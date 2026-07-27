#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml'
]);

const RESTRICTED_PUBLIC_REFERENCE =
  /2466872|1048901|\bNMLS\b|\bMLO\b|nmlsconsumeraccess\.org/i;

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function classNames(openingTag) {
  const match = openingTag.match(
    /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
  );
  return new Set((match?.[1] ?? match?.[2] ?? match?.[3] ?? '')
    .split(/\s+/)
    .filter(Boolean));
}

function matchingTagEnd(html, tagName, openingIndex) {
  const tag = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tag.lastIndex = openingIndex;
  let depth = 0;

  for (let match = tag.exec(html); match; match = tag.exec(html)) {
    if (/^<\//.test(match[0])) depth -= 1;
    else if (!/\/>$/.test(match[0])) depth += 1;
    if (depth === 0) return match.index + match[0].length;
  }

  throw new Error(`Unbalanced <${tagName}> element while redacting public licensing references`);
}

function removeBalancedElements(html, tagName, shouldRemove) {
  let output = html;
  let cursor = 0;
  let removed = 0;

  while (cursor < output.length) {
    const opening = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
    opening.lastIndex = cursor;
    const match = opening.exec(output);
    if (!match) break;

    const end = matchingTagEnd(output, tagName, match.index);
    const block = output.slice(match.index, end);
    if (shouldRemove(block, match[0])) {
      output = `${output.slice(0, match.index)}${output.slice(end)}`;
      cursor = match.index;
      removed += 1;
    } else {
      cursor = match.index + match[0].length;
    }
  }

  return { output, removed };
}

function removeSimpleElements(html, tagName, shouldRemove) {
  let removed = 0;
  const expression = new RegExp(
    `<${tagName}\\b[^>]*>(?:(?!<\\/${tagName}>)[\\s\\S])*?<\\/${tagName}>`,
    'gi'
  );
  const output = html.replace(expression, block => {
    if (!shouldRemove(block)) return block;
    removed += 1;
    return '';
  });
  return { output, removed };
}

function countRestrictedReferences(value) {
  return [
    ...(value.match(/2466872/gi) ?? []),
    ...(value.match(/1048901/gi) ?? []),
    ...(value.match(/\bNMLS\b/gi) ?? []),
    ...(value.match(/\bMLO\b/gi) ?? []),
    ...(value.match(/nmlsconsumeraccess\.org/gi) ?? [])
  ].length;
}

function removeKnownLicenseClaims(value) {
  return value
    .replace(/Ready to Move Forward\?/g, 'Ready to Discuss Your Deal?')
    .replace(/\bLicensing,[ \t]*/gi, '')
    .replace(
      /^[ \t]*-[ \t]*States licensed:[^\r\n]*(?:\r?\n|$)/gim,
      ''
    )
    .replace(
      /About Logan Sullivan,\s*NMLS\s*#\s*2466872,\s*and Grand Funding LLC/gi,
      'About Logan Sullivan and Grand Funding LLC'
    )
    .replace(
      /(<div\b[^>]*class\s*=\s*(?:"[^"]*\bengagement-logan__title\b[^"]*"|'[^']*\bengagement-logan__title\b[^']*')[^>]*>)[\s\S]*?(40\+\s*Years[^<]*)(<\/div>)/gi,
      '$1$2$3'
    )
    .replace(
      /Licensing,\s*loan product terms,\s*rate and fee ranges/gi,
      'Loan product terms, rate and fee ranges'
    )
    .replace(
      /Grand Funding LLC is a direct private hard money lender licensed in Arizona and California\./gi,
      'Grand Funding LLC is a direct private hard money lender serving real estate investors in Arizona and California.'
    )
    .replace(
      /,\s*licensed to originate real estate loans in Arizona and California/gi,
      ''
    )
    .replace(
      /\.[ \t]*licensed in Arizona and California\./gi,
      '.'
    )
    .replace(
      /\s*\(the only states where Grand Funding is licensed to originate loans\)/gi,
      ''
    )
    .replace(
      /Logan Sullivan is the licensed mortgage professional\s*\(\s*NMLS\s*#\s*2466872\s*\)\s*behind Grand Funding LLC\./gi,
      'Logan Sullivan is the founder of Grand Funding LLC.'
    )
    .replace(
      /[ \t]*(?:He|Logan)[ \t]+holds[ \t]+NMLS[ \t]+license[ \t]*#[ \t]*2466872[ \t]+and[ \t]+(?:AZ|Arizona)[ \t]+MLO[ \t]+license[ \t]*#[ \t]*1048901\./gi,
      ''
    )
    .replace(
      /including\s+NMLS Consumer Access,\s*state regulator websites,\s*and informational resources/gi,
      'including state regulator websites and informational resources'
    );
}

function scrubRestrictedTokens(value) {
  let output = value;
  const labeledReferences = [
    /(?:[ \t]*(?:,|(?<!\|)\|(?!\|)|·|—|-|&middot;)[ \t]*)?NMLS(?:[ \t]+(?:ID|License))?[ \t]*:?[ \t]*#?[ \t]*(?:<strong>)?[ \t]*2466872[ \t]*(?:<\/strong>)?/gi,
    /(?:[ \t]*(?:,|(?<!\|)\|(?!\|)|·|—|-|&middot;)[ \t]*)?(?:AZ|Arizona)[ \t]+MLO(?:[ \t]+License)?[ \t]*:?[ \t]*#?[ \t]*(?:<strong>)?[ \t]*1048901[ \t]*(?:<\/strong>)?/gi,
    /(?:[ \t]*(?:,|(?<!\|)\|(?!\|)|·|—|-|&middot;)[ \t]*)?Mortgage Loan Originator License[ \t]*#?[ \t]*(?:<strong>)?[ \t]*1048901[ \t]*(?:<\/strong>)?/gi,
    /(?:[ \t]*(?:,|(?<!\|)\|(?!\|)|·|—|-|&middot;)[ \t]*)?License[ \t]*#[ \t]*(?:<strong>)?[ \t]*1048901[ \t]*(?:<\/strong>)?/gi
  ];

  for (const expression of labeledReferences) output = output.replace(expression, '');

  output = output
    .replace(/https?:\/\/(?:www\.)?nmlsconsumeraccess\.org(?:\/[^\s"'<>)]*)?/gi, '')
    .replace(/\bNMLS(?:\s+Consumer\s+Access)?\b/gi, '')
    .replace(/\b(?:AZ|Arizona)\s+MLO(?:\s+License)?\b/gi, '')
    .replace(/\bMLO\b/gi, '')
    .replace(/2466872|1048901/gi, '')
    .replace(/<strong>\s*<\/strong>/gi, '')
    .replace(
      /[ \t]*(?:&middot;|·|(?<!\|)\|(?!\|))[ \t]*(?=(?:&middot;|·|(?<!\|)\|(?!\|)|<\/|$))/gi,
      ''
    )
    .replace(
      /[ \t]*(?:&middot;|·|(?<!\|)\|(?!\|))[ \t]*(?=[,.;:])/gi,
      ''
    )
    .replace(/,[ \t]*,/g, ',')
    .replace(/\.[ \t]+\.(?=[ \t]*[A-Z])/g, '.');

  return output;
}

function cleanSchemaValue(value, key = '') {
  if (/^(?:identifier|hasCredential)$/i.test(key)) return undefined;
  if (typeof value === 'string') {
    const cleaned = scrubRestrictedTokens(removeKnownLicenseClaims(value)).trim();
    return cleaned || undefined;
  }
  if (Array.isArray(value)) {
    const cleaned = value
      .map(item => cleanSchemaValue(item))
      .filter(item => item !== undefined);
    return cleaned.length ? cleaned : undefined;
  }
  if (!value || typeof value !== 'object') return value;
  if (
    value['@type'] === 'Question'
    && /What license does Grand Funding hold/i.test(String(value.name || ''))
  ) {
    return undefined;
  }

  const cleaned = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    const next = cleanSchemaValue(childValue, childKey);
    if (next !== undefined) cleaned[childKey] = next;
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

function cleanJsonLdScripts(html) {
  return html.replace(
    /<script\b([^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json')[^>]*)>([\s\S]*?)<\/script>/gi,
    (script, attributes, rawJson) => {
      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        return script;
      }
      const cleaned = cleanSchemaValue(parsed);
      if (cleaned === undefined) return '';
      const cleanedJson = JSON.stringify(cleaned);
      if (cleanedJson === JSON.stringify(parsed)) return script;
      return `<script${attributes}>${cleanedJson}</script>`;
    }
  );
}

function redactHtml(html) {
  const before = countRestrictedReferences(html);
  let output = cleanJsonLdScripts(removeKnownLicenseClaims(html));
  const licensingSection = output.match(
    /<h2\b[^>]*id\s*=\s*(?:"licensing"|'licensing')[^>]*>\s*(\d+)\./i
  );
  const removedSectionNumber = licensingSection
    ? Number.parseInt(licensingSection[1], 10)
    : null;

  output = output
    .replace(
      /<a\b[^>]*href\s*=\s*(?:"[^"]*nmlsconsumeraccess\.org[^"]*"|'[^']*nmlsconsumeraccess\.org[^']*')[^>]*>[\s\S]*?<\/a>/gi,
      ''
    )
    .replace(
      /<li\b[^>]*>\s*<a\b[^>]*href\s*=\s*(?:"#licensing"|'#licensing')[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi,
      ''
    )
    .replace(
      /<h3\b[^>]*>\s*License Verification\s*<\/h3>/gi,
      ''
    );

  ({ output } = removeBalancedElements(output, 'div', (block, openingTag) => {
    const classes = classNames(openingTag);
    if (classes.has('footer-license') || classes.has('talk-to-logan__nmls')) {
      return true;
    }
    if (classes.has('engagement-trust__item') && RESTRICTED_PUBLIC_REFERENCE.test(block)) {
      return true;
    }
    return classes.has('faq-item') && /What license does Grand Funding hold\?/i.test(block);
  }));

  output = output.replace(
    /<h2\b[^>]*id\s*=\s*(?:"licensing"|'licensing')[^>]*>[\s\S]*?(?=<h2\b)/gi,
    ''
  );
  if (removedSectionNumber !== null) {
    output = output.replace(
      /(<h2\b[^>]*>\s*)(\d+)(\.)/gi,
      (heading, prefix, rawNumber, suffix) => {
        const number = Number.parseInt(rawNumber, 10);
        return number > removedSectionNumber
          ? `${prefix}${number - 1}${suffix}`
          : heading;
      }
    );
  }

  for (const tagName of ['span', 'li', 'tr']) {
    ({ output } = removeSimpleElements(
      output,
      tagName,
      block => RESTRICTED_PUBLIC_REFERENCE.test(block)
    ));
  }

  ({ output } = removeSimpleElements(output, 'p', block => {
    if (!RESTRICTED_PUBLIC_REFERENCE.test(block)) return false;
    return (
      /nmlsconsumeraccess\.org/i.test(block)
      || /licensed mortgage professional/i.test(block)
      || /Grand Funding LLC is licensed and regulated/i.test(block)
      || /operating legal entity/i.test(block)
      || /(?:He|Logan)\s+holds\s+NMLS/i.test(block)
      || (
        /2466872/i.test(block)
        && /1048901/i.test(block)
        && /\blicens/i.test(block)
      )
    );
  }));

  output = scrubRestrictedTokens(removeKnownLicenseClaims(output));

  if (RESTRICTED_PUBLIC_REFERENCE.test(output)) {
    throw new Error('Restricted licensing reference survived HTML redaction');
  }

  return { output, removed: before };
}

function redactText(value) {
  const before = countRestrictedReferences(value);
  const withoutKnownClaims = removeKnownLicenseClaims(value);
  if (before === 0 && withoutKnownClaims === value) {
    return { output: value, removed: 0 };
  }

  const output = scrubRestrictedTokens(withoutKnownClaims)
    .split('\n')
    .filter(line => !/^\s*[-*|·,:#]+\s*$/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  if (RESTRICTED_PUBLIC_REFERENCE.test(output)) {
    throw new Error('Restricted licensing reference survived text redaction');
  }

  return { output, removed: before };
}

export function redactPublicLicenseContents({ filename, source }) {
  return filename.endsWith('.html') ? redactHtml(source) : redactText(source);
}

export async function redactPublicLicenseReferences({ dist }) {
  const files = await walk(dist);
  let changedFiles = 0;
  let removedReferences = 0;

  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const source = await fs.readFile(file, 'utf8');
    const result = redactPublicLicenseContents({ filename: file, source });
    removedReferences += result.removed;
    if (result.output === source) continue;
    await fs.writeFile(file, result.output);
    changedFiles += 1;
  }

  return { changedFiles, removedReferences };
}
