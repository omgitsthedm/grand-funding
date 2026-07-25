import fs from 'node:fs/promises';
import path from 'node:path';

const ORGANIZATION_NAME = 'Grand Funding LLC';
const LANGUAGE = 'en-US';
const OG_LOCALE = 'en_US';
const DEFAULT_SOCIAL_IMAGE = '/images/og-grandfunding-v2.jpg';
const SOCIAL_IMAGE_FAMILIES = Object.freeze({
  fundedDeals: Object.freeze({
    path: '/images/social/funded-deals-20260724.jpg',
    alt: 'Funded real estate deals — Grand Funding LLC'
  }),
  investorGuides: Object.freeze({
    path: '/images/social/investor-guides-20260724.jpg',
    alt: 'Grand Funding LLC investor guides for private real estate lending'
  }),
  loanPrograms: Object.freeze({
    path: '/images/social/loan-programs-20260725.jpg',
    alt: 'Grand Funding LLC business-purpose real estate loan programs'
  }),
  loganDirect: Object.freeze({
    path: '/images/social/logan-direct-lender-20260724.jpg',
    alt: 'Logan Sullivan, founder and direct lender at Grand Funding LLC'
  }),
  marketLending: Object.freeze({
    path: '/images/social/arizona-california-lending-20260725.jpg',
    alt: 'Grand Funding LLC real estate investor lending in Arizona and California'
  })
});
const GENERIC_ARIZONA_DESCRIPTION =
  'Arizona hard money lender. 24-hour approval, 3-5 day funding. Fix & flip, bridge, construction. $70K-$5M. Direct private lender in Phoenix & statewide.';
const FORBIDDEN_SCHEMA_TYPES = new Set([
  'AggregateRating',
  'FAQPage',
  'FinancialProduct',
  'HowTo',
  'LocalBusiness',
  'Rating',
  'Review',
  'SpeakableSpecification'
]);

