import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
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

test('built priority-page quote links retain context and the application loads its module', async () => {
  const cases = { 'fix-and-flip-loans-phoenix.html': 'fix-flip', 'fix-and-flip-loans-arizona.html': 'fix-flip', 'bridge-loans-arizona.html': 'bridge' };
  for (const [file, slug] of Object.entries(cases)) {
    const html = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(match => new URL(match[1], 'https://www.grandfundingllc.com')).filter(url => url.origin === 'https://www.grandfundingllc.com' && /^\/apply(?:\.html)?\/?$/.test(url.pathname));
    assert.ok(links.length > 0, `${file} has quote links`);
    for (const url of links) assert.equal(url.searchParams.get('loan'), slug, `${file}: ${url.pathname}${url.search}`);
  }
  const html = await readFile(new URL('../dist/apply.html', import.meta.url), 'utf8');
  assert.match(html, /<script\b(?=[^>]*type=["']module["'])(?=[^>]*src=["']\/loan-request-context\.js(?:\?v=[^"']*)?["'])[^>]*>/);
});
