#!/usr/bin/env node

// Dry-run regression for scripts/indexnow.mjs against a fixture dist/. Never passes
// --submit, so nothing is sent to IndexNow.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'indexnow.mjs');
const KEY = 'c4335c28ae36c55515f16d9dcb10e441';
const ORIGIN = 'https://www.grandfundingllc.com';

const fixture = mkdtempSync(path.join(tmpdir(), 'gf-indexnow-'));
try {
  mkdirSync(path.join(fixture, 'dist'));
  writeFileSync(path.join(fixture, `${KEY}.txt`), `${KEY}\n`);
  writeFileSync(path.join(fixture, 'dist', `${KEY}.txt`), `${KEY}\n`);
  writeFileSync(path.join(fixture, 'dist', 'robots.txt'), 'User-agent: *\nAllow: /\n');
  writeFileSync(
    path.join(fixture, 'dist', 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?><urlset><url><loc>${ORIGIN}/</loc></url><url><loc>${ORIGIN}/faq</loc></url><url><loc>${ORIGIN}/products</loc></url></urlset>`
  );

  const run = (...args) => {
    const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: fixture, encoding: 'utf8' });
    return { status: result.status, json: result.status === 0 ? JSON.parse(result.stdout) : null, stderr: result.stderr };
  };

  const all = run();
  assert.equal(all.status, 0, all.stderr);
  assert.equal(all.json.mode, 'dry-run');
  assert.equal(all.json.source, 'sitemap');
  assert.deepEqual(all.json.paths, ['/', '/faq', '/products']);

  const targeted = run('--changed', `${ORIGIN}/faq`, '--removed', `${ORIGIN}/retired-page`, '--changed', `${ORIGIN}/faq`);
  assert.equal(targeted.status, 0, targeted.stderr);
  assert.equal(targeted.json.mode, 'dry-run');
  assert.equal(targeted.json.source, 'changed');
  assert.deepEqual(targeted.json.paths, ['/faq', '/retired-page']);

  const unlisted = run('--changed', `${ORIGIN}/not-built`);
  assert.equal(unlisted.status, 1);
  assert.match(unlisted.stderr, /Not an indexable sitemap URL/);

  const stillListed = run('--removed', `${ORIGIN}/products`);
  assert.equal(stillListed.status, 1);
  assert.match(stillListed.stderr, /Still in the sitemap/);

  for (const bad of ['https://grandfundingllc.com/old', `${ORIGIN}/old.html`, `${ORIGIN}/old/`, `${ORIGIN}/old?x=1`, '/old']) {
    const rejected = run('--removed', bad);
    assert.equal(rejected.status, 1, `accepted ${bad}`);
  }

  assert.equal(run('--removed').status, 1);
  assert.equal(run('--unknown').status, 1);

  console.log('IndexNow dry-run regression passed: sitemap, changed, removed and canonical-host guards');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
