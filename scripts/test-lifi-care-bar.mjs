#!/usr/bin/env node

import assert from 'node:assert/strict';
import { injectCareBar } from './inject-lifi-care-bar.mjs';

const legacyLandingPage = `<!doctype html>
<html><head><title>Landing page</title></head><body>
<main id="main"><section><p>Approved transaction-specific copy.</p></section></main>
<footer class="lp-footer"><p>This is not a commitment to lend.</p><p>Designed, Hosted and Cared For by <a href="https://www.littlefightnyc.com" target="_blank">LittleFightNYC.com</a></p><div class="footer-credit" data-lfc></div></footer>
</body></html>`;

const output = injectCareBar(legacyLandingPage, 'landing-page-fixture.html');

assert.equal((output.match(/<main\b/gi) || []).length, 1);
assert.equal((output.match(/<\/main>/gi) || []).length, 1);
assert.equal((output.match(/<footer\b/gi) || []).length, 1);
assert.equal((output.match(/<\/footer>/gi) || []).length, 1);
assert.equal((output.match(/class="lfc"/g) || []).length, 1);
assert.equal((output.match(/lfc-beacon/g) || []).length, 1);
assert.equal(output.includes('Made by'), true);
assert.equal(output.includes('Little Fight NYC'), true);
assert.equal(output.includes('Designed, Hosted and Cared For by'), false);
assert.equal(output.includes('This is not a commitment to lend.'), true);
assert.equal(output.includes('data-lfc'), false);
assert.equal(output.includes('/lifi-care.css'), true);

console.log('Little Fight credit-mark landmark regression test passed');
