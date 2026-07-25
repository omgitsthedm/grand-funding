#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.env.SITE_DIR || 'dist');
const SITE_ORIGIN = 'https://www.grandfundingllc.com';
const SITE_HOST = 'www.grandfundingllc.com';
const SITE_HOSTS = new Set([SITE_HOST, 'grandfundingllc.com']);
const VERIFY_FILE = 'googleb80e08d782fcdd45.html';
const EXPECTED_SITEMAP = `${SITE_ORIGIN}/sitemap.xml`;
const OBSOLETE_SCHEMA_TYPES = new Set(['FAQPage']);
const SCHEMA_URL_KEYS = new Set([
  '@id',
  'item',
  'mainEntityOfPage',
  'url',
]);
const issues = [];
const issueKeys = new Set();

function addIssue(category, file, message) {
  const key = `${category}\0${file}\0${message}`;
  if (issueKeys.has(key)) return;
  issueKeys.add(key);
  issues.push({ category, file, message });
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function relativeName(file) {
  return path.relative(SITE, file).replaceAll(path.sep, '/');
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
  )) {
    attributes[match[1].toLowerCase()] =
      match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(
    match => ({
      raw: match[0],
      attributes: parseAttributes(match[0]),
    }),
  );
}

function relTokens(value) {
  return String(value || '').toLowerCase().split(/\s+/).filter(Boolean);
}

function linksWithRel(html, expectedRel) {
  return tags(html, 'link').filter(({ attributes }) =>
    relTokens(attributes.rel).includes(expectedRel),
  );
}

function metaValues(html, expectedKey) {
  const key = expectedKey.toLowerCase();
  return tags(html, 'meta')
    .filter(({ attributes }) =>
      (attributes.name || '').toLowerCase() === key
      || (attributes.property || '').toLowerCase() === key,
    )
    .map(({ attributes }) => attributes.content || '');
}

function decodeHtml(value) {
  const named = {
    amp: '&',
    apos: "'",
    copy: '©',
    gt: '>',
    hellip: '…',
    ldquo: '“',
    lsquo: '‘',
    lt: '<',
    mdash: '—',
    nbsp: ' ',
    ndash: '–',
    quot: '"',
    rdquo: '”',
    rsquo: '’',
  };

  return String(value || '')
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)),
    )
    .replace(
      /&#([0-9]+);/g,
      (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)),
    )
    .replace(
      /&([a-z]+);/gi,
      (entity, name) => named[name.toLowerCase()] ?? entity,
    );
}

function normalizeText(value) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%$#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripNonVisibleMarkup(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(
      /<(?:script|style|svg|template|noscript)\b[\s\S]*?<\/(?:script|style|svg|template|noscript)>/gi,
      ' ',
    );
}

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return normalizeText(stripNonVisibleMarkup(body));
}

function mainVisibleText(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  return normalizeText(stripNonVisibleMarkup(main));
}