function decodeEntities(value) {
  return value.replace(
    /&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi,
    (entity, decimal, hexadecimal, named) => {
      if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
      if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));

      const entities = {
        amp: '&',
        apos: "'",
        gt: '>',
        lt: '<',
        nbsp: ' ',
        quot: '"'
      };

      return entities[named.toLowerCase()] ?? entity;
    }
  );
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function compactWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripMarkup(value) {
  return compactWhitespace(
    decodeEntities(
      value
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function getAttribute(tag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`,
      'i'
    )
  );

  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function findMetaContent(html, key, attribute = 'name') {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const candidate = getAttribute(tag, attribute);
    if (candidate?.toLowerCase() === key.toLowerCase()) {
      const content = getAttribute(tag, 'content');
      return content === null ? null : decodeEntities(content);
    }
  }

  return null;
}

function findCanonicalTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0])
    .filter(tag => {
      const rel = getAttribute(tag, 'rel');
      return rel?.toLowerCase().split(/\s+/).includes('canonical');
    });
}

function readCanonical(html, fileLabel) {
  const tags = findCanonicalTags(html);
  if (tags.length !== 1) {
    throw new Error(
      `${fileLabel}: expected exactly one canonical link, found ${tags.length}`
    );
  }

  const href = getAttribute(tags[0], 'href');
  if (!href) throw new Error(`${fileLabel}: canonical link has no href`);
  return decodeEntities(href);
}

function readTitle(html, fileLabel) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = match ? stripMarkup(match[1]) : '';
  if (!title) throw new Error(`${fileLabel}: missing non-empty title`);
  return title;
}

function readHeading(html, level = 1) {
  const match = html.match(
    new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'i')
  );
  return match ? stripMarkup(match[1]) : '';
}

function readBodyHtml(html, fileLabel) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) throw new Error(`${fileLabel}: missing body element`);
  return match[1];
}

function bodyVisibleText(html, fileLabel) {
  return stripMarkup(
    readBodyHtml(html, fileLabel)
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
  );
}

function isNoindex(html) {
  const robots = findMetaContent(html, 'robots');
  return robots?.toLowerCase().split(/[\s,]+/).includes('noindex') ?? false;
}

function validateLegacyJsonLd(html, fileLabel) {
  const scripts = [
    ...html.matchAll(
      /<script\b(?=[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json))[^>]*>([\s\S]*?)<\/script>/gi
    )
  ];

  for (const script of scripts) {
    const source = script[1].trim();
    if (!source) throw new Error(`${fileLabel}: empty JSON-LD script`);
    try {
      JSON.parse(source);
    } catch (error) {
      throw new Error(`${fileLabel}: malformed JSON-LD: ${error.message}`);
    }
  }
}

function removeJsonLd(html) {
  return html.replace(
    /<script\b(?=[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json))[^>]*>[\s\S]*?<\/script>/gi,
    ''
  );
}

function removeSocialMeta(html) {
  return html.replace(/<meta\b[^>]*>/gi, tag => {
    const property = getAttribute(tag, 'property');
    const name = getAttribute(tag, 'name');
    if (property?.toLowerCase().startsWith('og:')) return '';
    if (name?.toLowerCase().startsWith('twitter:')) return '';
    return tag;
  });
}

function setMetaContent(html, key, content, attribute = 'name') {
  let found = false;
  const normalizedTag =
    `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}">`;
  const output = html.replace(/<meta\b[^>]*>/gi, tag => {
    const candidate = getAttribute(tag, attribute);
    if (candidate?.toLowerCase() !== key.toLowerCase()) return tag;
    if (found) return '';
    found = true;
    return normalizedTag;
  });

  return found ? output : insertHeadPayload(output, normalizedTag, key);
}

function normalizeManifestLink(html) {
  const canonicalTag = '<link rel="manifest" href="/site.webmanifest">';
  let found = false;
  const output = html.replace(/<link\b[^>]*>/gi, tag => {
    const rel = getAttribute(tag, 'rel');
    const isManifest = rel
      ?.toLowerCase()
      .split(/\s+/)
      .includes('manifest');
    if (!isManifest) return tag;
    if (found) return '';
    found = true;
    return canonicalTag;
  });

  return found
    ? output
    : insertHeadPayload(output, canonicalTag, 'manifest link');
}

function normalizeAppleTouchIcon(html) {
  const canonicalTag =
    '<link rel="apple-touch-icon" sizes="180x180" href="/images/appicon-180.png">';
  let found = false;

  const normalized = html.replace(/<link\b[^>]*>/gi, tag => {
    const rel = getAttribute(tag, 'rel');
    const isAppleIcon = rel
      ?.toLowerCase()
      .split(/\s+/)
      .includes('apple-touch-icon');
    if (!isAppleIcon) return tag;
    if (found) return '';
    found = true;
    return canonicalTag;
  });

  if (found) return normalized;
  if (!/<\/head>/i.test(normalized)) {
    throw new Error('Cannot add Apple touch icon: missing closing head tag');
  }
  return normalized.replace(/<\/head>/i, `${canonicalTag}</head>`);
}

function trimDescription(value, maximum = 175) {
  const normalized = compactWhitespace(value);
  if (normalized.length <= maximum) return normalized;
  const clipped = normalized.slice(0, maximum - 1);
  const boundary = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, Math.max(boundary, 50)).replace(/[,:;\s]+$/, '')}.`;
}

function generatedDescription(route, heading) {
  const label = (
    heading || 'Grand Funding business-purpose real estate financing'
  ).replace(/[?!.,:;\s]+$/, '');
  const exact = {
    '/cash-out-refinance-investors-arizona':
      'Explore cash-out refinance options for Arizona real estate investors, including property fit, equity review, timing, and direct next steps with Grand Funding.',
    '/funded-deals':
      'Review selected Grand Funding real estate loans by location, loan type, amount, and closing timeline across Arizona, California, and approved markets.',
    '/privacy':
      'Read the Grand Funding LLC privacy policy, including how website and loan inquiry information is collected, used, retained, and protected.',
    '/products':
      'Explore Grand Funding business-purpose real estate loan programs, typical use cases, and direct next steps for investors in Arizona and California.'
  };
  if (exact[route]) return exact[route];

  if (route === '/press') {
    return 'Find Grand Funding LLC company background, media resources, and direct contact information for interview and publication inquiries.';
  }
  if (route.startsWith('/glossary-')) {
    const term = label.replace(/^What is\s+/i, '');
    return `Learn about ${term}: what it means for real estate investors, how it affects a business-purpose loan review, and what to ask a lender.`;
  }
  if (route.startsWith('/compare-')) {
    return `${label}. Compare common use cases, tradeoffs, timing, and lender-fit questions for a business-purpose financing decision.`;
  }

  return `${label} from Grand Funding LLC. Review property fit, loan purpose, timing, and direct next steps for business-purpose real estate investors.`;
}

function normalizePageDescription({ current, heading, route }) {
  const normalized = compactWhitespace(current || '');
  const generic =
    normalizeTextForComparison(normalized) ===
    normalizeTextForComparison(GENERIC_ARIZONA_DESCRIPTION);
  const californiaRoute =
    /(?:california|los-angeles|san-diego|orange-county)/.test(route);
  const geographyMismatch =
    californiaRoute &&
    /\barizona\b|\bphoenix\b|\bstatewide\b/i.test(normalized) &&
    !/\bcalifornia\b|\blos angeles\b|\bsan diego\b|\borange county\b/i.test(
      normalized
    );

  if (
    normalized.length >= 50 &&
    normalized.length <= 180 &&
    !generic &&
    !geographyMismatch
  ) {
    return normalized;
  }

  const generated = trimDescription(generatedDescription(route, heading));
  if (generated.length < 50 || generated.length > 180) {
    throw new Error(
      `${route}: normalized description must be 50-180 characters; found ${generated.length}`
    );
  }
  return generated;
}

function normalizeTextForComparison(value) {
  return compactWhitespace(decodeEntities(String(value)))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function splitUrlSuffix(value) {
  const queryIndex = value.indexOf('?');
  const fragmentIndex = value.indexOf('#');
  const indexes = [queryIndex, fragmentIndex].filter(index => index >= 0);
  const suffixIndex = indexes.length ? Math.min(...indexes) : value.length;
  return [value.slice(0, suffixIndex), value.slice(suffixIndex)];
}

function allowedHtmlPath(pathname) {
  const lower = pathname.toLowerCase();
  return (
    lower === '/404.html' ||
    /\/google[^/]*\.html$/i.test(pathname)
  );
}

function normalizedExtensionlessPath(pathname) {
  if (!/\.html$/i.test(pathname) || allowedHtmlPath(pathname)) return pathname;
  const withoutExtension = pathname.slice(0, -5);
  return /\/index$/i.test(withoutExtension)
    ? withoutExtension.slice(0, -5) || '/'
    : withoutExtension || '/';
}

function normalizeInternalHrefValue(value, pageUrl, siteUrl) {
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    /^(?:data|javascript|mailto|sms|tel):/i.test(trimmed)
  ) {
    return value;
  }

  const [pathPart, suffix] = splitUrlSuffix(trimmed);
  if (!/\.html$/i.test(pathPart)) return value;

  if (/^https?:\/\//i.test(pathPart)) {
    let parsed;
    try {
      parsed = new URL(pathPart);
    } catch {
      return value;
    }
    if (parsed.origin !== siteUrl.origin || allowedHtmlPath(parsed.pathname)) {
      return value;
    }
    parsed.pathname = normalizedExtensionlessPath(parsed.pathname);
    return `${parsed.origin}${parsed.pathname}${suffix}`;
  }

  if (pathPart.startsWith('//')) {
    let parsed;
    try {
      parsed = new URL(`${siteUrl.protocol}${pathPart}`);
    } catch {
      return value;
    }
    if (parsed.origin !== siteUrl.origin || allowedHtmlPath(parsed.pathname)) {
      return value;
    }
    return `//${parsed.host}${normalizedExtensionlessPath(parsed.pathname)}${suffix}`;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(pathPart)) return value;

  let resolved;
  try {
    resolved = new URL(pathPart, pageUrl);
  } catch {
    return value;
  }
  if (resolved.origin !== siteUrl.origin || allowedHtmlPath(resolved.pathname)) {
    return value;
  }

  return `${normalizedExtensionlessPath(resolved.pathname)}${suffix}`;
}

