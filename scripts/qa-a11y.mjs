#!/usr/bin/env node
/**
 * Grand Funding — representative WCAG browser audit
 *
 * Prerequisites:
 *   npm run build
 *   npm run serve -- --dir dist --port 8888
 *   BASE_URL=http://127.0.0.1:8888 node scripts/qa-a11y.mjs
 *
 * This suite does not interact with forms. Analytics and advertising requests
 * are fulfilled locally so the audit cannot create telemetry.
 */

import AxeBuilder from '@axe-core/playwright';
import { chromium, devices } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:8888').replace(
  /\/+$/,
  ''
);
const BASE_ORIGIN = new URL(BASE_URL).origin;
const ROUTES = (
  process.env.QA_ROUTES?.split(',').map(route => route.trim()).filter(Boolean)
  || [
    '/',
    '/products',
    '/apply',
    '/contact',
    '/faq',
    '/funded-deals',
    '/blog',
    '/bridge-loans-arizona',
    '/posts/how-fast-can-you-close-hard-money-loan-arizona',
    '/privacy'
  ]
);
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const TELEMETRY_HOSTS = [
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)analytics\.google\.com$/i,
  /(^|\.)googleadservices\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)facebook\.net$/i,
  /(^|\.)clarity\.ms$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)segment\.com$/i,
  /(^|\.)segment\.io$/i,
  /(^|\.)posthog\.com$/i
];

const withoutDefaultBrowser = descriptor => {
  const { defaultBrowserType: _defaultBrowserType, ...options } = descriptor;
  return options;
};

const PROFILES = [
  {
    name: 'desktop',
    options: {
      ...withoutDefaultBrowser(devices['Desktop Chrome']),
      viewport: { width: 1440, height: 900 }
    }
  },
  {
    name: 'mobile',
    options: withoutDefaultBrowser(devices['Pixel 7'])
  }
];

const failures = [];
let checks = 0;
let blockedTelemetryRequests = 0;

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
    return new URL(rawUrl, BASE_URL).origin === BASE_ORIGIN;
  } catch {
    return false;
  }
}

function routeUrl(route) {
  return new URL(route, `${BASE_URL}/`).href;
}

function compactNode(node) {
  return {
    target: node.target,
    html: node.html.replace(/\s+/g, ' ').trim().slice(0, 240),
    failureSummary: node.failureSummary?.replace(/\s+/g, ' ').trim() || ''
  };
}

async function installSafetyRails(context) {
  await context.route('**/*', async route => {
    if (isTelemetryUrl(route.request().url())) {
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
}

const browser = await chromium.launch({ headless: true });

try {
  for (const profile of PROFILES) {
    const context = await browser.newContext({
      ...profile.options,
      colorScheme: 'dark',
      locale: 'en-US',
      reducedMotion: 'no-preference',
      serviceWorkers: 'block'
    });
    await installSafetyRails(context);

    for (const route of ROUTES) {
      const page = await context.newPage();
      const runtimeErrors = [];

      page.on('pageerror', error => {
        runtimeErrors.push(`page error: ${error.message}`);
      });
      page.on('requestfailed', request => {
        if (!isInternalUrl(request.url())) return;
        runtimeErrors.push(
          `request failed: ${request.url()} `
            + `(${request.failure()?.errorText || 'unknown error'})`
        );
      });

      try {
        const response = await page.goto(routeUrl(route), {
          waitUntil: 'load',
          timeout: 30_000
        });
        if (!response || response.status() >= 400) {
          failures.push({
            profile: profile.name,
            route,
            type: 'navigation',
            detail: `document status ${response?.status() ?? 'no response'}`
          });
          continue;
        }

        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(150);

        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();

        checks += 1;
        if (runtimeErrors.length) {
          failures.push({
            profile: profile.name,
            route,
            type: 'runtime',
            detail: [...new Set(runtimeErrors)]
          });
        }
        for (const violation of results.violations) {
          failures.push({
            profile: profile.name,
            route,
            type: 'axe',
            rule: violation.id,
            impact: violation.impact,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: violation.nodes.map(compactNode)
          });
        }
      } catch (error) {
        failures.push({
          profile: profile.name,
          route,
          type: 'exception',
          detail: error?.stack || error?.message || String(error)
        });
      } finally {
        await page.close();
      }
    }

    await context.close();
    console.log(
      `A11y audited ${ROUTES.length} routes in the ${profile.name} profile`
    );
  }
} finally {
  await browser.close();
}

console.log(
  `A11y QA: ${checks} page/profile audits; `
    + `${failures.length} failures; `
    + `${blockedTelemetryRequests} telemetry requests blocked`
);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