function titleText(html) {
  const matches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  return {
    count: matches.length,
    value: decodeHtml(matches[0]?.[1] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  };
}

function h1Values(html) {
  const source = stripNonVisibleMarkup(html);
  return [...source.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match =>
    decodeHtml(match[1]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  );
}

function isNoindex(html) {
  return tags(html, 'meta').some(({ attributes }) =>
    ['robots', 'googlebot'].includes((attributes.name || '').toLowerCase())
    && /\bnoindex\b/i.test(attributes.content || ''),
  );
}

function normalizePageUrl(raw, base = SITE_ORIGIN) {
  if (!raw) return null;

  try {
    const url = new URL(raw, base);
    url.hash = '';
    url.search = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

function expectedUrlForFile(file) {
  const name = relativeName(file);
  if (name === 'index.html') return `${SITE_ORIGIN}/`;

  if (path.basename(file) === 'index.html') {
    const directory = path.posix.dirname(name);
    return `${SITE_ORIGIN}/${directory}/`;
  }

  return `${SITE_ORIGIN}/${name.replace(/\.html$/i, '')}`;
}

function withinSite(target) {
  return target === SITE || target.startsWith(`${SITE}${path.sep}`);
}

function pathnameCandidates(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }

  const target = path.resolve(SITE, `.${decoded}`);
  if (!withinSite(target)) return [];
  if (decoded === '/' || decoded.endsWith('/')) {
    return [path.join(target, 'index.html')];
  }
  if (/\.html$/i.test(decoded)) return [target];
  if (!path.extname(decoded)) {
    return [`${target}.html`, path.join(target, 'index.html')];
  }
  return [];
}

function resolveDocumentUrl(raw, base, documentByFile) {
  let url;
  try {
    url = new URL(raw, base || SITE_ORIGIN);
  } catch {
    return null;
  }

  if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;
  const file = pathnameCandidates(url.pathname).find(candidate =>
    documentByFile.has(candidate),
  );
  if (!file) return null;

  return {
    file,
    normalized: normalizePageUrl(url.toString()),
    url,
  };
}

function resolvePublicFile(raw, fromFile) {
  if (!raw) return null;

  let pathname;
  try {
    if (/^https?:/i.test(raw) || String(raw).startsWith('//')) {
      const url = new URL(raw, SITE_ORIGIN);
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;
      pathname = decodeURIComponent(url.pathname);
    } else {
      const clean = String(raw).split(/[?#]/, 1)[0];
      pathname = decodeURIComponent(clean);
    }
  } catch {
    return null;
  }

  const target = pathname.startsWith('/')
    ? path.resolve(SITE, `.${pathname}`)
    : path.resolve(path.dirname(fromFile), pathname);
  return withinSite(target) ? target : null;
}

function imageMime(file) {
  const extension = path.extname(file).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.ico') return 'image/x-icon';
  return null;
}

function pngDimensions(buffer) {
  if (
    buffer.length < 24
    || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
  ) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  const startOfFrame = new Set([
    0xc0, 0xc1, 0xc2, 0xc3,
    0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb,
    0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (offset + 2 > buffer.length) break;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (startOfFrame.has(marker) && length >= 7) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }

  return null;
}

function webpDimensions(buffer) {
  if (
    buffer.length < 30
    || buffer.subarray(0, 4).toString('ascii') !== 'RIFF'
    || buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
  ) {
    return null;
  }

  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (chunk === 'VP8L' && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >>> 14) & 0x3fff),
    };
  }

  if (chunk === 'VP8 ') {
    const signature = buffer.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (signature >= 0 && signature + 7 <= buffer.length) {
      return {
        width: buffer.readUInt16LE(signature + 3) & 0x3fff,
        height: buffer.readUInt16LE(signature + 5) & 0x3fff,
      };
    }
  }

  return null;
}

function imageDimensions(file) {
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  const buffer = fs.readFileSync(file);
  return pngDimensions(buffer) || jpegDimensions(buffer) || webpDimensions(buffer);
}

function schemaTypes(node) {
  const value = node?.['@type'];
  if (Array.isArray(value)) {
    return value.filter(type => typeof type === 'string');
  }
  return typeof value === 'string' ? [value] : [];
}

function flattenSchemaNodes(value, nodes = []) {
  if (Array.isArray(value)) {
    for (const item of value) flattenSchemaNodes(item, nodes);
    return nodes;
  }
  if (!value || typeof value !== 'object') return nodes;

  if (value['@type']) nodes.push(value);
  for (const child of Object.values(value)) flattenSchemaNodes(child, nodes);
  return nodes;
}

function parseSchemas(document) {
  const roots = [];
  const expression =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let block = 0;

  for (const match of document.html.matchAll(expression)) {
    block += 1;
    try {
      roots.push(JSON.parse(match[1]));
    } catch (error) {
      addIssue(
        'schema/parse',
        document.name,
        `JSON-LD block ${block} is invalid: ${error.message}`,
      );
    }
  }
  return roots;
}

function schemaUrlValues(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) schemaUrlValues(item, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;

  for (const [key, child] of Object.entries(value)) {
    if (SCHEMA_URL_KEYS.has(key)) {
      if (typeof child === 'string') {
        found.push({ key, value: child });
      } else if (child && typeof child === 'object') {
        const nested = child['@id'] || child.url;
        if (typeof nested === 'string') found.push({ key, value: nested });
      }
    }
    schemaUrlValues(child, found);
  }
  return found;
}

function directUrlValues(node) {
  const found = [];
  for (const key of ['@id', 'mainEntityOfPage', 'url']) {
    const value = node?.[key];
    if (typeof value === 'string') {
      found.push({ key, value });
    } else if (value && typeof value === 'object') {
      const nested = value['@id'] || value.url;
      if (typeof nested === 'string') found.push({ key, value: nested });
    }
  }
  return found;
}

function isPageScopedNode(node) {
  return schemaTypes(node).some(type =>
    type.endsWith('Page')
    || [
      'Article',
      'Blog',
      'BlogPosting',
      'CollectionPage',
      'DefinedTerm',
      'FinancialProduct',
      'NewsArticle',
      'Product',
      'Service',
    ].includes(type),
  );
}

function isBusinessEntity(node) {
  return schemaTypes(node).some(type =>
    type === 'FinancialService'
    || type === 'LocalBusiness'
    || type === 'Organization'
    || type.endsWith('Business'),
  );
}

function isSiteEntity(node) {
  return schemaTypes(node).includes('WebSite');
}

function finalBreadcrumbUrl(node) {
  if (
    !schemaTypes(node).includes('BreadcrumbList')
    || !Array.isArray(node.itemListElement)
  ) {
    return null;
  }

  const ordered = [...node.itemListElement].sort(
    (left, right) =>
      Number(left?.position || 0) - Number(right?.position || 0),
  );
  const last = ordered.at(-1);
  if (!last) return null;
  if (typeof last.item === 'string') return last.item;
  return last.item?.['@id'] || last.item?.url || null;
}

function normalizedValueAppears(value, haystack, minimumLength = 3) {
  const normalized = normalizeText(value);
  return normalized.length >= minimumLength && haystack.includes(normalized);
}

function metadataHaystack(document) {
  return [
    document.title,
    document.description,
    ...metaValues(document.html, 'og:title'),
    ...metaValues(document.html, 'og:description'),
    ...metaValues(document.html, 'twitter:title'),
    ...metaValues(document.html, 'twitter:description'),
  ].map(normalizeText).filter(Boolean).join(' | ');
}

function assertVisibleSchemaParity(document, nodes) {
  const visible = document.visible;
  const metadata = metadataHaystack(document);

  for (const node of nodes) {
    const types = schemaTypes(node);
    const label = types.join('/') || 'schema node';
    const checksName = isPageScopedNode(node)
      || isBusinessEntity(node)
      || types.some(type => ['Person', 'Review'].includes(type));

    if (
      checksName
      && typeof node.name === 'string'
      && !normalizedValueAppears(node.name, visible, 3)
    ) {
      addIssue(
        'schema/visible-copy',
        document.name,
        `${label} name is not supported by visible body copy: "${node.name}"`,
      );
    }

    if (
      isPageScopedNode(node)
      && typeof node.headline === 'string'
      && !normalizedValueAppears(node.headline, visible, 8)
      && !normalizedValueAppears(node.headline, metadata, 8)
    ) {
      addIssue(
        'schema/visible-copy',
        document.name,
        `${label} headline is not supported by the visible page or release metadata`,
      );
    }

    if (
      isPageScopedNode(node)
      && typeof node.description === 'string'
      && !normalizedValueAppears(node.description, visible, 16)
      && !normalizedValueAppears(node.description, metadata, 16)
    ) {
      addIssue(
        'schema/visible-copy',
        document.name,
        `${label} description is not supported by the visible page or release metadata`,
      );
    }

    if (types.includes('Review')) {
      const reviewBody = String(node.reviewBody || '');
      if (
        reviewBody
        && !normalizedValueAppears(reviewBody, visible, 16)
      ) {
        addIssue(
          'schema/visible-copy',
          document.name,
          'Review body is not present in visible body copy',
        );
      }

      const authorName =
        typeof node.author === 'string' ? node.author : node.author?.name;
      if (
        typeof authorName === 'string'
        && !normalizedValueAppears(authorName, visible, 3)
      ) {
        addIssue(
          'schema/visible-copy',
          document.name,
          `Review author is not present in visible body copy: "${authorName}"`,
        );
      }
    }

    if (types.includes('AggregateRating')) {
      for (const key of ['ratingValue', 'reviewCount', 'ratingCount']) {
        if (
          node[key] !== undefined
          && !normalizedValueAppears(String(node[key]), visible, 1)
        ) {
          addIssue(
            'schema/visible-copy',
            document.name,
            `AggregateRating ${key} is not present in visible body copy`,
          );
        }
      }
    }
  }
}

const GEOGRAPHIES = {
  Arizona: {
    expected: [
      'arizona', 'az', 'phoenix', 'scottsdale', 'tempe', 'mesa',
      'tucson', 'gilbert', 'chandler',
    ],
    opposing: [
      'california', 'ca', 'los angeles', 'san diego', 'orange county',
    ],
  },
  California: {
    expected: [
      'california', 'ca', 'los angeles', 'san diego', 'orange county',
    ],
    opposing: [
      'arizona', 'az', 'phoenix', 'scottsdale', 'tempe', 'mesa',
      'tucson', 'gilbert', 'chandler',
    ],
  },
};

function inferredState(canonical) {
  if (!canonical) return null;
  const pathname = new URL(canonical).pathname.toLowerCase();
  const california =
    /(?:california|los-angeles|san-diego|orange-county)/.test(pathname);
  const arizona =
    /(?:arizona|phoenix|scottsdale|tempe|mesa|tucson|gilbert|chandler)/.test(
      pathname,
    );
  if (california === arizona) return null;
  return california ? 'California' : 'Arizona';
}

function containsGeographySignal(value, signals) {
  const normalized = ` ${normalizeText(value)} `;
  return signals.some(signal => {
    const needle = ` ${normalizeText(signal)} `;
    return normalized.includes(needle);
  });
}

function exclusivelyOpposingGeography(value, expectedState) {
  const geography = GEOGRAPHIES[expectedState];
  if (!geography) return false;
  return (
    containsGeographySignal(value, geography.opposing)
    && !containsGeographySignal(value, geography.expected)
  );
}

function stateSensitiveNode(node) {
  return isPageScopedNode(node)
    || schemaTypes(node).includes('BreadcrumbList');
}

function inspectGeography(document, nodes) {
  const expectedState = inferredState(document.canonical);
  if (!expectedState) return;

  const releaseFields = [
    ['title', document.title],
    ['meta description', document.description],
    ['H1', document.h1s.join(' ')],
    ['Open Graph title', metaValues(document.html, 'og:title')[0] || ''],
    [
      'Open Graph description',
      metaValues(document.html, 'og:description')[0] || '',
    ],
  ];

  for (const [label, value] of releaseFields) {
    if (value && exclusivelyOpposingGeography(value, expectedState)) {
      addIssue(
        'entity/geography',
        document.name,
        `${label} contradicts the ${expectedState} route`,
      );
    }
  }

  const mismatchedTypes = new Set();
  for (const node of nodes) {
    if (
      stateSensitiveNode(node)
      && exclusivelyOpposingGeography(JSON.stringify(node), expectedState)
    ) {
      for (const type of schemaTypes(node)) mismatchedTypes.add(type);
    }
  }

  if (mismatchedTypes.size) {
    addIssue(
      'entity/geography',
      document.name,
      `page-scoped schema contradicts the ${expectedState} route in `
        + [...mismatchedTypes].join(', '),
    );
  }
}

function parseRobotsGroups(source) {
  const groups = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value);
    } else if (current && ['allow', 'disallow'].includes(key)) {
      current.rules.push({ key, value });
    }
  }

  return groups;
}

