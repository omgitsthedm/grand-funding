#!/usr/bin/env node
/**
 * Grand Funding — conversion integrity QA
 *
 * Prerequisites:
 *   npm run build
 *   npm run serve -- --dir dist --port 8888
 *   BASE_URL=http://127.0.0.1:8888 node scripts/qa-conversion.mjs
 *
 * Safety:
 * - Refuses non-loopback BASE_URL values.
 * - Fulfills analytics/advertising requests locally.
 * - Intercepts every same-origin POST. No request can reach Netlify Forms.
 * - Uses synthetic .invalid contact values only.
 */

import { chromium, devices } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:8888').replace(
  /\/+$/,
  ''
);
const BASE = new URL(BASE_URL);
const BASE_ORIGIN = BASE.origin;
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost', '0.0.0.0']);
const PENDING_KEY = 'gf_pending_lead_v1';
const EVENT_LOG_KEY = '__gf_qa_data_layer_v1';
const LEAD_GUARD_PREFIX = 'gf_lead_conversion_v1:';
const RECOVERY_WAIT_MS = Number.parseInt(
  process.env.QA_FORM_RECOVERY_MS || '13000',
  10
);
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
const FORM_SCENARIOS = [
  {
    route: '/apply',
    thanksRoute: '/thanks',
    formName: 'pre-approval',
    type: 'application'
  },
  {
    route: '/contact',
    thanksRoute: '/thanks-contact',
    formName: 'contact',
    type: 'contact'
  }
];

const withoutDefaultBrowser = descriptor => {
  const { defaultBrowserType: _defaultBrowserType, ...options } = descriptor;
  return options;
};

if (!LOOPBACK_HOSTS.has(BASE.hostname)) {
  throw new Error(
    `Conversion QA is local-only. Refusing BASE_URL=${BASE_URL}. `
      + 'Start the built site on localhost so no lead can reach Netlify Forms.'
  );
}
if (!Number.isFinite(RECOVERY_WAIT_MS) || RECOVERY_WAIT_MS < 12_000) {
  throw new Error('QA_FORM_RECOVERY_MS must be at least 12000.');
}

const failures = [];
let checks = 0;
let blockedTelemetryRequests = 0;
let interceptedFormPosts = 0;

function routeUrl(route) {
  return new URL(route, `${BASE_URL}/`).href;
}

function isTelemetryUrl(rawUrl) {
  try {
    const { hostname } = new URL(rawUrl);
    return TELEMETRY_HOSTS.some(pattern => pattern.test(hostname));
  } catch {
    return false;
  }
}

function addFailure(scenario, check, detail) {
  failures.push({
    scenario,
    check,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail)
  });
}

function normalizeDataLayerEntry(entry) {
  if (Array.isArray(entry)) {
    if (entry[0] === 'event') {
      return {
        name: entry[1],
        params: entry[2] && typeof entry[2] === 'object' ? entry[2] : {}
      };
    }
    return { name: '', params: {}, raw: entry };
  }
  if (entry && typeof entry === 'object') {
    if (entry.event) {
      return { name: entry.event, params: entry };
    }
    const numericKeys = Object.keys(entry).filter(key => /^\d+$/.test(key));
    if (numericKeys.length) {
      const tuple = numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map(key => entry[key]);
      return normalizeDataLayerEntry(tuple);
    }
  }
  return { name: '', params: {}, raw: entry };
}

function leadEvents(entries) {
  return entries
    .map(normalizeDataLayerEntry)
    .filter(event => event.name === 'generate_lead');
}

function phoneEvents(entries) {
  return entries
    .map(normalizeDataLayerEntry)
    .filter(event => event.name === 'phone_click');
}

function ctaEvents(entries) {
  return entries
    .map(normalizeDataLayerEntry)
    .filter(event => event.name === 'cta_click');
}

async function installDataLayerRecorder(context) {
  await context.addInitScript(logKey => {
    try {
      localStorage.setItem(
        'gf_consent_v1',
        JSON.stringify({
          v: 1,
          ads: true,
          analytics: true,
          ts: Date.now()
        })
      );
    } catch {
      // Loopback QA still records the in-memory data layer if storage is blocked.
    }
    const normalize = value => {
      if (
        value
        && typeof value === 'object'
        && !Array.isArray(value)
        && Object.keys(value).some(key => /^\d+$/.test(key))
      ) {
        return Object.keys(value)
          .filter(key => /^\d+$/.test(key))
          .sort((a, b) => Number(a) - Number(b))
          .map(key => value[key]);
      }
      return value;
    };
    const record = value => {
      try {
        const log = JSON.parse(sessionStorage.getItem(logKey) || '[]');
        log.push(normalize(value));
        sessionStorage.setItem(logKey, JSON.stringify(log));
      } catch {
        // A failed recorder must not change application behavior.
      }
    };
    const layer = [];
    const nativePush = Array.prototype.push;
    layer.push = function push(...entries) {
      entries.forEach(record);
      return nativePush.apply(this, entries);
    };
    window.dataLayer = layer;
  }, EVENT_LOG_KEY);
}

