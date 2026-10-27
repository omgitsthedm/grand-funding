import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { loanTypeFromSearch, prefillLoanRequest } from '../loan-request-context.js';

test('recognizes only the six existing public loan choices', () => {
  const options = { 'fix-flip': 'Fix & Flip', bridge: 'Bridge', construction: 'Construction', land: 'Land', 'cash-out': 'Cash-Out Refinance', 'second-position': '2nd Position' };
  for (const [slug, label] of Object.entries(options)) assert.equal(loanTypeFromSearch(`?loan=${slug}&utm_source=instagram`), label);
});

test('ambiguous, unknown, private and hostile parameters cannot select a loan', () => {
  for (const search of ['', '?loan=', '?loan=dscr', '?loan=__proto__', '?loan=constructor', '?loan=bridge&loan=fix-flip', '?loan=bridge&loan=bridge', '?loan=<script>', '?loan=Bridge', '?name=Someone&amount=999999', '?loan=bridge&x=' + 'x'.repeat(4096)]) assert.equal(loanTypeFromSearch(search), null);
  assert.equal(loanTypeFromSearch(null), null);
});

function formWith(value, options = ['Fix & Flip', 'Bridge', 'Other']) {
  const field = { value, options: options.map(value => ({ value })) };
  return { field, form: { querySelector(selector) { assert.equal(selector, 'select[name="loan_type"]'); return field; } } };
}

test('prefills the native option without inventing a new form field', () => {
  const { form, field } = formWith('');
  assert.equal(prefillLoanRequest(form, '?loan=fix-flip'), true);
  assert.equal(field.value, 'Fix & Flip');
});

test('a borrower choice wins over page context on repeated initialization', () => {
  const { form, field } = formWith('');
  prefillLoanRequest(form, '?loan=fix-flip');
  field.value = 'Bridge';
  assert.equal(prefillLoanRequest(form, '?loan=fix-flip'), false);
  assert.equal(field.value, 'Bridge');
});

test('missing form, missing option and unknown context retain the native fallback', () => {
  assert.equal(prefillLoanRequest(null, '?loan=bridge'), false);
  const { form, field } = formWith('', ['Other']);
  assert.equal(prefillLoanRequest(form, '?loan=bridge'), false);
  assert.equal(prefillLoanRequest(form, '?loan=unrecognized'), false);
  assert.equal(field.value, '');
});

test('all 30 built loan pages retain their program through the quote handoff', async () => {
  const prefixes = { 'fix-and-flip-loans-': 'fix-flip', 'bridge-loans-': 'bridge', 'construction-loans-': 'construction', 'cash-out-refinance-': 'cash-out', 'second-position-loans-': 'second-position' };
  let pages = 0;
  for (const file of await readdir(new URL('../dist/', import.meta.url))) {
    const prefix = Object.keys(prefixes).find(prefix => file.startsWith(prefix) && file.endsWith('.html'));
    if (!prefix) continue;
    const slug = prefixes[prefix];
    pages++;
    const html = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(match => new URL(match[1], 'https://www.grandfundingllc.com')).filter(url => url.origin === 'https://www.grandfundingllc.com' && /^\/apply(?:\.html)?\/?$/.test(url.pathname));
    assert.ok(links.length > 0, `${file} has quote links`);
    for (const url of links) assert.equal(url.searchParams.get('loan'), slug, `${file}: ${url.pathname}${url.search}`);
    assert.doesNotMatch(html.match(/<meta\b(?=[^>]*name="description")[^>]*>/i)?.[0] || '', /approved timing/i);
  }
  assert.equal(pages, 30);
  const html = await readFile(new URL('../dist/apply.html', import.meta.url), 'utf8');
  assert.match(html, /<script\b(?=[^>]*type=["']module["'])(?=[^>]*src=["']\/loan-request-context\.js(?:\?v=[^"']*)?["'])[^>]*>/);
});

test('all six product quote actions preserve their existing native loan option', async () => {
  const html = await readFile(new URL('../dist/products.html', import.meta.url), 'utf8');
  const programs = { construction: 'construction', 'bridge-loans': 'bridge', 'fix-and-flip': 'fix-flip', 'cash-out-refinance': 'cash-out', 'land-loans': 'land', 'second-mortgage': 'second-position' };
  const sections = [...html.matchAll(/<section\b(?=[^>]*\bid="([^"]+)")[^>]*>[\s\S]*?<\/section>/gi)];
  for (const [id, slug] of Object.entries(programs)) {
    const section = sections.find(match => match[1] === id)?.[0];
    assert.ok(section, `${id}: product section exists`);
    const links = [...section.matchAll(/href="([^\"]+)"/g)].map(match => new URL(match[1], 'https://www.grandfundingllc.com')).filter(url => url.pathname === '/apply');
    assert.ok(links.length > 0, `${id}: quote action exists`);
    for (const url of links) assert.equal(url.searchParams.get('loan'), slug, id);
  }
});

test('all 18 built inquiry forms offer phone as optional while preserving the reply route', async () => {
  let forms = 0;
  for (const file of await readdir(new URL('../dist/', import.meta.url))) {
    if (!file.endsWith('.html')) continue;
    const html = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    for (const match of html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)) {
      const phone = match[0].match(/<input\b(?=[^>]*\bname="phone")[^>]*>/i)?.[0];
      if (!phone) continue;
      forms++;
      assert.doesNotMatch(phone, /\brequired\b/i, file);
      assert.match(match[0], /Phone \(optional\)/i, file);
      assert.match(match[0], /<input\b(?=[^>]*\bname="email")(?=[^>]*\brequired)[^>]*>/i, file);
      assert.match(match[0], /name="bot-field"/, file);
    }
  }
  assert.equal(forms, 18);
});
