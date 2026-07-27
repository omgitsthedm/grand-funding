#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const sourcePublicOnly = process.env.SOURCE_PUBLIC_ONLY === '1';
const site = sourcePublicOnly
  ? process.cwd()
  : path.resolve(process.env.SITE_DIR || 'dist');
const errors = [];
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.py',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml'
]);

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});

if (!fs.existsSync(site)) throw new Error(`Site directory does not exist: ${site}`);

const files = sourcePublicOnly
  ? [
      ...fs.readdirSync(site, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
        .map(entry => path.join(site, entry.name)),
      path.join(site, 'llms.txt'),
      path.join(site, 'generate_pages.py'),
      path.join(site, 'generate_posts.py'),
      ...walk(path.join(site, 'posts')).filter(file => file.endsWith('.html')),
      ...walk(path.join(site, 'images'))
    ]
  : walk(site);

for (const file of files) {
  const relative = path.relative(site, file).replaceAll(path.sep, '/');
  const bytes = fs.readFileSync(file);
  const byteText = bytes.toString('latin1');

  for (const identifier of ['2466872', '1048901']) {
    if (byteText.includes(identifier)) {
      errors.push(`${relative}: contains restricted identifier ${identifier}`);
    }
  }

  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const text = bytes.toString('utf8');
  if (/window\.dataLayer\s*=\s*window\.dataLayer\s*\|\s*\[\]/.test(text)) {
    errors.push(`${relative}: contains a corrupted analytics logical-OR initializer`);
  }
  for (const [label, expression] of [
    ['capitalized Forward brand term', /\bForward\b/],
    ['NMLS reference', /\bNMLS\b/i],
    ['MLO reference', /\bMLO\b/i],
    ['license-verification URL', /nmlsconsumeraccess\.org/i],
    ['Forward email domain', /forward\.loans/i],
    ['Forward Loans name', /\bForward Loans\b/i],
    ['Forward Holdings name', /\bForward Holdings\b/i],
    ['licensed-compliant association claim', /\blicensed\s*,\s*compliant\b/i],
    ['Grand Funding license question', /What license does Grand Funding hold/i],
    [
      'Grand Funding licensing assertion',
      /Grand Funding(?: LLC)?[^.]{0,120}\blicens(?:e|ed|ing)\b/i
    ],
    [
      'Logan Sullivan licensing assertion',
      /Logan Sullivan[^.]{0,120}\blicens(?:e|ed|ing)\b/i
    ],
    [
      'origination licensing assertion',
      /licensed to originate real estate loans/i
    ]
  ]) {
    if (expression.test(text)) errors.push(`${relative}: contains ${label}`);
  }

  if (file.endsWith('.html')) {
    const visibleText = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(?:nbsp|middot);/gi, ' ')
      .replace(/\s+/g, ' ');
    for (const [label, expression] of [
      [
        'visible Grand Funding licensing assertion',
        /Grand Funding(?: LLC)?[^.]{0,200}\blicens(?:e|ed|ing)\b/i
      ],
      [
        'visible Logan Sullivan licensing assertion',
        /Logan Sullivan[^.]{0,200}\blicens(?:e|ed|ing)\b/i
      ]
    ]) {
      if (expression.test(visibleText)) errors.push(`${relative}: contains ${label}`);
    }
  }
}

if (errors.length) {
  console.error(
    `${sourcePublicOnly ? 'Current public source' : 'Public artifact'} `
    + `license-separation validation failed with ${errors.length} issue(s):`
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${sourcePublicOnly ? 'current public source' : 'public artifact'} contains no `
  + 'restricted NMLS/MLO identifiers, Forward references, or Grand Funding licensing assertions'
);