async function installSafetyRails(context, onPost) {
  await installDataLayerRecorder(context);
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

    const requestUrl = new URL(request.url());
    if (request.method() === 'POST' && requestUrl.origin === BASE_ORIGIN) {
      interceptedFormPosts += 1;
      await onPost(route);
      return;
    }

    await route.continue();
  });
}

async function readEventLog(page) {
  return page.evaluate(logKey => {
    try {
      return JSON.parse(sessionStorage.getItem(logKey) || '[]');
    } catch {
      return [];
    }
  }, EVENT_LOG_KEY);
}

async function resetScenarioStorage(page) {
  await page.evaluate(
    ({ eventLogKey, pendingKey, guardPrefix }) => {
      sessionStorage.removeItem(eventLogKey);
      sessionStorage.removeItem(pendingKey);
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(guardPrefix)) sessionStorage.removeItem(key);
      }
    },
    {
      eventLogKey: EVENT_LOG_KEY,
      pendingKey: PENDING_KEY,
      guardPrefix: LEAD_GUARD_PREFIX
    }
  );
}

async function fillSyntheticRequiredFields(page) {
  await page.locator('form[data-gf-lead-form]').evaluate(form => {
    const synthetic = {
      email: 'codex-qa@example.invalid',
      phone: '6025550100',
      tel: '6025550100',
      url: 'https://example.invalid/qa'
    };

    for (const field of form.querySelectorAll(
      'input[required], select[required], textarea[required]'
    )) {
      if (field.disabled || field.name === 'bot-field') continue;
      if (field instanceof HTMLSelectElement) {
        const option = Array.from(field.options).find(
          candidate => !candidate.disabled && candidate.value
        );
        if (option) field.value = option.value;
      } else if (field instanceof HTMLInputElement) {
        if (['checkbox', 'radio'].includes(field.type)) {
          field.checked = true;
        } else {
          field.value =
            synthetic[field.type]
            || (field.name.toLowerCase().includes('name')
              ? 'Codex QA'
              : 'Synthetic QA value');
        }
      } else {
        field.value = 'Synthetic QA request. Never sent to a lead endpoint.';
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

function validateTypedLead(events, scenario, submissionId) {
  if (events.length !== 1) {
    return `expected exactly one generate_lead event, received ${events.length}`;
  }
  const params = events[0].params;
  const problems = [];
  if (params.form_type !== scenario.type) {
    problems.push(`form_type=${params.form_type ?? 'missing'}`);
  }
  if (params.method !== 'web_form') {
    problems.push(`method=${params.method ?? 'missing'}`);
  }
  if (params.submission_id !== submissionId) {
    problems.push(`submission_id=${params.submission_id ?? 'missing'}`);
  }
  return problems.length ? problems.join(', ') : null;
}

async function runDirectThanksScenario(browser, scenario) {
  const context = await browser.newContext({
    ...withoutDefaultBrowser(devices['Desktop Chrome']),
    serviceWorkers: 'block'
  });
  await installSafetyRails(context, async route => {
    await route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const label = `direct-${scenario.type}-thanks`;

  try {
    await page.goto(routeUrl('/'), { waitUntil: 'load' });
    await resetScenarioStorage(page);
    await page.goto(routeUrl(scenario.thanksRoute), { waitUntil: 'load' });
    await page.waitForTimeout(100);
    let events = leadEvents(await readEventLog(page));
    checks += 1;
    if (events.length) {
      addFailure(label, 'direct-visit-zero-leads', events);
    }

    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(100);
    events = leadEvents(await readEventLog(page));
    checks += 1;
    if (events.length) {
      addFailure(label, 'refresh-zero-leads', events);
    }
  } catch (error) {
    addFailure(label, 'exception', error?.stack || error?.message || String(error));
  } finally {
    await page.close();
    await context.close();
  }
}

async function runSeededMarkerScenario(browser, scenario) {
  const context = await browser.newContext({
    ...withoutDefaultBrowser(devices['Desktop Chrome']),
    serviceWorkers: 'block'
  });
  await installSafetyRails(context, async route => {
    await route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const label = `seeded-${scenario.type}-marker`;
  const submissionId = `qa-${scenario.type}-seeded`;

  try {
    await page.goto(routeUrl('/'), { waitUntil: 'load' });
    await resetScenarioStorage(page);
    await page.evaluate(
      ({ key, marker }) => sessionStorage.setItem(key, JSON.stringify(marker)),
      {
        key: PENDING_KEY,
        marker: {
          v: 1,
          id: submissionId,
          type: scenario.type,
          createdAt: Date.now(),
          path: scenario.route
        }
      }
    );

    await page.goto(routeUrl(scenario.thanksRoute), { waitUntil: 'load' });
    await page.waitForTimeout(100);
    let events = leadEvents(await readEventLog(page));
    checks += 1;
    const typedFailure = validateTypedLead(events, scenario, submissionId);
    if (typedFailure) {
      addFailure(label, 'one-typed-lead', typedFailure);
    }

    const storage = await page.evaluate(
      ({ pendingKey, guardKey }) => ({
        pending: sessionStorage.getItem(pendingKey),
        guard: sessionStorage.getItem(guardKey)
      }),
      {
        pendingKey: PENDING_KEY,
        guardKey: `${LEAD_GUARD_PREFIX}${submissionId}`
      }
    );
    checks += 1;
    if (storage.pending !== null || storage.guard === null) {
      addFailure(label, 'consume-and-guard-marker', storage);
    }

    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(100);
    events = leadEvents(await readEventLog(page));
    checks += 1;
    if (events.length !== 1) {
      addFailure(
        label,
        'refresh-does-not-duplicate',
        `expected 1 cumulative event, received ${events.length}`
      );
    }
  } catch (error) {
    addFailure(label, 'exception', error?.stack || error?.message || String(error));
  } finally {
    await page.close();
    await context.close();
  }
}

async function runPhoneScenario(browser) {
  const context = await browser.newContext({
    ...withoutDefaultBrowser(devices['Desktop Chrome']),
    serviceWorkers: 'block'
  });
  await installSafetyRails(context, async route => {
    await route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const label = 'phone-click-single-owner';

  try {
    await page.goto(routeUrl('/'), { waitUntil: 'load' });
    await resetScenarioStorage(page);
    await page.locator('a[href^="tel:"]').first().evaluate(anchor => {
      anchor.addEventListener('click', event => event.preventDefault(), {
        capture: true,
        once: true
      });
      anchor.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    });
    await page.waitForTimeout(50);

    const entries = await readEventLog(page);
    const phones = phoneEvents(entries);
    const callCtas = ctaEvents(entries).filter(
      event => event.params.cta_intent === 'call'
    );
    checks += 1;
    if (phones.length !== 1) {
      addFailure(
        label,
        'exactly-one-phone-event',
        `expected 1 phone_click event, received ${phones.length}`
      );
    }
    if (callCtas.length) {
      addFailure(
        label,
        'telephone-excluded-from-cta-owner',
        `received ${callCtas.length} call cta_click events`
      );
    }
  } catch (error) {
    addFailure(label, 'exception', error?.stack || error?.message || String(error));
  } finally {
    await page.close();
    await context.close();
  }
}

async function runFormRecoveryScenario(browser, scenario) {
  let unexpectedPosts = 0;
  const context = await browser.newContext({
    ...withoutDefaultBrowser(devices['Desktop Chrome']),
    serviceWorkers: 'block'
  });
  await installSafetyRails(context, async route => {
    unexpectedPosts += 1;
    await route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const label = `recovery-${scenario.type}-form`;

  try {
    await page.goto(routeUrl(scenario.route), { waitUntil: 'load' });
    await resetScenarioStorage(page);
    await fillSyntheticRequiredFields(page);

    const atSubmit = await page.locator('form[data-gf-lead-form]').evaluate(
      (form, pendingKey) => {
        let submitEvents = 0;
        form.addEventListener('submit', event => {
          submitEvents += 1;
          event.preventDefault();
        });
        const submit = form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );
        submit.click();
        submit.click();
        const status = form.querySelector('[data-form-status]');
        const raw = sessionStorage.getItem(pendingKey);
        return {
          submitEvents,
          pending: raw ? JSON.parse(raw) : null,
          busyState: {
            busy: form.getAttribute('aria-busy'),
            disabled: Boolean(submit?.disabled),
            label: submit?.textContent?.trim() || submit?.value || '',
            status: status?.textContent?.trim() || ''
          }
        };
      },
      PENDING_KEY
    );

    const { pending, busyState, submitEvents } = atSubmit;
    checks += 1;
    if (
      !pending
      || pending.v !== 1
      || !pending.id
      || pending.type !== scenario.type
      || !Number.isFinite(pending.createdAt)
      || pending.path !== scenario.route
      || busyState.busy !== 'true'
      || !busyState.disabled
      || !/sending securely/i.test(busyState.label)
      || !busyState.status
    ) {
      addFailure(label, 'pending-and-busy-contract', {
        pending,
        busyState
      });
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    if (submitEvents !== 1 || unexpectedPosts !== 0) {
      addFailure(
        label,
        'double-click-one-submit',
        `expected 1 locally prevented submit event and 0 POSTs; `
          + `received ${submitEvents} events and ${unexpectedPosts} POSTs`
      );
    }

    await page.waitForTimeout(RECOVERY_WAIT_MS);
    const recovered = await page.locator('form[data-gf-lead-form]').evaluate(form => {
      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      return {
        busy: form.getAttribute('aria-busy'),
        disabled: Boolean(submit?.disabled),
        label: submit?.textContent?.trim() || submit?.value || '',
        expectedLabel: submit?.getAttribute('data-submit-label') || '',
        status: status?.textContent?.trim() || '',
        pending: sessionStorage.getItem('gf_pending_lead_v1')
      };
    });
    checks += 1;
    if (
      recovered.busy === 'true'
      || recovered.disabled
      || !recovered.expectedLabel
      || recovered.label !== recovered.expectedLabel
      || recovered.pending !== null
      || !/try again|retry|not sent|still here/i.test(recovered.status)
    ) {
      addFailure(label, 'timeout-recovers-for-retry', recovered);
    }
  } catch (error) {
    addFailure(label, 'exception', error?.stack || error?.message || String(error));
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function runInterceptedSuccessScenario(browser, scenario) {
  let scenarioPosts = 0;
  const context = await browser.newContext({
    ...withoutDefaultBrowser(devices['Desktop Chrome']),
    serviceWorkers: 'block'
  });
  await installSafetyRails(context, async route => {
    scenarioPosts += 1;
    await new Promise(resolve => setTimeout(resolve, 25));
    await route.fulfill({
      status: 303,
      headers: {
        location: routeUrl(scenario.thanksRoute),
        'cache-control': 'no-store'
      },
      contentType: 'text/plain',
      body: ''
    });
  });
  const page = await context.newPage();
  const label = `intercepted-success-${scenario.type}`;

  try {
    await page.goto(routeUrl(scenario.route), { waitUntil: 'load' });
    await resetScenarioStorage(page);
    await fillSyntheticRequiredFields(page);

    const marker = await page.locator('form[data-gf-lead-form]').evaluate(
      (form, pendingKey) => {
        const submit = form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );
        submit.click();
        submit.click();
        const raw = sessionStorage.getItem(pendingKey);
        return raw ? JSON.parse(raw) : null;
      },
      PENDING_KEY
    );
    if (!marker?.id) {
      throw new Error('pending lead marker was missing after form submit');
    }
    const submissionId = marker.id;
    await page.waitForURL(
      url => {
        const clean = url.pathname.replace(/\.html$/i, '');
        return clean === scenario.thanksRoute;
      },
      { timeout: 10_000 }
    );
    await page.waitForTimeout(100);

    const events = leadEvents(await readEventLog(page));
    checks += 1;
    const typedFailure = validateTypedLead(events, scenario, submissionId);
    if (typedFailure) {
      addFailure(label, 'successful-form-one-typed-lead', typedFailure);
    }
    if (scenarioPosts !== 1) {
      addFailure(
        label,
        'double-click-one-post',
        `expected 1 intercepted POST, received ${scenarioPosts}`
      );
    }

    const pending = await page.evaluate(key => sessionStorage.getItem(key), PENDING_KEY);
    if (pending !== null) {
      addFailure(label, 'successful-form-consumes-pending', pending);
    }
  } catch (error) {
    addFailure(label, 'exception', error?.stack || error?.message || String(error));
  } finally {
    await page.close();
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });

try {
  for (const scenario of FORM_SCENARIOS) {
    console.log(`Checking direct and seeded ${scenario.type} thank-you behavior`);
    await runDirectThanksScenario(browser, scenario);
    await runSeededMarkerScenario(browser, scenario);
  }
  console.log('Checking single-owner phone telemetry');
  await runPhoneScenario(browser);
  for (const scenario of FORM_SCENARIOS) {
    console.log(`Checking intercepted ${scenario.type} form success`);
    await runInterceptedSuccessScenario(browser, scenario);
  }
} finally {
  await browser.close();
}

for (const scenario of FORM_SCENARIOS) {
  console.log(`Checking ${scenario.type} form timeout recovery`);
  const recoveryBrowser = await chromium.launch({ headless: true });
  try {
    await runFormRecoveryScenario(recoveryBrowser, scenario);
  } finally {
    await recoveryBrowser.close();
  }
}

console.log(
  `Conversion QA: ${checks} contract checks; `
    + `${failures.length} failures; `
    + `${interceptedFormPosts} same-origin form POSTs intercepted; `
    + `${blockedTelemetryRequests} telemetry requests blocked`
);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
