#!/usr/bin/env node
/**
 * Grand Funding — Preservation QA
 *
 * A browser-level regression suite for the restrained elevation pass. It
 * protects the original cinematic identity and operational conversion paths
 * while remaining tolerant of section reordering and copy refinements.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:8888 node scripts/qa-preservation.mjs
 *   QA_SCREENSHOTS=1 BASE_URL=http://127.0.0.1:8888 \
 *     node scripts/qa-preservation.mjs
 *
 * The suite never submits a form. Telemetry requests are fulfilled locally
 * with empty responses so a QA run cannot generate analytics or ad events.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:8888').replace(/\/+$/, '');
const BASE_ORIGIN = new URL(BASE_URL).origin;
const NETLIFY_PROCESSED = /(?:^|\.)netlify\.app$/i.test(
  new URL(BASE_URL).hostname
) || new URL(BASE_URL).hostname === 'www.grandfundingllc.com';
const SCREENSHOTS = process.env.QA_SCREENSHOTS === '1';
const SCREENSHOT_DIR = path.resolve(
  process.env.QA_SCREENSHOT_DIR || 'artifacts/qa-preservation'
);

const ROUTES = [
  '/',
  '/products',
  '/apply',
  '/contact',
  '/funded-deals',
  '/blog',
  '/bridge-loans-california',
  '/thanks'
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 800 },
  { name: 'desktop', width: 1440, height: 900 }
];

const STICKY_INELIGIBLE_ROUTES = new Set(['/apply', '/contact', '/thanks']);
const STICKY_ELIGIBLE_ROUTES = new Set([
  '/',
  '/products',
  '/funded-deals',
  '/blog',
  '/bridge-loans-california'
]);

const EXPECTED_FORMS = new Map([
  [
    '/',
    {
      name: 'pre-approval',
      action: '/thanks.html',
      trackingFields: []
    }
  ],
  [
    '/apply',
    {
      name: 'pre-approval',
      action: '/thanks.html',
      trackingFields: [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'gclid',
        'gbraid',
        'wbraid',
        'referrer'
      ]
    }
  ],
  [
    '/contact',
    {
      name: 'contact',
      action: '/thanks-contact.html',
      trackingFields: []
    }
  ]
]);

const TELEMETRY_HOSTS = [
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)analytics\.google\.com$/i,
  /(^|\.)googleadservices\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)facebook\.net$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)clarity\.ms$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)segment\.com$/i,
  /(^|\.)segment\.io$/i,
  /(^|\.)posthog\.com$/i
];

const INTERNAL_PRODUCTION_HOSTS = new Set([
  'grandfundingllc.com',
  'www.grandfundingllc.com'
]);

const failures = [];
let checks = 0;
let blockedTelemetryRequests = 0;

function reportFailure(viewport, route, check, detail) {
  failures.push({
    viewport,
    route,
    check,
    detail: String(detail)
  });
}

async function check(viewport, route, id, assertion) {
  checks += 1;
  try {
    const result = await assertion();
    if (result) reportFailure(viewport, route, id, result);
  } catch (error) {
    reportFailure(viewport, route, id, error?.stack || error?.message || error);
  }
}

function isTelemetryUrl(rawUrl) {
  try {
    const { hostname } = new URL(rawUrl);
    return TELEMETRY_HOSTS.some(pattern => pattern.test(hostname));
  } catch {
    return false;
  }
}

function isInternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, BASE_URL);
    return (
      url.origin === BASE_ORIGIN ||
      INTERNAL_PRODUCTION_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function routeUrl(route) {
  return new URL(route, `${BASE_URL}/`).href;
}

function screenshotName(viewport, route) {
  const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
  return `${viewport}-${slug}.png`;
}

async function installSafetyRails(context) {
  await context.route('**/*', async route => {
    const request = route.request();
    if (isTelemetryUrl(request.url())) {
      blockedTelemetryRequests += 1;
      await route.fulfill({
        status: 204,
        contentType: 'text/plain',
        body: ''
      });
      return;
    }
    await route.continue();
  });

  await context.addInitScript(() => {
    try {
      localStorage.removeItem('gf_consent_v1');
    } catch {
      // Storage can be unavailable in hardened browsers; consent QA still runs.
    }

    window.__qaFormSubmissions = [];
    document.addEventListener(
      'submit',
      event => {
        const form = event.target;
        window.__qaFormSubmissions.push({
          name: form?.getAttribute?.('name') || '',
          action: form?.getAttribute?.('action') || ''
        });
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true
    );
  });
}

async function eagerlyLoadAndInspectImages(page) {
  return page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';

    await Promise.all(
      images.map(
        image =>
          new Promise(resolve => {
            if (image.complete) {
              resolve();
              return;
            }
            const done = () => resolve();
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
            setTimeout(done, 5_000);
          })
      )
    );

    return images
      .filter(image => {
        const declaredSource =
          image.currentSrc ||
          image.getAttribute('src') ||
          image.getAttribute('srcset');
        return declaredSource && (!image.complete || image.naturalWidth === 0);
      })
      .map(image => ({
        source:
          image.currentSrc ||
          image.getAttribute('src') ||
          image.getAttribute('srcset'),
        alt: image.getAttribute('alt') || ''
      }));
  });
}

