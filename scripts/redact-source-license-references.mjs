#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redactPublicLicenseContents } from './redact-public-license-references.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const restrictedReference =
  /2466872|1048901|\bNMLS\b|\bMLO\b|nmlsconsumeraccess\.org/i;

async function collectHtml(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(target));
    else if (entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

const rootHtml = (await fs.readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => path.join(root, entry.name));
const postHtml = await collectHtml(path.join(root, 'posts'));
const publicSources = [
  ...rootHtml,
  ...postHtml,
  path.join(root, 'llms.txt')
].sort();

let changedFiles = 0;
let removedReferences = 0;

for (const file of publicSources) {
  const source = await fs.readFile(file, 'utf8');
  const result = redactPublicLicenseContents({ filename: file, source });
  if (restrictedReference.test(result.output)) {
    throw new Error(`${path.relative(root, file)} still contains a restricted licensing reference`);
  }
  removedReferences += result.removed;
  if (result.output === source) continue;
  await fs.writeFile(file, result.output);
  changedFiles += 1;
}

for (const relative of ['generate_pages.py', 'generate_posts.py']) {
  const file = path.join(root, relative);
  let source = await fs.readFile(file, 'utf8');

  source = source
    .replace(
      /^[^\r\n]*engagement-trust__item[^\r\n]*(?:NMLS|2466872|1048901)[^\r\n]*(?:\r?\n|$)/gim,
      ''
    )
    .replace(
      /<div class="engagement-logan__title">[\s\S]*?40\+\s*Years([^<]*)<\/div>/gi,
      '<div class="engagement-logan__title">40+ Years$1</div>'
    )
    .replace(
      /[ \t]*"hasCredential"\s*:\s*\[[\s\S]*?\],[ \t]*(?:\r?\n)?/g,
      ''
    );

  const result = redactPublicLicenseContents({ filename: file, source });
  if (restrictedReference.test(result.output)) {
    throw new Error(`${relative} still contains a restricted licensing reference`);
  }
  removedReferences += result.removed;
  const original = await fs.readFile(file, 'utf8');
  if (result.output === original) continue;
  await fs.writeFile(file, result.output);
  changedFiles += 1;
}

console.log(
  `Redacted ${removedReferences} restricted licensing references from `
  + `${changedFiles} current public source file(s)`
);