function rootIsBlocked(group) {
  return group.rules.some(
    rule => rule.key === 'disallow' && rule.value.trim() === '/',
  );
}

function validateRobots() {
  const file = path.join(SITE, 'robots.txt');
  if (!fs.existsSync(file)) {
    addIssue('robots', 'robots.txt', 'file is missing');
    return;
  }

  const source = fs.readFileSync(file, 'utf8');
  const groups = parseRobotsGroups(source);
  const findAgent = expected =>
    groups.find(group =>
      group.agents.some(agent => agent.toLowerCase() === expected.toLowerCase()),
    );

  const wildcard = findAgent('*');
  if (!wildcard) {
    addIssue('robots', 'robots.txt', 'missing User-agent: * policy');
  } else if (rootIsBlocked(wildcard)) {
    addIssue('robots', 'robots.txt', 'wildcard policy blocks the entire site');
  }

  for (const required of ['OAI-SearchBot', 'Google-Extended']) {
    const group = findAgent(required);
    if (!group) {
      addIssue(
        'robots',
        'robots.txt',
        `missing explicit ${required} policy`,
      );
    } else if (rootIsBlocked(group)) {
      addIssue(
        'robots',
        'robots.txt',
        `${required} policy blocks the entire site`,
      );
    }
  }

  if (/^\s*User-agent\s*:\s*GoogleExtendedBot\b/im.test(source)) {
    addIssue(
      'robots',
      'robots.txt',
      'invalid crawler token GoogleExtendedBot; use Google-Extended',
    );
  }

  const sitemaps = [
    ...source.matchAll(/^\s*Sitemap\s*:\s*(\S+)\s*$/gim),
  ].map(match => match[1]);
  if (sitemaps.length !== 1 || sitemaps[0] !== EXPECTED_SITEMAP) {
    addIssue(
      'robots',
      'robots.txt',
      `expected one Sitemap directive with ${EXPECTED_SITEMAP}`,
    );
  }
}

