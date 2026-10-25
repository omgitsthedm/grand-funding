#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE_ORIGIN = 'https://www.grandfundingllc.com';
const HOST = 'www.grandfundingllc.com';
const KEY = 'c4335c28ae36c55515f16d9dcb10e441';
const KEY_FILE = `${KEY}.txt`;
const KEY_LOCATION = `${SITE_ORIGIN}/${KEY_FILE}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 1000;

if (!/^[A-Za-z0-9-]{8,128}$/.test(KEY)) throw new Error('IndexNow key must contain 8–128 letters, numbers, or dashes');

const usage = `Usage:
  npm run indexnow                         # dry-run all canonical sitemap URLs
  npm run indexnow -- --changed <url>      # dry-run an added or changed URL (repeatable)
  npm run indexnow -- --removed <url>      # dry-run a removed URL (repeatable)
  npm run indexnow:submit                  # submit the whole sitemap (first submission only)
  npm run indexnow -- --submit --changed <url> --removed <url>
                                           # every later release: only what it added, changed or removed

Run after the published production release, from the same built dist/.
The command never submits without --submit. Never resubmit unchanged URLs.
URLs must use ${SITE_ORIGIN}, have no query or hash, and use the clean
canonical form (no .html, no trailing slash except the home page). A --changed
URL must appear in dist/sitemap.xml; a --removed URL must no longer appear there.`;

const fail = message => {
  console.error(`IndexNow: ${message}`);
  process.exitCode = 1;
};

const parseArgs = args => {
  const changed = [];
  const removed = [];
  let submit = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--submit') {
      submit = true;
      continue;
    }
    if (arg === '--changed') {
      const url = args[index + 1];
      if (!url || url.startsWith('--')) throw new Error('--changed requires one URL');
      changed.push(url);
      index += 1;
      continue;
    }
    if (arg === '--removed') {
      const url = args[index + 1];
      if (!url || url.startsWith('--')) throw new Error('--removed requires one URL');
      removed.push(url);
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log(usage);
      process.exit(0);
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  return { changed, removed, submit };
};

const validateCanonicalUrl = value => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('A supplied URL is not valid');
  }
  if (url.origin !== SITE_ORIGIN || url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new Error(`URLs must belong to ${SITE_ORIGIN}`);
  }
  if (url.search || url.hash) throw new Error('URLs must not include a query string or hash');
  if (/\.html$/i.test(url.pathname)) throw new Error('URLs must use the clean canonical form without .html');
  if (url.pathname !== '/' && url.pathname.endsWith('/')) throw new Error('URLs must not end with a slash (except the home page)');
  return url.href;
};

const readSitemapUrls = async () => {
  const sitemapPath = resolve('dist/sitemap.xml');
  const robotsPath = resolve('dist/robots.txt');
  let xml;
  let robots;
  try {
    [xml, robots] = await Promise.all([readFile(sitemapPath, 'utf8'), readFile(robotsPath, 'utf8')]);
  } catch {
    throw new Error('Missing dist/sitemap.xml or dist/robots.txt. Run `npm run build` for the released source first.');
  }
  if (/^Disallow: \/$/m.test(robots)) throw new Error('The built robots.txt blocks crawling; refusing to submit.');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => validateCanonicalUrl(match[1].trim()));
  if (!urls.length) throw new Error('The sitemap contains no indexable URLs. Run `npm run build` first.');
  return urls;
};

const verifyKeyFiles = async () => {
  for (const relative of [KEY_FILE, `dist/${KEY_FILE}`]) {
    let contents;
    try {
      contents = await readFile(resolve(relative), 'utf8');
    } catch {
      throw new Error(`Missing ${relative}. Run \`npm run build\` so the key ships in dist/.`);
    }
    if (contents.trim() !== KEY) throw new Error(`${relative} must contain only its matching key`);
  }
};

const responseMeaning = status => ({
  200: 'received',
  202: 'accepted_pending_key_validation',
  400: 'invalid_request',
  403: 'key_verification_failed',
  422: 'host_or_key_schema_rejected',
  429: 'rate_limited',
}[status] || 'unexpected_response');

try {
  const { changed, removed, submit } = parseArgs(process.argv.slice(2));
  await verifyKeyFiles();
  const sitemapUrls = await readSitemapUrls();
  let source = 'sitemap';
  let selected = sitemapUrls;
  if (changed.length || removed.length) {
    source = 'changed';
    const indexable = new Set(sitemapUrls);
    const changedUrls = changed.map(validateCanonicalUrl);
    const missing = changedUrls.filter(url => !indexable.has(url));
    if (missing.length) throw new Error(`Not an indexable sitemap URL: ${missing.join(', ')}`);
    const removedUrls = removed.map(validateCanonicalUrl);
    const stillListed = removedUrls.filter(url => indexable.has(url));
    if (stillListed.length) throw new Error(`Still in the sitemap, so not removed (use --changed): ${stillListed.join(', ')}`);
    selected = [...changedUrls, ...removedUrls];
  }
  const urls = [...new Set(selected)];
  if (urls.length > MAX_URLS) throw new Error(`Refusing ${urls.length} URLs; submit changed URLs in batches of ${MAX_URLS} or fewer.`);

  const summary = {
    mode: submit ? 'submit' : 'dry-run',
    source,
    host: HOST,
    keyLocation: KEY_LOCATION,
    urlCount: urls.length,
    paths: urls.map(url => new URL(url).pathname),
  };

  if (!submit) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
      });
    } catch {
      throw new Error('IndexNow request failed before a response was received');
    }
    const result = { ...summary, status: response.status, outcome: responseMeaning(response.status) };
    console.log(JSON.stringify(result, null, 2));
    if (!response.ok) process.exitCode = 1;
  }
} catch (error) {
  fail(error instanceof Error ? error.message : 'Unexpected failure');
}
