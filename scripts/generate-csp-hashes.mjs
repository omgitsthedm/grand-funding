import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const skipDirs = new Set(['.git', '.netlify', 'node_modules']);

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        results.push(...walk(join(dir, entry.name)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(join(dir, entry.name));
    }
  }
  return results;
}

function sha256(value) {
  return `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
}

function addHash(map, type, source, value) {
  const hash = sha256(value);
  if (!map.has(hash)) {
    map.set(hash, []);
  }
  map.get(hash).push({ type, source, value });
}

const scriptHashes = new Map();
const styleHashes = new Map();

for (const file of walk(root)) {
  const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const source = relative(root, file);

  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    addHash(scriptHashes, 'script', source, match[1]);
  }

  for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    addHash(styleHashes, 'style-block', source, match[1]);
  }

  for (const match of html.matchAll(/\sstyle="([^"]*)"/gi)) {
    addHash(styleHashes, 'style-attr', source, match[1]);
  }

  for (const match of html.matchAll(/\s(on[a-z]+)="([^"]*)"/gi)) {
    addHash(scriptHashes, `event:${match[1]}`, source, match[2]);
  }
}

const scriptList = [...scriptHashes.keys()].sort();
const styleList = [...styleHashes.keys()].sort();

const policy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-hashes'",
    ...scriptList,
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net',
  ].join(' '),
  [
    "style-src 'self' 'unsafe-hashes'",
    ...styleList,
    'https://fonts.googleapis.com',
  ].join(' '),
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
  "frame-src 'self' https://www.google.com https://www.recaptcha.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

console.log(policy);
console.error(`script hashes: ${scriptList.length}`);
console.error(`style hashes: ${styleList.length}`);
