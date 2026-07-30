#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "lightningcss";

const CSS_TAG_PATTERN =
  /<noscript>\s*<link\b[^>]*>\s*<\/noscript>|<style\b[^>]*>[\s\S]*?<\/style>|<link\b[^>]*>/gi;
const TRACKING_HOSTS = new Set([
  "www.google-analytics.com",
  "www.googletagmanager.com",
]);

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const attribute = (tag, name) => {
  const match = tag.match(
    new RegExp(
      `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "i",
    ),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
};

const classNames = (tag) =>
  new Set(attribute(tag, "class").split(/\s+/).filter(Boolean));

const walk = async (directory) => {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else files.push(target);
  }
  return files;
};

const removeTrackingConnectionHints = (html) =>
  html.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = attribute(tag, "rel").toLowerCase();
    if (!["dns-prefetch", "preconnect"].includes(rel)) return tag;
    const href = attribute(tag, "href");
    try {
      return TRACKING_HOSTS.has(new URL(href).hostname) ? "" : tag;
    } catch {
      return tag;
    }
  });

const removePartialAccessibleNames = (html) =>
  html.replace(/<a\b[^>]*>/gi, (tag) => {
    const classes = classNames(tag);
    if (!classes.has("loan-card") && !classes.has("footer-wordmark")) {
      return tag;
    }
    return tag.replace(
      /\s+aria-label\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i,
      "",
    );
  });

const repairLegacyCss = (css) =>
  css
    .replace(
      /^(@font-face[^\n]*\n(?:\/\*[^\n]*\*\/\n)?)\}\s*\n/,
      "$1",
    )
    .replace(
      /(\.brand-wordmark \.brand-suffix\{[^{}]*\})\s*}\s*(?=\/\*)/g,
      "$1\n",
    );

const localCssPath = (href, dist) => {
  if (!href || /^(?:data:|https?:|\/\/)/i.test(href)) return null;
  const pathname = new URL(href, "https://grandfunding.invalid").pathname;
  if (!pathname.endsWith(".css")) return null;
  const absolute = path.resolve(dist, `.${pathname}`);
  const relative = path.relative(dist, absolute);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative === ""
  ) {
    throw new Error(`Refusing CSS path outside dist: ${href}`);
  }
  return { absolute, pathname };
};

const cssReference = async (tag, dist) => {
  if (/^<style\b/i.test(tag)) {
    const css = repairLegacyCss(
      tag
        .replace(/^<style\b[^>]*>/i, "")
        .replace(/<\/style>$/i, ""),
    );
    return {
      css,
      key: `inline:${sha256(css)}`,
      source: "inline style",
    };
  }

  const link = tag.match(/<link\b[^>]*>/i)?.[0];
  if (!link) return null;
  const rel = attribute(link, "rel").toLowerCase();
  const as = attribute(link, "as").toLowerCase();
  if (rel !== "stylesheet" && !(rel === "preload" && as === "style")) {
    return null;
  }
  const href = attribute(link, "href");
  const local = localCssPath(href, dist);
  if (!local) return null;
  const css = repairLegacyCss(await fs.readFile(local.absolute, "utf8"));
  return {
    css,
    key: `file:${local.pathname}`,
    source: local.pathname,
  };
};

const bundlePageCss = async (html, relative, dist, bundles) => {
  const records = [];
  for (const match of html.matchAll(CSS_TAG_PATTERN)) {
    const reference = await cssReference(match[0], dist);
    if (!reference) continue;
    records.push({
      end: match.index + match[0].length,
      start: match.index,
      ...reference,
    });
  }
  if (records.length === 0) return { html, cssBytes: 0 };

  const seen = new Set();
  const ordered = records.filter((record) => {
    if (seen.has(record.key)) return false;
    seen.add(record.key);
    return true;
  });
  const input = ordered.map((record) => record.css).join("\n");
  let result;
  try {
    result = transform({
      code: Buffer.from(input),
      filename: `${relative}.css`,
      minify: true,
      sourceMap: false,
    });
  } catch (error) {
    throw new Error(`Unable to optimize CSS for ${relative}: ${error.message}`);
  }

  const digest = sha256(result.code).slice(0, 16);
  const filename = `site-${digest}.css`;
  const existing = bundles.get(filename);
  if (existing && !existing.equals(result.code)) {
    throw new Error(`Generated CSS hash collision for ${filename}`);
  }
  bundles.set(filename, result.code);

  let rebuilt = "";
  let cursor = 0;
  let inserted = false;
  for (const record of records) {
    rebuilt += html.slice(cursor, record.start);
    if (!inserted) {
      rebuilt += `<link rel="stylesheet" href="/${filename}">`;
      inserted = true;
    }
    cursor = record.end;
  }
  rebuilt += html.slice(cursor);

  return {
    cssBytes: input.length,
    html: rebuilt,
    outputCssBytes: result.code.length,
  };
};

export async function optimizeBuiltSite({ dist }) {
  const htmlFiles = (await walk(dist))
    .filter((file) => file.endsWith(".html"))
    .sort();
  const bundles = new Map();
  let changedFiles = 0;
  let cssInputBytes = 0;
  let cssOutputBytes = 0;
  let htmlBytesBefore = 0;
  let htmlBytesAfter = 0;

  for (const file of htmlFiles) {
    const relative = path.relative(dist, file).split(path.sep).join("/");
    const source = await fs.readFile(file, "utf8");
    let html = removeTrackingConnectionHints(source);
    html = removePartialAccessibleNames(html);
    const bundled = await bundlePageCss(html, relative, dist, bundles);
    html = bundled.html;
    cssInputBytes += bundled.cssBytes;
    cssOutputBytes += bundled.outputCssBytes ?? 0;
    htmlBytesBefore += Buffer.byteLength(source);
    htmlBytesAfter += Buffer.byteLength(html);
    if (html === source) continue;
    await fs.writeFile(file, html);
    changedFiles += 1;
  }

  for (const [filename, code] of [...bundles].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    await fs.writeFile(path.join(dist, filename), code);
  }

  return {
    bundleFiles: bundles.size,
    changedFiles,
    cssInputBytes,
    cssOutputBytes,
    htmlBytesRemoved: htmlBytesBefore - htmlBytesAfter,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootFlagIndex = process.argv.indexOf("--dist");
  const dist =
    rootFlagIndex >= 0
      ? path.resolve(process.argv[rootFlagIndex + 1])
      : path.resolve(process.cwd(), "dist");
  const result = await optimizeBuiltSite({ dist });
  console.log(
    `Optimized ${result.changedFiles} HTML files into ${result.bundleFiles} deterministic CSS bundles; removed ${result.htmlBytesRemoved} HTML bytes.`,
  );
}
