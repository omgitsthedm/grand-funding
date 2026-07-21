#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.env.SITE_DIR || 'dist');
const VERIFY_FILE = 'googleb80e08d782fcdd45.html';
const errors = [];

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

const rel = file => path.relative(SITE, file).replaceAll(path.sep, '/');
const count = (html, expression) => (html.match(expression) || []).length;
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function localReference(raw, fromFile) {
  if (!raw || /^(?:data:|mailto:|tel:|javascript:|\/\/|%23)/i.test(raw)) return null;
  let value = raw;
  if (/^https?:/i.test(value)) {
    const url = new URL(value);
    if (url.hostname !== 'www.grandfundingllc.com' && url.hostname !== 'grandfundingllc.com') return null;
    value = `${url.pathname}${url.search}${url.hash}`;
  }
  const [withoutHash, anchor = ''] = value.split('#', 2);
  const clean = withoutHash.split('?', 1)[0];
  let decoded = clean;
  try { decoded = decodeURIComponent(clean); } catch {}
  const base = decoded.startsWith('/') ? SITE : path.dirname(fromFile);
  const fragment = decoded.replace(/^\/+/, '');
  const resolved = decoded ? path.resolve(base, fragment) : fromFile;
  const candidates = [resolved];
  if (decoded.endsWith('/')) candidates.push(path.join(resolved, 'index.html'));
  else if (decoded && !path.extname(decoded)) candidates.push(`${resolved}.html`, path.join(resolved, 'index.html'));
  return { anchor, candidates };
}

function resolveReference(raw, fromFile) {
  const local = localReference(raw, fromFile);
  if (!local) return;
  const target = local.candidates.find(candidate => fs.existsSync(candidate));
  if (!target) {
    errors.push(`${rel(fromFile)}: missing local reference ${raw}`);
    return;
  }
  if (local.anchor && target.endsWith('.html')) {
    const html = fs.readFileSync(target, 'utf8');
    const id = new RegExp(`\\bid=["']${escapeRegExp(local.anchor)}["']`);
    if (!id.test(html)) errors.push(`${rel(fromFile)}: missing anchor ${raw}`);
  }
}

if (!fs.existsSync(SITE)) throw new Error(`Site directory does not exist: ${SITE}`);

const files = walk(SITE);
const htmlFiles = files.filter(file => file.endsWith('.html'));

for (const forbidden of [
  '.ai', '.git', '.github', '.netlify', 'AGENTS.md', 'CLAUDE.md', 'PREMIUM_STANDARDS.md',
  'PROJECT_STATUS.md', 'SOURCE_OF_TRUTH.md', 'docs', 'generate_pages.py', 'generate_posts.py',
  'node_modules', 'package-lock.json', 'package.json', 'scripts'
]) {
  if (fs.existsSync(path.join(SITE, forbidden))) errors.push(`publish boundary includes forbidden path: ${forbidden}`);
}

for (const file of htmlFiles) {
  const name = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  if (path.basename(file) !== VERIFY_FILE) {
    const expected = [
      ['doctype', /<!doctype\s+html/gi], ['html open', /<html\b/gi], ['html close', /<\/html>/gi],
      ['head open', /<head\b/gi], ['head close', /<\/head>/gi], ['body open', /<body\b/gi],
      ['body close', /<\/body>/gi], ['main open', /<main\b/gi], ['main close', /<\/main>/gi],
      ['h1', /<h1\b/gi], ['title', /<title\b/gi]
    ];
    for (const [label, expression] of expected) {
      const found = count(html, expression);
      if (found !== 1) errors.push(`${name}: expected one ${label}, found ${found}`);
    }
    if (!/<html\b[^>]*\blang=["'][a-z]/i.test(html)) errors.push(`${name}: missing document language`);
    if (!/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["'][^"']+/i.test(html)
      && !/<meta\b[^>]*\bcontent=["'][^"']+["'][^>]*\bname=["']description["']/i.test(html)) {
      errors.push(`${name}: missing meta description`);
    }
    if (!/<link\b[^>]*\brel=["']canonical["']/i.test(html)) errors.push(`${name}: missing canonical link`);
  }

  if (/class=["'][^"']*\bclass\s*=/.test(html)) errors.push(`${name}: malformed nested class attribute`);

  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) errors.push(`${name}: duplicate ids ${duplicates.join(', ')}`);

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/<(?:a|link|script|img|iframe|video)\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    resolveReference(attributes.href || attributes.src, file);
  }
  for (const match of html.matchAll(/<source\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    for (const source of (attributes.srcset || '').split(',').map(part => part.trim().split(/\s+/, 1)[0]).filter(Boolean)) {
      resolveReference(source, file);
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if (!Object.hasOwn(attributes, 'alt')) errors.push(`${name}: image missing alt (${attributes.src || 'unknown source'})`);
    if (!attributes.width || !attributes.height) errors.push(`${name}: image missing dimensions (${attributes.src || 'unknown source'})`);
  }

  for (const match of html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)) {
    const open = match[0].match(/<form\b[^>]*>/i)?.[0] || '';
    const attributes = parseAttributes(open);
    const body = match[0];
    if (!attributes.name) errors.push(`${name}: form missing name`);
    if ((attributes.method || '').toLowerCase() !== 'post') errors.push(`${name}: ${attributes.name || 'form'} must POST`);
    if (!attributes.action) errors.push(`${name}: ${attributes.name || 'form'} missing action`);
    if (!/\bdata-netlify(?:\s*=|\s|>)/i.test(open) && !/\snetlify(?:\s|>)/i.test(open)) {
      errors.push(`${name}: ${attributes.name || 'form'} missing Netlify declaration`);
    }
    if (!/name=["']form-name["']/i.test(body)) errors.push(`${name}: ${attributes.name || 'form'} missing form-name input`);
    if (!/\bnetlify-honeypot=/i.test(open)) errors.push(`${name}: ${attributes.name || 'form'} missing honeypot declaration`);
  }
}

for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = fs.readFileSync(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) resolveReference(match[1], file);
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML documents and ${files.length} public files in ${path.relative(process.cwd(), SITE) || '.'}`);