async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const wait = milliseconds =>
      new Promise(resolve => window.setTimeout(resolve, milliseconds));
    const stride = Math.max(420, Math.floor(window.innerHeight * 0.72));
    let lastHeight = 0;

    for (let pass = 0; pass < 2; pass += 1) {
      const height = document.documentElement.scrollHeight;
      for (let y = 0; y < height; y += stride) {
        window.scrollTo(0, y);
        await wait(40);
      }
      window.scrollTo(0, height);
      await wait(100);
      if (height === lastHeight) break;
      lastHeight = height;
    }

    window.scrollTo(0, 0);
    await wait(80);
  });
}

async function inspectStructure(page) {
  return page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const normalize = value => value.trim().replace(/\s+/g, '').toLowerCase();
    return {
      mains: document.querySelectorAll('main').length,
      h1s: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      teal: normalize(root.getPropertyValue('--gf-teal')),
      ember: normalize(root.getPropertyValue('--gf-ember'))
    };
  });
}

async function inspectNavigationMode(page, width) {
  return page.evaluate(expectedWidth => {
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number.parseFloat(style.opacity || '1') > 0.05 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const list = document.querySelector('.nav-list');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const listVisible = visible(list);
    const toggleVisible = visible(toggle);
    const expectsMobile = expectedWidth <= 768;
    const issues = [];

    if (!list || !toggle) {
      issues.push('primary navigation list or mobile toggle is missing');
    } else if (listVisible === toggleVisible) {
      issues.push(
        `expected one navigation mode, got list=${listVisible} toggle=${toggleVisible}`
      );
    } else if (expectsMobile && !toggleVisible) {
      issues.push(`mobile toggle is not the active mode at ${expectedWidth}px`);
    } else if (!expectsMobile && !listVisible) {
      issues.push(`desktop navigation is not the active mode at ${expectedWidth}px`);
    }

    return issues;
  }, width);
}

async function inspectSchema(page) {
  return page.evaluate(() => {
    const issues = [];
    const forbidden = new Set(['FAQPage', 'HowTo']);
    const types = [];

    const visit = value => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (!value || typeof value !== 'object') return;
      const type = value['@type'];
      if (Array.isArray(type)) types.push(...type);
      if (typeof type === 'string') types.push(type);
      Object.values(value).forEach(visit);
    };

    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((script, index) => {
        try {
          visit(JSON.parse(script.textContent));
        } catch (error) {
          issues.push(`JSON-LD block ${index + 1} is invalid: ${error.message}`);
        }
      });

    for (const type of types) {
      if (forbidden.has(type)) issues.push(`obsolete ${type} schema is present`);
    }
    return issues;
  });
}

async function inspectSocialMetadata(page) {
  return page.evaluate(() => {
    const issues = [];
    const meta = selector =>
      document.querySelector(selector)?.getAttribute('content')?.trim() || '';
    const canonical =
      document.querySelector('link[rel="canonical"]')?.href?.trim() || '';
    const required = [
      ['title', document.title.trim()],
      ['description', meta('meta[name="description"]')],
      ['canonical', canonical],
      ['og:title', meta('meta[property="og:title"]')],
      ['og:description', meta('meta[property="og:description"]')],
      ['og:type', meta('meta[property="og:type"]')],
      ['og:url', meta('meta[property="og:url"]')],
      ['og:image', meta('meta[property="og:image"]')],
      ['twitter:card', meta('meta[name="twitter:card"]')],
      ['twitter:title', meta('meta[name="twitter:title"]')],
      ['twitter:description', meta('meta[name="twitter:description"]')],
      ['twitter:image', meta('meta[name="twitter:image"]')]
    ];

    for (const [label, value] of required) {
      if (!value) issues.push(`missing ${label}`);
    }

    const ogUrl = meta('meta[property="og:url"]');
    const ogImage = meta('meta[property="og:image"]');
    const twitterImage = meta('meta[name="twitter:image"]');
    const twitterCard = meta('meta[name="twitter:card"]');

    if (canonical && ogUrl && canonical !== ogUrl) {
      issues.push(`canonical and og:url differ (${canonical} vs ${ogUrl})`);
    }
    if (twitterCard && twitterCard !== 'summary_large_image') {
      issues.push(`twitter:card must be summary_large_image, got ${twitterCard}`);
    }
    for (const [label, value] of [
      ['og:image', ogImage],
      ['twitter:image', twitterImage]
    ]) {
      if (value && !/^https:\/\//i.test(value)) {
        issues.push(`${label} must be an absolute HTTPS URL`);
      }
    }
    if (ogImage && twitterImage && ogImage !== twitterImage) {
      issues.push('og:image and twitter:image do not use the same share asset');
    }

    return issues;
  });
}

async function inspectInternalUrls(page) {
  return page.evaluate(
    ({ baseOrigin, productionHosts }) => {
      const issues = [];
      const hosts = new Set(productionHosts);

      for (const anchor of document.querySelectorAll('a[href]')) {
        const raw = anchor.getAttribute('href')?.trim() || '';
        if (!raw) {
          issues.push('empty anchor href');
          continue;
        }
        if (/^(mailto:|tel:|sms:)/i.test(raw)) continue;
        if (/^javascript:/i.test(raw)) {
          issues.push(`javascript URL: ${raw}`);
          continue;
        }
        if (raw === '#') {
          issues.push('placeholder href="#"');
          continue;
        }
        if (raw.startsWith('#')) {
          if (!document.getElementById(raw.slice(1))) {
            issues.push(`fragment has no target: ${raw}`);
          }
          continue;
        }

        let url;
        try {
          url = new URL(raw, document.baseURI);
        } catch {
          issues.push(`invalid URL: ${raw}`);
          continue;
        }

        const internal =
          url.origin === baseOrigin || hosts.has(url.hostname.toLowerCase());
        if (!internal) continue;

        const pathname = url.pathname;
        if (/\.html$/i.test(pathname)) {
          issues.push(`legacy .html link: ${raw}`);
        }
        if (/\/index(?:\.html)?$/i.test(pathname)) {
          issues.push(`index filename link: ${raw}`);
        }
        if (/\/{2,}/.test(pathname)) {
          issues.push(`duplicate slash in path: ${raw}`);
        }
        if (pathname.length > 1 && pathname.endsWith('/')) {
          issues.push(`non-root trailing slash: ${raw}`);
        }
        if (hosts.has(url.hostname.toLowerCase()) && url.protocol !== 'https:') {
          issues.push(`production link is not HTTPS: ${raw}`);
        }
      }

      return [...new Set(issues)];
    },
    {
      baseOrigin: BASE_ORIGIN,
      productionHosts: [...INTERNAL_PRODUCTION_HOSTS]
    }
  );
}

