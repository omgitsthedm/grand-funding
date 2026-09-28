import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../consent.js', import.meta.url), 'utf8');
const granted = JSON.stringify({ v: 1, analytics: true, ads: false });
const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) });
function boot({ url = 'https://www.grandfundingllc.com/contact', robots = 'index,follow', canonical = '/contact', consent = granted, session = new Map(), blockedStorage = false, webdriver = false } = {}) {
  const scripts = [], actions = {}, local = new Map();
  if (consent) local.set('gf_consent_v1', consent);
  const button = choice => ({ dataset: { consent: choice }, addEventListener: (_, fn) => { actions[choice] = fn; } });
  const banner = { classList: { add() {}, remove() {} }, querySelectorAll: () => [button('all'), button('essential')], querySelector: () => ({ focus() {} }) };
  const sandbox = {
    location: new URL(url), navigator: { webdriver }, URLSearchParams, console,
    dispatchEvent() {}, CustomEvent: class {},
    document: {
      readyState: 'complete', referrer: 'https://private.invalid/account?token=NEVER-SEND',
      querySelector(selector) { return selector.includes('gf-analytics-path') ? { content: canonical } : selector.includes('robots') ? { content: robots } : { appendChild() {} }; },
      getElementById: () => banner,
      createElement: () => ({ dataset: {}, addEventListener() {} }),
      head: { appendChild: script => scripts.push(script) }
    }
  };
  Object.defineProperty(sandbox, 'localStorage', { get() { if (blockedStorage) throw new Error('Storage disabled'); return storage(local); } });
  Object.defineProperty(sandbox, 'sessionStorage', { get() { if (blockedStorage) throw new Error('Storage disabled'); return storage(session); } });
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return { sandbox, scripts, actions, session, entries: () => sandbox.dataLayer.map(item => typeof item?.[0] === 'string' ? Array.from(item) : item) };
}
const denied = boot({ consent: null });
assert.equal(denied.scripts.length, 0);
assert.equal(denied.sandbox.gfPhoneConversion(), false);
denied.actions.all();
assert.equal(denied.scripts.length, 1);
assert.equal(denied.sandbox['ga-disable-G-K825ENLYS6'], false);
denied.actions.essential();
assert.equal(denied.sandbox['ga-disable-G-K825ENLYS6'], true);
assert.equal(denied.sandbox.gfTrackCta({ intent: 'apply' }), false);
denied.actions.all();
assert.equal(denied.scripts.length, 1, 'Regrant must not duplicate GTM');
for (const options of [
  { url: 'http://www.grandfundingllc.com/contact' },
  { url: 'https://grandfundingllc.netlify.app/contact' },
  { url: 'http://127.0.0.1:8888/contact' },
  { robots: 'noindex,follow' }, { webdriver: true }, { blockedStorage: true },
  { url: 'https://www.grandfundingllc.com/private-NEVER-SEND' }
]) {
  const test = boot(options);
  assert.equal(test.scripts.length, 0, JSON.stringify(options));
  test.actions.all();
  assert.equal(test.scripts.length, 0, 'Allow must not bypass context guards');
  assert.equal(test.sandbox.gfPhoneConversion(), false);
}
const session = new Map();
assert.equal(boot({ url: 'https://www.grandfundingllc.com/contact?qa=1', session }).scripts.length, 0);
assert.equal(boot({ session }).scripts.length, 0, 'QA persists across navigation');
const privateQuery = boot({ url: 'https://www.grandfundingllc.com/contact?email=NEVER-SEND#NEVER-SEND' });
assert.equal(privateQuery.scripts.length, 1);
assert.equal(privateQuery.sandbox.gfPhoneConversion({ href: 'tel:NEVER-SEND', location: 'NEVER-SEND' }), true);
assert.equal(JSON.stringify(privateQuery.entries()).includes('NEVER-SEND'), false);
assert.equal(privateQuery.sandbox.location.search, '?email=NEVER-SEND', 'Never rewrite visitor URL');
assert.equal(privateQuery.sandbox.location.hash, '#NEVER-SEND');
assert.equal(Array.isArray(privateQuery.sandbox.dataLayer[0]), false, 'Google commands use arguments objects');
assert.equal(privateQuery.sandbox.gfTrackCta({ intent: 'arbitrary-NEVER-SEND' }), false);
const receiptOptions = { url: 'https://www.grandfundingllc.com/thanks-contact', canonical: '/thanks-contact', robots: 'noindex,follow' };
assert.equal(boot(receiptOptions).scripts.length, 0, 'Direct receipts cannot load Google');
const pending = new Map([['gf_pending_lead_v1', JSON.stringify({ v: 1, id: 'internal-only', type: 'contact', createdAt: Date.now() })]]);
const receipt = boot({ ...receiptOptions, session: pending });
assert.equal(receipt.scripts.length, 1);
assert.equal(receipt.sandbox.gfLeadConversion({ formType: 'application', submissionId: 'internal-only' }), false, 'Receipt type must match the pending native form');
assert.equal(receipt.sandbox.gfLeadConversion({ formType: 'contact', submissionId: 'other-local-id' }), false, 'Receipt ID must match the pending native form');
assert.equal(receipt.sandbox.gfLeadConversion({ formType: 'contact', submissionId: 'internal-only' }), true);
assert.equal(receipt.sandbox.gfLeadConversion({ formType: 'contact', submissionId: 'internal-only' }), false);
assert.equal(JSON.stringify(receipt.entries()).includes('internal-only'), false, 'Deduplication ID remains local');
const commands = privateQuery.entries();
assert.ok(commands.filter(e => e[0] === 'consent').every(e => e[2].ad_storage === 'denied' && e[2].ad_user_data === 'denied' && e[2].ad_personalization === 'denied'));
const dist = new URL('../dist/', import.meta.url);
const html = await fs.readFile(new URL('index.html', dist), 'utf8');
assert.equal(/googletagmanager\.com\/(gtm\.js|ns\.html)/.test(html), false, 'No initial Google loader/fallback');
assert.ok(html.includes('name="gf-analytics-path" content="/"'));
assert.ok(html.includes('Allow analytics'));
const builtFiles = await fs.readdir(dist, { recursive: true });
const builtHtml = builtFiles.filter(file => file.endsWith('.html'));
assert.ok(builtHtml.length > 0, 'Build must include HTML');
for (const file of builtHtml) {
  const built = await fs.readFile(new URL(file, dist), 'utf8');
  assert.equal(/<script\b[^>]*>[^<]*\bgtag\s*\(/i.test(built), false, `${file} has inline Google commands`);
  assert.equal(/<(?:script|noscript|link)\b[^>]*(?:googletagmanager|google-analytics)\.com/i.test(built), false, `${file} has a Google transport hint or loader`);
  assert.ok(/<meta\b[^>]*name=["']gf-analytics-path["']/i.test(built), `${file} lacks an analytics route`);
}
console.log('Analytics runtime guards, consent transitions, privacy payloads, receipt deduplication and built loader checks passed.');
