#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_ORIGIN = 'https://www.grandfundingllc.com';
const EXPERIENCE_VERSION = '20260724';
const RELEASE_DATE = '2026-07-24';

const ROOT_ASSETS = [
  '404.html',
  'apply.css',
  'blog.css',
  'brand-tokens.css',
  'consent.js',
  'conversion-tools.css',
  'conversion-tools.js',
  'favicon.ico',
  'grand-experience.css',
  'grand-experience.js',
  'llms.txt',
  'premium-motion.css',
  'premium-motion.js',
  'premium-polish.css',
  'premium.js',
  'products.css',
  'robots.txt',
  'script.js',
  'site.webmanifest',
  'sitemap.xml',
  'styles-v2.css',
  'trust-pack.css'
];

const PUBLIC_DIRECTORIES = ['brand-kit', 'fonts', 'images', 'posts'];

const HOME_FAQ = [
  [
    'What is a hard money loan?',
    "A hard money loan is a short-term, asset-based loan secured by real estate. Unlike traditional bank loans that focus heavily on credit scores and income verification, hard money lenders primarily evaluate the property's value and your exit strategy. This makes them ideal for real estate investors who need fast funding for time-sensitive deals."
  ],
  [
    'How quickly can I get funded?',
    "We provide loan decisions within 24 hours of receiving a complete application. Once approved, most loans close and fund within 3-5 business days. For exceptionally straightforward deals, we've closed in as little as 48 hours."
  ],
  [
    'What are your loan-to-value (LTV) limits?',
    'Our LTV ratios vary by loan type: Fix & Flip loans up to 90% ARV, Bridge Loans up to 75% LTV, Construction Loans up to 80% of project cost, Land Loans up to 65% LTV, and Cash-Out Refinance up to 75% LTV.'
  ],
  [
    'Do I need good credit to qualify?',
    'Credit is considered but not the primary factor. We focus more on the property value, your equity position, and your exit strategy. Borrowers with credit scores as low as 550 may qualify depending on the deal structure and down payment.'
  ],
  [
    'What types of properties do you finance?',
    'We finance single-family homes, condos, townhouses, multi-family properties (2-4 units), mixed-use buildings, retail centers, office buildings, industrial properties, and raw land. Both residential and commercial properties are eligible.'
  ],
  [
    'Are there prepayment penalties?',
    "Most of our loan products have no prepayment penalty, allowing you to pay off the loan early without additional fees. Some specialized programs may have minimal prepayment terms - we'll clearly disclose any such terms before closing."
  ]
];

const SOCIAL_PROFILES = {
  home: {
    file: 'og-home-desert-deal-room-20260724.jpg',
    alt: 'Grand Funding desert deal route for Arizona and California real estate investors'
  },
  funded: {
    file: 'og-funded-deals-20260724.jpg',
    alt: 'Grand Funding funded-deal dossier with an Arizona investment property'
  },
  logan: {
    file: 'og-logan-direct-lender-20260724.jpg',
    alt: 'Logan Sullivan, founder and direct lender at Grand Funding LLC'
  },
  brief: {
    file: 'og-deal-desk-brief-20260724.jpg',
    alt: 'Grand Funding Deal Desk Brief for real estate investors'
  }
};

function assertSafeDist() {
  if (path.dirname(DIST) !== ROOT || path.basename(DIST) !== 'dist') {
    throw new Error(`Refusing unsafe output path: ${DIST}`);
  }
}

async function copyRequired(source, destination) {
  await fs.access(source);
  await fs.cp(source, destination, { recursive: true, preserveTimestamps: true });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtml(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 16)))
    .replace(/&#([0-9]+);/g, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value = '') {
  return decodeHtml(String(value))
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%$#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function visibleBodyText(html) {
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

function schemaTypes(node) {
  const value = node?.['@type'];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? [value] : [];
}

function legacySchemaNodes(html) {
  const nodes = [];
  const visit = value => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (value['@type']) nodes.push(value);
    if (value['@graph']) visit(value['@graph']);
  };
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch {}
  }
  return nodes;
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

