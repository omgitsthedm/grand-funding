#!/usr/bin/env node
/**
 * Grand Funding — Premium QA Merge Gate
 *
 * Enforces PREMIUM_STANDARDS.md invariants across every page at every breakpoint.
 * Exits non-zero if any invariant fails so CI can block the merge.
 *
 * Usage:
 *   node scripts/qa-premium.mjs                            # audit production
 *   BASE_URL=http://localhost:8888 node scripts/qa-premium.mjs
 *   PAGES_FILE=scripts/qa-pages.json node scripts/qa-premium.mjs
 *   WATCHLIST_ONLY=1 node scripts/qa-premium.mjs           # ranking-critical pages only
 *
 * Requires:
 *   npm install --save-dev playwright
 *   npx playwright install --with-deps chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'https://www.grandfundingllc.com';
const WATCHLIST_ONLY = !!process.env.WATCHLIST_ONLY;
const CI = !!process.env.CI;

// ─────────────────────────────────────────────────────────────
// Ranking watchlist — these pages MUST pass at every breakpoint.
// A failure here exits 2 (watchlist failure, highest priority).
// ─────────────────────────────────────────────────────────────
const WATCHLIST = [
  '/',
  '/phoenix-hard-money-lender.html',
  '/arizona-hard-money-lender.html',
  '/fix-and-flip-loans-arizona.html',
  '/bridge-loans-arizona.html',
  '/blog.html',
  '/funded-deals.html',
  '/partners.html',
  '/about.html',
  '/contact.html',
  '/apply.html'
];

// ─────────────────────────────────────────────────────────────
// Full page set — everything else. Failures exit 1.
// Override via scripts/qa-pages.json (flat array of routes).
// ─────────────────────────────────────────────────────────────
const DEFAULT_PAGES = [
  '/about.html', '/apply.html', '/products.html', '/contact.html', '/faq.html',
  '/blog.html', '/partners.html', '/funded-deals.html',
  '/california-hard-money-lender.html',
  '/scottsdale-hard-money-lender.html',
  '/san-diego-hard-money-lender.html',
  '/los-angeles-hard-money-lender.html',
  '/construction-loans-arizona.html',
  '/cash-out-refinance-investors-arizona.html',
  '/second-position-loans-arizona.html',
  '/lp-arizona-hard-money.html',
  '/lp-bridge-loan-arizona.html',
  '/lp-fix-and-flip-arizona.html',
  '/privacy.html', '/terms.html', '/disclosures.html', '/thanks.html', '/404.html',
  '/posts/how-to-fund-a-fix-and-flip-in-arizona.html',
  '/posts/arizona-bridge-loan-guide-real-estate-investors.html',
  '/posts/how-fast-can-you-close-hard-money-loan-arizona.html'
];

let PAGES;
if (process.env.PAGES_FILE) {
  const p = path.resolve(process.env.PAGES_FILE);
  PAGES = JSON.parse(fs.readFileSync(p, 'utf8'));
} else {
  PAGES = WATCHLIST_ONLY ? WATCHLIST : [...WATCHLIST, ...DEFAULT_PAGES];
}

// ─────────────────────────────────────────────────────────────
// Breakpoint matrix — the only sizes that matter.
// ─────────────────────────────────────────────────────────────
const BREAKPOINTS = [
  { name: 'iphone-se-1', width: 320, height: 568 },
  { name: 'iphone-se',   width: 375, height: 667 },
  { name: 'iphone-13',   width: 393, height: 852 },
  { name: 'iphone-max',  width: 430, height: 932 },
  { name: 'tablet',      width: 768, height: 1024 },
  { name: 'laptop',      width: 1280, height: 800 },
  { name: 'desktop',     width: 1440, height: 900 }
];

// ─────────────────────────────────────────────────────────────
// PREMIUM FAIL CHECKS
// Each returns `null` on pass or a diagnostic string on fail.
// ─────────────────────────────────────────────────────────────
const CHECKS = [
  // 0. FOUNDATIONAL THEME SANITY
  // Catches the "page forgot to load styles-v2.css" regression class —
  // a silent failure where a page's structure is fine but the foundational
  // stylesheet never reaches it, so header/nav/body/footer render as
  // unstyled-document flow instead of the premium dark theme.
  //
  // Production-caught instance (2026-04-19): blog.html, partners.html,
  // funded-deals.html rendered with white body, blue-underlined nav links,
  // and 247px-tall stacked-bullet header because /styles-v2.css was never
  // linked on those pages. The old checks (overflow, contrast, etc.) all
  // passed because the page WASN'T broken in those specific ways — it was
  // broken in the "no foundational CSS at all" way that downstream symptom
  // checks can't reach. This check exists to block exactly that.
  {
    id: 'foundational-theme-sanity',
    severity: 'blocker',
    test: async p => {
      return await p.evaluate(() => {
        const fails = [];

        // 0.a Foundational stylesheet must be loaded (link OR inlined).
        const hasStylesV2Link = !!document.querySelector(
          'link[rel="stylesheet"][href*="styles-v2"], link[rel="preload"][href*="styles-v2"]'
        );
        // Also accept inlined premium system block as foundational coverage.
        const hasPremiumInline = !!Array.from(document.querySelectorAll('style'))
          .find(s => s.textContent.includes('GRAND FUNDING PREMIUM SYSTEM'));
        if (!hasStylesV2Link && !hasPremiumInline) {
          fails.push('foundational CSS missing (no styles-v2.css link AND no premium-system inline)');
        }

        // 0.b Body background must be the premium dark theme.
        // Acceptable: any background where average RGB luminance < 40.
        // Unstyled default is rgb(255,255,255) — lum 255. Catches that.
        const body = document.body;
        const bodyBg = getComputedStyle(body).backgroundColor;
        const bgMatch = bodyBg.match(/\d+/g);
        if (bgMatch) {
          const [br, bg, bb, ba] = bgMatch.map(Number);
          const lum = (br + bg + bb) / 3;
          const opaque = ba === undefined || ba > 0.8;
          // If body is transparent AND html is also transparent/white, the
          // effective background is the browser default (white).
          if (opaque && lum > 40) {
            fails.push(`body bg too bright: rgb(${br},${bg},${bb}) lum=${Math.round(lum)} (premium theme requires <40)`);
          } else if (!opaque) {
            // Body transparent — check html
            const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
            const hm = htmlBg.match(/\d+/g);
            if (hm) {
              const hLum = (+hm[0] + +hm[1] + +hm[2]) / 3;
              if (hLum > 40) fails.push(`html bg too bright: rgb(${hm[0]},${hm[1]},${hm[2]}) lum=${Math.round(hLum)}`);
            } else {
              fails.push('both body and html have no computable background — browser default white');
            }
          }
        }

        // 0.c Header must exist and render within expected height range.
        // Unstyled nav in a <header> stacks vertically to 200+px. Premium
        // collapsed header is 48–90px. Desktop uncollapsed is up to 120px.
        const header = document.querySelector('header.header, header, .header');
        if (!header) {
          fails.push('no <header> element');
        } else {
          const hr = header.getBoundingClientRect();
          if (hr.height > 140) {
            fails.push(`header is ${Math.round(hr.height)}px tall (unstyled stacked nav symptom — max 140px)`);
          }
          if (hr.height < 30) {
            fails.push(`header is ${Math.round(hr.height)}px tall (collapsed/hidden — min 30px)`);
          }
        }

        // 0.d Mobile nav behavior — at ≤768px, either hamburger is visible
        // OR nav-list is collapsed. The unstyled-bullet-list failure mode has
        // nav-list display:block with list-style-type:disc visible — wrong.
        const vw = window.innerWidth;
        if (vw <= 768) {
          const toggle = document.querySelector('.mobile-menu-toggle');
          const navList = document.querySelector('.nav-list');
          if (toggle) {
            const td = getComputedStyle(toggle).display;
            if (td === 'none') {
              fails.push(`mobile-menu-toggle display:none at vw=${vw} (hamburger must show ≤768)`);
            }
          }
          if (navList) {
            const nd = getComputedStyle(navList).display;
            const lst = getComputedStyle(navList).listStyleType;
            // If nav-list is visible (block/flex) AND has default bullets, it's unstyled.
            if ((nd === 'block' || nd === 'list-item') && lst === 'disc') {
              fails.push(`nav-list is rendering as bulleted list at vw=${vw} (foundational CSS not applied)`);
            }
          }
        }

        // 0.e Footer must render with styled layout — not default flow with
        // a transparent bg and default body text color.
        const footer = document.querySelector('footer.footer, footer, .footer');
        if (!footer) {
          fails.push('no <footer> element');
        } else {
          const fr = footer.getBoundingClientRect();
          if (fr.height < 100) {
            fails.push(`footer is ${Math.round(fr.height)}px tall (likely unstyled — min 100px)`);
          }
          // Footer text color — should be light on dark theme.
          const fcol = getComputedStyle(footer).color.match(/\d+/g);
          if (fcol) {
            const flum = (+fcol[0] + +fcol[1] + +fcol[2]) / 3;
            if (flum < 60) {
              fails.push(`footer text too dark: rgb(${fcol[0]},${fcol[1]},${fcol[2]}) lum=${Math.round(flum)} — dark-on-dark symptom`);
            }
          }
        }

        return fails.length ? fails.join(' | ') : null;
      });
    }
  },

  // 1. Horizontal overflow — the premium killer on mobile.
  {
    id: 'horizontal-overflow',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const doc = document.documentElement.scrollWidth;
      const vp = window.innerWidth;
      return doc > vp + 1 ? `doc ${doc}px vs viewport ${vp}px (overflow ${doc - vp}px)` : null;
    })
  },

  // 2. Header CTA wrap — "Pre-" / "approved" two-line symptom.
  // Detect real wrapping (not just a tall-but-single-line CTA).
  {
    id: 'header-cta-wrap',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const c = document.querySelector('.header .cta-btn');
      if (!c) return null;
      if (getComputedStyle(c).display === 'none') return null; // hidden at ≤360px by design
      // Use line count: if height ≈ lineHeight it's single-line. 2 lines = wrap.
      const cs = getComputedStyle(c);
      const lh = parseFloat(cs.lineHeight);
      const pt = parseFloat(cs.paddingTop);
      const pb = parseFloat(cs.paddingBottom);
      const inner = c.clientHeight - pt - pb;
      // If inner content height is more than 1.6x line-height, text wrapped.
      if (lh && inner > lh * 1.6) {
        return `CTA text wraps (inner ${Math.round(inner)}px > lineHeight ${Math.round(lh)}px × 1.6)`;
      }
      return null;
    })
  },

  // 3. Dark-on-dark card text — invisible text bug.
  {
    id: 'card-text-contrast',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const selectors = '.feature-card, .product-card, .service-card, .value-item, .reason-card, .deal-card';
      for (const c of document.querySelectorAll(selectors)) {
        const h3 = c.querySelector('h3');
        if (!h3) continue;
        const m = getComputedStyle(h3).color.match(/\d+/g);
        if (!m) continue;
        const lum = (+m[0] + +m[1] + +m[2]) / 3;
        if (lum < 80) {
          return `h3 "${h3.innerText.slice(0,30)}" rgb(${m[0]},${m[1]},${m[2]}) lum=${lum.toFixed(0)}`;
        }
      }
      return null;
    })
  },

  // 4. Icon alignment — centered above OR left-inline only.
  {
    id: 'icon-misaligned',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const cards = document.querySelectorAll(
        '.feature-card, .product-card, .service-card, .reason-card, .value-item'
      );
      for (const c of cards) {
        const icon = c.querySelector('[class*="-icon"]:not(.feature-icon-container)');
        if (!icon) continue;
        const ir = icon.getBoundingClientRect();
        const cr = c.getBoundingClientRect();
        if (ir.width === 0 || ir.height === 0) continue;
        const iconCx = ir.left + ir.width / 2;
        const cardCx = cr.left + cr.width / 2;
        const centered = Math.abs(iconCx - cardCx) < 25;
        const leftInline = (ir.left - cr.left) < 30;
        if (!centered && !leftInline) {
          return `icon ${Math.round(ir.left - cr.left)}px from card edge, ${Math.round(iconCx - cardCx)}px off-center`;
        }
      }
      return null;
    })
  },

  // 5. Footer grid stacking — mobile must be 1 column.
  {
    id: 'footer-grid-mobile',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const f = document.querySelector(
        '.footer .footer-main, .footer .footer-main--clean, .footer-grid'
      );
      if (!f) return null;
      const cols = getComputedStyle(f).gridTemplateColumns.split(' ').length;
      const vw = window.innerWidth;
      if (vw <= 768 && cols > 1) return `footer ${cols} cols at ${vw}px (must be 1)`;
      return null;
    })
  },

  // 6. Hidden reveal content — opacity:0 element stuck in viewport.
  {
    id: 'reveal-stuck',
    severity: 'blocker',
    test: async p => {
      // Settle for IntersectionObserver + any font-swap
      await p.waitForTimeout(900);
      return await p.evaluate(() => {
        const all = document.querySelectorAll('.reveal, .reveal-stagger');
        const vh = window.innerHeight;
        for (const el of all) {
          const r = el.getBoundingClientRect();
          const inView = r.top < vh && r.bottom > 0;
          if (!inView) continue;
          const op = parseFloat(getComputedStyle(el).opacity);
          if (op < 0.3) {
            const tag = el.tagName + '.' + (el.className || '').split(' ').slice(0,2).join('.');
            return `${tag} opacity=${op} in viewport`;
          }
        }
        return null;
      });
    }
  },

  // 7. Broken blog card rendering — image missing/tiny/invisible, title invisible.
  {
    id: 'blog-card-broken',
    severity: 'blocker',
    test: async p => await p.evaluate(() => {
      const cards = document.querySelectorAll('.blog-card');
      if (!cards.length) return null;
      const cardWidth = cards[0].getBoundingClientRect().width;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue; // not yet laid out
        const img = c.querySelector('img');
        if (img) {
          const ir = img.getBoundingClientRect();
          // Image must fill at least 80% of card width
          if (ir.width > 0 && ir.width < r.width * 0.8) {
            return `blog-card image only ${Math.round(ir.width)}px in ${Math.round(r.width)}px card`;
          }
          // Only fail if image is eager OR above-fold (visible in viewport) AND not loaded.
          // Lazy images below fold may legitimately be unloaded at check time.
          const isEager = img.loading !== 'lazy';
          const vh = window.innerHeight;
          const aboveFold = ir.top < vh && ir.bottom > 0;
          if ((isEager || aboveFold) && (!img.complete || img.naturalWidth === 0)) {
            return `blog-card image not loaded: ${img.currentSrc?.split('/').pop() || img.src}`;
          }
        }
        const title = c.querySelector('.blog-card__title, h2, h3');
        if (title) {
          const op = parseFloat(getComputedStyle(title).opacity);
          if (op < 0.3) return `blog-card title opacity ${op}`;
          const m = getComputedStyle(title).color.match(/\d+/g);
          if (m && (+m[0] + +m[1] + +m[2]) / 3 < 80) {
            return `blog-card title too dark rgb(${m[0]},${m[1]},${m[2]})`;
          }
        }
      }
      return null;
    })
  }
];

// ─────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────
const LABELS = {
  blocker: '🚫'
};

async function auditPage(page, route, bp) {
  const url = `${BASE}${route}`;
  const fails = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // Give reveal IO + font swap time to settle
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(400);
  } catch (e) {
    fails.push({ id: 'navigation', severity: 'blocker', msg: e.message.slice(0, 80) });
    return fails;
  }
  for (const check of CHECKS) {
    try {
      const result = await check.test(page);
      if (result) fails.push({ id: check.id, severity: check.severity, msg: result });
    } catch (e) {
      fails.push({ id: check.id, severity: 'blocker', msg: `check-errored: ${e.message.slice(0, 60)}` });
    }
  }
  return fails;
}

function isWatchlist(route) {
  return WATCHLIST.includes(route);
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  GRAND FUNDING — PREMIUM QA MERGE GATE`);
  console.log(`  base=${BASE}  pages=${PAGES.length}  breakpoints=${BREAKPOINTS.length}`);
  console.log(`${'═'.repeat(70)}`);

  const browser = await chromium.launch({ headless: true });
  const report = { startedAt: new Date().toISOString(), base: BASE, failures: {}, summary: {} };
  let totalChecks = 0;
  let totalFails = 0;
  let watchlistFails = 0;

  for (const bp of BREAKPOINTS) {
    const label = `${bp.name.padEnd(12)} ${bp.width}×${bp.height}`;
    console.log(`\n▸ ${label}`);
    const ctx = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    const page = await ctx.newPage();
    for (const route of PAGES) {
      totalChecks += CHECKS.length;
      const fails = await auditPage(page, route, bp);
      if (fails.length) {
        totalFails += fails.length;
        const key = `${bp.name} ${route}`;
        report.failures[key] = fails;
        const watch = isWatchlist(route);
        if (watch) watchlistFails += fails.length;
        const prefix = watch ? '🎯 WATCHLIST' : '  ';
        console.log(
          `  ${prefix} FAIL ${route}\n      ${fails.map(f => `${LABELS[f.severity] || ''} ${f.id}: ${f.msg}`).join('\n      ')}`
        );
      } else {
        process.stdout.write('.');
      }
    }
    await ctx.close();
  }

  await browser.close();

  report.summary = {
    totalChecks,
    totalFails,
    watchlistFails,
    uniquePageFails: Object.keys(report.failures).length,
    durationMs: Date.now() - new Date(report.startedAt).getTime()
  };

  fs.mkdirSync(path.join(__dirname), { recursive: true });
  const reportPath = path.join(__dirname, 'qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`  RESULTS`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  Total checks run:      ${totalChecks}`);
  console.log(`  Total failures:        ${totalFails}`);
  console.log(`  Watchlist failures:    ${watchlistFails}`);
  console.log(`  Unique page failures:  ${report.summary.uniquePageFails}`);
  console.log(`  Duration:              ${(report.summary.durationMs / 1000).toFixed(1)}s`);
  console.log(`  Report:                ${path.relative(process.cwd(), reportPath)}`);

  if (watchlistFails > 0) {
    console.error(`\n❌ MERGE BLOCKED — ${watchlistFails} watchlist failure(s). These are ranking-critical pages.`);
    process.exit(2);
  }
  if (totalFails > 0) {
    console.error(`\n❌ MERGE BLOCKED — ${totalFails} premium regression(s).`);
    process.exit(1);
  }
  console.log(`\n✅ PASS — no premium regressions.\n`);
  process.exit(0);
}

main().catch(err => {
  console.error(`\n💥 QA runner crashed: ${err.stack || err.message}`);
  process.exit(3);
});
