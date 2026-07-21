#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

const ROOT_ASSETS = [
  '404.html',
  'apply.css',
  'blog.css',
  'brand-tokens.css',
  'consent.js',
  'conversion-tools.css',
  'conversion-tools.js',
  'favicon.ico',
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

const PUBLIC_DIRECTORIES = ['fonts', 'images', 'posts'];

function assertSafeDist() {
  if (path.dirname(DIST) !== ROOT || path.basename(DIST) !== 'dist') {
    throw new Error(`Refusing unsafe output path: ${DIST}`);
  }
}

async function copyRequired(source, destination) {
  await fs.access(source);
  await fs.cp(source, destination, { recursive: true, preserveTimestamps: true });
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

for (const name of [...htmlFiles, ...ROOT_ASSETS.filter(name => name !== '404.html')]) {
  await copyRequired(path.join(ROOT, name), path.join(DIST, name));
}

for (const directory of PUBLIC_DIRECTORIES) {
  await copyRequired(path.join(ROOT, directory), path.join(DIST, directory));
}

const files = await walk(DIST);
const bytes = (await Promise.all(files.map(async file => (await fs.stat(file)).size)))
  .reduce((sum, size) => sum + size, 0);

console.log(`Built ${files.length} public files (${(bytes / 1024 / 1024).toFixed(1)} MiB) in dist/`);
