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
    if (!/<link\b[^>]*\brel=["']alternate["'][^>]*\btype=["']application\/rss\+xml["']/i.test(html)
      && !/<link\b[^>]*\btype=["']application\/rss\+xml["'][^>]*\brel=["']alternate["']/i.test(html)) {
      errors.push(`${name}: missing RSS discovery link`);
    }
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
    if (['pre-approval', 'contact'].includes(attributes.name)) {
      if (!/\bdata-gf-lead-form(?:\s|>)/i.test(open)) {
        errors.push(`${name}: ${attributes.name} missing resilient lead-form marker`);
      }
      if (!/\bdata-form-kind=["'](?:application|contact)["']/i.test(open)) {
        errors.push(`${name}: ${attributes.name} missing typed form kind`);
      }
      if (!/\bdata-form-status(?:\s|>)/i.test(body) || !/\brole=["']status["']/i.test(body)) {
        errors.push(`${name}: ${attributes.name} missing accessible submission status`);
      }
    }
  }

  const faqQuestions = [...html.matchAll(/<button\b[^>]*\bclass=(?:"[^"]*\bfaq-question\b[^"]*"|'[^']*\bfaq-question\b[^']*')[^>]*>/gi)];
  const faqAnswers = [...html.matchAll(/<div\b[^>]*\bclass=(?:"[^"]*\bfaq-answer\b[^"]*"|'[^']*\bfaq-answer\b[^']*')[^>]*>/gi)];
  if (faqQuestions.length !== faqAnswers.length) {
    errors.push(`${name}: FAQ question/answer count mismatch (${faqQuestions.length}/${faqAnswers.length})`);
  }
  faqQuestions.forEach((question, index) => {
    const questionAttributes = parseAttributes(question[0]);
    const answerAttributes = parseAttributes(faqAnswers[index]?.[0] || '');
    if (!questionAttributes.id || questionAttributes['aria-controls'] !== answerAttributes.id) {
      errors.push(`${name}: FAQ disclosure ${index + 1} has broken controls relationship`);
    }
    if (answerAttributes['aria-labelledby'] !== questionAttributes.id) {
      errors.push(`${name}: FAQ disclosure ${index + 1} has broken label relationship`);
    }
    if (!/\shidden(?:\s|>)/i.test(faqAnswers[index]?.[0] || '')) {
      errors.push(`${name}: FAQ disclosure ${index + 1} is not semantically collapsed`);
    }
  });

  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = tableMatch[0];
    if (!/<caption\b[^>]*>[\s\S]*?<\/caption>/i.test(table)) {
      errors.push(`${name}: table missing caption`);
    }
    for (const headMatch of table.matchAll(/<thead\b[^>]*>[\s\S]*?<\/thead>/gi)) {
      for (const header of headMatch[0].matchAll(/<th\b[^>]*>/gi)) {
        if (!/\bscope=["']col["']/i.test(header[0])) {
          errors.push(`${name}: table column header missing scope=col`);
        }
      }
    }
  }

  if (/^thanks(?:-contact)?\.html$/.test(name)) {
    if (/generate_lead|gfLeadConversion\(\)/i.test(html)) {
      errors.push(`${name}: unconfirmed direct-load lead conversion remains`);
    }
    const gtmFallbacks = count(
      html,
      /<noscript\b[^>]*>[\s\S]*?googletagmanager\.com\/ns\.html\?id=GTM-M36VM2VG[\s\S]*?<\/noscript>/gi
    );
    if (gtmFallbacks > 1) errors.push(`${name}: duplicate GTM noscript fallbacks (${gtmFallbacks})`);
  }
}

for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = fs.readFileSync(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) resolveReference(match[1], file);
}

const feedPath = path.join(SITE, 'feed.xml');
if (!fs.existsSync(feedPath)) {
  errors.push('feed.xml: missing generated investor-guide RSS feed');
} else {
  const feed = fs.readFileSync(feedPath, 'utf8');
  if (!/<rss\b/i.test(feed) || !/<channel\b/i.test(feed) || count(feed, /<item\b/gi) < 1) {
    errors.push('feed.xml: invalid or empty RSS feed');
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML documents and ${files.length} public files in ${path.relative(process.cwd(), SITE) || '.'}`);