function validateRedirectsAndPostForms(documents) {
  const file = path.join(SITE, '_redirects');
  if (!fs.existsSync(file)) {
    addIssue('redirects', '_redirects', 'file is missing');
    return;
  }

  const rules = fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((line, index) => {
      const [source, target, status, ...extra] = line.split(/\s+/);
      if (!source || !target || !status || extra.length) {
        addIssue(
          'redirects',
          '_redirects',
          `line ${index + 1} is malformed: ${line}`,
        );
      }
      return { source, target, status };
    });

  const first = rules[0];
  if (
    first?.source !== 'https://grandfundingllc.com/*'
    || first?.target !== 'https://www.grandfundingllc.com/:splat'
    || first?.status !== '301!'
  ) {
    addIssue(
      'redirects/order',
      '_redirects',
      'the forced apex-to-www host rule must be the first effective rule',
    );
  }

  const bySource = new Map();
  for (const rule of rules) {
    if (bySource.has(rule.source)) {
      addIssue(
        'redirects',
        '_redirects',
        `duplicate source route: ${rule.source}`,
      );
    }
    bySource.set(rule.source, rule);
  }

  let postForms = 0;
  for (const document of documents) {
    for (const form of tags(document.html, 'form')) {
      if ((form.attributes.method || 'get').toLowerCase() !== 'post') continue;
      postForms += 1;
      const rawAction = form.attributes.action || '';
      if (!rawAction) {
        addIssue(
          'forms/redirect-safety',
          document.name,
          'POST form is missing an explicit action',
        );
        continue;
      }

      let action;
      try {
        action = new URL(
          decodeHtml(rawAction),
          document.canonicalRaw || document.canonical || SITE_ORIGIN,
        );
      } catch {
        addIssue(
          'forms/redirect-safety',
          document.name,
          `POST form action is invalid: ${rawAction}`,
        );
        continue;
      }

      if (!SITE_HOSTS.has(action.hostname.toLowerCase())) {
        addIssue(
          'forms/redirect-safety',
          document.name,
          `POST form action leaves the canonical site: ${rawAction}`,
        );
        continue;
      }

      const redirect = bySource.get(action.pathname);
      if (redirect && /^3\d\d!?$/.test(redirect.status || '')) {
        addIssue(
          'forms/redirect-safety',
          document.name,
          `POST action ${action.pathname} is intercepted by ${redirect.status}`,
        );
      }

      if (/\.html$/i.test(action.pathname)) {
        const cleanRoute = action.pathname.slice(0, -5) || '/';
        const rewrite = bySource.get(cleanRoute);
        if (
          rewrite?.target !== action.pathname
          || rewrite?.status !== '200'
        ) {
          addIssue(
            'forms/redirect-safety',
            document.name,
            `missing clean-route rewrite for POST action ${action.pathname}`,
          );
        }
      }
    }
  }

  if (postForms === 0) {
    addIssue(
      'forms/redirect-safety',
      '_redirects',
      'no POST forms were found for release-safety validation',
    );
  }
}

function validateManifest(documents) {
  const manifestFile = path.join(SITE, 'site.webmanifest');
  if (!fs.existsSync(manifestFile)) {
    addIssue('manifest', 'site.webmanifest', 'file is missing');
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  } catch (error) {
    addIssue(
      'manifest',
      'site.webmanifest',
      `invalid JSON: ${error.message}`,
    );
    return;
  }

  for (const key of [
    'name',
    'short_name',
    'description',
    'theme_color',
    'background_color',
  ]) {
    if (typeof manifest[key] !== 'string' || manifest[key].trim().length === 0) {
      addIssue('manifest', 'site.webmanifest', `missing ${key}`);
    }
  }

  if (manifest.start_url !== '/') {
    addIssue('manifest', 'site.webmanifest', 'start_url must be "/"');
  }
  if (manifest.scope !== '/') {
    addIssue('manifest', 'site.webmanifest', 'scope must be "/"');
  }

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  for (const requiredSize of ['192x192', '512x512']) {
    if (!icons.some(icon => icon?.sizes === requiredSize)) {
      addIssue(
        'manifest',
        'site.webmanifest',
        `missing ${requiredSize} icon`,
      );
    }
  }
  if (
    !icons.some(icon =>
      relTokens(icon?.purpose || 'any').includes('maskable'),
    )
  ) {
    addIssue('manifest', 'site.webmanifest', 'missing a maskable icon');
  }

  for (const icon of icons) {
    const file = resolvePublicFile(icon?.src, manifestFile);
    if (!file || !fs.existsSync(file)) {
      addIssue(
        'manifest',
        'site.webmanifest',
        `icon is missing: ${icon?.src || '(missing src)'}`,
      );
      continue;
    }

    const dimensions = imageDimensions(file);
    const declared = String(icon.sizes || '').match(/^(\d+)x(\d+)$/);
    if (
      declared
      && (
        !dimensions
        || dimensions.width !== Number(declared[1])
        || dimensions.height !== Number(declared[2])
      )
    ) {
      addIssue(
        'manifest',
        'site.webmanifest',
        `${icon.src} does not match declared size ${icon.sizes}`,
      );
    }
  }

  for (const document of documents.filter(candidate => !candidate.noindex)) {
    const manifests = linksWithRel(document.html, 'manifest');
    if (manifests.length !== 1) {
      addIssue(
        'manifest',
        document.name,
        `expected one manifest link, found ${manifests.length}`,
      );
      continue;
    }

    const file = resolvePublicFile(
      manifests[0].attributes.href,
      document.file,
    );
    if (file !== manifestFile) {
      addIssue(
        'manifest',
        document.name,
        'manifest link must reference /site.webmanifest',
      );
    }
  }
}

