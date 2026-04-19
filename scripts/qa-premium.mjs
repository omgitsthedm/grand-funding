// Premium QA Runner — audit every page at every breakpoint.
// Usage: node scripts/qa-premium.mjs
// Requires: npm i -g playwright && playwright install chromium

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE_URL || 'https://www.grandfundingllc.com';
const BREAKPOINTS = [
  { name: 'iphone-se',  width: 375, height: 667  },
  { name: 'iphone-13',  width: 393, height: 852  },
  { name: 'iphone-pro', width: 430, height: 932  },
  { name: 'tablet',     width: 768, height: 1024 },
  { name: 'laptop',     width: 1280, height: 800 },
  { name: 'desktop',    width: 1440, height: 900 }
];

// All 40 page routes
const PAGES = [
  '/', '/about', '/apply', '/products', '/contact', '/faq',
  '/blog', '/partners', '/funded-deals',
  '/arizona-hard-money-lender', '/california-hard-money-lender',
  '/phoenix-hard-money-lender', '/scottsdale-hard-money-lender',
  '/san-diego-hard-money-lender', '/los-angeles-hard-money-lender',
  '/fix-and-flip-loans-arizona', '/bridge-loans-arizona',
  '/construction-loans-arizona', '/cash-out-refinance-investors-arizona',
  '/second-position-loans-arizona',
  '/lp-arizona-hard-money', '/lp-bridge-loan-arizona', '/lp-fix-and-flip-arizona',
  '/privacy', '/terms', '/disclosures', '/thanks', '/404',
  '/posts/how-to-fund-a-fix-and-flip-in-arizona.html',
  '/posts/arizona-bridge-loan-guide-real-estate-investors.html',
  '/posts/how-fast-can-you-close-hard-money-loan-arizona.html'
];

const PREMIUM_FAIL_CHECKS = [
  { id: 'horizontal-overflow', test: async p => {
    const { doc, vp } = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, vp: window.innerWidth }));
    return doc > vp + 1 ? `Overflow ${doc - vp}px` : null;
  }},
  { id: 'header-cta-wrap', test: async p => {
    return await p.evaluate(() => {
      const c = document.querySelector('.header .cta-btn');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return r.height > 40 ? `CTA wraps (${Math.round(r.height)}px tall)` : null;
    });
  }},
  { id: 'invisible-card-text', test: async p => {
    return await p.evaluate(() => {
      const cards = document.querySelectorAll('.feature-card, .product-card, .service-card, .value-item, .reason-card');
      for (const c of cards) {
        const h3 = c.querySelector('h3');
        if (!h3) continue;
        const col = getComputedStyle(h3).color;
        const m = col.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) {
          const lum = (+m[1] + +m[2] + +m[3]) / 3;
          if (lum < 60) return `h3 too dark: ${col}`;
        }
      }
      return null;
    });
  }},
  { id: 'icon-misaligned', test: async p => {
    return await p.evaluate(() => {
      const cards = document.querySelectorAll('.feature-card, .product-card, .service-card, .reason-card, .value-item');
      for (const c of cards) {
        const icon = c.querySelector('[class*="-icon"]');
        if (!icon) continue;
        const ir = icon.getBoundingClientRect();
        const cr = c.getBoundingClientRect();
        const iconCenterX = ir.left + ir.width/2;
        const cardCenterX = cr.left + cr.width/2;
        const isCentered = Math.abs(iconCenterX - cardCenterX) < 20;
        const isLeftAligned = (ir.left - cr.left) < 25;
        if (!isCentered && !isLeftAligned) return `icon at ${Math.round(ir.left - cr.left)}px from card edge (not centered/left)`;
      }
      return null;
    });
  }},
  { id: 'footer-grid', test: async p => {
    return await p.evaluate(() => {
      const f = document.querySelector('.footer .footer-main, .footer .footer-main--clean, .footer-grid');
      if (!f) return null;
      const cs = getComputedStyle(f);
      const cols = cs.gridTemplateColumns.split(' ').length;
      const vw = window.innerWidth;
      if (vw <= 768 && cols > 1) return `footer has ${cols} cols at ${vw}px (should be 1)`;
      return null;
    });
  }}
];

const run = async () => {
  const browser = await chromium.launch();
  const failures = {};
  for (const bp of BREAKPOINTS) {
    console.log(`\n=== ${bp.name} (${bp.width}x${bp.height}) ===`);
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height }});
    const p = await ctx.newPage();
    for (const route of PAGES) {
      try {
        await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
        const results = [];
        for (const check of PREMIUM_FAIL_CHECKS) {
          const fail = await check.test(p);
          if (fail) results.push(`${check.id}: ${fail}`);
        }
        if (results.length) {
          const key = `${bp.name}${route}`;
          failures[key] = results;
          console.log(`  FAIL ${route}: ${results.join(' | ')}`);
        } else {
          process.stdout.write('.');
        }
      } catch (e) {
        console.log(`  ERROR ${route}: ${e.message.slice(0,60)}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  const reportPath = 'scripts/qa-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(failures, null, 2));
  console.log(`\n\nReport: ${reportPath}`);
  console.log(`Total failures: ${Object.keys(failures).length}`);
  process.exit(Object.keys(failures).length ? 1 : 0);
};

run();