function supportedFaqItems(html, route) {
  if (route === '/') {
    return HOME_FAQ.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text }
    }));
  }
  const visible = visibleBodyText(html);
  const unique = new Map();
  for (const faq of legacySchemaNodes(html).filter(node => schemaTypes(node).includes('FAQPage'))) {
    const questions = Array.isArray(faq.mainEntity) ? faq.mainEntity : [];
    for (const question of questions) {
      const name = String(question?.name || '').trim();
      const text = answerText(question);
      if (!textAppearsVisible(name, visible, 8) || !textAppearsVisible(text, visible, 16)) continue;
      const key = normalizeText(name);
      if (!key || unique.has(key)) continue;
      unique.set(key, {
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text }
      });
    }
  }
  return [...unique.values()];
}

function routeAreaServed(route) {
  const california = /(?:california|los-angeles|san-diego|orange-county)/.test(route);
  const arizona = /(?:arizona|phoenix|scottsdale|tempe|mesa|tucson)/.test(route);
  if (california && !arizona) return [{ '@type': 'State', name: 'California' }];
  if (arizona && !california) return [{ '@type': 'State', name: 'Arizona' }];
  return [
    { '@type': 'State', name: 'Arizona' },
    { '@type': 'State', name: 'California' }
  ];
}

function isFinancialProductRoute(route) {
  if (/^\/(?:blog|compare-|faq|glossary-|posts|press)/.test(route)) return false;
  return /(?:hard-money-lender|bridge-loans?|fix-and-flip-loans?|construction-loans?|cash-out-refinance|second-position-loans?)/.test(route);
}

function attributeValue(html, tag, attribute, key) {
  const expression = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  for (const match of html.matchAll(expression)) {
    const attributes = {};
    for (const attributeMatch of match[0].matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attributes[attributeMatch[1].toLowerCase()] = attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? '';
    }
    if ((attributes[attribute.toLowerCase()] || '').toLowerCase() === key.toLowerCase()) {
      return decodeHtml(attributes.content || '');
    }
  }
  return '';
}

function canonicalUrl(html) {
  return html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\b(?=[^>]*\bhref=["']([^"']+)["'])[^>]*\brel=["']canonical["'][^>]*>/i)?.[1]
    || '';
}

function routeForFile(name, html) {
  const canonical = canonicalUrl(html);
  if (canonical) {
    try { return new URL(canonical).pathname || '/'; } catch {}
  }
  return name === 'index.html' ? '/' : `/${name.replace(/\.html$/, '')}`;
}

function socialProfileFor(name) {
  if (name === 'index.html') return SOCIAL_PROFILES.home;
  if (name === 'funded-deals.html') return SOCIAL_PROFILES.funded;
  if (/^(?:about|apply|contact|partners|thanks|thanks-contact)\.html$/.test(name)) return SOCIAL_PROFILES.logan;
  if (/^(?:blog|faq|press|glossary-|compare-)/.test(name)) return SOCIAL_PROFILES.brief;
  return SOCIAL_PROFILES.home;
}

function upsertMeta(html, attribute, key, content) {
  const expression = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(key)}["'])[^>]*>`, 'i');
  const escapedContent = String(content || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const tag = `<meta ${attribute}="${key}" content="${escapedContent}">`;
  return expression.test(html)
    ? html.replace(expression, tag)
    : html.replace('</head>', `${tag}\n</head>`);
}

function addExperienceAssets(html) {
  if (!html.includes('/grand-experience.css')) {
    html = html.replace('</head>', `<link rel="stylesheet" href="/grand-experience.css?v=${EXPERIENCE_VERSION}">\n</head>`);
  }
  if (!html.includes('/grand-experience.js')) {
    html = html.replace('</body>', `<script defer src="/grand-experience.js?v=${EXPERIENCE_VERSION}"></script>\n</body>`);
  }
  return html;
}

function addRouteMarker(html, route) {
  return html.replace(/<body\b(?![^>]*\bdata-grand-route=)/i, `<body data-grand-route="${route.replace(/^\/|\/$/g, '') || 'home'}"`);
}

function normalizeGeneratedDescription(html, route) {
  const current = attributeValue(html, 'meta', 'name', 'description');
  if (!/^Arizona hard money lender\.\s*24-hour approval/i.test(current)) return html;
  const h1 = decodeHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || 'Real estate investor financing');
  let description;
  if (/^\/glossary-/.test(route)) {
    description = `${h1} explained for real estate investors, including how the term affects a business-purpose loan review and what to ask a lender.`;
  } else if (/^\/compare-/.test(route)) {
    description = `${h1}. Compare the use cases, tradeoffs, and questions that shape a business-purpose real estate financing decision.`;
  } else {
    description = `${h1} from Grand Funding LLC. Review business-purpose loan options, property fit, process, and direct next steps for real estate investors.`;
  }
  if (description.length > 165) {
    description = `${description.slice(0, 161).replace(/\s+\S*$/, '')}.`;
  }
  html = upsertMeta(html, 'name', 'description', description);
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'name', 'twitter:description', description);
  return html;
}