function validateFavicons(document) {
  if (document.noindex) return;

  const icons = linksWithRel(document.html, 'icon');
  const appleIcons = linksWithRel(document.html, 'apple-touch-icon');
  const required = [
    {
      label: '16x16 PNG favicon',
      matches: link =>
        link.attributes.sizes === '16x16'
        && link.attributes.type === 'image/png',
      width: 16,
      height: 16,
    },
    {
      label: '32x32 PNG favicon',
      matches: link =>
        link.attributes.sizes === '32x32'
        && link.attributes.type === 'image/png',
      width: 32,
      height: 32,
    },
    {
      label: 'any-size fallback favicon',
      matches: link => relTokens(link.attributes.sizes).includes('any'),
    },
  ];

  for (const expectation of required) {
    const link = icons.find(expectation.matches);
    if (!link) {
      addIssue('favicon', document.name, `missing ${expectation.label}`);
      continue;
    }

    const file = resolvePublicFile(link.attributes.href, document.file);
    if (!file || !fs.existsSync(file)) {
      addIssue(
        'favicon',
        document.name,
        `${expectation.label} asset is missing`,
      );
      continue;
    }

    if (expectation.width) {
      const dimensions = imageDimensions(file);
      if (
        !dimensions
        || dimensions.width !== expectation.width
        || dimensions.height !== expectation.height
      ) {
        addIssue(
          'favicon',
          document.name,
          `${expectation.label} has incorrect file dimensions`,
        );
      }
    }
  }

  if (appleIcons.length !== 1) {
    addIssue(
      'favicon',
      document.name,
      `expected one apple-touch-icon, found ${appleIcons.length}`,
    );
  } else {
    const apple = appleIcons[0];
    const file = resolvePublicFile(apple.attributes.href, document.file);
    const dimensions = imageDimensions(file);
    if (
      apple.attributes.sizes !== '180x180'
      || !file
      || !dimensions
      || dimensions.width !== 180
      || dimensions.height !== 180
    ) {
      addIssue(
        'favicon',
        document.name,
        'apple-touch-icon must be a real 180x180 image',
      );
    }
  }
}

