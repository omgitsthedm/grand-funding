#!/usr/bin/env node
/**
 * Grand Funding — cross-browser experience contract
 *
 * Prerequisites:
 *   npm run build
 *   npx playwright install chromium firefox webkit
 *   npm run serve -- --dir dist --port 8888
 *   BASE_URL=http://127.0.0.1:8888 node scripts/qa-cross-browser.mjs
 *
 * Mobile profiles use real Playwright Android Chrome and iPhone Safari device
 * descriptors. Firefox's narrow pass remains honestly labeled as responsive
 * desktop Firefox because Playwright does not emulate Firefox for Android.
 *
 * The suite never submits a form. Analytics and advertising requests are
 * fulfilled locally.
 */

import {
  chromium,
  devices,
  firefox,
  webkit
} from 'playwright';

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
    '/posts/how-fast-can-you-close-hard-money-loan-arizona'
  ]
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
const FORM_CONTRACTS = new Map([
  [
    '/',
    {
      name: 'pre-approval',
      type: 'application',
      actions: ['/thanks', '/thanks.html']
    }
  ],
  [
    '/apply',
    {
      name: 'pre-approval',
      type: 'application',
      actions: ['/thanks', '/thanks.html']
    }
  ],
  [
    '/contact',
    {
      name: 'contact',
      type: 'contact',
      actions: ['/thanks-contact', '/thanks-contact.html']
    }
  ]
]);

const withoutDefaultBrowser = descriptor => {
  const { defaultBrowserType: _defaultBrowserType, ...options } = descriptor;
  return options;
};

const BROWSER_PROFILES = [
  {
    browserName: 'chromium',
    engine: chromium,
    name: 'desktop-chrome',
    options: {
      ...withoutDefaultBrowser(devices['Desktop Chrome']),
      viewport: { width: 1440, height: 900 }
    }
  },
  {
    browserName: 'chromium',
    engine: chromium,
    name: 'android-chrome-pixel-7',
    options: withoutDefaultBrowser(devices['Pixel 7'])
  },
  {
    browserName: 'firefox',
    engine: firefox,
    name: 'desktop-firefox',
    options: {
      ...withoutDefaultBrowser(devices['Desktop Firefox']),
      viewport: { width: 1440, height: 900 }
    }
  },
  {
    browserName: 'firefox',
    engine: firefox,
    name: 'responsive-desktop-firefox',
    options: {
      ...withoutDefaultBrowser(devices['Desktop Firefox']),
      viewport: { width: 390, height: 844 }
    }
  },
  {
    browserName: 'webkit',
    engine: webkit,
    name: 'desktop-safari',
    options: {
      ...withoutDefaultBrowser(devices['Desktop Safari']),
      viewport: { width: 1440, height: 900 }
    }
  },
  {
    browserName: 'webkit',
    engine: webkit,
    name: 'ios-safari-iphone-15',
    options: withoutDefaultBrowser(devices['iPhone 15'])
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

function addFailure(profile, route, check, detail) {
  failures.push({
    browser: profile.browserName,
    profile: profile.name,
    route,
    check,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail)
  });
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

  await context.addInitScript(() => {
    document.addEventListener(
      'submit',
      event => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true
    );
  });
}

async function inspectPage(page, route) {
  return page.evaluate(expectedRoute => {
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return (
        style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number.parseFloat(style.opacity || '1') > 0.05
        && bounds.width > 0
        && bounds.height > 0
      );
    };

    const main = document.querySelector('main');
    const h1s = Array.from(document.querySelectorAll('h1'));
    const result = {
      mainCount: document.querySelectorAll('main').length,
      mainVisible: visible(main),
      h1Count: h1s.length,
      visibleH1Count: h1s.filter(visible).length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      hero: null,
      form: null,
      faq: null
    };

    if (expectedRoute === '/') {
      const hero = document.querySelector('main .hero');
      const heroVideo = hero?.querySelector('video.hero-video');
      const heroHeading = hero?.querySelector('h1');
      result.hero = {
        exists: Boolean(hero),
        visible: visible(hero),
        headingVisible: visible(heroHeading),
        height: hero?.getBoundingClientRect().height || 0,
        videoExists: Boolean(heroVideo),
        poster: heroVideo?.getAttribute('poster') || '',
        autoplay: Boolean(heroVideo?.autoplay),
        loop: Boolean(heroVideo?.loop),
        muted: Boolean(heroVideo?.muted),
        playsInline: Boolean(heroVideo?.hasAttribute('playsinline')),
        mediaSource:
          heroVideo?.currentSrc
          || heroVideo?.querySelector('source')?.getAttribute('src')
          || ''
      };
    }

    const form = document.querySelector('form[data-gf-lead-form]');
    if (form) {
      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      result.form = {
        count: document.querySelectorAll('form[data-gf-lead-form]').length,
        name: form.getAttribute('name') || '',
        type: form.getAttribute('data-form-kind') || '',
        method: (form.getAttribute('method') || '').toLowerCase(),
        action: form.getAttribute('action') || '',
        hiddenName:
          form.querySelector('input[type="hidden"][name="form-name"]')?.value || '',
        submitVisible: visible(submit),
        submitDisabled: Boolean(submit?.disabled),
        submitLabel:
          submit?.getAttribute('data-submit-label')
          || submit?.textContent?.trim()
          || '',
        statusExists: Boolean(status),
        statusLive:
          status?.getAttribute('aria-live')
          || status?.getAttribute('role')
          || ''
      };
    }

    const questions = Array.from(document.querySelectorAll('.faq-question'));
    if (questions.length) {
      result.faq = {
        count: questions.length,
        nonButtons: questions.filter(question => question.tagName !== 'BUTTON').length,
        wrongTypes: questions.filter(
          question =>
            question.tagName === 'BUTTON'
            && (question.getAttribute('type') || '').toLowerCase() !== 'button'
        ).length,
        invalidExpanded: questions.filter(
          question => !['true', 'false'].includes(question.getAttribute('aria-expanded'))
        ).length,
        missingAnswers: questions.filter(
          question =>
            !question.closest('.faq-item')?.querySelector('.faq-answer')
        ).length,
        brokenControls: questions.filter(question => {
          const answer = question.closest('.faq-item')?.querySelector('.faq-answer');
          return (
            !question.id
            || !answer?.id
            || question.getAttribute('aria-controls') !== answer.id
            || answer.getAttribute('aria-labelledby') !== question.id
          );
        }).length,
        exposedCollapsedAnswers: questions.filter(question => {
          const answer = question.closest('.faq-item')?.querySelector('.faq-answer');
          return question.getAttribute('aria-expanded') === 'false' && !answer?.hidden;
        }).length
      };
    }

    return result;
  }, route);
}