function compactMetaText(value, maximum) {
  if (value.length <= maximum) return value;
  const shortened = value
    .slice(0, maximum - 1)
    .replace(/\s+\S*$/, '')
    .replace(/[\s,;:|\-–—]+$/, '');
  return `${shortened}.`;
}

function cleanMetaPunctuation(value) {
  return value
    .replace(/([?!])\.+/g, '$1')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();
}

function normalizeMetadataLengths(html) {
  const originalTitle = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const originalDescription = attributeValue(html, 'meta', 'name', 'description');
  if (!originalTitle || !originalDescription) return html;

  let title = cleanMetaPunctuation(originalTitle);
  if (title.length > 65) {
    const topic = title.replace(/\s+\|\s+Grand Funding(?: LLC)?$/i, '');
    title = `${compactMetaText(topic, 46).replace(/\.$/, '')} | Grand Funding`;
  }

  let description = cleanMetaPunctuation(originalDescription);
  if (description.length < 100) {
    const h1 = decodeHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title);
    description = `${h1}. Practical guidance for business-purpose real estate investors from the Grand Funding Deal Desk Brief.`;
  }
  description = cleanMetaPunctuation(compactMetaText(description, 160));

  if (title !== originalTitle) {
    html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = upsertMeta(html, 'property', 'og:title', title);
    html = upsertMeta(html, 'name', 'twitter:title', title);
  }
  if (description !== originalDescription) {
    html = upsertMeta(html, 'name', 'description', description);
    html = upsertMeta(html, 'property', 'og:description', description);
    html = upsertMeta(html, 'name', 'twitter:description', description);
  }
  return html;
}