function normalizeInternalHrefs(html, pageUrl, siteUrl) {
  let normalizedCount = 0;
  const output = html.replace(
    /(\bhref\s*=\s*)(["'])([\s\S]*?)\2/gi,
    (attribute, prefix, quote, value) => {
      const normalized = normalizeInternalHrefValue(
        decodeEntities(value),
        pageUrl,
        siteUrl
      );
      if (normalized === decodeEntities(value)) return attribute;
      normalizedCount += 1;
      return `${prefix}${quote}${escapeAttribute(normalized)}${quote}`;
    }
  );

  return { html: output, normalizedCount };
}

function formActions(html) {
  return [...html.matchAll(/<form\b[^>]*>/gi)].map(match => {
    const action = match[0].match(
      /\s(action\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))/i
    );
    return action ? action[1] : null;
  });
}

function removeExactDuplicateAnalyticsLoaders(html) {
  const scripts = [
    ...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)
  ].map(match => match[0]);
  const counts = new Map();

  for (const script of scripts) {
    if (
      /googletagmanager\.com\/(?:gtag\/js|gtm\.js)|google-analytics\.com/i.test(
        script
      )
    ) {
      counts.set(script, (counts.get(script) ?? 0) + 1);
    }
  }

  const seen = new Map();
  let removedCount = 0;
  const output = html.replace(
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    script => {
      if (counts.get(script) !== 2) return script;
      const occurrence = (seen.get(script) ?? 0) + 1;
      seen.set(script, occurrence);
      if (occurrence === 2) {
        removedCount += 1;
        return '';
      }
      return script;
    }
  );

  return { html: output, removedCount };
}

function applyKnownGrammarRepairs(html, isBlogIndex) {
  let fixes = 0;
  let output = html.replace(/\bLoan [Ll]oans\b/g, () => {
    fixes += 1;
    return 'Loans';
  });

  output = output.replace(/\bCalifornia,\s+California\b/g, () => {
    fixes += 1;
    return 'California';
  });

  if (isBlogIndex) {
    output = output.replace(
      /(<h3\b[^>]*\bclass\s*=\s*(?:"[^"]*\bblog-card__title\b[^"]*"|'[^']*\bblog-card__title\b[^']*')[^>]*>)([^<]*)<\/h2>/gi,
      (_match, opening, content) => {
        fixes += 1;
        return `${opening}${content}</h3>`;
      }
    );
  }

  return { html: output, fixes };
}

function ensureBodyRoute(html, route, fileLabel) {
  let bodyCount = 0;
  const output = html.replace(/<body\b[^>]*>/gi, tag => {
    bodyCount += 1;
    const withoutExisting = tag.replace(
      /\sdata-route\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ''
    );
    return withoutExisting.replace(
      />$/,
      ` data-route="${escapeAttribute(route)}">`
    );
  });

  if (bodyCount !== 1) {
    throw new Error(`${fileLabel}: expected one body element, found ${bodyCount}`);
  }
  return output;
}

async function imageDimensions(filePath) {
  const buffer = await fs.readFile(filePath);

  if (
    buffer.length >= 24 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      const segmentLength = buffer.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return {
          width: buffer.readUInt16BE(offset + 5),
          height: buffer.readUInt16BE(offset + 3)
        };
      }
      offset += segmentLength;
    }
  }

  throw new Error(`Unsupported social image format: ${filePath}`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function localAssetPathFromUrl(value, siteUrl) {
  try {
    const parsed = new URL(value, siteUrl);
    if (parsed.origin !== siteUrl.origin) return null;
    return decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
}

function socialImageType(filePath) {
  if (/\.png$/i.test(filePath)) return 'image/png';
  if (/\.jpe?g$/i.test(filePath)) return 'image/jpeg';
  if (/\.webp$/i.test(filePath)) return 'image/webp';
  throw new Error(`Unsupported social image type: ${filePath}`);
}

async function chooseSocialImage({
  dist,
  existingImage,
  isPost,
  relativeFile,
  route,
  siteUrl
}) {
  let selectedPath = DEFAULT_SOCIAL_IMAGE;
  let routeAlt = null;
  let mappedRouteImage = false;
  let uniquePostImage = false;

  if (isPost) {
    const slug = path.basename(relativeFile, '.html');
    const candidates = [];
    const existingPath = existingImage
      ? localAssetPathFromUrl(existingImage, siteUrl)
      : null;

    if (existingPath?.startsWith('/images/og/')) {
      const existingSlug = path.basename(
        existingPath,
        path.extname(existingPath)
      );
      if (existingSlug === slug) candidates.push(existingPath);
    }
    candidates.push(
      `/images/og/${slug}.png`,
      `/images/og/${slug}.jpg`,
      `/images/og/${slug}.jpeg`,
      `/images/og/${slug}.webp`
    );

    for (const candidate of [...new Set(candidates)]) {
      if (await fileExists(path.join(dist, candidate.slice(1)))) {
        selectedPath = candidate;
        uniquePostImage = true;
        break;
      }
    }

    if (!uniquePostImage) {
      selectedPath = SOCIAL_IMAGE_FAMILIES.investorGuides.path;
      routeAlt = SOCIAL_IMAGE_FAMILIES.investorGuides.alt;
      mappedRouteImage = true;
    }
  } else {
    const mapping = socialImageForRoute(route);
    if (mapping) {
      selectedPath = mapping.path;
      routeAlt = mapping.alt;
      mappedRouteImage = true;
    }
  }

  assertPrioritySocialImage({
    isPost,
    route,
    selectedPath,
    uniquePostImage
  });

  const absoluteFile = path.join(dist, selectedPath.slice(1));
  if (!(await fileExists(absoluteFile))) {
    throw new Error(`Missing required social image: ${selectedPath}`);
  }

  const dimensions = await imageDimensions(absoluteFile);
  if (
    mappedRouteImage &&
    (dimensions.width !== 1200 || dimensions.height !== 630)
  ) {
    throw new Error(
      `Mapped social image ${selectedPath} must be 1200x630; found ${dimensions.width}x${dimensions.height}`
    );
  }

  return {
    path: selectedPath,
    url: new URL(selectedPath, siteUrl).href,
    type: socialImageType(selectedPath),
    routeAlt,
    ...dimensions
  };
}

function isLoanProgramRoute(route) {
  return (
    route === '/products' ||
    route.startsWith('/lp-') ||
    /^\/(?:bridge-loans|cash-out-refinance|construction-loans|fix-and-flip-loans|second-position-loans)(?:-|$)/.test(
      route
    )
  );
}

function isMarketLenderRoute(route) {
  return /^\/[a-z0-9]+(?:-[a-z0-9]+)*-hard-money-lender$/.test(route);
}

function prioritySocialImageForRoute(route) {
  if (route === '/funded-deals') return SOCIAL_IMAGE_FAMILIES.fundedDeals;
  if (isLoanProgramRoute(route)) return SOCIAL_IMAGE_FAMILIES.loanPrograms;
  if (isMarketLenderRoute(route)) return SOCIAL_IMAGE_FAMILIES.marketLending;

  if (
    ['/about', '/apply', '/contact', '/partners'].includes(route) ||
    route.startsWith('/thanks')
  ) {
    return SOCIAL_IMAGE_FAMILIES.loganDirect;
  }

  if (
    ['/blog', '/faq', '/press'].includes(route) ||
    route.startsWith('/glossary-') ||
    route.startsWith('/compare-')
  ) {
    return SOCIAL_IMAGE_FAMILIES.investorGuides;
  }

  return null;
}

function assertPrioritySocialImage({
  isPost,
  route,
  selectedPath,
  uniquePostImage
}) {
  const expected =
    isPost && !uniquePostImage
      ? SOCIAL_IMAGE_FAMILIES.investorGuides
      : prioritySocialImageForRoute(route);

  if (expected && selectedPath !== expected.path) {
    throw new Error(
      `${route}: priority social family must use ${expected.path}; selected ${selectedPath}`
    );
  }
}

function socialImageForRoute(route) {
  return prioritySocialImageForRoute(route);
}

function socialMetaBlock({
  canonical,
  image,
  imageAlt,
  isPost,
  ogDescription,
  ogTitle,
  twitterDescription,
  twitterTitle
}) {
  const tags = [
    ['property', 'og:title', ogTitle],
    ['property', 'og:description', ogDescription],
    ['property', 'og:type', isPost ? 'article' : 'website'],
    ['property', 'og:url', canonical],
    ['property', 'og:image', image.url],
    ['property', 'og:image:type', image.type],
    ['property', 'og:image:width', String(image.width)],
    ['property', 'og:image:height', String(image.height)],
    ['property', 'og:image:alt', imageAlt],
    ['property', 'og:site_name', ORGANIZATION_NAME],
    ['property', 'og:locale', OG_LOCALE],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', twitterTitle],
    ['name', 'twitter:description', twitterDescription],
    ['name', 'twitter:image', image.url],
    ['name', 'twitter:image:alt', imageAlt]
  ];

  return tags
    .map(
      ([attribute, key, content]) =>
        `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}">`
    )
    .join('');
}

function canonicalRoute(canonical, siteUrl, fileLabel) {
  let parsed;
  try {
    parsed = new URL(canonical);
  } catch {
    throw new Error(`${fileLabel}: invalid canonical URL: ${canonical}`);
  }

  if (parsed.origin !== siteUrl.origin) {
    throw new Error(
      `${fileLabel}: canonical origin ${parsed.origin} does not match ${siteUrl.origin}`
    );
  }
  if (parsed.search || parsed.hash) {
    throw new Error(`${fileLabel}: canonical URL must not include query or fragment`);
  }
  if (/\.html$/i.test(parsed.pathname)) {
    throw new Error(`${fileLabel}: canonical URL must be extensionless`);
  }

  return parsed.pathname || '/';
}

function webPageType(route, isPost) {
  if (route === '/about') return 'AboutPage';
  if (route === '/contact') return 'ContactPage';
  if (
    route === '/blog' ||
    route === '/products' ||
    route === '/funded-deals'
  ) {
    return 'CollectionPage';
  }
  if (isPost) return 'WebPage';
  return 'WebPage';
}

function breadcrumbNode({ canonical, route, title, siteUrl }) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: new URL('/', siteUrl).href
    }
  ];

  if (route.startsWith('/posts/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: new URL('/blog', siteUrl).href
    });
  }

  if (route !== '/') {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: title,
      item: canonical
    });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: items
  };
}