async function verifyFaqInteraction(page) {
  const first = page.locator('.faq-question').first();
  if (await first.count() === 0) return null;

  await first.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(50);
  const expanded = await first.getAttribute('aria-expanded');
  const answer = page.locator(
    `#${await first.getAttribute('aria-controls')}`
  );
  const expandedHidden = await answer.getAttribute('hidden');
  await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  const collapsed = await first.getAttribute('aria-expanded');
  const collapsedHidden = await answer.getAttribute('hidden');
  if (
    expanded !== 'true'
    || expandedHidden !== null
    || collapsed !== 'false'
    || collapsedHidden === null
  ) {
    return `keyboard toggle states were ${expanded ?? 'missing'} then `
      + `${collapsed ?? 'missing'}; hidden=${expandedHidden !== null}/`
      + `${collapsedHidden !== null}`;
  }
  return null;
}

async function runStaticFallback(profile, browser) {
  const context = await browser.newContext({
    ...profile.options,
    colorScheme: 'dark',
    javaScriptEnabled: false,
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block'
  });
  await installSafetyRails(context);
  const page = await context.newPage();

  try {
    const response = await page.goto(routeUrl('/'), {
      waitUntil: 'load',
      timeout: 30_000
    });
    checks += 1;
    if (!response || response.status() >= 400) {
      addFailure(
        profile,
        '/',
        'static-document-status',
        `status ${response?.status() ?? 'no response'}`
      );
      return;
    }

    const state = await page.evaluate(() => {
      const hero = document.querySelector('main .hero');
      const heading = hero?.querySelector('h1');
      const video = hero?.querySelector('video.hero-video');
      const visible = element => {
        if (!element) return false;
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        return (
          style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number.parseFloat(style.opacity || '1') > 0.05
          && bounds.width > 0
          && bounds.height > 0
        );
      };
      return {
        heroExists: Boolean(hero),
        heroVisible: visible(hero),
        headingVisible: visible(heading),
        heroHeight: hero?.getBoundingClientRect().height || 0,
        poster: video?.getAttribute('poster') || '',
        hiddenRevealCount: Array.from(
          document.querySelectorAll('main .reveal, main .reveal-stagger')
        ).filter(element => Number.parseFloat(getComputedStyle(element).opacity || '1') < 0.05)
          .length
      };
    });

    if (
      !state.heroExists
      || !state.heroVisible
      || !state.headingVisible
      || state.heroHeight < 240
    ) {
      addFailure(profile, '/', 'static-hero-fallback', state);
    }
    if (!state.poster) {
      addFailure(profile, '/', 'static-hero-poster', 'hero video poster is missing');
    }
    if (state.hiddenRevealCount) {
      addFailure(
        profile,
        '/',
        'static-content-visibility',
        `${state.hiddenRevealCount} reveal elements remain hidden without JavaScript`
      );
    }
  } catch (error) {
    addFailure(
      profile,
      '/',
      'static-fallback-exception',
      error?.stack || error?.message || String(error)
    );
  } finally {
    await page.close();
    await context.close();
  }
}