async function inspectForms(page, route) {
  return page.evaluate(
    ({ expectedRoute, expected, netlifyProcessed }) => {
      const issues = [];
      const netlifySourceForms = Array.from(
        document.querySelectorAll(
          'form[data-netlify="true"], form[netlify], form[data-netlify]'
        )
      );
      const forms = expected && netlifyProcessed
        ? Array.from(document.querySelectorAll('form')).filter(
            form => form.getAttribute('name') === expected.name
          )
        : netlifySourceForms;

      if (!expected) {
        if (forms.length) {
          issues.push(`unexpected Netlify form count: ${forms.length}`);
        }
        return issues;
      }

      if (forms.length !== 1) {
        issues.push(`expected one Netlify form on ${expectedRoute}, found ${forms.length}`);
        return issues;
      }

      const form = forms[0];
      const name = form.getAttribute('name') || '';
      const action = form.getAttribute('action') || '';
      const method = (form.getAttribute('method') || '').toLowerCase();
      if (name !== expected.name) {
        issues.push(`form name changed: expected ${expected.name}, got ${name || '(empty)'}`);
      }
      const allowedActions = netlifyProcessed
        ? [expected.action, expected.action.replace(/\.html$/i, '')]
        : [expected.action];
      if (!allowedActions.includes(action)) {
        issues.push(
          `form action changed: expected ${expected.action}, got ${action || '(empty)'}`
        );
      }
      if (method !== 'post') issues.push(`form method must remain POST, got ${method}`);
      if (
        !netlifyProcessed &&
        !form.hasAttribute('data-netlify') &&
        !form.hasAttribute('netlify')
      ) {
        issues.push('Netlify form attribute is missing');
      }

      const formName = form.querySelector('input[name="form-name"]');
      if (!formName || formName.type !== 'hidden' || formName.value !== expected.name) {
        issues.push('hidden form-name field is missing or no longer matches form name');
      }

      const honeypotName = form.getAttribute('netlify-honeypot') || 'bot-field';
      if (
        !netlifyProcessed &&
        form.getAttribute('netlify-honeypot') !== 'bot-field'
      ) {
        issues.push('netlify-honeypot must remain bot-field');
      }
      if (!form.querySelector(`[name="${CSS.escape(honeypotName)}"]`)) {
        issues.push(`honeypot field is missing: ${honeypotName}`);
      }

      for (const fieldName of expected.trackingFields) {
        const field = form.querySelector(
          `input[type="hidden"][name="${CSS.escape(fieldName)}"]`
        );
        if (!field) issues.push(`operational hidden field is missing: ${fieldName}`);
      }

      const submit = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      const expectedType = expected.name === 'contact' ? 'contact' : 'application';
      if (!form.hasAttribute('data-gf-lead-form')) {
        issues.push('resilient lead-form marker is missing');
      }
      if (form.getAttribute('data-form-kind') !== expectedType) {
        issues.push(`typed form kind must be ${expectedType}`);
      }
      if (!submit?.getAttribute('data-submit-label')) {
        issues.push('route-specific submit label is missing');
      }
      if (!status || status.getAttribute('role') !== 'status') {
        issues.push('accessible submission status region is missing');
      }

      return issues;
    },
    {
      expectedRoute: route,
      expected: EXPECTED_FORMS.get(route) || null,
      netlifyProcessed: NETLIFY_PROCESSED
    }
  );
}

