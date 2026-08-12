#!/usr/bin/env node

import assert from 'node:assert/strict';
import { injectCareBar } from './inject-lifi-care-bar.mjs';

const legacyLandingPage = `<!doctype html>
<html><head><title>Landing page</title></head><body>
<main id="main"><section><p>Approved transaction-specific copy.</p></section></main>
<footer class="lp-footer"><p>This is not a commitment to lend.</p><p>Designed, Hosted and Cared For by <a href="https://www.littlefightnyc.com" target="_blank">LittleFightNYC.com</a></p></footer>
</body></html>`;

const output = injectCareBar(legacyLandingPage, 'landing-page-fixture.html');

assert.equal((output.match(/<main\b/gi) || []).length, 1);
assert.equal((output.match(/<\/main>/gi) || []).length, 1);
assert.equal((output.match(/<footer\b/gi) || []).length, 1);
assert.equal((output.match(/<\/footer>/gi) || []).length, 1);
assert.equal((output.match(/class="lf-care-bar"/g) || []).length, 1);
assert.equal(output.includes('Designed, Hosted and Cared For by'), false);
assert.equal(output.includes('target="_blank"'), false);

console.log('Little Fight care-bar landmark regression test passed');
