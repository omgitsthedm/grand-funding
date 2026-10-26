import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../consent.js', import.meta.url), 'utf8');
const granted = JSON.stringify({ v: 1, analytics: true, ads: false });
const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });
function boot({ url = 'https://www.grandfundingllc.com/contact', referrer = 'https://private.invalid/account?token=NEVER-SEND', robots = 'index,follow', canonical = '/contact', consent = granted, session = new Map(), blockedStorage = false, webdriver = false, gpc = false, src = source } = {}) {
  const scripts = [], actions = {}, local = new Map();
  if (consent) local.set('gf_consent_v1', consent);
  const button = choice => ({ dataset: { consent: choice }, addEventListener: (_, fn) => { actions[choice] = fn; } });
  const banner = { classList: { add() {}, remove() {} }, querySelectorAll: () => [button('all'), button('essential')], querySelector: () => ({ focus() {} }) };
  const sandbox = {
    location: new URL(url), navigator: { webdriver, globalPrivacyControl: gpc }, URL, URLSearchParams, console,
    dispatchEvent() {}, CustomEvent: class {},
    document: {
      readyState: 'complete', referrer,
      querySelector(selector) { return selector.includes('gf-analytics-path') ? { content: canonical } : selector.includes('robots') ? { content: robots } : { appendChild() {} }; },
      getElementById: () => banner,
      createElement: () => ({ dataset: {}, addEventListener() {} }),
      head: { appendChild: script => scripts.push(script) }
    }
  };
  Object.defineProperty(sandbox, 'localStorage', { get() { if (blockedStorage) throw new Error('Storage disabled'); return storage(local); } });
  Object.defineProperty(sandbox, 'sessionStorage', { get() { if (blockedStorage) throw new Error('Storage disabled'); return storage(session); } });
  sandbox.window = sandbox;
  vm.runInNewContext(src, sandbox);
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
// Channel attribution must survive navigation without leaking URLs or free text.
const channel = test => test.entries().find(e => e[0] === 'set' && typeof e[1] === 'object')?.[1] || {};
for (const [host, expectedSource, medium] of [['www.google.com', 'google', 'organic'], ['www.bing.com', 'bing', 'organic'], ['l.instagram.com', 'instagram', 'social'], ['linktr.ee', 'linktree', 'referral'], ['chatgpt.com', 'chatgpt.com', 'referral'], ['chat.openai.com', 'chatgpt.com', 'referral'], ['www.perplexity.ai', 'perplexity.ai', 'referral'], ['claude.ai', 'claude.ai', 'referral'], ['gemini.google.com', 'gemini.google.com', 'referral'], ['copilot.microsoft.com', 'copilot.microsoft.com', 'referral'], ['meta.ai', 'meta.ai', 'referral'], ['muse.ai', 'muse.ai', 'referral']]) {
  const test = boot({ referrer: `https://${host}/private/NEVER-SEND?token=NEVER-SEND` });
  assert.equal(channel(test).campaign_source, expectedSource);
  assert.equal(channel(test).campaign_medium, medium);
  assert.equal(channel(test).page_referrer, '');
  assert.equal(JSON.stringify(test.entries()).includes('NEVER-SEND'), false);
  assert.equal(JSON.stringify([...test.session]).includes('NEVER-SEND'), false);
}
for (const referrer of ['https://www.google.com.evil.invalid/NEVER-SEND', 'https://chatgpt.com.evil.invalid/NEVER-SEND', 'https://private.invalid/NEVER-SEND', 'https://constructor/', 'not-a-url']) {
  assert.equal(channel(boot({ referrer })).campaign_source, undefined);
}
for (const query of ['gclid=NEVER-SEND', 'msclkid=NEVER-SEND', 'utm_source=NEVER-SEND&utm_medium=email', 'utm_source=google&utm_medium=cpc', 'utm_source=chatgpt.com&utm_medium=cpc', 'utm_source=chatgpt.com&gclid=NEVER-SEND', 'utm_source=instagram&utm_medium=social&gclid=NEVER-SEND']) {
  const test = boot({ url: 'https://www.grandfundingllc.com/contact?' + query, referrer: 'https://www.google.com/' });
  assert.equal(channel(test).campaign_source, undefined, 'Unknown campaigns and paid clicks must not become organic');
  assert.equal(JSON.stringify(test.entries()).includes('NEVER-SEND'), false);
}
const aiSession = new Map();
const aiArrival = boot({ url: 'https://www.grandfundingllc.com/contact?utm_source=chatgpt.com&utm_campaign=NEVER-SEND&prompt=NEVER-SEND', consent: null, session: aiSession });
assert.equal(aiSession.has('gf_acquisition_v1'), false, 'AI referral storage also requires consent');
assert.equal(aiArrival.scripts.length, 0);
aiArrival.actions.all();
assert.equal(channel(aiArrival).campaign_source, 'chatgpt.com', 'OpenAI source-only links are recognized');
assert.equal(channel(aiArrival).campaign_medium, 'referral');
assert.equal(channel(aiArrival).campaign_name, undefined);
assert.equal(JSON.stringify(aiArrival.entries()).includes('NEVER-SEND'), false);
assert.equal(JSON.stringify([...aiSession]).includes('NEVER-SEND'), false);
assert.equal(channel(boot({ session: aiSession, referrer: 'https://www.grandfundingllc.com/contact' })).campaign_source, 'chatgpt.com');
aiArrival.actions.essential();
assert.equal(aiSession.has('gf_acquisition_v1'), false);
const campaignSession = new Map();
const campaign = boot({ url: 'https://www.grandfundingllc.com/contact?utm_source=instagram&utm_medium=social&utm_campaign=phoenix_fix_flip&utm_content=NEVER-SEND&email=NEVER-SEND#NEVER-SEND', consent: null, session: campaignSession });
assert.equal(campaignSession.has('gf_acquisition_v1'), false, 'No source storage before consent');
assert.equal(campaign.scripts.length, 0);
campaign.actions.all();
assert.equal(channel(campaign).campaign_source, 'instagram');
assert.equal(channel(campaign).campaign_name, 'phoenix_fix_flip');
assert.equal(JSON.stringify(campaign.entries()).includes('NEVER-SEND'), false);
const nextPage = boot({ session: campaignSession, referrer: 'https://www.grandfundingllc.com/contact' });
assert.equal(channel(nextPage).campaign_source, 'instagram', 'Source survives an internal navigation');
assert.equal(channel(nextPage).campaign_name, 'phoenix_fix_flip');
nextPage.actions.essential();
assert.equal(campaignSession.has('gf_acquisition_v1'), false, 'Revoking consent clears local attribution');
const priorSearch = new Map([['gf_acquisition_v1', JSON.stringify({ v: 1, source: 'google', medium: 'organic', ts: Date.now() })]]);
assert.equal(channel(boot({ url: 'https://www.grandfundingllc.com/contact?gclid=NEVER-SEND', session: priorSearch })).campaign_source, undefined, 'Paid markers must not reuse a saved organic source');
const unknownCampaign = boot({ url: 'https://www.grandfundingllc.com/contact?utm_source=ig&utm_medium=social&utm_campaign=NEVER-SEND' });
assert.equal(channel(unknownCampaign).campaign_source, 'instagram');
assert.equal(channel(unknownCampaign).campaign_name, undefined);
assert.equal(JSON.stringify(unknownCampaign.entries()).includes('NEVER-SEND'), false);
for (const saved of [
  { v: 1, source: 'NEVER-SEND', medium: 'social', ts: Date.now() },
  { v: 1, source: 'instagram', medium: 'NEVER-SEND', ts: Date.now() },
  { v: 1, source: 'instagram', medium: 'social', campaign: 'NEVER-SEND', ts: Date.now() },
  { v: 1, source: 'instagram', medium: 'social', ts: Date.now() - 31 * 60 * 1000 },
  { v: 1, source: 'instagram', medium: 'social', ts: Date.now() + 60000 }
]) {
  assert.equal(channel(boot({ session: new Map([['gf_acquisition_v1', JSON.stringify(saved)]]) })).campaign_source, undefined, 'Expired or tampered source records are ignored');
}
// Ads off-state: an empty pixel ID means no Meta runtime exists even when granted.
assert.equal(privateQuery.sandbox.fbq, undefined, 'No pixel ID must mean no fbq stub');
assert.equal(privateQuery.scripts.length, 1, 'No pixel ID must mean only the GTM transport loads');
// Ads on-state uses an in-memory stub ID; the shipped source stays empty and no
// network request is possible inside this sandbox.
const stubbedSource = source.replace('const META_PIXEL_ID = "";', 'const META_PIXEL_ID = "1234567890";');
assert.ok(stubbedSource.includes('const META_PIXEL_ID = "1234567890";'), 'Stub ID injection must apply');
assert.ok(!source.includes('1234567890'), 'Shipped consent.js must not carry a stub pixel ID');
const adsBoth = JSON.stringify({ v: 1, analytics: true, ads: true });
const adsOnly = JSON.stringify({ v: 1, analytics: false, ads: true });
const adsOn = boot({ src: stubbedSource, consent: adsBoth });
assert.equal(adsOn.scripts.length, 2, 'Ads consent must load the Meta transport alongside GTM');
assert.ok(JSON.stringify(adsOn.sandbox.fbq.q).includes('1234567890'), 'Pixel must init with the configured ID');
assert.ok(JSON.stringify(adsOn.sandbox.fbq.q).includes('PageView'), 'Pixel must record a PageView');
assert.equal(adsOn.sandbox.gfPhoneConversion({}), true, 'Phone conversion stays available');
assert.ok(JSON.stringify(adsOn.sandbox.fbq.q).includes('Contact'), 'Call tap must translate to Contact');
const adsDenied = boot({ src: stubbedSource, consent: granted });
assert.equal(adsDenied.scripts.length, 1, 'Denied ads consent must not load the pixel');
assert.equal(adsDenied.sandbox.fbq, undefined, 'Denied ads consent must not define fbq');
const adsSeparate = boot({ src: stubbedSource, consent: adsOnly });
assert.equal(adsSeparate.scripts.length, 1, 'Ads-only consent loads the pixel without GTM');
assert.ok(JSON.stringify(adsSeparate.sandbox.fbq.q).includes('PageView'));
const adsGpc = boot({ src: stubbedSource, consent: adsBoth, gpc: true });
assert.equal(adsGpc.scripts.length, 1, 'Global Privacy Control must suppress the pixel');
assert.equal(adsGpc.sandbox.fbq, undefined, 'Global Privacy Control must leave fbq undefined');
const adsPending = new Map([['gf_pending_lead_v1', JSON.stringify({ v: 1, id: 'ads-receipt-only', type: 'contact', createdAt: Date.now() })]]);
const adsReceipt = boot({ ...receiptOptions, src: stubbedSource, consent: adsBoth, session: adsPending });
assert.equal(adsReceipt.sandbox.gfLeadConversion({ formType: 'contact', submissionId: 'ads-receipt-only' }), true);
assert.ok(JSON.stringify(adsReceipt.sandbox.fbq.q).includes('Lead'), 'Quote submit must translate to Lead');
assert.ok(JSON.stringify(adsReceipt.sandbox.fbq.q).includes('contact'), 'Lead must carry the form type');
assert.equal(JSON.stringify(adsReceipt.sandbox.fbq.q).includes('ads-receipt-only'), false, 'Deduplication ID must not reach Meta');
const dist = new URL('../dist/', import.meta.url);
const html = await fs.readFile(new URL('index.html', dist), 'utf8');
assert.equal(/googletagmanager\.com\/(gtm\.js|ns\.html)/.test(html), false, 'No initial Google loader/fallback');
assert.ok(html.includes('name="gf-analytics-path" content="/"'));
assert.ok(html.includes('Allow analytics'));
assert.ok(html.includes('Advertising tracking is off.'), 'Deployed banner keeps the no-ads promise while no pixel ID is configured');
assert.equal(/connect\.facebook\.net/.test(html), false, 'No Meta transport in published HTML');
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
