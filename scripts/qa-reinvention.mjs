#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:8888').replace(/\/$/, '');
const SCREENSHOTS = process.env.QA_SCREENSHOTS === '1';
const SCREENSHOT_DIR = path.resolve(process.env.QA_SCREENSHOT_DIR || '/tmp/grand-funding-reinvention-qa');
const routes = ['/', '/apply', '/blog', '/bridge-loans-california', '/funded-deals', '/thanks-contact'];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'header-seam', width: 800, height: 900 },
  { name: 'desktop', width: 1440, height: 900 }
];
const TELEMETRY_HOST_SUFFIXES = [
  'doubleclick.net',
  'google-analytics.com',
  'googleadservices.com',
  'googletagmanager.com'
];
const failures = [];
let checks = 0;

function assert(condition, label, detail = '') {
  checks += 1;
  if (!condition) failures.push(`${label}${detail ? `: ${detail}` : ''}`);
}

async function installTelemetryFirewall(page) {
  const blocked = [];
  await page.route('**/*', async route => {
    const requestUrl = new URL(route.request().url());
    const telemetry = TELEMETRY_HOST_SUFFIXES.some(suffix =>
      requestUrl.hostname === suffix || requestUrl.hostname.endsWith(`.${suffix}`)
    );
    if (!telemetry) {
      await route.continue();
      return;
    }
    blocked.push(requestUrl.hostname);
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: ''
    });
  });
  return blocked;
}

