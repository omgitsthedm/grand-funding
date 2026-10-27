import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:8888');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('Inquiry QA only runs on loopback.');
const files = (await fs.readdir('dist')).filter(file => file.endsWith('.html'));
const forms = [];
const loans = [];
const prefixes = { 'fix-and-flip-loans-': 'Fix & Flip', 'bridge-loans-': 'Bridge', 'construction-loans-': 'Construction', 'cash-out-refinance-': 'Cash-Out Refinance', 'second-position-loans-': '2nd Position' };
for (const file of files) {
  const html = await fs.readFile(`dist/${file}`, 'utf8');
  const route = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
  if (/<form\b/i.test(html)) forms.push(route);
  const prefix = Object.keys(prefixes).find(prefix => file.startsWith(prefix));
  if (prefix) loans.push({ route, expected: prefixes[prefix] });
}
assert.equal(forms.length, 18);
assert.equal(loans.length, 30);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let posts = 0; let handoffs = 0;
try {
  for (const javaScriptEnabled of [true, false]) {
    for (const route of forms) {
      console.log(`Inquiry path: ${route}; JavaScript ${javaScriptEnabled ? 'on' : 'off'}`);
      const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      let posted = null;
      await context.route('**/*', async interception => {
        const request = interception.request();
        if (new URL(request.url()).origin !== base.origin) return interception.abort();
        if (request.method() === 'POST') {
          posted = new URLSearchParams(request.postData() || '');
          posts++;
          return interception.fulfill({ status: 302, headers: { location: route === '/contact' ? '/thanks-contact' : '/thanks' }, body: '' });
        }
        return interception.continue();
      });
      const page = await context.newPage();
      await page.goto(new URL(route, base).href);
      const form = page.locator('form').first();
      assert.equal(await form.locator('[name="phone"]').getAttribute('required'), null, route);
      await form.locator('[name="name"]').fill('Local QA');
      await form.locator('[name="email"]').fill('qa@example.invalid');
      const required = await form.locator('[required]').evaluateAll(fields => fields.map(field => ({ name: field.name, tag: field.tagName, value: field.tagName === 'SELECT' ? [...field.options].find(option => option.value && !option.disabled)?.value : '' })));
      for (const field of required) {
        if (field.tag === 'SELECT') await form.locator(`[name="${field.name}"]`).selectOption(field.value);
        if (field.tag === 'TEXTAREA') await form.locator(`[name="${field.name}"]`).fill('Synthetic local verification only.');
      }
      assert.equal(await form.evaluate(element => element.checkValidity()), true, `${route}: email-only inquiry is valid`);
      await form.locator('[name="email"]').fill('invalid-email');
      assert.equal(await form.evaluate(element => element.checkValidity()), false, `${route}: invalid reply route rejected`);
      await form.locator('[name="email"]').fill('qa@example.invalid');
      const submit = form.locator('button[type="submit"], button:not([type]), input[type="submit"]').first();
      // With script execution disabled, exercise the browser's native keyboard
      // submission without Playwright's animation-frame-based pointer checks.
      if (javaScriptEnabled) await submit.tap();
      else await submit.press('Enter');
      await page.waitForURL(url => ['/thanks', '/thanks-contact'].includes(url.pathname.replace(/\.html$/, '')));
      assert.ok(posted?.get('form-name'), `${route}: provider form identity retained`);
      assert.equal(posted.get('phone'), '', `${route}: blank phone preserved`);
      assert.equal(posted.get('email'), 'qa@example.invalid');
      assert.ok(posted.has('bot-field'), `${route}: spam control retained`);
      await context.close();
    }
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === base.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const { route, expected } of loans) {
    await page.goto(new URL(route, base).href);
    await page.locator('main a[href^="/apply?loan="]').first().click();
    await page.waitForURL(url => url.pathname === '/apply');
    await page.locator('select[name="loan_type"]').waitFor();
    assert.equal(await page.locator('select[name="loan_type"]').inputValue(), expected, route);
    handoffs++;
  }
  for (const [section, expected] of Object.entries({ construction: 'Construction', 'bridge-loans': 'Bridge', 'fix-and-flip': 'Fix & Flip', 'cash-out-refinance': 'Cash-Out Refinance', 'land-loans': 'Land', 'second-mortgage': '2nd Position' })) {
    await page.goto(new URL('/products', base).href);
    await page.locator(`#${section} a[href^="/apply?loan="]`).first().click();
    await page.waitForURL(url => url.pathname === '/apply');
    assert.equal(await page.locator('select[name="loan_type"]').inputValue(), expected, section);
    handoffs++;
  }
  await context.close();
  console.log(JSON.stringify({ forms: forms.length, interceptedLocalPosts: posts, programHandoffs: handoffs, javaScriptAndNativeFallback: true, externalSubmissions: 0 }));
} finally { await browser.close(); }