function extractProductItemList(html, canonical) {
  const sections = [];
  const sectionPattern =
    /<section\b(?=[^>]*\bclass\s*=\s*(?:"[^"]*\bproduct-section\b[^"]*"|'[^']*\bproduct-section\b[^']*'))(?=[^>]*\bid\s*=\s*(?:"([^"]+)"|'([^']+)'))[^>]*>([\s\S]*?)(?=<section\b(?=[^>]*\bclass\s*=\s*(?:"[^"]*\bproduct-section\b[^"]*"|'[^']*\bproduct-section\b[^']*'))|<\/main>|$)/gi;

  for (const match of html.matchAll(sectionPattern)) {
    const id = decodeEntities(match[1] ?? match[2] ?? '');
    const headingMatch = match[3].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    const name = headingMatch ? stripMarkup(headingMatch[1]) : '';
    if (id && name) sections.push({ id, name });
  }

  if (!sections.length) return null;
  return {
    '@type': 'ItemList',
    '@id': `${canonical}#products`,
    itemListElement: sections.map(({ id, name }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: `${canonical}#${encodeURIComponent(id)}`
    }))
  };
}

function findArticleDate(html, property) {
  const metaDate = findMetaContent(html, property, 'property');
  if (metaDate) return metaDate;
  if (property !== 'article:published_time') return null;

  const time = html.match(
    /<time\b[^>]*\bdatetime\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/i
  );
  return time ? decodeEntities(time[1] ?? time[2] ?? time[3] ?? '') : null;
}

function normalizedDate(value, label, fileLabel) {
  if (!value) throw new Error(`${fileLabel}: missing ${label}`);
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
  if (!match || Number.isNaN(Date.parse(match[1]))) {
    throw new Error(`${fileLabel}: invalid ${label}: ${value}`);
  }
  return match[1];
}