async function inspectRefinedRouteFlow(page, route, width) {
  return page.evaluate(
    ({ expectedRoute, viewportWidth }) => {
      const issues = [];
      const visible = element => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number.parseFloat(style.opacity || '1') > 0.05
          && rect.width > 0
          && rect.height > 0
        );
      };

      if (expectedRoute === '/blog') {
        if (document.querySelector('.blog-toolbar .ghost-btn')) {
          issues.push('redundant blog-toolbar conversion CTA remains');
        }
        const grid = document.querySelector('.blog-grid');
        if (!grid) {
          issues.push('blog grid is missing');
        } else {
          const directCards = Array.from(grid.children).filter(child =>
            child.matches('article.blog-card')
          );
          const allCards = Array.from(grid.querySelectorAll('article.blog-card'));
          const allLinks = Array.from(grid.querySelectorAll('.blog-card__link'));
          if (directCards.length !== 18 || allCards.length !== 18) {
            issues.push(
              `blog grid needs 18 direct article cards; got `
                + `${directCards.length} direct/${allCards.length} total`
            );
          }
          directCards.forEach((card, index) => {
            const links = card.querySelectorAll('.blog-card__link').length;
            if (links !== 1) {
              issues.push(`blog card ${index + 1} contains ${links} card links`);
            }
          });
          if (allLinks.length !== 18) {
            issues.push(`blog grid needs 18 card links; got ${allLinks.length}`);
          }
          if (viewportWidth >= 1024 && directCards.length) {
            const tallest = Math.max(
              ...directCards.map(card => card.getBoundingClientRect().height)
            );
            if (tallest > 900) {
              issues.push(`blog card row is implausibly tall at ${tallest.toFixed(1)}px`);
            }
          }
        }
      }

      if (expectedRoute === '/apply') {
        const card = document.querySelector('.apply-card');
        const title = card?.querySelector('.apply-card__title');
        const form = card?.querySelector('form.apply-form');
        const logan = card?.querySelector('.talk-to-logan');
        const compact = card?.querySelector('.logan-sidebar');
        if (!card || !title || !form || !logan) {
          issues.push('application card is missing its title, form, or Logan support block');
        } else {
          const follows = (first, second) =>
            Boolean(first.compareDocumentPosition(second)
              & Node.DOCUMENT_POSITION_FOLLOWING);
          if (!follows(title, form) || !follows(form, logan)) {
            issues.push('application flow must present title, then form, then Logan support');
          }
        }
        if (compact) issues.push('duplicate compact Logan callout remains before the form');
      }

      if (expectedRoute === '/products') {
        const genericClose = document.querySelectorAll('main .final-cta').length;
        const duplicateClose = document.querySelectorAll('main .cta-section').length;
        if (genericClose !== 1 || duplicateClose !== 0) {
          issues.push(
            `products needs one decisive close; found final=${genericClose}, `
              + `duplicate=${duplicateClose}`
          );
        }
      }

      if (expectedRoute === '/') {
        const calculator = document.querySelector('main .loan-calc');
        const products = document.querySelector('main .products-overview-section');
        if (!calculator || !products) {
          issues.push('homepage calculator or product section is missing');
        } else if (
          !(calculator.compareDocumentPosition(products)
            & Node.DOCUMENT_POSITION_FOLLOWING)
        ) {
          issues.push('homepage calculator must precede the long product inventory');
        }

        if (viewportWidth <= 820) {
          const panel = document.querySelector('.hero .hero-loans');
          const cards = Array.from(
            document.querySelectorAll('.hero .loan-card[href]')
          );
          const visibleCards = cards.filter(visible);
          if (!visible(panel) || visibleCards.length !== 3) {
            issues.push(
              `mobile hero needs a compact 3-deal proof strip; got panel=${visible(panel)} `
                + `and ${visibleCards.length} visible cards`
            );
          }
        }
      }

      if (viewportWidth <= 820) {
        const backToTop = document.querySelector('.back-to-top');
        if (visible(backToTop)) {
          issues.push('mobile back-to-top control can overlap conversion content');
        }
        if (
          ['/apply', '/contact', '/thanks'].includes(expectedRoute)
          && visible(document.querySelector('.header .cta-btn'))
        ) {
          issues.push(`redundant mobile header CTA remains visible on ${expectedRoute}`);
        }
      }

      return issues;
    },
    { expectedRoute: route, viewportWidth: width }
  );
}

async function inspectHiddenContent(page) {
  return page.evaluate(() => {
    const visibleLayoutBox = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 4 &&
        rect.height > 4 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    };
    const selectors = [
      'main > section',
      '.reveal',
      '.reveal-stagger',
      '[data-reveal]'
    ];
    const stuck = [];

    for (const element of document.querySelectorAll(selectors.join(','))) {
      if (!visibleLayoutBox(element) || element.getAttribute('aria-hidden') === 'true') {
        continue;
      }
      const opacity = Number.parseFloat(getComputedStyle(element).opacity || '1');
      if (opacity <= 0.05) {
        stuck.push(
          element.id
            ? `#${element.id}`
            : `.${Array.from(element.classList).slice(0, 3).join('.') || element.tagName}`
        );
      }
    }

    return [...new Set(stuck)];
  });
}