function addPremiumSocialMeta(html, name) {
  const profile = socialProfileFor(name);
  const image = `${SITE_ORIGIN}/images/social/${profile.file}`;
  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Grand Funding LLC');
  const description = attributeValue(html, 'meta', 'name', 'description');
  const canonical = canonicalUrl(html);
  html = upsertMeta(html, 'property', 'og:title', title);
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'property', 'og:type', attributeValue(html, 'meta', 'property', 'og:type') || 'website');
  if (canonical) html = upsertMeta(html, 'property', 'og:url', canonical);
  html = upsertMeta(html, 'property', 'og:image', image);
  html = upsertMeta(html, 'property', 'og:image:type', 'image/jpeg');
  html = upsertMeta(html, 'property', 'og:image:width', '1200');
  html = upsertMeta(html, 'property', 'og:image:height', '630');
  html = upsertMeta(html, 'property', 'og:image:alt', profile.alt);
  html = upsertMeta(html, 'property', 'og:site_name', 'Grand Funding LLC');
  html = upsertMeta(html, 'property', 'og:locale', 'en_US');
  html = upsertMeta(html, 'name', 'twitter:image', image);
  html = upsertMeta(html, 'name', 'twitter:image:alt', profile.alt);
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'name', 'twitter:title', title);
  html = upsertMeta(html, 'name', 'twitter:description', description);
  return html.replace(
    /<link\b(?=[^>]*\brel=["']apple-touch-icon["'])[^>]*>/i,
    '<link rel="apple-touch-icon" sizes="180x180" href="/images/appicon-180.png">'
  );
}

function addPostSocialMeta(html) {
  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Grand Funding Deal Desk Brief');
  const description = attributeValue(html, 'meta', 'name', 'description');
  const existingOpenGraph = attributeValue(html, 'meta', 'property', 'og:image');
  const existingTwitter = attributeValue(html, 'meta', 'name', 'twitter:image');
  let image = existingOpenGraph;
  if (!image || /gf-mark-light|og-grandfunding-v2/i.test(image)) image = existingTwitter;
  if (!image || !/\/images\/og\//i.test(image)) {
    image = `${SITE_ORIGIN}/images/social/${SOCIAL_PROFILES.brief.file}`;
  }
  if (image.startsWith('/')) image = `${SITE_ORIGIN}${image}`;
  const extension = image.split(/[?#]/, 1)[0].split('.').at(-1)?.toLowerCase();
  const type = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const alt = `Article cover for ${title}`;
  html = upsertMeta(html, 'property', 'og:title', title);
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'property', 'og:type', 'article');
  html = upsertMeta(html, 'property', 'og:url', canonicalUrl(html));
  html = upsertMeta(html, 'property', 'og:image', image);
  html = upsertMeta(html, 'property', 'og:image:type', type);
  html = upsertMeta(html, 'property', 'og:image:width', '1200');
  html = upsertMeta(html, 'property', 'og:image:height', '630');
  html = upsertMeta(html, 'property', 'og:image:alt', alt);
  html = upsertMeta(html, 'property', 'og:site_name', 'Grand Funding LLC');
  html = upsertMeta(html, 'property', 'og:locale', 'en_US');
  html = upsertMeta(html, 'name', 'twitter:image', image);
  html = upsertMeta(html, 'name', 'twitter:image:alt', alt);
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'name', 'twitter:title', title);
  html = upsertMeta(html, 'name', 'twitter:description', description);
  return html.replace(
    /<link\b(?=[^>]*\brel=["']apple-touch-icon["'])[^>]*>/i,
    '<link rel="apple-touch-icon" sizes="180x180" href="/images/appicon-180.png">'
  );
}

function makeSchema(html, route) {
  const canonical = canonicalUrl(html);
  if (!canonical) return html;
  if (/\bnoindex\b/i.test(attributeValue(html, 'meta', 'name', 'robots'))) {
    return html.replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
      ''
    );
  }

  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Grand Funding LLC');
  const h1 = decodeHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title);
  const description = attributeValue(html, 'meta', 'name', 'description');
  const cleanRoute = route.replace(/\.html$/, '');
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const pageId = `${canonical}#webpage`;
  const pageType = cleanRoute === '/contact'
    ? 'ContactPage'
    : cleanRoute === '/about'
      ? 'AboutPage'
      : /^(?:\/blog|\/funded-deals|\/products)$/.test(cleanRoute)
        ? 'CollectionPage'
        : 'WebPage';
  const pageNode = {
    '@type': pageType,
    '@id': pageId,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    inLanguage: 'en-US'
  };
  const graph = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Grand Funding LLC',
      url: `${SITE_ORIGIN}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/images/brand-logo-dark.webp`
      },
      telephone: '+1-602-935-0371',
      email: 'Logan@grandfundingllc.com',
      identifier: [
        { '@type': 'PropertyValue', name: 'NMLS ID', value: '2466872' },
        { '@type': 'PropertyValue', name: 'AZ MLO License', value: '1048901' }
      ],
      areaServed: [
        { '@type': 'State', name: 'Arizona' },
        { '@type': 'State', name: 'California' }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_ORIGIN}/`,
      name: 'Grand Funding LLC',
      publisher: { '@id': organizationId },
      inLanguage: 'en-US'
    },
    pageNode
  ];

  if (cleanRoute !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: title, item: canonical }
      ]
    });
  }

  if (['/', '/about', '/apply', '/contact'].includes(cleanRoute)) {
    graph.push({
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/about#logan-sullivan`,
      name: 'Logan Sullivan',
      jobTitle: 'Founder & Direct Lender',
      url: `${SITE_ORIGIN}/about`,
      image: `${SITE_ORIGIN}/images/logan/logan-portrait-720.webp`,
      worksFor: { '@id': organizationId },
      identifier: [
        { '@type': 'PropertyValue', name: 'NMLS ID', value: '2466872' },
        { '@type': 'PropertyValue', name: 'AZ MLO License', value: '1048901' }
      ]
    });
  }

  if (isFinancialProductRoute(cleanRoute)) {
    const productId = `${canonical}#financial-product`;
    pageNode.mainEntity = { '@id': productId };
    graph.push({
      '@type': 'FinancialProduct',
      '@id': productId,
      url: canonical,
      name: h1,
      description,
      category: 'Business-purpose real estate financing',
      provider: { '@id': organizationId },
      areaServed: routeAreaServed(cleanRoute),
      mainEntityOfPage: { '@id': pageId }
    });
  }

  if (/^\/glossary-/.test(cleanRoute)) {
    const termId = `${canonical}#term`;
    pageNode.mainEntity = { '@id': termId };
    graph.push({
      '@type': 'DefinedTerm',
      '@id': termId,
      url: canonical,
      name: h1,
      description,
      inDefinedTermSet: { '@id': `${SITE_ORIGIN}/products#glossary` },
      mainEntityOfPage: { '@id': pageId }
    });
  }

  if (cleanRoute === '/products') {
    const listId = `${canonical}#loan-products`;
    pageNode.mainEntity = { '@id': listId };
    graph.push({
      '@type': 'ItemList',
      '@id': listId,
      name: 'Grand Funding business-purpose loan products',
      mainEntityOfPage: { '@id': pageId },
      itemListElement: [
        ['Hard Money Loans', '#hard-money'],
        ['Construction Loans', '#construction'],
        ['Bridge Loans', '#bridge-loans'],
        ['Fix and Flip Loans', '#fix-and-flip'],
        ['Cash-Out Refinance', '#cash-out-refinance'],
        ['Land Loans', '#land-loans'],
        ['Investment Property Loans', '#investment-property'],
        ['Second Position Loans', '#second-mortgage']
      ].map(([name, fragment], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        url: `${canonical}${fragment}`
      }))
    });
  }

  if (cleanRoute === '/funded-deals') {
    const listId = `${canonical}#funded-deals`;
    pageNode.mainEntity = { '@id': listId };
    graph.push({
      '@type': 'ItemList',
      '@id': listId,
      name: 'Selected Grand Funding funded deals',
      mainEntityOfPage: { '@id': pageId },
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '$250,000 Payson bridge loan, closed in 48 hours' },
        { '@type': 'ListItem', position: 2, name: '$650,000 Scottsdale second-position loan, closed in 3 days' }
      ]
    });
  }

  const faqItems = supportedFaqItems(html, cleanRoute);
  if (faqItems.length) {
    const faqId = `${canonical}#faq`;
    graph.push({
      '@type': 'FAQPage',
      '@id': faqId,
      url: canonical,
      name: `${h1} questions and answers`,
      isPartOf: { '@id': websiteId },
      about: pageNode.mainEntity || { '@id': organizationId },
      mainEntity: faqItems
    });
  }

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  const withoutLegacySchema = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  return withoutLegacySchema.replace('</head>', `<script type="application/ld+json">${json}</script>\n</head>`);
}