function validateSocial(document) {
  if (document.noindex || !document.canonical) return;

  const requirements = [
    ['og:title', value => value.trim().length >= 10],
    ['og:description', value => value.trim().length >= 50],
    ['og:type', value => value.trim().length > 0],
    [
      'og:url',
      value => normalizePageUrl(value, document.canonical) === document.canonical,
    ],
    ['og:site_name', value => value.trim().length > 0],
    ['og:locale', value => value.trim().length > 0],
    ['og:image', value => /^https:\/\//i.test(value.trim())],
    ['og:image:type', value => /^image\/(?:jpeg|png|webp)$/i.test(value.trim())],
    ['og:image:width', value => value.trim() === '1200'],
    ['og:image:height', value => value.trim() === '630'],
    ['og:image:alt', value => value.trim().length >= 10],
    ['twitter:card', value => value.trim() === 'summary_large_image'],
    ['twitter:title', value => value.trim().length >= 10],
    ['twitter:description', value => value.trim().length >= 50],
    ['twitter:image', value => /^https:\/\//i.test(value.trim())],
    ['twitter:image:alt', value => value.trim().length >= 10],
  ];

  const invalid = [];
  for (const [key, validate] of requirements) {
    const values = metaValues(document.html, key);
    if (values.length !== 1 || !validate(values[0] || '')) invalid.push(key);
  }
  if (invalid.length) {
    addIssue(
      'social',
      document.name,
      `missing, duplicated, or invalid premium metadata: ${invalid.join(', ')}`,
    );
  }

  const ogImage = metaValues(document.html, 'og:image')[0] || '';
  const twitterImage = metaValues(document.html, 'twitter:image')[0] || '';
  if (ogImage && twitterImage && ogImage !== twitterImage) {
    addIssue(
      'social',
      document.name,
      'og:image and twitter:image must reference the same premium asset',
    );
  }

  if (!ogImage) return;
  let imageUrl;
  try {
    imageUrl = new URL(ogImage);
  } catch {
    return;
  }

  if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== SITE_HOST) {
    addIssue(
      'social',
      document.name,
      'social image must use the canonical HTTPS host',
    );
    return;
  }

  const file = resolvePublicFile(ogImage, document.file);
  if (!file || !fs.existsSync(file)) {
    addIssue('social', document.name, `social image is missing: ${ogImage}`);
    return;
  }

  const dimensions = imageDimensions(file);
  if (!dimensions || dimensions.width !== 1200 || dimensions.height !== 630) {
    const actual = dimensions
      ? `${dimensions.width}x${dimensions.height}`
      : 'unreadable dimensions';
    addIssue(
      'social',
      document.name,
      `social image must be 1200x630; found ${actual}`,
    );
  }

  const declaredType = metaValues(document.html, 'og:image:type')[0] || '';
  const actualType = imageMime(file);
  if (declaredType && actualType && declaredType !== actualType) {
    addIssue(
      'social',
      document.name,
      `og:image:type ${declaredType} does not match ${actualType}`,
    );
  }
}

function validateSitemap(documents, documentByFile, canonicalByFile) {
  const file = path.join(SITE, 'sitemap.xml');
  if (!fs.existsSync(file)) {
    addIssue('sitemap', 'sitemap.xml', 'file is missing');
    return;
  }

  const source = fs.readFileSync(file, 'utf8');
  if (!/<urlset\b/i.test(source)) {
    addIssue('sitemap', 'sitemap.xml', 'missing urlset root');
  }

  const rawLocations = [
    ...source.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi),
  ].map(match => decodeHtml(match[1]).trim());
  const sitemapUrls = new Map();

  for (const raw of rawLocations) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      addIssue('sitemap', 'sitemap.xml', `invalid URL: ${raw}`);
      continue;
    }

    if (
      url.protocol !== 'https:'
      || url.hostname !== SITE_HOST
      || url.search
      || url.hash
    ) {
      addIssue(
        'sitemap',
        'sitemap.xml',
        `URL is not canonical HTTPS: ${raw}`,
      );
    }

    const normalized = normalizePageUrl(raw);
    if (!normalized) continue;
    if (sitemapUrls.has(normalized)) {
      addIssue('sitemap', 'sitemap.xml', `duplicate URL: ${normalized}`);
      continue;
    }
    sitemapUrls.set(normalized, raw);

    const resolved = resolveDocumentUrl(raw, SITE_ORIGIN, documentByFile);
    if (!resolved) {
      addIssue(
        'sitemap',
        'sitemap.xml',
        `URL has no built HTML route: ${raw}`,
      );
      continue;
    }

    const targetCanonical = canonicalByFile.get(resolved.file);
    if (targetCanonical !== normalized) {
      addIssue(
        'sitemap',
        'sitemap.xml',
        `${raw} does not match the target document canonical`,
      );
    }

    const targetDocument = documentByFile.get(resolved.file);
    if (targetDocument?.noindex) {
      addIssue(
        'sitemap',
        'sitemap.xml',
        `noindex route must not be listed: ${raw}`,
      );
    }
  }

  for (const document of documents.filter(candidate => !candidate.noindex)) {
    if (document.canonical && !sitemapUrls.has(document.canonical)) {
      addIssue(
        'sitemap',
        document.name,
        `indexable canonical is missing from sitemap: ${document.canonical}`,
      );
    }
  }
}

function documentHrefCandidates(url) {
  return pathnameCandidates(url.pathname);
}

function validateInternalLinks(
  documents,
  documentByFile,
  canonicalByFile,
) {
  const inbound = new Map(
    documents.map(document => [document.file, new Set()]),
  );

  for (const document of documents) {
    const base = document.canonicalRaw || expectedUrlForFile(document.file);
    for (const { attributes } of tags(document.html, 'a')) {
      const raw = attributes.href || '';
      if (
        !raw
        || /^(?:mailto:|tel:|javascript:|data:)/i.test(raw)
      ) {
        continue;
      }

      let url;
      try {
        url = new URL(raw, base);
      } catch {
        addIssue('links', document.name, `invalid link: ${raw}`);
        continue;
      }
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) continue;

      if (
        String(raw).startsWith('//')
        || url.protocol !== 'https:'
        || url.hostname !== SITE_HOST
      ) {
        addIssue(
          'links',
          document.name,
          `internal link uses a noncanonical origin: ${raw}`,
        );
      }

      const candidates = documentHrefCandidates(url);
      const targetFile = candidates.find(candidate =>
        documentByFile.has(candidate),
      );

      if (targetFile) {
        const targetCanonical = canonicalByFile.get(targetFile);
        const linked = normalizePageUrl(url.toString());
        if (targetCanonical && linked !== targetCanonical) {
          addIssue(
            'links',
            document.name,
            `internal link is noncanonical: ${raw}; use ${targetCanonical}`,
          );
        }

        if (url.hash && url.hash !== '#') {
          let id;
          try {
            id = decodeURIComponent(url.hash.slice(1));
          } catch {
            id = url.hash.slice(1);
          }
          const targetHtml = documentByFile.get(targetFile)?.html || '';
          const identifiers = new Set([
            ...targetHtml.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi),
          ].map(match => match[1]));
          if (id && !identifiers.has(id)) {
            addIssue(
              'links',
              document.name,
              `internal fragment does not exist: ${raw}`,
            );
          }
        }

        if (
          !document.noindex
          && !documentByFile.get(targetFile)?.noindex
          && targetFile !== document.file
        ) {
          inbound.get(targetFile)?.add(document.file);
        }
        continue;
      }

      const publicFile = resolvePublicFile(url.toString(), document.file);
      if (!publicFile || !fs.existsSync(publicFile)) {
        addIssue('links', document.name, `missing internal target: ${raw}`);
      }
    }
  }

  const homeFile = path.join(SITE, 'index.html');
  for (const document of documents.filter(candidate => !candidate.noindex)) {
    if (
      document.file !== homeFile
      && (inbound.get(document.file)?.size || 0) === 0
    ) {
      addIssue(
        'links/orphan',
        document.name,
        'indexable route has no incoming link from another indexable page',
      );
    }
  }
}