async function inspectStickyAndConsent(page, route, width) {
  const issues = [];
  if (width > 820) return issues;

  if (route === '/') {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(120);
  }

  const getState = () =>
    page.evaluate(() => {
      const sticky = document.querySelector('[data-sticky-cta], .sticky-dual');
      const consent = document.querySelector('#consent-banner, .consent-banner');
      const state = element => {
        if (!element) return { exists: false, visible: false, rect: null };
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const visible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number.parseFloat(style.opacity || '1') > 0.05 &&
          style.pointerEvents !== 'none' &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight;
        return {
          exists: true,
          visible,
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom
          }
        };
      };
      return { sticky: state(sticky), consent: state(consent) };
    });

  await page.waitForTimeout(650);
  const withConsent = await getState();
  if (!withConsent.consent.exists) {
    issues.push('cookie consent banner is missing');
  } else if (!withConsent.consent.visible) {
    issues.push('fresh-session cookie consent banner did not open');
  }
  if (withConsent.consent.visible && withConsent.sticky.visible) {
    issues.push('sticky CTA remains visible while consent intersects the viewport');
    const a = withConsent.consent.rect;
    const b = withConsent.sticky.rect;
    const overlaps =
      a &&
      b &&
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top;
    if (overlaps) issues.push('cookie consent and sticky CTA overlap');
  }

  const essential = page.locator('[data-consent="essential"]').first();
  if (await essential.count()) {
    await essential.click();
    await page.waitForFunction(
      () => {
        const banner = document.querySelector(
          '#consent-banner, .consent-banner'
        );
        if (!banner || banner.classList.contains('is-open')) return false;
        try {
          const saved = JSON.parse(localStorage.getItem('gf_consent_v1'));
          return (
            saved?.v === 1
            && saved.ads === false
            && saved.analytics === false
          );
        } catch {
          return false;
        }
      },
      undefined,
      { timeout: 2_500 }
    ).catch(() => null);
  } else {
    issues.push('Essential only consent control is missing');
  }

  const consentDecision = await page.evaluate(() => {
    const banner = document.querySelector(
      '#consent-banner, .consent-banner'
    );
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('gf_consent_v1'));
    } catch {
      // Report the missing functional state below.
    }
    return {
      isOpen: banner?.classList.contains('is-open') ?? true,
      storedEssential:
        saved?.v === 1
        && saved.ads === false
        && saved.analytics === false
    };
  });
  if (consentDecision.isOpen) {
    issues.push('cookie consent did not close after Essential only');
  }
  if (!consentDecision.storedEssential) {
    issues.push('Essential only consent was not persisted');
  }
  const afterConsent = await getState();

  const suppressionZones = {
    '/': ['.meet-logan__cta', '.loan-calc'],
    '/products': ['.products-hero', '.quiz'],
    '/funded-deals': ['.deals-hero'],
    '/blog': ['.blog-hero', '.blog-callout']
  }[route] || [];
  for (const selector of suppressionZones) {
    const zone = page.locator(selector).first();
    if (!(await zone.count())) {
      issues.push(`sticky suppression zone is missing: ${selector}`);
      continue;
    }
    await zone.scrollIntoViewIfNeeded();
    await page.waitForTimeout(240);
    const state = await getState();
    if (state.sticky.visible) {
      issues.push(`sticky CTA competes with ${selector}`);
    }
  }

  if (STICKY_INELIGIBLE_ROUTES.has(route)) {
    if (afterConsent.sticky.visible) {
      issues.push(`sticky CTA must remain hidden on ${route}`);
    }
    return issues;
  }

  if (STICKY_ELIGIBLE_ROUTES.has(route)) {
    if (route === '/') {
      const heroState = await getState();
      if (heroState.sticky.visible) {
        issues.push('sticky CTA competes with visible homepage hero CTAs');
      }
    }

    let eligibleState = null;
    for (const progress of [0.22, 0.34, 0.46, 0.58, 0.7, 0.82]) {
      await page.evaluate(value => {
        const maximum = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        window.scrollTo({ top: maximum * value, behavior: 'instant' });
      }, progress);
      await page.waitForTimeout(220);
      eligibleState = await getState();
      if (eligibleState.sticky.visible) break;
    }
    if (!eligibleState?.sticky.exists || !eligibleState.sticky.visible) {
      issues.push(`sticky CTA is not visible on eligible long page ${route}`);
    }

    const menuToggle = page.locator('.mobile-menu-toggle').first();
    if (await menuToggle.count()) {
      await menuToggle.click();
      await page.waitForTimeout(160);
      const menuState = await getState();
      if (menuState.sticky.visible) {
        issues.push('sticky CTA remains visible beneath the open mobile menu');
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(160);
    }
  }

  const conversionForm = page.locator(
    'main form[data-netlify="true"], main form[netlify], '
      + 'main form[data-netlify], main form[method="POST"], main form[method="post"]'
  );
  if (await conversionForm.count()) {
    await conversionForm.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const formState = await getState();
    if (formState.sticky.visible) {
      issues.push('sticky CTA remains visible while a conversion form intersects');
    }
  }

  return issues;
}

async function inspectHeroVideo(page, width) {
  await page
    .waitForFunction(() => {
      const video = document.querySelector('.hero-video');
      return !video || video.readyState >= 2 || Boolean(video.error);
    }, null, { timeout: 5_000 })
    .catch(() => {});

  return page.evaluate(async expectedWidth => {
    const issues = [];
    const video = document.querySelector('.hero-video');
    if (!video) return ['homepage hero video element is missing'];

    let posterPath = '';
    try {
      posterPath = new URL(video.poster, document.baseURI).pathname;
    } catch {
      posterPath = video.getAttribute('poster') || '';
    }
    if (posterPath !== '/images/arizona-hero-poster.webp') {
      issues.push(`hero poster changed: ${posterPath || '(empty)'}`);
    }

    const source =
      video.currentSrc ||
      video.querySelector('source')?.src ||
      video.querySelector('source')?.getAttribute('src') ||
      '';
    let sourcePath = '';
    try {
      sourcePath = new URL(source, document.baseURI).pathname;
    } catch {
      sourcePath = source;
    }
    const style = getComputedStyle(video);
    const start = video.currentTime;
    await new Promise(resolve => setTimeout(resolve, 450));
    const end = video.currentTime;

    if (sourcePath !== '/images/arizona-hero.mp4') {
      issues.push(`hero video source changed or is missing: ${sourcePath || '(empty)'}`);
    }
    if (style.display === 'none' || style.visibility === 'hidden') {
      issues.push('hero video is hidden on a capable desktop');
    }
    if (!video.autoplay || !video.muted || !video.loop || !video.playsInline) {
      issues.push('hero video autoplay/muted/loop/playsinline contract changed');
    }
    if (video.error) issues.push(`hero video media error code ${video.error.code}`);
    if (video.readyState < 2) {
      issues.push(`hero video is not ready (readyState ${video.readyState})`);
    }
    if (video.paused) issues.push('hero video is paused on capable desktop');
    if (end <= start && video.readyState < 3) {
      issues.push(
        `hero video did not advance and is not future-data ready (${start} → ${end})`
      );
    }

    const hero = document.querySelector('main[data-original-home-refined] > .hero');
    const overlay = hero?.querySelector('.hero-overlay');
    const title = hero?.querySelector('.hero-title.gradient-text');
    const nextSection = hero?.nextElementSibling;
    if (!hero || !overlay || !title || !nextSection) {
      issues.push('refined hero presentation contract is incomplete');
      return issues;
    }

    const overlayStyle = getComputedStyle(overlay);
    const titleStyle = getComputedStyle(title);
    const gap = nextSection.getBoundingClientRect().top - hero.getBoundingClientRect().bottom;
    if (overlayStyle.backgroundImage !== 'none') {
      issues.push(`hero overlay still uses a gradient: ${overlayStyle.backgroundImage}`);
    }
    if (titleStyle.backgroundImage !== 'none') {
      issues.push(`hero title still uses a gradient: ${titleStyle.backgroundImage}`);
    }
    if (gap < 8 || gap > 32) {
      issues.push(
        `hero-to-next-section gap is outside the intended small range at ${expectedWidth}px: ${gap.toFixed(1)}px`
      );
    }
    return issues;
  }, width);
}

