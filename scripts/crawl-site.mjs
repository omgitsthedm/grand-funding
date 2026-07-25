#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8888';
const SITE_DIR = path.resolve(process.env.SITE_DIR || 'dist');
const baseOrigin = new URL(BASE_URL).origin;
const telemetryHosts = [
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
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function htmlRoutes(directory, relative = '') {
  const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) routes.push(...await htmlRoutes(directory, child));
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.html') continue;
    const normalized = child.split(path.sep).join('/');
    routes.push(normalized === 'index.html' ? '/' : `/${normalized}`);
  }

  return routes;
}

function internal(url) {
  try {
    return new URL(url).origin === baseOrigin;
  } catch {
    return false;
  }
}

function telemetry(url) {
  try {
    return telemetryHosts.some(pattern => pattern.test(new URL(url).hostname));
  } catch {
    return false;
  }
}

const routes = (await htmlRoutes(SITE_DIR))
  .filter(route => !/^\/google[a-z0-9]+\.html$/i.test(route))
  .sort();
const browser = await chromium.launch({ headless: true });
const failures = [];
let checks = 0;
let blockedTelemetryRequests = 0;

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'no-preference',
      serviceWorkers: 'block'
    });
    await context.route('**/*', async route => {
      if (telemetry(route.request().url())) {
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

    for (const route of routes) {
      const page = await context.newPage();
      const pageFailures = [];
      const addFailure = message => {
        if (!pageFailures.includes(message)) pageFailures.push(message);
      };

      page.on('pageerror', error => addFailure(`page error: ${error.message}`));
      page.on('console', message => {
        if (message.type() === 'error') addFailure(`console error: ${message.text()}`);
      });
      page.on('requestfailed', request => {
        if (internal(request.url())) {
          addFailure(`request failed: ${request.url()} (${request.failure()?.errorText || 'unknown'})`);
        }
      });
      page.on('response', response => {
        if (internal(response.url()) && response.status() >= 400) {
          addFailure(`HTTP ${response.status()}: ${response.url()}`);
        }
      });

      try {
        const response = await page.goto(new URL(route, BASE_URL).href, {
          waitUntil: 'load',
          timeout: 30_000
        });
        if (!response || response.status() >= 400) {
          addFailure(`document status: ${response?.status() ?? 'no response'}`);
        }
        await page.waitForTimeout(100);

        const state = await page.evaluate(() => ({
          hasMain: Boolean(document.querySelector('main')),
          hasH1: Boolean(document.querySelector('h1')),
          overflow: document.documentElement.scrollWidth - window.innerWidth
        }));
        if (!state.hasMain) addFailure('missing <main>');
        if (!state.hasH1) addFailure('missing <h1>');
        if (state.overflow > 1) addFailure(`horizontal overflow: ${state.overflow}px`);
      } catch (error) {
        addFailure(`navigation failed: ${error.message}`);
      }

      checks += 1;
      if (pageFailures.length) {
        failures.push({ viewport: viewport.name, route, failures: pageFailures });
      }
      await page.close();
    }

    await context.close();
    console.log(`Crawled ${routes.length} pages at ${viewport.name} (${viewport.width}x${viewport.height})`);
  }
} finally {
  await browser.close();
}

console.log(
  `Runtime crawl: ${checks} page/viewport checks; ${failures.length} failed; ` +
    `${blockedTelemetryRequests} telemetry requests blocked`
);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