for (const profile of BROWSER_PROFILES) {
  let browser;
  try {
    browser = await profile.engine.launch({ headless: true });
  } catch (error) {
    addFailure(
      profile,
      '(launch)',
      'browser-launch',
      `${error.message}\nRun: npx playwright install chromium firefox webkit`
    );
    continue;
  }

  try {
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
      const addRuntimeError = detail => {
        if (!runtimeErrors.includes(detail)) runtimeErrors.push(detail);
      };

      page.on('pageerror', error => {
        addRuntimeError(`page error: ${error.message}`);
      });
      page.on('console', message => {
        if (message.type() === 'error') {
          addRuntimeError(`console error: ${message.text()}`);
        }
      });
      page.on('requestfailed', request => {
        if (!isInternalUrl(request.url())) return;
        addRuntimeError(
          `request failed: ${request.url()} `
            + `(${request.failure()?.errorText || 'unknown error'})`
        );
      });
      page.on('response', response => {
        if (isInternalUrl(response.url()) && response.status() >= 400) {
          addRuntimeError(`HTTP ${response.status()}: ${response.url()}`);
        }
      });

      try {
        const response = await page.goto(routeUrl(route), {
          waitUntil: 'load',
          timeout: 30_000
        });
        checks += 1;
        if (!response || response.status() >= 400) {
          addFailure(
            profile,
            route,
            'document-status',
            `status ${response?.status() ?? 'no response'}`
          );
          continue;
        }

        await page.waitForTimeout(150);
        const state = await inspectPage(page, route);

        if (state.mainCount !== 1 || !state.mainVisible) {
          addFailure(profile, route, 'main-landmark', state);
        }
        if (state.h1Count !== 1 || state.visibleH1Count !== 1) {
          addFailure(profile, route, 'primary-heading', state);
        }
        if (state.overflow > 2) {
          addFailure(
            profile,
            route,
            'horizontal-overflow',
            `${state.overflow.toFixed(2)}px`
          );
        }

        if (route === '/') {
          const hero = state.hero;
          if (
            !hero?.exists
            || !hero.visible
            || !hero.headingVisible
            || hero.height < 240
            || !hero.videoExists
            || !hero.poster
            || !hero.autoplay
            || !hero.loop
            || !hero.muted
            || !hero.playsInline
          ) {
            addFailure(profile, route, 'preserved-cinematic-hero', hero);
          }
          if ((profile.options.viewport?.width || 0) > 720 && !hero?.mediaSource) {
            addFailure(
              profile,
              route,
              'desktop-hero-media-source',
              'desktop cinematic hero has no video source'
            );
          }
        }

        const expectedForm = FORM_CONTRACTS.get(route);
        if (expectedForm) {
          const form = state.form;
          if (!form || form.count !== 1) {
            addFailure(
              profile,
              route,
              'lead-form-contract',
              form || 'form[data-gf-lead-form] is missing'
            );
          } else {
            if (
              form.name !== expectedForm.name
              || form.type !== expectedForm.type
              || form.method !== 'post'
              || !expectedForm.actions.includes(form.action)
              || form.hiddenName !== expectedForm.name
            ) {
              addFailure(profile, route, 'lead-form-identity', form);
            }
            if (
              !form.submitVisible
              || form.submitDisabled
              || !form.submitLabel
              || !form.statusExists
              || !form.statusLive
            ) {
              addFailure(profile, route, 'lead-form-feedback', form);
            }
          }
        } else if (state.form) {
          addFailure(
            profile,
            route,
            'unexpected-lead-form',
            state.form
          );
        }

        if (state.faq) {
          if (
            state.faq.nonButtons
            || state.faq.wrongTypes
            || state.faq.invalidExpanded
            || state.faq.missingAnswers
            || state.faq.brokenControls
            || state.faq.exposedCollapsedAnswers
          ) {
            addFailure(profile, route, 'faq-semantics', state.faq);
          } else {
            const interactionFailure = await verifyFaqInteraction(page);
            if (interactionFailure) {
              addFailure(
                profile,
                route,
                'faq-keyboard-interaction',
                interactionFailure
              );
            }
          }
        }

        if (runtimeErrors.length) {
          addFailure(profile, route, 'runtime-or-resource-errors', runtimeErrors);
        }
      } catch (error) {
        addFailure(
          profile,
          route,
          'exception',
          error?.stack || error?.message || String(error)
        );
      } finally {
        await page.close();
      }
    }

    await context.close();
    await runStaticFallback(profile, browser);
    console.log(
      `Cross-browser checked ${ROUTES.length} routes plus static fallback `
        + `in ${profile.name}`
    );
  } finally {
    await browser.close();
  }
}

console.log(
  `Cross-browser QA: ${checks} document checks; `
    + `${failures.length} failures; `
    + `${blockedTelemetryRequests} telemetry requests blocked`
);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