async function inspectCalculator(page) {
  const calculator = page.locator('.loan-calc[data-project-calc]').first();
  if (!(await calculator.count())) return ['homepage project calculator is missing'];

  const purchase = calculator.locator('[data-project-calc="purchase"]');
  const rehab = calculator.locator('[data-project-calc="rehab"]');
  const value = calculator.locator('[data-project-calc="value"]');
  const cost = calculator.locator('[data-project-calc="cost"]');
  const spread = calculator.locator('[data-project-calc="spread"]');
  if (
    !(await purchase.count()) ||
    !(await rehab.count()) ||
    !(await value.count()) ||
    !(await cost.count()) ||
    !(await spread.count())
  ) {
    return ['project calculator controls or output are incomplete'];
  }

  const before = (await spread.textContent())?.trim() || '';
  await purchase.fill('$100,000');
  await rehab.fill('$25,000');
  await value.fill('$160,000');
  await page.waitForTimeout(80);
  const afterCost = (await cost.textContent())?.trim() || '';
  const afterSpread = (await spread.textContent())?.trim() || '';
  const issues = [];

  if (!afterSpread || afterSpread === before) {
    issues.push('project calculator output did not update');
  }
  if (afterCost !== '$125,000') {
    issues.push(`project calculator total cost is incorrect: ${afterCost || '(empty)'}`);
  }
  if (afterSpread !== '$35,000') {
    issues.push(`project calculator gross spread is incorrect: ${afterSpread || '(empty)'}`);
  }
  return issues;
}

async function inspectReducedMotionFallback(browser) {
  const viewport = 'reduced-motion';
  const route = '/';
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    serviceWorkers: 'block'
  });
  await installSafetyRails(context);
  const page = await context.newPage();
  const videoRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/images/arizona-hero.mp4') {
      videoRequests.push(request.url());
    }
  });

  try {
    const response = await page.goto(routeUrl(route), {
      waitUntil: 'load',
      timeout: 30_000
    });
    await check(viewport, route, 'document-200', () =>
      response?.status() === 200
        ? null
        : `expected 200, got ${response?.status() ?? 'no response'}`
    );
    await page.waitForTimeout(250);

    await check(viewport, route, 'static-hero-fallback', async () => {
      const state = await page.evaluate(() => {
        const video = document.querySelector('.hero-video');
        const media = document.querySelector('.hero-media');
        const hero = document.querySelector('.hero');
        const fallback = document.querySelector(
          '.hero-fallback, .hero-media picture img, .hero-media > img'
        );
        const backgrounds = [media, hero]
          .filter(Boolean)
          .map(element => getComputedStyle(element).backgroundImage);
        const fallbackSource =
          fallback?.currentSrc || fallback?.getAttribute?.('src') || '';
        const videoStyle = video ? getComputedStyle(video) : null;
        return {
          hasVideo: Boolean(video),
          poster: video?.poster || '',
          videoHidden:
            !video ||
            videoStyle.display === 'none' ||
            videoStyle.visibility === 'hidden' ||
            Number.parseFloat(videoStyle.opacity || '1') <= 0.05,
          hasPosterFallback:
            backgrounds.some(value => value.includes('arizona-hero-poster.webp')) ||
            fallbackSource.includes('/images/arizona-hero-poster.webp'),
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
        };
      });
      const issues = [];
      if (!state.reduced) issues.push('browser did not apply reduced-motion preference');
      if (!state.hasVideo) issues.push('hero video element was removed');
      if (!state.poster.endsWith('/images/arizona-hero-poster.webp')) {
        issues.push(`hero poster changed: ${state.poster || '(empty)'}`);
      }
      if (!state.videoHidden) issues.push('hero video still animates in reduced motion');
      if (!state.hasPosterFallback) {
        issues.push('reduced-motion hero has no static Arizona poster fallback');
      }
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport, route, 'reduced-motion-content-visible', async () => {
      await scrollThroughPage(page);
      const stuck = await inspectHiddenContent(page);
      return stuck.length ? `opacity-hidden content: ${stuck.join(', ')}` : null;
    });
    await check(viewport, route, 'reduced-motion-no-video-download', () =>
      videoRequests.length
        ? `hero MP4 was requested ${videoRequests.length} time(s)`
        : null
    );
  } finally {
    await page.close();
    await context.close();
  }
}

