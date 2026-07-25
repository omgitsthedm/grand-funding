#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const EXPECTED_SITE_ID = '055c5942-aeaa-478a-9508-a34406994d5d';
const EXPECTED_SITE_NAME = 'grandfundingllc';
const CORRECTIVE_COMMAND = `netlify link --id ${EXPECTED_SITE_ID}`;

function safeMetadata(value, fallback) {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  return value.replace(/[^\w.-]/g, '?').slice(0, 128);
}

function fail(message) {
  console.error(`Netlify deploy preflight failed: ${message}`);
  console.error(`Expected: ${EXPECTED_SITE_NAME} (${EXPECTED_SITE_ID})`);
  console.error(`Relink this checkout with: ${CORRECTIVE_COMMAND}`);
  process.exit(1);
}

function parseStatus(stdout) {
  const output = String(stdout || '').trim();

  try {
    return JSON.parse(output);
  } catch {
    const start = output.indexOf('{');
    const end = output.lastIndexOf('}');
    if (start < 0 || end <= start) return null;

    try {
      return JSON.parse(output.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

const result = spawnSync('netlify', ['status', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

if (result.error) {
  fail(
    result.error.code === 'ENOENT'
      ? 'Netlify CLI is not installed or is not on PATH.'
      : 'Unable to inspect this checkout’s Netlify link.',
  );
}

if (result.status !== 0) {
  fail('Netlify CLI could not inspect this checkout’s linked site.');
}

const status = parseStatus(result.stdout);
if (!status || typeof status !== 'object') {
  fail('Netlify CLI returned unreadable site metadata.');
}

const site = status.siteData ?? status.site ?? status;
const actualSiteId =
  site['site-id']
  ?? site.siteId
  ?? site.site_id
  ?? status.siteId
  ?? status.site_id;
const actualSiteName =
  site['site-name']
  ?? site.siteName
  ?? site.site_name
  ?? site.name
  ?? status.siteName
  ?? status.site_name;

if (typeof actualSiteId !== 'string' || actualSiteId.length === 0) {
  fail('No linked Netlify site ID was found.');
}

if (typeof actualSiteName !== 'string' || actualSiteName.length === 0) {
  fail('No linked Netlify site name was found.');
}

if (
  actualSiteId !== EXPECTED_SITE_ID
  || actualSiteName !== EXPECTED_SITE_NAME
) {
  fail(
    `found ${safeMetadata(actualSiteName, 'unknown-site')} `
      + `(${safeMetadata(actualSiteId, 'unknown-id')}).`,
  );
}

console.log(
  `Netlify target verified: ${EXPECTED_SITE_NAME} (${EXPECTED_SITE_ID}).`,
);