if (!fs.existsSync(SITE)) {
  console.error(
    `SEO validation cannot run because the site directory does not exist: ${SITE}`,
  );
  process.exit(2);
}

const htmlFiles = walk(SITE).filter(file => file.endsWith('.html'));
const documents = htmlFiles
  .filter(file => path.basename(file) !== VERIFY_FILE)
  .map(file => {
    const html = fs.readFileSync(file, 'utf8');
    const canonicalLinks = linksWithRel(html, 'canonical');
    const canonicalRaw = canonicalLinks[0]?.attributes.href || '';
    const canonical = normalizePageUrl(canonicalRaw);
    const title = titleText(html);
    const descriptions = metaValues(html, 'description');
    const h1s = h1Values(html);

    return {
      file,
      name: relativeName(file),
      html,
      canonicalLinks,
      canonicalRaw,
      canonical,
      noindex: isNoindex(html),
      title: title.value,
      titleCount: title.count,
      description: decodeHtml(descriptions[0] || '').trim(),
      descriptionCount: descriptions.length,
      h1s,
      visible: visibleText(html),
      mainVisible: mainVisibleText(html),
    };
  });

if (documents.length === 0) {
  console.error(`SEO validation found no HTML documents in ${SITE}`);
  process.exit(2);
}

const documentByFile = new Map(documents.map(document => [
  document.file,
  document,
]));
const canonicalByFile = new Map();
const canonicalOwners = new Map();
const titleOwners = new Map();
const descriptionOwners = new Map();

for (const document of documents) {
  if (document.canonicalLinks.length !== 1) {
    addIssue(
      'canonical',
      document.name,
      `expected one canonical link, found ${document.canonicalLinks.length}`,
    );
  } else {
    let parsed;
    try {
      parsed = new URL(document.canonicalRaw);
    } catch {
      parsed = null;
    }

    if (
      !parsed
      || parsed.protocol !== 'https:'
      || parsed.hostname !== SITE_HOST
      || parsed.username
      || parsed.password
      || parsed.search
      || parsed.hash
    ) {
      addIssue(
        'canonical',
        document.name,
        `canonical must use the clean canonical HTTPS origin: ${document.canonicalRaw}`,
      );
    }

    const expected = normalizePageUrl(expectedUrlForFile(document.file));
    if (!document.canonical || document.canonical !== expected) {
      addIssue(
        'canonical',
        document.name,
        `canonical does not match built route; expected ${expected}`,
      );
    }
  }

  if (document.canonical) {
    canonicalByFile.set(document.file, document.canonical);
    const owners = canonicalOwners.get(document.canonical) || [];
    owners.push(document.name);
    canonicalOwners.set(document.canonical, owners);
  }

  if (document.titleCount !== 1 || !document.title) {
    addIssue(
      'metadata',
      document.name,
      `expected one nonempty title, found ${document.titleCount}`,
    );
  }
  if (document.descriptionCount !== 1 || !document.description) {
    addIssue(
      'metadata',
      document.name,
      `expected one nonempty meta description, found ${document.descriptionCount}`,
    );
  }
  if (document.h1s.length !== 1 || !document.h1s[0]) {
    addIssue(
      'content',
      document.name,
      `expected one nonempty H1, found ${document.h1s.length}`,
    );
  }
  if (document.mainVisible.length < (document.noindex ? 20 : 120)) {
    addIssue(
      'content',
      document.name,
      'main content is missing or too thin to represent this route',
    );
  }

  if (!document.noindex) {
    if (document.title.length < 15 || document.title.length > 70) {
      addIssue(
        'metadata/length',
        document.name,
        `title length ${document.title.length} is outside the 15-70 character house range`,
      );
    }
    if (document.description.length < 50 || document.description.length > 180) {
      addIssue(
        'metadata/length',
        document.name,
        `description length ${document.description.length} is outside the 50-180 character house range`,
      );
    }

    const normalizedTitle = normalizeText(document.title);
    const normalizedDescription = normalizeText(document.description);
    if (normalizedTitle) {
      const owners = titleOwners.get(normalizedTitle) || [];
      owners.push(document.name);
      titleOwners.set(normalizedTitle, owners);
    }
    if (normalizedDescription) {
      const owners = descriptionOwners.get(normalizedDescription) || [];
      owners.push(document.name);
      descriptionOwners.set(normalizedDescription, owners);
    }
  }
}

for (const [canonical, owners] of canonicalOwners) {
  if (owners.length > 1) {
    addIssue(
      'canonical/duplicate',
      owners.join(', '),
      `${canonical} is claimed by ${owners.length} documents`,
    );
  }
}
for (const [title, owners] of titleOwners) {
  if (owners.length > 1) {
    addIssue(
      'metadata/duplicate-title',
      owners.join(', '),
      `duplicate indexable title: "${title}"`,
    );
  }
}
for (const [description, owners] of descriptionOwners) {
  if (owners.length > 1) {
    addIssue(
      'metadata/duplicate-description',
      owners.join(', '),
      `duplicate indexable description: "${description}"`,
    );
  }
}