async function inspectReducedMotionSticky(browser) {
  const viewport = 'reduced-motion-mobile';
  const route = '/';
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    serviceWorkers: 'block'
  });
  await installSafetyRails(context);
  const page = await context.newPage();

  try {
    const response = await page.goto(routeUrl(route), {
      waitUntil: 'load',
      timeout: 30_000
    });
    await check(viewport, route, 'document-200', () =>
      response?.status() === 200
        ? null
        : `expected 200, got ${response?.status() ?? 'no response'}`
    );
    await check(viewport, route, 'sticky-respects-reduced-motion', async () => {
      const issues = await inspectStickyAndConsent(page, route, 390);
      return issues.length ? issues.join(' | ') : null;
    });
  } finally {
    await page.close();
    await context.close();
  }
}

async function inspectConstrainedNetworkVideoFallback(
  browser,
  { name, saveData, effectiveType }
) {
  const route = '/';
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
    serviceWorkers: 'block'
  });
  await context.addInitScript(
    connection => {
      Object.defineProperty(window.navigator, 'connection', {
        configurable: true,
        value: connection
      });
    },
    { saveData, effectiveType }
  );
  await installSafetyRails(context);
  const page = await context.newPage();
  const videoRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/images/arizona-hero.mp4') {
      videoRequests.push(request.url());
    }
  });

  try {
    const response = await page.goto(routeUrl(route), {
      waitUntil: 'load',
      timeout: 30_000
    });
    await check(name, route, 'document-200', () =>
      response?.status() === 200
        ? null
        : `expected 200, got ${response?.status() ?? 'no response'}`
    );
    await page.waitForTimeout(250);

    await check(name, route, 'network-capability-applied', async () => {
      const connection = await page.evaluate(() => ({
        saveData: Boolean(navigator.connection?.saveData),
        effectiveType: navigator.connection?.effectiveType || ''
      }));
      if (connection.saveData !== saveData) {
        return `saveData expected ${saveData}, got ${connection.saveData}`;
      }
      if (connection.effectiveType !== effectiveType) {
        return `effectiveType expected ${effectiveType}, got ${connection.effectiveType}`;
      }
      return null;
    });

    await check(name, route, 'constrained-network-static-poster', async () => {
      const state = await page.evaluate(() => {
        const video = document.querySelector('.hero-video');
        return {
          hasVideo: Boolean(video),
          hasSource: Boolean(video?.querySelector('source')),
          poster: video?.poster || ''
        };
      });
      const issues = [];
      if (!state.hasVideo) issues.push('hero video element was removed');
      if (state.hasSource) issues.push('hero MP4 source was attached');
      if (!state.poster.endsWith('/images/arizona-hero-poster.webp')) {
        issues.push(`hero poster changed: ${state.poster || '(empty)'}`);
      }
      return issues.length ? issues.join(' | ') : null;
    });

    await check(name, route, 'constrained-network-no-video-download', () =>
      videoRequests.length
        ? `hero MP4 was requested ${videoRequests.length} time(s)`
        : null
    );
  } finally {
    await page.close();
    await context.close();
  }
}

async function inspectBackgroundToForegroundVideo(browser) {
  const viewport = 'background-to-foreground';
  const route = '/';
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
    serviceWorkers: 'block'
  });
  await context.addInitScript(() => {
    window.__qaVisibilityState = 'hidden';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => window.__qaVisibilityState
    });
    window.__qaSetVisibility = state => {
      window.__qaVisibilityState = state;
      document.dispatchEvent(new Event('visibilitychange'));
    };
  });
  await installSafetyRails(context);
  const page = await context.newPage();
  const videoRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/images/arizona-hero.mp4') {
      videoRequests.push(request.url());
    }
  });

  try {
    const response = await page.goto(routeUrl(route), {
      waitUntil: 'load',
      timeout: 30_000
    });
    await check(viewport, route, 'document-200', () =>
      response?.status() === 200
        ? null
        : `expected 200, got ${response?.status() ?? 'no response'}`
    );
    await page.waitForTimeout(250);

    await check(viewport, route, 'background-defers-video', async () => {
      const state = await page.evaluate(() => ({
        visibility: document.visibilityState,
        hasSource: Boolean(document.querySelector('.hero-video source'))
      }));
      const issues = [];
      if (state.visibility !== 'hidden') {
        issues.push(`expected hidden document, got ${state.visibility}`);
      }
      if (state.hasSource) issues.push('hero MP4 source attached while hidden');
      if (videoRequests.length) {
        issues.push(`hero MP4 requested ${videoRequests.length} time(s) while hidden`);
      }
      return issues.length ? issues.join(' | ') : null;
    });

    await page.evaluate(() => window.__qaSetVisibility('visible'));
    await page.waitForTimeout(500);
    await check(viewport, route, 'foreground-restores-video', async () => {
      const state = await page.evaluate(() => ({
        visibility: document.visibilityState,
        source:
          document.querySelector('.hero-video source')?.getAttribute('src') || ''
      }));
      const issues = [];
      if (state.visibility !== 'visible') {
        issues.push(`expected visible document, got ${state.visibility}`);
      }
      if (state.source !== '/images/arizona-hero.mp4') {
        issues.push(`hero MP4 source missing after foreground: ${state.source || '(empty)'}`);
      }
      if (!videoRequests.length) issues.push('hero MP4 was not requested after foreground');
      return issues.length ? issues.join(' | ') : null;
    });
  } finally {
    await page.close();
    await context.close();
  }
}

