#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".netlify",
  "dist",
  "node_modules",
  "artifacts"
]);

async function walk(directory, relative = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const nextRelative = relative
      ? path.posix.join(relative, entry.name)
      : entry.name;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target, nextRelative));
    else files.push(nextRelative);
  }
  return files;
}

async function totalBytes(files) {
  const sizes = await Promise.all(
    files.map(async file => (await fs.stat(path.join(root, file))).size)
  );
  return sizes.reduce((sum, value) => sum + value, 0);
}

const allFiles = await walk(root);
const assets = allFiles.filter(file => file.startsWith("assets/"));
const images = allFiles.filter(file => file.startsWith("images/"));
const searchable = allFiles.filter(
  file =>
    /\.(?:css|html|js|json|md|mjs|txt|xml|yml)$/i.test(file) &&
    !file.startsWith("assets/") &&
    !file.startsWith("images/")
);
const corpus = (
  await Promise.all(
    searchable.map(async file => `${file}\n${await fs.readFile(path.join(root, file), "utf8")}`)
  )
).join("\n");
const unreferencedImages = images.filter(file => {
  const basename = path.posix.basename(file);
  return !corpus.includes(file) && !corpus.includes(`/${file}`) && !corpus.includes(basename);
});

const report = {
  assets: {
    files: assets.length,
    bytes: await totalBytes(assets)
  },
  images: {
    files: images.length,
    bytes: await totalBytes(images),
    unreferencedCandidates: unreferencedImages.length,
    unreferencedBytes: await totalBytes(unreferencedImages)
  },
  rootCssCandidates: ["premium.css", "styles.css"].filter(file =>
    allFiles.includes(file)
  ),
  policy:
    "Report only. Verify external URL and source-asset contracts before deleting."
};

console.log(JSON.stringify(report, null, 2));
