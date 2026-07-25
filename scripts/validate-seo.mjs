#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.env.SITE_DIR || 'dist');
const SITE_ORIGIN = 'https://www.grandfundingllc.com';
const SITE_HOSTS = new Set(['www.grandfundingllc.com', 'grandfundingllc.com']);
const VERIFY_FILE = 'googleb80e08d782fcdd45.html';
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
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => ({
    raw: match[0],
    attributes: parseAttributes(match[0])
  }));
}

function linksWithRel(html, expectedRel) {
  return tags(html, 'link').filter(({ attributes }) =>
    (attributes.rel || '').toLowerCase().split(/\s+/).includes(expectedRel)
  );
}

function metaValues(html, expectedKey) {
  const key = expectedKey.toLowerCase();
  return tags(html, 'meta')
    .filter(({ attributes }) =>
      (attributes.name || '').toLowerCase() === key
      || (attributes.property || '').toLowerCase() === key
    )
    .map(({ attributes }) => attributes.content || '');
}

function normalizeUrl(raw, base = SITE_ORIGIN) {
  if (!raw) return null;
  try {
    const url = new URL(raw, base);
    url.hash = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

function urlWithoutFragment(raw, base = SITE_ORIGIN) {
  const normalized = normalizeUrl(raw, base);
  return normalized;
}

function schemaTypes(node) {
  const value = node?.['@type'];
  if (Array.isArray(value)) return value.filter(type => typeof type === 'string');
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
  const expression = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let block = 0;
  for (const match of document.html.matchAll(expression)) {
    block += 1;
    try {
      roots.push(JSON.parse(match[1]));
    } catch (error) {
      addIssue('schema', document.name, `JSON-LD block ${block} is invalid: ${error.message}`);
    }
  }
  return roots;
}

function schemaUrlValues(value, key = '', found = []) {
  if (Array.isArray(value)) {
    for (const item of value) schemaUrlValues(item, key, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;

  for (const [childKey, child] of Object.entries(value)) {
    if (['url', '@id', 'item', 'mainEntityOfPage'].includes(childKey)) {
      if (typeof child === 'string') {
        found.push({ key: childKey, value: child });
      } else if (child && typeof child === 'object') {
        const nested = child['@id'] || child.url;
        if (typeof nested === 'string') found.push({ key: childKey, value: nested });
      }
    }
    schemaUrlValues(child, childKey, found);
  }
  return found;
}

function directUrlValues(node) {
  const found = [];
  for (const key of ['url', '@id', 'mainEntityOfPage']) {
    const value = node?.[key];
    if (typeof value === 'string') found.push({ key, value });
    else if (value && typeof value === 'object') {
      const nested = value['@id'] || value.url;
      if (typeof nested === 'string') found.push({ key, value: nested });
    }
  }
  return found;
}

function isPageScopedNode(node) {
  const types = schemaTypes(node);
  return types.some(type =>
    type.endsWith('Page')
    || ['Article', 'Blog', 'BlogPosting', 'NewsArticle', 'Product', 'FinancialProduct', 'Service', 'HowTo'].includes(type)
  );
}

function isBusinessEntity(node) {
  return schemaTypes(node).some(type =>
    type === 'LocalBusiness' || type === 'FinancialService' || type.endsWith('Business')
  );
}

function finalBreadcrumbUrl(node) {
  if (!schemaTypes(node).includes('BreadcrumbList') || !Array.isArray(node.itemListElement)) return null;
  const ordered = [...node.itemListElement].sort((left, right) =>
    Number(left?.position || 0) - Number(right?.position || 0)
  );
  const last = ordered.at(-1);
  if (!last) return null;
  if (typeof last.item === 'string') return last.item;
  return last.item?.['@id'] || last.item?.url || null;
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
    rsquo: '’'
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)))
    .replace(/&#([0-9]+);/g, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function normalizeText(value) {
  return decodeHtml(String(value || ''))
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%$#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return normalizeText(body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(?:script|style|svg|template|noscript)\b[\s\S]*?<\/(?:script|style|svg|template|noscript)>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function textAppearsVisible(value, visible, minimumLength) {
  const normalized = normalizeText(value);
  return normalized.length >= minimumLength && visible.includes(normalized);
}

function answerText(question) {
  const answers = Array.isArray(question?.acceptedAnswer)
    ? question.acceptedAnswer
    : [question?.acceptedAnswer];
  return answers
    .map(answer => typeof answer === 'string' ? answer : answer?.text)
    .filter(value => typeof value === 'string' && value.trim())
    .join(' ');
}

function inferredState(canonical) {
  if (!canonical) return null;
  const pathname = new URL(canonical).pathname.toLowerCase();
  const california = /(?:california|los-angeles|san-diego|orange-county)/.test(pathname);
  const arizona = /(?:arizona|phoenix|scottsdale|tempe|mesa|tucson)/.test(pathname);
  if (california === arizona) return null;
  return california ? 'California' : 'Arizona';
}

function nodeStateMismatch(node, expectedState) {
  const serialized = JSON.stringify(node);
  const mentionsArizona = /\barizona\b|addressRegion"\s*:\s*"AZ"/i.test(serialized);
  const mentionsCalifornia = /\bcalifornia\b|addressRegion"\s*:\s*"CA"/i.test(serialized);
  if (expectedState === 'California') return mentionsArizona && !mentionsCalifornia;
  if (expectedState === 'Arizona') return mentionsCalifornia && !mentionsArizona;
  return false;
}

function stateSensitiveNode(node) {
  return schemaTypes(node).some(type => [
    'BreadcrumbList',
    'FAQPage',
    'FinancialProduct',
    'FinancialService',
    'HowTo',
    'LocalBusiness',
    'Service',
    'WebPage'
  ].includes(type) || type.endsWith('Business'));
}

function isNoindex(html) {
  return tags(html, 'meta').some(({ attributes }) =>
    ['robots', 'googlebot'].includes((attributes.name || '').toLowerCase())
    && /\bnoindex\b/i.test(attributes.content || '')
  );
}

function isFinancialProductRoute(pathname) {
  if (/^\/(?:blog|compare-|faq|glossary-|posts|press)/.test(pathname)) return false;
  return /(?:hard-money-lender|bridge-loans?|fix-and-flip-loans?|construction-loans?|cash-out-refinance|second-position-loans?)/.test(pathname);
}

function hasVisibleFaqMarkup(html) {
  return /class=["'][^"']*(?:faq-question|lp-faq__q|gd-faq__item)[^"']*["']/i.test(html)
    || /<h[1-3]\b[^>]*>\s*(?:Frequently Asked Questions|FAQ)\s*<\/h[1-3]>/i.test(html);
}

function resolvePublicFile(raw, fromFile) {
  if (!raw) return null;
  let pathname;
  try {
    if (/^https?:/i.test(raw)) {
      const url = new URL(raw);
      if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;
      pathname = decodeURIComponent(url.pathname);
    } else {
      const clean = raw.split(/[?#]/, 1)[0];
      pathname = decodeURIComponent(clean);
    }
  } catch {
    return null;
  }

  const target = pathname.startsWith('/')
    ? path.resolve(SITE, `.${pathname}`)
    : path.resolve(path.dirname(fromFile), pathname);
  if (target !== SITE && !target.startsWith(`${SITE}${path.sep}`)) return null;
  return target;
}

function pngDimensions(file) {
  if (!fs.existsSync(file)) return null;
  const buffer = fs.readFileSync(file);
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function resolveInternalDocument(raw, base, canonicalByFile) {
  let url;
  try {
    url = new URL(raw, base || SITE_ORIGIN);
  } catch {
    return null;
  }
  if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = url.pathname;
  }

  const baseTarget = path.resolve(SITE, `.${pathname}`);
  if (baseTarget !== SITE && !baseTarget.startsWith(`${SITE}${path.sep}`)) return null;

  const candidates = [];
  if (pathname === '/' || pathname.endsWith('/')) candidates.push(path.join(baseTarget, 'index.html'));
  else if (pathname.endsWith('.html')) candidates.push(baseTarget);
  else if (!path.extname(pathname)) candidates.push(`${baseTarget}.html`, path.join(baseTarget, 'index.html'));

  const file = candidates.find(candidate => canonicalByFile.has(candidate));
  return file ? { file, url: normalizeUrl(url.toString()) } : null;
}

if (!fs.existsSync(SITE)) {
  console.error(`SEO validation cannot run because the site directory does not exist: ${SITE}`);
  process.exit(2);
}

const htmlFiles = walk(SITE).filter(file => file.endsWith('.html'));
const documents = htmlFiles
  .filter(file => path.basename(file) !== VERIFY_FILE)
  .map(file => {
    const html = fs.readFileSync(file, 'utf8');
    const canonicalLinks = linksWithRel(html, 'canonical');
    const canonicalRaw = canonicalLinks[0]?.attributes.href || '';
    const canonical = normalizeUrl(canonicalRaw);
    return {
      file,
      name: relativeName(file),
      html,
      canonicalLinks,
      canonicalRaw,
      canonical,
      noindex: isNoindex(html)
    };
  });

const canonicalByFile = new Map();
for (const document of documents) {
  if (document.canonicalLinks.length !== 1) {
    addIssue('canonical', document.name, `expected one canonical link, found ${document.canonicalLinks.length}`);
  } else if (!/^https:\/\//i.test(document.canonicalRaw)) {
    addIssue('canonical', document.name, `canonical must be an absolute HTTPS URL: ${document.canonicalRaw}`);
  } else if (!document.canonical) {
    addIssue('canonical', document.name, `canonical is invalid: ${document.canonicalRaw}`);
  }
  if (document.canonical) canonicalByFile.set(document.file, document.canonical);
}

for (const document of documents) {
  const schemas = parseSchemas(document);
  const nodes = schemas.flatMap(root => flattenSchemaNodes(root));
  const canonicalProblems = new Set();

  if (document.canonical) {
    const ogUrl = metaValues(document.html, 'og:url')[0];
    if (ogUrl && normalizeUrl(ogUrl, document.canonical) !== document.canonical) {
      canonicalProblems.add(`og:url ${ogUrl}`);
    }

    for (const node of nodes) {
      if (isPageScopedNode(node)) {
        for (const reference of directUrlValues(node)) {
          const normalized = urlWithoutFragment(reference.value, document.canonical);
          if (normalized && SITE_HOSTS.has(new URL(normalized).hostname.toLowerCase())
            && normalized !== document.canonical) {
            canonicalProblems.add(`${schemaTypes(node).join('/')} ${reference.key} ${reference.value}`);
          }
        }
      }

      if (isBusinessEntity(node)) {
        for (const reference of directUrlValues(node)) {
          const normalized = urlWithoutFragment(reference.value, document.canonical);
          if (!normalized) continue;
          const url = new URL(normalized);
          if (SITE_HOSTS.has(url.hostname.toLowerCase()) && url.pathname !== '/' && normalized !== document.canonical) {
            canonicalProblems.add(`${schemaTypes(node).join('/')} ${reference.key} ${reference.value}`);
          }
        }
      }

      const breadcrumb = finalBreadcrumbUrl(node);
      if (breadcrumb && urlWithoutFragment(breadcrumb, document.canonical) !== document.canonical) {
        canonicalProblems.add(`BreadcrumbList final item ${breadcrumb}`);
      }
    }

    for (const schema of schemas) {
      for (const reference of schemaUrlValues(schema)) {
        const resolved = resolveInternalDocument(reference.value, document.canonical, canonicalByFile);
        if (!resolved) continue;
        const targetCanonical = canonicalByFile.get(resolved.file);
        if (targetCanonical && resolved.url !== targetCanonical) {
          canonicalProblems.add(`${reference.key} uses noncanonical ${reference.value}; expected ${targetCanonical}`);
        }
      }
    }
  }

  if (canonicalProblems.size) {
    const examples = [...canonicalProblems].slice(0, 5);
    const remaining = canonicalProblems.size - examples.length;
    addIssue(
      'canonical/schema',
      document.name,
      `${examples.join('; ')}${remaining ? `; plus ${remaining} more` : ''}`
    );
  }

  const expectedState = inferredState(document.canonical);
  if (expectedState) {
    const mismatchedTypes = new Set();
    for (const node of nodes) {
      if (stateSensitiveNode(node) && nodeStateMismatch(node, expectedState)) {
        for (const type of schemaTypes(node)) mismatchedTypes.add(type);
      }
    }
    if (mismatchedTypes.size) {
      addIssue(
        'schema/state',
        document.name,
        `canonical implies ${expectedState}, but schema contains exclusively opposing-state signals in ${[...mismatchedTypes].join(', ')}`
      );
    }
  }

  const visible = visibleText(document.html);
  const nodeTypes = new Set(nodes.flatMap(schemaTypes));
  const pathname = document.canonical ? new URL(document.canonical).pathname.replace(/\/+$/, '') || '/' : '';
  if (!document.noindex && isFinancialProductRoute(pathname) && !nodeTypes.has('FinancialProduct')) {
    addIssue('schema/type', document.name, 'loan route is missing a FinancialProduct node');
  }
  if (!document.noindex && /^\/glossary-/.test(pathname) && !nodeTypes.has('DefinedTerm')) {
    addIssue('schema/type', document.name, 'glossary route is missing a DefinedTerm node');
  }
  if (!document.noindex && pathname === '/contact' && !nodeTypes.has('ContactPage')) {
    addIssue('schema/type', document.name, 'contact route is missing a ContactPage node');
  }
  if (!document.noindex && hasVisibleFaqMarkup(document.html) && !nodeTypes.has('FAQPage')) {
    addIssue('schema/type', document.name, 'visible FAQ content is missing a supported FAQPage node');
  }

  let faqTotal = 0;
  const unsupportedFaqs = [];
  for (const node of nodes.filter(candidate => schemaTypes(candidate).includes('FAQPage'))) {
    const questions = Array.isArray(node.mainEntity) ? node.mainEntity : [];
    for (const question of questions) {
      faqTotal += 1;
      const questionName = String(question?.name || '').trim();
      const answer = answerText(question);
      const questionVisible = textAppearsVisible(questionName, visible, 8);
      const answerVisible = textAppearsVisible(answer, visible, 16);
      if (!questionVisible || !answerVisible) {
        const missing = [
          !questionVisible ? 'question' : '',
          !answerVisible ? 'answer' : ''
        ].filter(Boolean).join('+');
        unsupportedFaqs.push(`${questionName || '(unnamed question)'} [${missing}]`);
      }
    }
  }
  if (unsupportedFaqs.length) {
    const examples = unsupportedFaqs.slice(0, 3);
    addIssue(
      'schema/visible-faq',
      document.name,
      `${unsupportedFaqs.length}/${faqTotal} FAQ entries are not fully supported by visible body copy: ${examples.join('; ')}${unsupportedFaqs.length > examples.length ? '; …' : ''}`
    );
  }

  const headingSource = document.html
    .replace(/<(?:script|style|svg|template|noscript)\b[\s\S]*?<\/(?:script|style|svg|template|noscript)>/gi, ' ');
  const headingStack = [];
  let headingMismatches = 0;
  for (const match of headingSource.matchAll(/<(\/?)h([1-6])\b[^>]*>/gi)) {
    const closing = Boolean(match[1]);
    const level = match[2];
    if (!closing) {
      headingStack.push(level);
      continue;
    }
    if (headingStack.pop() !== level) headingMismatches += 1;
  }
  headingMismatches += headingStack.length;
  if (headingMismatches) {
    addIssue('html/headings', document.name, `${headingMismatches} mismatched or unclosed heading tag(s)`);
  }
  if (pathname === '/blog') {
    const articleCount = (document.html.match(/<article\b[^>]*class=["'][^"']*\bblog-card\b[^"']*["'][^>]*>/gi) || []).length;
    const linkCount = (document.html.match(/<a\b[^>]*class=["'][^"']*\bblog-card__link\b[^"']*["'][^>]*>/gi) || []).length;
    const titleCount = (document.html.match(/<h3\b[^>]*class=["'][^"']*\bblog-card__title\b[^"']*["'][^>]*>/gi) || []).length;
    const visibleCount = document.html.match(/<div\b[^>]*data-blog-count[^>]*>([^<]*)<\/div>/i)?.[1]?.trim();
    if (articleCount !== 18 || linkCount !== articleCount || titleCount !== articleCount || visibleCount !== '18 posts') {
      addIssue(
        'html/blog-grid',
        document.name,
        `expected 18 self-contained cards and current count; found ${articleCount} articles, ${linkCount} links, ${titleCount} titles, "${visibleCount || ''}"`
      );
    }
  }

  const copyDefects = [];
  if (/\bLoan Loans\b/i.test(document.html)) copyDefects.push('"Loan Loans"');
  if (/\bCalifornia\s*,\s*California\b/i.test(document.html)) copyDefects.push('"California, California"');
  if (copyDefects.length) {
    addIssue('copy', document.name, `known generated-copy defect(s): ${copyDefects.join(', ')}`);
  }
  const gtmLoaderCount = (document.html.match(/googletagmanager\.com\/gtm\.js/g) || []).length;
  const adsLoaderCount = (document.html.match(/googletagmanager\.com\/gtag\/js\?id=AW-/g) || []).length;
  if (gtmLoaderCount > 1 || adsLoaderCount > 1) {
    addIssue(
      'analytics',
      document.name,
      `duplicate analytics loaders: ${gtmLoaderCount} GTM and ${adsLoaderCount} Google Ads`
    );
  }

  if (!document.noindex && document.canonical) {
    const requiredSocial = [
      ['og:title', value => value.trim()],
      ['og:description', value => value.trim().length >= 80],
      ['og:type', value => value.trim()],
      ['og:url', value => normalizeUrl(value, document.canonical) === document.canonical],
      ['og:image', value => /^https:\/\//i.test(value.trim())],
      ['og:site_name', value => value.trim()],
      ['og:locale', value => value.trim()],
      ['og:image:type', value => /^image\/(?:jpeg|png|webp)$/i.test(value.trim())],
      ['og:image:width', value => /^\d+$/.test(value.trim()) && Number(value) > 0],
      ['og:image:height', value => /^\d+$/.test(value.trim()) && Number(value) > 0],
      ['og:image:alt', value => value.trim()],
      ['twitter:image:alt', value => value.trim()],
      ['twitter:card', value => value.trim() === 'summary_large_image'],
      ['twitter:image', value => /^https:\/\//i.test(value.trim())],
      ['twitter:title', value => value.trim()],
      ['twitter:description', value => value.trim().length >= 80]
    ];
    const missingOrInvalid = [];
    for (const [key, valid] of requiredSocial) {
      const value = metaValues(document.html, key)[0] || '';
      if (!valid(value)) missingOrInvalid.push(key);
    }
    if (missingOrInvalid.length) {
      addIssue('social', document.name, `missing or invalid premium metadata: ${missingOrInvalid.join(', ')}`);
    }

    const title = decodeHtml(document.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const description = decodeHtml(metaValues(document.html, 'description')[0] || '').trim();
    if (title.length < 25 || title.length > 65) {
      addIssue('metadata/length', document.name, `title length ${title.length} is outside the 25-65 character release range`);
    }
    if (description.length < 100 || description.length > 165) {
      addIssue('metadata/length', document.name, `description length ${description.length} is outside the 100-165 character release range`);
    }
    if (/([?!])\.|\.\./.test(title) || /([?!])\.|\.\./.test(description)) {
      addIssue('metadata/punctuation', document.name, 'title or description contains repeated terminal punctuation');
    }

    const mismatchedDescriptions = nodes
      .filter(node => typeof node.description === 'string')
      .filter(node => schemaTypes(node).some(type => [
        'AboutPage',
        'BlogPosting',
        'CollectionPage',
        'ContactPage',
        'DefinedTerm',
        'FinancialProduct',
        'WebPage'
      ].includes(type)))
      .filter(node => normalizeText(node.description) !== normalizeText(description))
      .map(node => schemaTypes(node).join('/'));
    if (mismatchedDescriptions.length) {
      addIssue(
        'metadata/parity',
        document.name,
        `schema description does not match the release description for ${[...new Set(mismatchedDescriptions)].join(', ')}`
      );
    }
  }

  const appleIcons = linksWithRel(document.html, 'apple-touch-icon');
  if (appleIcons.length) {
    const inspected = appleIcons.map(({ attributes }) => {
      const href = attributes.href || '';
      const asset = resolvePublicFile(href, document.file);
      const dimensions = asset ? pngDimensions(asset) : null;
      return { href, asset, dimensions };
    });
    const invalidIcons = inspected.filter(icon =>
      icon.dimensions?.width !== 180 || icon.dimensions?.height !== 180
    );
    if (invalidIcons.length) {
      const details = invalidIcons.map(icon => {
        if (!icon.asset) return `${icon.href || '(missing href)'} cannot be checked locally`;
        if (!fs.existsSync(icon.asset)) return `${icon.href} is missing`;
        if (!icon.dimensions) return `${icon.href} is not a readable PNG`;
        return `${icon.href} is ${icon.dimensions.width}x${icon.dimensions.height}`;
      });
      addIssue('favicon', document.name, `apple-touch-icon must reference a real 180x180 PNG; ${details.join('; ')}`);
    }
  }
}

const robotsFile = path.join(SITE, 'robots.txt');
if (!fs.existsSync(robotsFile)) {
  addIssue('robots', 'robots.txt', 'file is missing');
} else {
  const robots = fs.readFileSync(robotsFile, 'utf8');
  if (/^\s*User-agent\s*:\s*GoogleExtendedBot\b/im.test(robots)) {
    addIssue('robots', 'robots.txt', 'invalid crawler token GoogleExtendedBot; use Google-Extended');
  }
}

if (issues.length) {
  const categories = new Map();
  for (const issue of issues) {
    if (!categories.has(issue.category)) categories.set(issue.category, []);
    categories.get(issue.category).push(issue);
  }

  console.error(`SEO validation failed with ${issues.length} issue(s) across ${documents.length} HTML document(s):`);
  for (const [category, categoryIssues] of categories) {
    console.error(`\n[${category}] ${categoryIssues.length} issue(s)`);
    for (const issue of categoryIssues.sort((left, right) => left.file.localeCompare(right.file))) {
      console.error(`- ${issue.file}: ${issue.message}`);
    }
  }
  process.exit(1);
}

console.log(`SEO validation passed for ${documents.length} HTML document(s) in ${path.relative(process.cwd(), SITE) || '.'}`);