async function inspectPage(page, route, viewport, blockedTelemetry) {
  const label = `${route} @ ${viewport.width}x${viewport.height}`;
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(`pageerror ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(`console ${message.text()}`);
  });

  const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  assert(response?.ok(), `${label} response`, String(response?.status()));

  const state = await page.evaluate(() => {
    const schemaBlocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const schemas = [];
    for (const block of schemaBlocks) {
      try { schemas.push(JSON.parse(block.textContent || '{}')); } catch {}
    }
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const schemaText = JSON.stringify(schemas);
    const requiredSocial = [
      'meta[property="og:image:type"]',
      'meta[property="og:image:width"]',
      'meta[property="og:image:height"]',
      'meta[property="og:image:alt"]',
      'meta[property="og:site_name"]',
      'meta[property="og:locale"]',
      'meta[name="twitter:image:alt"]'
    ];
    return {
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      experienceCss: [...document.styleSheets].some(sheet => sheet.href?.includes('/grand-experience.css')),
      experienceJs: [...document.scripts].some(script => script.src.includes('/grand-experience.js')),
      socialComplete: requiredSocial.every(selector => document.querySelector(selector)?.content),
      canonical,
      schemaCount: schemas.length,
      schemaCanonical: Boolean(canonical && schemaText.includes(canonical)),
      noindex: /\bnoindex\b/i.test(document.querySelector('meta[name="robots"]')?.content || ''),
      universalEngagement: document.querySelectorAll('.engagement-block').length,
      imagesBroken: [...document.images].filter(image => image.complete && image.naturalWidth === 0).length,
      routeMarker: document.body.dataset.grandRoute || '',
      webdriver: navigator.webdriver,
      desktopNavVisible: Boolean(document.querySelector('.nav-list') && getComputedStyle(document.querySelector('.nav-list')).display !== 'none'),
      mobileToggleVisible: Boolean(document.querySelector('.mobile-menu-toggle') && getComputedStyle(document.querySelector('.mobile-menu-toggle')).display !== 'none')
    };
  });

  assert(state.h1 === 1, `${label} one H1`, String(state.h1));
  assert(state.main === 1, `${label} one main`, String(state.main));
  assert(state.overflow <= 1, `${label} horizontal overflow`, `${state.overflow}px`);
  assert(state.experienceCss, `${label} experience CSS`);
  assert(state.experienceJs, `${label} experience JS`);
  assert(state.socialComplete, `${label} premium social metadata`);
  assert(state.schemaCount === (state.noindex ? 0 : 1), `${label} schema release policy`, String(state.schemaCount));
  if (!state.noindex) assert(state.schemaCanonical, `${label} schema/canonical alignment`, state.canonical);
  assert(state.universalEngagement === 0, `${label} legacy engagement removed`, String(state.universalEngagement));
  assert(state.imagesBroken === 0, `${label} broken images`, String(state.imagesBroken));
  assert(Boolean(state.routeMarker), `${label} route marker`);
  assert(state.webdriver === false, `${label} real-user behavior path`, String(state.webdriver));
  assert(!(state.desktopNavVisible && state.mobileToggleVisible), `${label} one navigation mode`);
  assert(runtimeErrors.length === 0, `${label} runtime errors`, runtimeErrors.join(' | '));

  const consent = page.locator('[data-consent="essential"]');
  await page.waitForTimeout(420);
  if (await consent.isVisible().catch(() => false)) {
    if (viewport.width <= 820) {
      assert(!(await page.locator('.sticky-dual').isVisible()), `${label} consent/sticky collision prevented`);
    }
    await consent.click();
  }

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  let stuckReveals = 0;
  for (let top = 0; top < scrollHeight; top += Math.max(360, Math.round(viewport.height * 0.72))) {
    await page.evaluate(value => window.scrollTo({ top: value, behavior: 'auto' }), top);
    await page.waitForTimeout(24);
    stuckReveals += await page.evaluate(() => [...document.querySelectorAll('.reveal, .reveal-stagger')]
      .filter(element => {
        const bounds = element.getBoundingClientRect();
        const visible = bounds.bottom > 0 && bounds.top < innerHeight;
        return visible && Number.parseFloat(getComputedStyle(element).opacity) < 0.3;
      }).length);
  }
  assert(stuckReveals === 0, `${label} real-user reveals never stuck`, String(stuckReveals));
  assert(blockedTelemetry.length > 0, `${label} analytics safely sandboxed`);
  assert(runtimeErrors.length === 0, `${label} post-scroll runtime errors`, runtimeErrors.join(' | '));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));

  if (route === '/') {
    const home = await page.evaluate(() => ({
      home: document.querySelectorAll('[data-grand-home]').length,
      sections: document.querySelectorAll('[data-grand-home] > section').length,
      forms: document.querySelectorAll('[data-grand-home] form[name="pre-approval"]').length,
      calculators: document.querySelectorAll('[data-grand-home] [data-loan-calc]').length,
      faqVisible: document.querySelectorAll('.gd-faq__item').length,
      socialImage: document.querySelector('meta[property="og:image"]')?.content || ''
    }));
    assert(home.home === 1, `${label} one Grand homepage`, String(home.home));
    assert(home.sections === 8, `${label} eight-section hierarchy`, String(home.sections));
    assert(home.forms === 1, `${label} preserved pre-approval form`, String(home.forms));
    assert(home.calculators === 1, `${label} preserved calculator`, String(home.calculators));
    assert(home.faqVisible === 6, `${label} visible FAQ/schema parity`, String(home.faqVisible));
    assert(home.socialImage.includes('og-home-desert-deal-room-20260724.jpg'), `${label} homepage social art`);

    const docketButtons = page.locator('[data-docket-option]');
    await docketButtons.nth(1).click();
    assert(
      (await docketButtons.nth(1).getAttribute('aria-pressed')) === 'true',
      `${label} docket selection`
    );
    assert(
      (await page.locator('[data-docket-summary]').textContent())?.startsWith('For construction'),
      `${label} docket summary`
    );

    if (state.mobileToggleVisible) {
      const toggle = page.locator('.mobile-menu-toggle');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(30);
      assert(
        await page.evaluate(() => document.activeElement?.closest('.nav-list') !== null),
        `${label} mobile menu enters opened links`
      );
      await page.keyboard.press('Escape');
      assert(
        await toggle.evaluate(element => document.activeElement === element),
        `${label} mobile menu restores toggle focus`
      );
    }
  }

  if (route === '/apply') {
    const apply = await page.evaluate(() => ({
      falseAvailability: document.body.textContent.includes('Logan is available'),
      talkBlocks: document.querySelectorAll('.talk-to-logan').length,
      forms: Array.from(document.querySelectorAll('form[name="pre-approval"]')).filter(
        (form) =>
          form.hasAttribute('data-netlify') ||
          Boolean(form.querySelector('input[name="form-name"][value="pre-approval"]'))
      ).length,
      stickyVisible: Boolean(document.querySelector('[data-sticky-cta]:not([hidden])'))
    }));
    assert(!apply.falseAvailability, `${label} false live availability removed`);
    assert(apply.talkBlocks === 1, `${label} one Logan contact path`, String(apply.talkBlocks));
    assert(apply.forms === 1, `${label} apply form contract`, String(apply.forms));
    assert(!apply.stickyVisible, `${label} redundant apply sticky hidden`);
  }

  if (route === '/thanks-contact') {
    const thanksContact = await page.evaluate(() => ({
      stickyVisible: Boolean(document.querySelector('[data-sticky-cta]:not([hidden])')),
      nextStep: document.querySelectorAll('.gd-route-next').length,
      socialImage: document.querySelector('meta[property="og:image"]')?.content || ''
    }));
    assert(!thanksContact.stickyVisible, `${label} thank-you sticky hidden`);
    assert(thanksContact.nextStep === 0, `${label} thank-you route-next suppressed`);
    assert(thanksContact.socialImage.includes('og-logan-direct-lender-20260724.jpg'), `${label} human social art`);
  }

  if (route === '/blog') {
    const blogStructure = await page.evaluate(() => {
      const articles = [...document.querySelectorAll('article.blog-card')];
      return {
        articles: articles.length,
        links: document.querySelectorAll('a.blog-card__link').length,
        titles: document.querySelectorAll('h3.blog-card__title').length,
        malformed: document.querySelectorAll('h3.blog-card__title').length
          - [...document.querySelectorAll('h3.blog-card__title')].filter(element => element.tagName === 'H3').length,
        invalidArticles: articles.filter(article =>
          article.querySelectorAll(':scope > a.blog-card__link').length !== 1
          || article.querySelectorAll('h3.blog-card__title').length !== 1
        ).length,
        count: document.querySelector('[data-blog-count]')?.textContent?.trim() || ''
      };
    });
    assert(blogStructure.malformed === 0, `${label} blog heading semantics`, String(blogStructure.malformed));
    assert(blogStructure.articles === 18, `${label} one article per post`, String(blogStructure.articles));
    assert(blogStructure.links === blogStructure.articles, `${label} card-link/article parity`, String(blogStructure.links));
    assert(blogStructure.titles === blogStructure.articles, `${label} card-title/article parity`, String(blogStructure.titles));
    assert(blogStructure.invalidArticles === 0, `${label} self-contained blog cards`, String(blogStructure.invalidArticles));
    assert(blogStructure.count === '18 posts', `${label} current visible post count`, blogStructure.count);
  }

  if (SCREENSHOTS) {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
    const slug = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-/, '');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${slug}-${viewport.name}.png`),
      fullPage: true,
      animations: 'disabled'
    });
  }
}

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled']
});
try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'no-preference'
      });
      const blockedTelemetry = await installTelemetryFirewall(page);
      try {
        await inspectPage(page, route, viewport, blockedTelemetry);
      } catch (error) {
        failures.push(`${route} @ ${viewport.width}x${viewport.height}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce'
  });
  await installTelemetryFirewall(reducedPage);
  await reducedPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const reduced = await reducedPage.evaluate(() => ({
    mode: document.documentElement.dataset.experienceMode,
    hidden: [...document.querySelectorAll('.gd-home > section')].filter(element =>
      Number.parseFloat(getComputedStyle(element).opacity) < 0.9
    ).length
  }));
  assert(reduced.mode === 'still', 'reduced motion selects still experience', reduced.mode);
  assert(reduced.hidden === 0, 'reduced motion keeps content visible', String(reduced.hidden));
  await reducedPage.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Reinvention QA failed: ${failures.length} of ${checks} checks`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Reinvention QA passed: ${checks} checks across ${routes.length} routes and ${viewports.length} viewports`);
if (SCREENSHOTS) console.log(`Screenshots: ${SCREENSHOT_DIR}`);