function makePostSchema(html) {
  const canonical = canonicalUrl(html);
  if (!canonical) return html;
  const title = decodeHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Grand Funding Deal Desk Brief');
  const description = attributeValue(html, 'meta', 'name', 'description');
  const image = attributeValue(html, 'meta', 'property', 'og:image');
  const published = attributeValue(html, 'meta', 'property', 'article:published_time')
    || html.match(/<time\b[^>]*\bdatetime=["']([^"']+)["']/i)?.[1];
  const modified = attributeValue(html, 'meta', 'property', 'article:modified_time') || published;
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const personId = `${SITE_ORIGIN}/about#logan-sullivan`;
  const pageId = `${canonical}#webpage`;
  const articleId = `${canonical}#article`;
  const route = new URL(canonical).pathname;
  const graph = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Grand Funding LLC',
      url: `${SITE_ORIGIN}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/images/brand-logo-dark.webp` }
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Logan Sullivan',
      jobTitle: 'Founder & Direct Lender',
      url: `${SITE_ORIGIN}/about`,
      image: `${SITE_ORIGIN}/images/logan/logan-portrait-720.webp`,
      worksFor: { '@id': organizationId }
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_ORIGIN}/`,
      name: 'Grand Funding LLC',
      publisher: { '@id': organizationId },
      inLanguage: 'en-US'
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: canonical,
      name: title,
      description,
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': articleId },
      inLanguage: 'en-US'
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Deal Desk Brief', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: title, item: canonical }
      ]
    },
    {
      '@type': 'BlogPosting',
      '@id': articleId,
      headline: title,
      description,
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630
      },
      mainEntityOfPage: { '@id': pageId },
      author: { '@id': personId },
      publisher: { '@id': organizationId },
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
      inLanguage: 'en-US'
    }
  ];
  const faqItems = supportedFaqItems(html, route);
  if (faqItems.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      url: canonical,
      name: `${title} questions and answers`,
      isPartOf: { '@id': websiteId },
      about: { '@id': articleId },
      mainEntity: faqItems
    });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  const withoutLegacySchema = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );
  return withoutLegacySchema.replace('</head>', `<script type="application/ld+json">${json}</script>\n</head>`);
}

function routeNext(route) {
  if (/^\/(?:apply|contact|thanks|thanks-contact)(?:\.html)?$/.test(route)) return '';
  const research = /^\/(?:blog|faq|glossary-|compare-|press)/.test(route);
  const title = research ? 'Turn the research into a deal review.' : 'Have a property and a deadline?';
  const copy = research
    ? 'Send the property, target close date, and exit strategy. Logan reviews the actual deal.'
    : 'Talk directly with the lender who reviews the deal.';
  return `<aside class="gd-route-next" aria-label="Next step"><div><span>Direct next step</span><h2>${title}</h2><p>${copy}</p></div><div class="gd-route-next__actions"><a class="btn btn-secondary" href="tel:6029350371">Call Logan</a><a class="btn btn-primary" href="/apply">Send the deal</a></div></aside>`;
}

function removeUniversalEngagement(html, route) {
  return html.replace(
    /<section class=["'][^"']*\bengagement-block\b[^"']*["'][\s\S]*?<\/section>/gi,
    routeNext(route)
  );
}

function fixKnownMarkup(html, name) {
  html = html
    .replace(/Loan Loans/g, 'Loans')
    .replace(/\bLoan loans\b/g, 'loans')
    .replace(/California,\s*California/g, 'California')
    .replace(/(<h3 class=["']blog-card__title["'][^>]*>[^<]*)<\/h2>/gi, '$1</h3>');

  if (name === 'apply.html') {
    html = html.replace(
      /<div class=["']logan-sidebar["'][\s\S]*?(?=<div class=["']talk-to-logan["'])/i,
      ''
    );
  }
  return html;
}

function blogCardCategory(link) {
  const title = decodeHtml(link.match(/<h3\b[^>]*class=["'][^"']*\bblog-card__title\b[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '');
  if (/rates decrease|renaissance|destinations|scottsdale construction/i.test(title)) return 'markets';
  if (/qualify|how fast|hard money lenders|second mortgages|private lending|no-doc|banks say no/i.test(title)) return 'basics';
  if (/underwrite|calculating arv|investing in an llc/i.test(title)) return 'investing';
  return 'strategy';
}

function normalizeBlogGrid(html, name) {
  if (name !== 'blog.html') return html;
  const startMatch = html.match(
    /<div\b(?=[^>]*class=["'][^"']*\bblog-grid\b[^"']*["'])(?=[^>]*\bdata-blog-cards\b)[^>]*>/i
  );
  if (!startMatch || startMatch.index === undefined) return html;
  const nextSection = '<section class="section" id="hard-money-faq">';
  const nextSectionIndex = html.indexOf(nextSection, startMatch.index);
  if (nextSectionIndex === -1) return html;
  const closeMarker = '</div></div></section>';
  const gridEnd = html.lastIndexOf(closeMarker, nextSectionIndex);
  if (gridEnd === -1) return html;

  const contentStart = startMatch.index + startMatch[0].length;
  const originalGrid = html.slice(contentStart, gridEnd);
  const links = [...originalGrid.matchAll(/<a\b[^>]*class=["'][^"']*\bblog-card__link\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi)]
    .map(match => match[0]);
  if (!links.length) return html;

  const normalizedGrid = links
    .map(link => `<article class="blog-card" data-category="${blogCardCategory(link)}">${link}</article>`)
    .join('');
  html = `${html.slice(0, contentStart)}${normalizedGrid}${html.slice(gridEnd)}`;
  return html.replace(
    /(<div\b[^>]*class=["'][^"']*\bblog-count\b[^"']*["'][^>]*data-blog-count[^>]*>)[^<]*(<\/div>)/i,
    `$1${links.length} posts$2`
  );
}

function removeDuplicateAnalyticsLoaders(html) {
  if (!html.includes('Google Tag Manager (deferred)') || !html.includes('Google tag (gtag.js) deferred')) {
    return html;
  }
  return html
    .replace(
      /<!-- Google Tag Manager --><script>\(function\(w,d,s,l,i\)\{[\s\S]*?GTM-M36VM2VG[\s\S]*?<\/script><!-- End Google Tag Manager -->/i,
      ''
    )
    .replace(
      /<!-- Google tag \(gtag\.js\) --><script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18099499294["'][^>]*><\/script><script>[\s\S]*?gtag\(["']config["'],["']AW-18099499294["']\);<\/script>/i,
      ''
    );
}

async function buildHomepage(source) {
  let template = await fs.readFile(path.join(ROOT, 'templates', 'home-main.html'), 'utf8');
  const calculator = source.match(/<section class=["']loan-calc["'][\s\S]*?<\/section>/i)?.[0];
  const form = source.match(/<form\b(?=[^>]*\bname=["']pre-approval["'])[\s\S]*?<\/form>/i)?.[0];
  if (!calculator || !form) throw new Error('Homepage preservation contract failed: calculator or pre-approval form missing');
  template = template
    .replace('<!-- GRAND_ORIGINAL_CALCULATOR -->', calculator)
    .replace('<!-- GRAND_ORIGINAL_PREAPPROVAL_FORM -->', form);
  if (!template.includes('data-grand-home')) throw new Error('Homepage template is missing data-grand-home');
  return source.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, template);
}

async function transformHtml(name, source) {
  let html = name === 'index.html' ? await buildHomepage(source) : source;
  const route = routeForFile(name, html);
  html = fixKnownMarkup(html, name);
  html = normalizeBlogGrid(html, name);
  html = removeDuplicateAnalyticsLoaders(html);
  html = normalizeGeneratedDescription(html, route);
  html = normalizeMetadataLengths(html);
  html = removeUniversalEngagement(html, route);
  html = addRouteMarker(html, route);
  html = addPremiumSocialMeta(html, name);
  html = makeSchema(html, route);
  return addExperienceAssets(html);
}

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

assertSafeDist();
await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

const htmlFiles = (await fs.readdir(ROOT))
  .filter(name => name.endsWith('.html'))
  .sort();

for (const name of htmlFiles) {
  const source = await fs.readFile(path.join(ROOT, name), 'utf8');
  const transformed = await transformHtml(name, source);
  await fs.writeFile(path.join(DIST, name), transformed);
}

for (const name of ROOT_ASSETS.filter(name => name !== '404.html')) {
  await copyRequired(path.join(ROOT, name), path.join(DIST, name));
}

for (const directory of PUBLIC_DIRECTORIES) {
  await copyRequired(path.join(ROOT, directory), path.join(DIST, directory));
}

const sitemapPath = path.join(DIST, 'sitemap.xml');
const sitemap = await fs.readFile(sitemapPath, 'utf8');
await fs.writeFile(
  sitemapPath,
  sitemap.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${RELEASE_DATE}</lastmod>`)
);

const builtPosts = await walk(path.join(DIST, 'posts'));
for (const file of builtPosts.filter(file => file.endsWith('.html'))) {
  let html = await fs.readFile(file, 'utf8');
  const route = routeForFile(path.basename(file), html);
  html = fixKnownMarkup(html, path.basename(file));
  html = normalizeMetadataLengths(html);
  html = addRouteMarker(html, route);
  html = addPostSocialMeta(html);
  html = makePostSchema(html);
  html = addExperienceAssets(html);
  await fs.writeFile(file, html);
}

const files = await walk(DIST);
const bytes = (await Promise.all(files.map(async file => (await fs.stat(file)).size)))
  .reduce((sum, size) => sum + size, 0);

console.log(`Built ${files.length} public files (${(bytes / 1024 / 1024).toFixed(1)} MiB) in dist/`);