for (const document of documents) {
  validateFavicons(document);
  validateSocial(document);

  const schemas = parseSchemas(document);
  const nodes = schemas.flatMap(root => flattenSchemaNodes(root));
  if (!document.noindex && schemas.length === 0) {
    addIssue(
      'schema',
      document.name,
      'indexable route has no structured data',
    );
  }

  const obsolete = new Set();
  for (const type of nodes.flatMap(schemaTypes)) {
    if (OBSOLETE_SCHEMA_TYPES.has(type) || type.startsWith('HowTo')) {
      obsolete.add(type);
    }
  }
  if (obsolete.size) {
    addIssue(
      'schema/obsolete',
      document.name,
      `remove obsolete FAQ/HowTo rich-result schema: ${[...obsolete].join(', ')}`,
    );
  }

  assertVisibleSchemaParity(document, nodes);
  inspectGeography(document, nodes);

  const canonicalProblems = new Set();
  for (const node of nodes) {
    if (document.canonical && isPageScopedNode(node)) {
      for (const reference of directUrlValues(node)) {
        const normalized = normalizePageUrl(
          reference.value,
          document.canonicalRaw || document.canonical,
        );
        if (
          normalized
          && SITE_HOSTS.has(new URL(normalized).hostname.toLowerCase())
          && normalized !== document.canonical
        ) {
          canonicalProblems.add(
            `${schemaTypes(node).join('/')} ${reference.key} ${reference.value}`,
          );
        }
      }
    }

    if (document.canonical && isBusinessEntity(node)) {
      for (const reference of directUrlValues(node)) {
        const normalized = normalizePageUrl(
          reference.value,
          document.canonicalRaw || document.canonical,
        );
        if (!normalized) continue;
        const url = new URL(normalized);
        const allowed = new Set([`${SITE_ORIGIN}/`, document.canonical]);
        if (
          SITE_HOSTS.has(url.hostname.toLowerCase())
          && !allowed.has(normalized)
        ) {
          canonicalProblems.add(
            `${schemaTypes(node).join('/')} ${reference.key} ${reference.value}`,
          );
        }
      }
    }

    if (isSiteEntity(node)) {
      for (const reference of directUrlValues(node)) {
        const normalized = normalizePageUrl(reference.value, SITE_ORIGIN);
        if (
          normalized
          && SITE_HOSTS.has(new URL(normalized).hostname.toLowerCase())
          && normalized !== `${SITE_ORIGIN}/`
        ) {
          canonicalProblems.add(
            `WebSite ${reference.key} must resolve to ${SITE_ORIGIN}/`,
          );
        }
      }
    }

    const breadcrumb = finalBreadcrumbUrl(node);
    if (
      document.canonical
      && breadcrumb
      && normalizePageUrl(
        breadcrumb,
        document.canonicalRaw || document.canonical,
      ) !== document.canonical
    ) {
      canonicalProblems.add(`BreadcrumbList final item ${breadcrumb}`);
    }
  }

  const ogUrl = metaValues(document.html, 'og:url')[0] || '';
  if (
    document.canonical
    && ogUrl
    && normalizePageUrl(ogUrl, document.canonicalRaw) !== document.canonical
  ) {
    canonicalProblems.add(`og:url ${ogUrl}`);
  }

  for (const schema of schemas) {
    for (const reference of schemaUrlValues(schema)) {
      let url;
      try {
        url = new URL(
          reference.value,
          document.canonicalRaw || document.canonical || SITE_ORIGIN,
        );
      } catch {
        continue;
      }
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) continue;
      const looksLikeDocument =
        url.pathname === '/'
        || url.pathname.endsWith('/')
        || /\.html$/i.test(url.pathname)
        || !path.extname(url.pathname);
      if (!looksLikeDocument) continue;

      const resolved = resolveDocumentUrl(
        url.toString(),
        document.canonicalRaw || document.canonical,
        documentByFile,
      );
      if (!resolved) {
        canonicalProblems.add(
          `${reference.key} points to a missing route: ${reference.value}`,
        );
        continue;
      }
      const targetCanonical = canonicalByFile.get(resolved.file);
      if (targetCanonical && resolved.normalized !== targetCanonical) {
        canonicalProblems.add(
          `${reference.key} uses noncanonical ${reference.value}; `
            + `expected ${targetCanonical}`,
        );
      }
    }
  }

  if (canonicalProblems.size) {
    const examples = [...canonicalProblems].slice(0, 6);
    const remaining = canonicalProblems.size - examples.length;
    addIssue(
      'canonical/schema',
      document.name,
      `${examples.join('; ')}${remaining ? `; plus ${remaining} more` : ''}`,
    );
  }
}

validateRobots();
validateManifest(documents);
validateSitemap(documents, documentByFile, canonicalByFile);
validateInternalLinks(documents, documentByFile, canonicalByFile);
validateRedirectsAndPostForms(documents);

if (issues.length) {
  const categories = new Map();
  for (const issue of issues) {
    if (!categories.has(issue.category)) categories.set(issue.category, []);
    categories.get(issue.category).push(issue);
  }

  console.error(
    `SEO validation failed with ${issues.length} issue(s) `
      + `across ${documents.length} HTML document(s):`,
  );
  for (const [category, categoryIssues] of [...categories].sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    console.error(`\n[${category}] ${categoryIssues.length} issue(s)`);
    for (const issue of categoryIssues.sort((left, right) =>
      left.file.localeCompare(right.file),
    )) {
      console.error(`- ${issue.file}: ${issue.message}`);
    }
  }
  process.exit(1);
}

console.log(
  `SEO validation passed for ${documents.length} HTML document(s) in `
    + `${path.relative(process.cwd(), SITE) || '.'}.`,
);