function schemaGraph({
  canonical,
  description,
  headline,
  html,
  image,
  imageAlt,
  isPost,
  releaseDate,
  route,
  siteUrl,
  title
}) {
  const organizationId = `${siteUrl.origin}/#organization`;
  const websiteId = `${siteUrl.origin}/#website`;
  const webpageId = `${canonical}#webpage`;
  const imageId = `${canonical}#primaryimage`;
  const personId = `${siteUrl.origin}/about#logan-sullivan`;
  const visibleText = bodyVisibleText(html, route);
  const hasVisibleLogan = /\bLogan Sullivan\b/.test(visibleText);
  const hasVisibleByline = /\bBy Logan Sullivan\b/i.test(visibleText);
  const personRelevant =
    hasVisibleLogan && (route === '/' || route === '/about' || hasVisibleByline);

  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: ORGANIZATION_NAME,
    url: `${siteUrl.origin}/`,
    telephone: '+1-602-935-0371',
    email: 'Logan@grandfundingllc.com',
    identifier: [
      {
        '@type': 'PropertyValue',
        name: 'NMLS ID',
        value: '2466872'
      },
      {
        '@type': 'PropertyValue',
        name: 'AZ MLO License',
        value: '1048901'
      }
    ],
    areaServed: [
      { '@type': 'State', name: 'Arizona' },
      { '@type': 'State', name: 'California' }
    ]
  };
  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: `${siteUrl.origin}/`,
    name: ORGANIZATION_NAME,
    publisher: { '@id': organizationId },
    inLanguage: LANGUAGE
  };
  const imageObject = {
    '@type': 'ImageObject',
    '@id': imageId,
    url: image.url,
    width: image.width,
    height: image.height,
    caption: imageAlt
  };
  const breadcrumb = breadcrumbNode({
    canonical,
    route,
    title: headline || title,
    siteUrl
  });
  const webpage = {
    '@type': webPageType(route, isPost),
    '@id': webpageId,
    url: canonical,
    name: headline || title,
    description,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    breadcrumb: { '@id': breadcrumb['@id'] },
    primaryImageOfPage: { '@id': imageId },
    inLanguage: LANGUAGE
  };

  const graph = [organization, website, imageObject, webpage, breadcrumb];

  if (personRelevant) {
    graph.push({
      '@type': 'Person',
      '@id': personId,
      name: 'Logan Sullivan',
      jobTitle: 'Founder and Direct Lender',
      url: `${siteUrl.origin}/about`,
      image: `${siteUrl.origin}/images/logan/logan-portrait-720.webp`,
      identifier: {
        '@type': 'PropertyValue',
        name: 'NMLS ID',
        value: '2466872'
      },
      worksFor: { '@id': organizationId }
    });
  }

  if (route === '/products') {
    const itemList = extractProductItemList(html, canonical);
    if (itemList) {
      graph.push(itemList);
      webpage.mainEntity = { '@id': itemList['@id'] };
    }
  }

  if (isPost) {
    const published = normalizedDate(
      findArticleDate(html, 'article:published_time'),
      'article publication date',
      route
    );
    const modifiedSource = findArticleDate(html, 'article:modified_time');
    const modified = modifiedSource
      ? normalizedDate(modifiedSource, 'article modification date', route)
      : published;

    if (published > releaseDate || modified > releaseDate) {
      throw new Error(
        `${route}: article date is later than release date ${releaseDate}`
      );
    }

    const article = {
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      url: canonical,
      headline: headline || title,
      description,
      datePublished: published,
      dateModified: modified,
      mainEntityOfPage: { '@id': webpageId },
      image: { '@id': imageId },
      author: personRelevant
        ? { '@id': personId }
        : { '@id': organizationId },
      publisher: { '@id': organizationId },
      inLanguage: LANGUAGE
    };
    graph.push(article);
    webpage.mainEntity = { '@id': article['@id'] };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

function safeJsonForHtml(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function insertHeadPayload(html, payload, fileLabel) {
  if (!/<\/head>/i.test(html)) {
    throw new Error(`${fileLabel}: missing closing head tag`);
  }
  return html.replace(/<\/head>/i, `${payload}</head>`);
}

function schemaTypes(value, types = []) {
  if (Array.isArray(value)) {
    for (const item of value) schemaTypes(item, types);
    return types;
  }
  if (!value || typeof value !== 'object') return types;

  const type = value['@type'];
  if (Array.isArray(type)) types.push(...type);
  else if (typeof type === 'string') types.push(type);
  for (const child of Object.values(value)) schemaTypes(child, types);
  return types;
}

function validateNormalizedHtml({
  html,
  fileLabel,
  isBlogIndex,
  isNoindexPage,
  route,
  siteUrl
}) {
  const canonical = readCanonical(html, fileLabel);
  if (canonicalRoute(canonical, siteUrl, fileLabel) !== route) {
    throw new Error(`${fileLabel}: canonical route changed during normalization`);
  }

  const body = html.match(/<body\b[^>]*>/i)?.[0];
  if (!body || getAttribute(body, 'data-route') !== route) {
    throw new Error(`${fileLabel}: incorrect or missing body data-route`);
  }

  const appleIcons = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(match => match[0])
    .filter(tag =>
      getAttribute(tag, 'rel')
        ?.toLowerCase()
        .split(/\s+/)
        .includes('apple-touch-icon')
    );
  if (
    appleIcons.length !== 1 ||
    getAttribute(appleIcons[0], 'href') !== '/images/appicon-180.png' ||
    getAttribute(appleIcons[0], 'sizes') !== '180x180'
  ) {
    throw new Error(`${fileLabel}: Apple touch icon was not normalized`);
  }

  const socialKeys = [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:type'],
    ['property', 'og:url'],
    ['property', 'og:image'],
    ['property', 'og:image:type'],
    ['property', 'og:image:width'],
    ['property', 'og:image:height'],
    ['property', 'og:image:alt'],
    ['property', 'og:site_name'],
    ['property', 'og:locale'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
    ['name', 'twitter:image:alt']
  ];
  for (const [attribute, key] of socialKeys) {
    const matches = [...html.matchAll(/<meta\b[^>]*>/gi)]
      .map(match => match[0])
      .filter(
        tag => getAttribute(tag, attribute)?.toLowerCase() === key.toLowerCase()
      );
    if (matches.length !== 1 || !getAttribute(matches[0], 'content')) {
      throw new Error(
        `${fileLabel}: expected one non-empty ${key} meta tag, found ${matches.length}`
      );
    }
  }

  for (const match of html.matchAll(
    /(\bhref\s*=\s*)(["'])([\s\S]*?)\2/gi
  )) {
    const value = decodeEntities(match[3]);
    if (
      normalizeInternalHrefValue(value, new URL(canonical), siteUrl) !== value
    ) {
      throw new Error(`${fileLabel}: internal .html href remains: ${value}`);
    }
  }

  if (/\bLoan [Ll]oans\b/.test(html)) {
    throw new Error(`${fileLabel}: legacy "Loan Loans" grammar remains`);
  }
  if (/\bCalifornia,\s+California\b/.test(html)) {
    throw new Error(`${fileLabel}: duplicate California grammar remains`);
  }
  if (
    isBlogIndex &&
    /<h3\b[^>]*\bclass\s*=\s*(?:"[^"]*\bblog-card__title\b[^"]*"|'[^']*\bblog-card__title\b[^']*')[^>]*>[^<]*<\/h2>/i.test(
      html
    )
  ) {
    throw new Error(`${fileLabel}: malformed blog-card h3 remains`);
  }

  const jsonLdScripts = [
    ...html.matchAll(
      /<script\b(?=[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json))[^>]*>([\s\S]*?)<\/script>/gi
    )
  ];
  if (isNoindexPage) {
    if (jsonLdScripts.length !== 0) {
      throw new Error(`${fileLabel}: noindex page must not contain schema`);
    }
    return;
  }

  if (jsonLdScripts.length !== 1) {
    throw new Error(
      `${fileLabel}: expected one coherent JSON-LD graph, found ${jsonLdScripts.length}`
    );
  }

  let schema;
  try {
    schema = JSON.parse(jsonLdScripts[0][1]);
  } catch (error) {
    throw new Error(`${fileLabel}: malformed normalized JSON-LD: ${error.message}`);
  }
  if (
    schema['@context'] !== 'https://schema.org' ||
    !Array.isArray(schema['@graph'])
  ) {
    throw new Error(`${fileLabel}: normalized JSON-LD is not an @graph`);
  }

  const types = schemaTypes(schema);
  for (const forbidden of FORBIDDEN_SCHEMA_TYPES) {
    if (types.includes(forbidden)) {
      throw new Error(`${fileLabel}: forbidden schema type remains: ${forbidden}`);
    }
  }

  for (const required of ['Organization', 'WebSite']) {
    if (!types.includes(required)) {
      throw new Error(`${fileLabel}: missing required ${required} schema node`);
    }
  }
  if (
    !types.some(type =>
      ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'].includes(type)
    )
  ) {
    throw new Error(`${fileLabel}: missing required WebPage schema node`);
  }

  const breadcrumb = schema['@graph'].find(
    node => node?.['@type'] === 'BreadcrumbList'
  );
  const lastCrumb = breadcrumb?.itemListElement?.at(-1);
  if (!breadcrumb || lastCrumb?.item !== canonical) {
    throw new Error(`${fileLabel}: breadcrumb does not resolve to canonical self`);
  }
  if (route.startsWith('/posts/') && !types.includes('BlogPosting')) {
    throw new Error(`${fileLabel}: post is missing BlogPosting schema`);
  }
}

async function transformHtml({
  dist,
  html: sourceHtml,
  relativeFile,
  releaseDate,
  siteUrl
}) {
  const fileLabel = relativeFile;
  validateLegacyJsonLd(sourceHtml, fileLabel);
  const originalActions = formActions(sourceHtml);
  const isPost = relativeFile.startsWith('posts/');
  const isBlogIndex = relativeFile === 'blog.html';

  const repaired = applyKnownGrammarRepairs(sourceHtml, isBlogIndex);
  let html = repaired.html;
  const canonical = readCanonical(html, fileLabel);
  const route = canonicalRoute(canonical, siteUrl, fileLabel);
  const pageUrl = new URL(canonical);
  const noindex = isNoindex(html);

  const title = readTitle(html, fileLabel);
  const heading = readHeading(html, 1);
  const existingOgTitle = findMetaContent(html, 'og:title', 'property');
  const existingTwitterTitle = findMetaContent(html, 'twitter:title');
  const existingImage = findMetaContent(html, 'og:image', 'property');
  const metaDescription = normalizePageDescription({
    current: findMetaContent(html, 'description'),
    heading,
    route
  });
  html = setMetaContent(html, 'description', metaDescription);

  const ogTitle = existingOgTitle || title;
  const ogDescription = metaDescription;
  const twitterTitle = existingTwitterTitle || ogTitle;
  const twitterDescription = metaDescription;
  const image = await chooseSocialImage({
    dist,
    existingImage,
    isPost,
    relativeFile,
    route,
    siteUrl
  });
  const imageAlt = image.routeAlt || heading || ogTitle;

  const hrefResult = normalizeInternalHrefs(html, pageUrl, siteUrl);
  html = hrefResult.html;
  const analyticsResult = removeExactDuplicateAnalyticsLoaders(html);
  html = analyticsResult.html;
  html = normalizeAppleTouchIcon(html);
  html = normalizeManifestLink(html);
  html = removeSocialMeta(html);
  html = removeJsonLd(html);
  html = ensureBodyRoute(html, route, fileLabel);

  const social = socialMetaBlock({
    canonical,
    image,
    imageAlt,
    isPost,
    ogDescription,
    ogTitle,
    twitterDescription,
    twitterTitle
  });
  const graph = noindex
    ? ''
    : `<script type="application/ld+json">${safeJsonForHtml(
        schemaGraph({
          canonical,
          description: metaDescription,
          headline: heading,
          html,
          image,
          imageAlt,
          isPost,
          releaseDate,
          route,
          siteUrl,
          title: ogTitle
        })
      )}</script>`;
  html = insertHeadPayload(html, `${social}${graph}`, fileLabel);

  const normalizedActions = formActions(html);
  if (JSON.stringify(originalActions) !== JSON.stringify(normalizedActions)) {
    throw new Error(`${fileLabel}: form actions changed during normalization`);
  }

  validateNormalizedHtml({
    html,
    fileLabel,
    isBlogIndex,
    isNoindexPage: noindex,
    route,
    siteUrl
  });

  return {
    html,
    stats: {
      analyticsLoadersRemoved: analyticsResult.removedCount,
      canonical,
      grammarFixes: repaired.fixes,
      hrefsNormalized: hrefResult.normalizedCount,
      indexable: !noindex,
      post: isPost
    }
  };
}

function normalizeReleaseDate(releaseDate) {
  const value =
    releaseDate instanceof Date
      ? releaseDate.toISOString().slice(0, 10)
      : String(releaseDate ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(
      `releaseDate must be a valid YYYY-MM-DD date; received ${String(releaseDate)}`
    );
  }
  return value;
}

function normalizeSiteOrigin(siteOrigin) {
  let siteUrl;
  try {
    siteUrl = new URL(siteOrigin);
  } catch {
    throw new Error(`Invalid siteOrigin: ${String(siteOrigin)}`);
  }
  if (!['http:', 'https:'].includes(siteUrl.protocol)) {
    throw new Error(`siteOrigin must use http or https: ${siteOrigin}`);
  }
  if (siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
    throw new Error(`siteOrigin must not include a path, query, or fragment`);
  }
  return siteUrl;
}

async function builtHtmlFiles(dist) {
  const rootFiles = (await fs.readdir(dist, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => entry.name);
  const postsDirectory = path.join(dist, 'posts');
  const postFiles = (await fileExists(postsDirectory))
    ? (await fs.readdir(postsDirectory, { withFileTypes: true }))
        .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
        .map(entry => path.posix.join('posts', entry.name))
    : [];

  return [...rootFiles, ...postFiles]
    .filter(relativeFile => !/^google[^/]*\.html$/i.test(relativeFile))
    .sort();
}

function publicFilePath(relativeFile) {
  return `/${relativeFile
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')}`;
}

function cleanRouteForFile(relativeFile) {
  if (relativeFile === 'index.html') return '/';
  return publicFilePath(relativeFile).slice(0, -5);
}

function redirectInventory(htmlFiles) {
  return htmlFiles
    .filter(relativeFile => relativeFile !== '404.html')
    .filter(relativeFile => !/^google[^/]*\.html$/i.test(relativeFile))
    .map(relativeFile => ({
      cleanRoute: cleanRouteForFile(relativeFile),
      htmlRoute: publicFilePath(relativeFile),
      relativeFile
    }));
}

async function postFormActionHtmlRoutes(dist, htmlFiles) {
  const htmlRoutes = new Set(
    redirectInventory(htmlFiles).map(({ htmlRoute }) => htmlRoute)
  );
  const protectedRoutes = new Set();
  let postForms = 0;

  for (const relativeFile of htmlFiles) {
    const html = await fs.readFile(path.join(dist, relativeFile), 'utf8');
    const documentUrl = new URL(
      publicFilePath(relativeFile),
      'https://www.grandfundingllc.com'
    );

    for (const match of html.matchAll(/<form\b[^>]*>/gi)) {
      const tag = match[0];
      const method = (getAttribute(tag, 'method') || 'get').toLowerCase();
      if (method !== 'post') continue;
      postForms += 1;

      const rawAction = getAttribute(tag, 'action');
      if (!rawAction) {
        throw new Error(
          `${relativeFile}: POST form must have an explicit local action`
        );
      }

      const action = new URL(decodeEntities(rawAction), documentUrl);
      if (action.origin !== documentUrl.origin) {
        throw new Error(
          `${relativeFile}: POST form action must stay on the canonical origin`
        );
      }
      if (!/\.html$/i.test(action.pathname)) continue;
      if (!htmlRoutes.has(action.pathname)) {
        throw new Error(
          `${relativeFile}: POST form action is not a built HTML route: ${action.pathname}`
        );
      }
      protectedRoutes.add(action.pathname);
    }
  }

  if (postForms === 0 || protectedRoutes.size === 0) {
    throw new Error(
      'No POST form action routes were found to protect from canonical redirects'
    );
  }

  return protectedRoutes;
}

function validateRedirectRules(content, inventory, protectedPostRoutes) {
  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  const rules = lines.map((line, index) => {
    const parts = line.split(/\s+/);
    if (parts.length !== 3) {
      throw new Error(`_redirects line ${index + 1} is malformed: ${line}`);
    }
    const [source, target, status] = parts;
    return { source, target, status };
  });

  const expectedRuleCount =
    inventory.length * 2 - protectedPostRoutes.size + 1;
  if (rules.length !== expectedRuleCount) {
    throw new Error(
      `_redirects expected ${expectedRuleCount} rules, found ${rules.length}`
    );
  }

  const hostRule = rules[0];
  if (
    hostRule?.source !== 'https://grandfundingllc.com/*' ||
    hostRule?.target !== 'https://www.grandfundingllc.com/:splat' ||
    hostRule?.status !== '301!'
  ) {
    throw new Error(
      '_redirects must begin with the forced apex-to-www canonical host rule'
    );
  }

  const sourceRules = new Map();
  for (const rule of rules) {
    if (sourceRules.has(rule.source)) {
      throw new Error(`_redirects has duplicate source route: ${rule.source}`);
    }
    sourceRules.set(rule.source, rule);
  }

  const knownHtmlRoutes = new Set(
    inventory.map(({ htmlRoute }) => htmlRoute)
  );
  for (const { cleanRoute, htmlRoute, relativeFile } of inventory) {
    const redirect = sourceRules.get(htmlRoute);
    if (protectedPostRoutes.has(htmlRoute)) {
      if (redirect) {
        throw new Error(
          `_redirects must not redirect POST form action ${htmlRoute}`
        );
      }
    } else if (
      redirect?.target !== cleanRoute ||
      redirect?.status !== '301!'
    ) {
      throw new Error(
        `_redirects missing forced canonical redirect for ${relativeFile}`
      );
    }

    const rewrite = sourceRules.get(cleanRoute);
    if (
      rewrite?.target !== htmlRoute ||
      rewrite?.status !== '200'
    ) {
      throw new Error(
        `_redirects missing extensionless rewrite for ${relativeFile}`
      );
    }
  }

  for (const rule of rules) {
    if (rule === hostRule) continue;

    if (
      /\/404\.html$/i.test(rule.source) ||
      /\/404\.html$/i.test(rule.target) ||
      /\/google[^/]*\.html$/i.test(rule.source) ||
      /\/google[^/]*\.html$/i.test(rule.target)
    ) {
      throw new Error(`_redirects includes an excluded route: ${rule.source}`);
    }

    if (rule.status === '200') {
      if (!knownHtmlRoutes.has(rule.target)) {
        throw new Error(
          `_redirects rewrite target is not a built HTML file: ${rule.target}`
        );
      }
      continue;
    }

    if (rule.status !== '301!') {
      throw new Error(
        `_redirects has unsupported status for ${rule.source}: ${rule.status}`
      );
    }
    if (!/\.html$/i.test(rule.source) || /\.html$/i.test(rule.target)) {
      throw new Error(
        `_redirects canonical redirect is not HTML-to-clean: ${rule.source}`
      );
    }
  }

  const externalRedirects = new Map(
    rules
      .filter(rule => rule.status === '301!')
      .map(rule => [rule.source, rule.target])
  );
  for (const source of externalRedirects.keys()) {
    const visited = new Set();
    let cursor = source;
    while (externalRedirects.has(cursor)) {
      if (visited.has(cursor)) {
        throw new Error(`_redirects external redirect cycle starts at ${source}`);
      }
      visited.add(cursor);
      cursor = externalRedirects.get(cursor);
    }
  }
}

async function writeRedirects(dist, htmlFiles) {
  const inventory = redirectInventory(htmlFiles);
  const protectedPostRoutes = await postFormActionHtmlRoutes(dist, htmlFiles);
  const canonicalRedirects = inventory
    .filter(({ htmlRoute }) => !protectedPostRoutes.has(htmlRoute))
    .map(({ cleanRoute, htmlRoute }) => `${htmlRoute} ${cleanRoute} 301!`);
  const extensionlessRewrites = inventory.map(
    ({ cleanRoute, htmlRoute }) => `${cleanRoute} ${htmlRoute} 200`
  );
  const content = [
    '# Generated by scripts/normalize-built-site.mjs. Do not edit.',
    '# Canonical host rule must remain first because Netlify uses first match.',
    'https://grandfundingllc.com/* https://www.grandfundingllc.com/:splat 301!',
    '',
    '# Canonical redirects from legacy .html URLs',
    '# POST form action HTML routes are intentionally excluded.',
    ...canonicalRedirects,
    '',
    '# Internal rewrites for extensionless public routes',
    ...extensionlessRewrites,
    ''
  ].join('\n');

  validateRedirectRules(content, inventory, protectedPostRoutes);
  await fs.writeFile(path.join(dist, '_redirects'), content, 'utf8');
  return inventory.length * 2 - protectedPostRoutes.size + 1;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function validateSitemap(content, canonicals, releaseDate, siteUrl) {
  if (
    !content.includes(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
  ) {
    throw new Error('Generated sitemap is missing the standard urlset root');
  }
  if (/<(?:changefreq|priority)\b/i.test(content)) {
    throw new Error('Generated sitemap must not contain changefreq or priority');
  }

  const locations = [
    ...content.matchAll(/<loc>([\s\S]*?)<\/loc>/g)
  ].map(match => decodeEntities(match[1]));
  const lastmods = [
    ...content.matchAll(/<lastmod>([\s\S]*?)<\/lastmod>/g)
  ].map(match => match[1]);

  if (
    locations.length !== canonicals.length ||
    lastmods.length !== canonicals.length
  ) {
    throw new Error(
      `Generated sitemap expected ${canonicals.length} URL records`
    );
  }
  if (new Set(locations).size !== locations.length) {
    throw new Error('Generated sitemap contains duplicate canonical URLs');
  }
  if (lastmods.some(value => value !== releaseDate)) {
    throw new Error('Generated sitemap contains an inaccurate lastmod');
  }

  const expected = new Set(canonicals);
  for (const location of locations) {
    if (!expected.has(location)) {
      throw new Error(`Generated sitemap contains unexpected URL: ${location}`);
    }
    const parsed = new URL(location);
    if (
      parsed.origin !== siteUrl.origin ||
      parsed.search ||
      parsed.hash ||
      /\.html$/i.test(parsed.pathname)
    ) {
      throw new Error(
        `Generated sitemap URL is not a clean canonical: ${location}`
      );
    }
  }
}

async function writeSitemap(
  dist,
  indexableCanonicals,
  releaseDate,
  siteUrl
) {
  if (new Set(indexableCanonicals).size !== indexableCanonicals.length) {
    throw new Error('Indexable pages contain duplicate canonical URLs');
  }

  const canonicals = [...indexableCanonicals].sort((left, right) => {
    const leftPath = new URL(left).pathname;
    const rightPath = new URL(right).pathname;
    if (leftPath === '/') return rightPath === '/' ? 0 : -1;
    if (rightPath === '/') return 1;
    return left.localeCompare(right);
  });
  const records = canonicals.map(
    canonical =>
      `  <url>\n    <loc>${escapeXml(canonical)}</loc>\n    <lastmod>${releaseDate}</lastmod>\n  </url>`
  );
  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...records,
    '</urlset>',
    ''
  ].join('\n');

  validateSitemap(content, canonicals, releaseDate, siteUrl);
  await fs.writeFile(path.join(dist, 'sitemap.xml'), content, 'utf8');
  return canonicals.length;
}

export async function normalizeBuiltSite({
  root,
  dist,
  siteOrigin,
  releaseDate
}) {
  if (!root || !dist) throw new Error('normalizeBuiltSite requires root and dist');

  const resolvedRoot = path.resolve(root);
  const resolvedDist = path.resolve(dist);
  if (
    path.dirname(resolvedDist) !== resolvedRoot ||
    path.basename(resolvedDist) !== 'dist'
  ) {
    throw new Error(
      `Refusing unsafe dist path ${resolvedDist}; expected ${path.join(
        resolvedRoot,
        'dist'
      )}`
    );
  }

  const siteUrl = normalizeSiteOrigin(siteOrigin);
  const normalizedReleaseDate = normalizeReleaseDate(releaseDate);
  await fs.access(resolvedDist);

  const files = await builtHtmlFiles(resolvedDist);
  if (!files.length) throw new Error('No built HTML files found to normalize');

  const summary = {
    analyticsLoadersRemoved: 0,
    files: files.length,
    grammarFixes: 0,
    hrefsNormalized: 0,
    indexablePages: 0,
    noindexPages: 0,
    posts: 0,
    redirectRules: 0,
    sitemapUrls: 0,
    releaseDate: normalizedReleaseDate
  };
  const indexableCanonicals = [];

  for (const relativeFile of files) {
    const filePath = path.join(resolvedDist, relativeFile);
    const sourceHtml = await fs.readFile(filePath, 'utf8');
    const first = await transformHtml({
      dist: resolvedDist,
      html: sourceHtml,
      relativeFile,
      releaseDate: normalizedReleaseDate,
      siteUrl
    });
    const second = await transformHtml({
      dist: resolvedDist,
      html: first.html,
      relativeFile,
      releaseDate: normalizedReleaseDate,
      siteUrl
    });

    if (second.html !== first.html) {
      throw new Error(`${relativeFile}: normalization is not deterministic`);
    }

    await fs.writeFile(filePath, first.html, 'utf8');
    summary.analyticsLoadersRemoved += first.stats.analyticsLoadersRemoved;
    summary.grammarFixes += first.stats.grammarFixes;
    summary.hrefsNormalized += first.stats.hrefsNormalized;
    summary.indexablePages += first.stats.indexable ? 1 : 0;
    summary.noindexPages += first.stats.indexable ? 0 : 1;
    summary.posts += first.stats.post ? 1 : 0;
    if (first.stats.indexable) {
      indexableCanonicals.push(first.stats.canonical);
    }
  }

  summary.redirectRules = await writeRedirects(resolvedDist, files);
  summary.sitemapUrls = await writeSitemap(
    resolvedDist,
    indexableCanonicals,
    normalizedReleaseDate,
    siteUrl
  );
  return summary;
}