async function auditPage(context, viewport, route) {
  const page = await context.newPage();
  const runtimeErrors = [];
  const resourceErrors = [];
  const unexpectedPosts = [];

  page.on('pageerror', error => {
    runtimeErrors.push(`page error: ${error.message}`);
  });
  page.on('console', message => {
    if (message.type() === 'error') {
      runtimeErrors.push(`console error: ${message.text()}`);
    }
  });
  page.on('response', response => {
    if (isInternalUrl(response.url()) && response.status() >= 400) {
      resourceErrors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  page.on('request', request => {
    if (
      request.method() === 'POST' &&
      isInternalUrl(request.url()) &&
      !isTelemetryUrl(request.url())
    ) {
      unexpectedPosts.push(`${request.method()} ${request.url()}`);
    }
  });

  try {
    let response;
    await check(viewport.name, route, 'navigation', async () => {
      response = await page.goto(routeUrl(route), {
        waitUntil: 'load',
        timeout: 30_000
      });
      return null;
    });

    if (!response) return;

    await check(viewport.name, route, 'document-200', () =>
      response.status() === 200
        ? null
        : `expected 200, got ${response.status()} (${response.url()})`
    );

    await page.waitForTimeout(200);

    await check(viewport.name, route, 'structure-and-palette', async () => {
      const state = await inspectStructure(page);
      const issues = [];
      if (state.mains !== 1) issues.push(`expected one <main>, found ${state.mains}`);
      if (state.h1s !== 1) issues.push(`expected one <h1>, found ${state.h1s}`);
      if (state.overflow > 1) {
        issues.push(`horizontal overflow: ${state.overflow}px`);
      }
      if (state.teal !== '#4fe3d2') {
        issues.push(`--gf-teal changed: ${state.teal || '(missing)'}`);
      }
      if (state.ember !== '#f0b26b') {
        issues.push(`--gf-ember changed: ${state.ember || '(missing)'}`);
      }
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'one-navigation-mode', async () => {
      const issues = await inspectNavigationMode(page, viewport.width);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'schema-policy', async () => {
      const issues = await inspectSchema(page);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'social-metadata', async () => {
      const issues = await inspectSocialMetadata(page);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'clean-internal-urls', async () => {
      const issues = await inspectInternalUrls(page);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'form-contracts', async () => {
      const issues = await inspectForms(page, route);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'refined-route-flow', async () => {
      const issues = await inspectRefinedRouteFlow(
        page,
        route,
        viewport.width
      );
      return issues.length ? issues.join(' | ') : null;
    });

    if (route === '/') {
      await check(viewport.name, route, 'preserved-hero-video', async () => {
        const issues = await inspectHeroVideo(page, viewport.width);
        return issues.length ? issues.join(' | ') : null;
      });
      await check(viewport.name, route, 'calculator-behavior', async () => {
        const issues = await inspectCalculator(page);
        return issues.length ? issues.join(' | ') : null;
      });
    }

    await check(viewport.name, route, 'sticky-and-consent', async () => {
      const issues = await inspectStickyAndConsent(page, route, viewport.width);
      return issues.length ? issues.join(' | ') : null;
    });

    await check(viewport.name, route, 'broken-images', async () => {
      const broken = await eagerlyLoadAndInspectImages(page);
      return broken.length
        ? broken
            .map(image => `${image.source}${image.alt ? ` (${image.alt})` : ''}`)
            .join(' | ')
        : null;
    });

    await check(viewport.name, route, 'revealed-content', async () => {
      await scrollThroughPage(page);
      const stuck = await inspectHiddenContent(page);
      return stuck.length ? `opacity-hidden content: ${stuck.join(', ')}` : null;
    });

    await check(viewport.name, route, 'post-interaction-overflow', async () => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      return overflow > 1 ? `horizontal overflow after interactions: ${overflow}px` : null;
    });

    await check(viewport.name, route, 'no-form-submissions', async () => {
      const trappedSubmissions = await page.evaluate(
        () => window.__qaFormSubmissions || []
      );
      const all = [...unexpectedPosts, ...trappedSubmissions.map(JSON.stringify)];
      return all.length ? `unexpected form submission: ${all.join(' | ')}` : null;
    });

    if (SCREENSHOTS) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, screenshotName(viewport.name, route)),
        fullPage: true
      });
    }

    await page.waitForTimeout(50);
    await check(viewport.name, route, 'runtime-errors', () => {
      const all = [...new Set([...runtimeErrors, ...resourceErrors])];
      return all.length ? all.join(' | ') : null;
    });
  } finally {
    await page.close();
  }
}

if (SCREENSHOTS) await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'no-preference',
      serviceWorkers: 'block'
    });
    await installSafetyRails(context);

    try {
      for (const route of ROUTES) {
        await auditPage(context, viewport, route);
      }
    } finally {
      await context.close();
    }

    console.log(
      `Preservation QA: ${ROUTES.length} routes at ${viewport.width}px (${viewport.name})`
    );
  }

  await inspectReducedMotionFallback(browser);
  await inspectReducedMotionSticky(browser);
  await inspectConstrainedNetworkVideoFallback(browser, {
    name: 'save-data',
    saveData: true,
    effectiveType: '4g'
  });
  await inspectConstrainedNetworkVideoFallback(browser, {
    name: 'slow-network',
    saveData: false,
    effectiveType: '2g'
  });
  await inspectBackgroundToForegroundVideo(browser);
} finally {
  await browser.close();
}

console.log(
  `Preservation QA: ${checks} checks; ${failures.length} failed; ` +
    `${blockedTelemetryRequests} telemetry requests blocked`
);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
