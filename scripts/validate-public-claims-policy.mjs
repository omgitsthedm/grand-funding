#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = path.join(repoRoot, ".lifi", "public-claims-policy.json");

const decodeEntities = (value) => {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["mdash", "—"],
    ["nbsp", " "],
    ["ndash", "–"],
    ["quot", '"'],
  ]);

  return String(value).replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, body) => {
      if (!body.startsWith("#")) return named.get(body.toLowerCase()) ?? entity;
      const hexadecimal = body[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(
        body.slice(hexadecimal ? 2 : 1),
        hexadecimal ? 16 : 10,
      );
      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : entity;
    },
  );
};

const publicText = (raw) => {
  // The editorial content date (sitemap lastmod source) is not public copy.
  raw = raw.replace(/<meta\b[^>]*\bname\s*=\s*["']gf-content-updated["'][^>]*>/gi, " ");
  const metadata = [
    ...raw.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi),
    ...raw.matchAll(
      /<meta\b[^>]*\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
    ),
  ]
    .map((match) => match[1] ?? match[2] ?? "")
    .join(" ");
  // Structured data is public, machine-read copy: scan it with the visible text.
  const structured = [
    ...raw.matchAll(
      /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ]
    .map((match) => match[1].replace(/\\n/g, " ").replace(/["{}\[\],]/g, " "))
    .join(" ");
  const visible = raw
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(`${metadata} ${structured} ${visible}`).replace(/\s+/g, " ").trim();
};

const exists = async (target) =>
  fs
    .stat(target)
    .then(() => true)
    .catch((error) => {
      if (error?.code === "ENOENT") return false;
      throw error;
    });

const collectHtml = async (directory, prefix = "") => {
  const files = [];
  if (!(await exists(directory))) return files;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtml(absolute, relative)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative);
    }
  }
  return files.sort();
};

// Every served plain-text/JSON surface (llms.txt, robots.txt, key files, the web
// manifest, feeds) is public copy and must pass the same fail-closed checks.
const SERVED_TEXT = /\.(?:txt|json|webmanifest|xml)$/i;
const NON_PUBLIC_TEXT = new Set(["package.json", "package-lock.json"]);
const servedTextFiles = async (directory) =>
  (await fs.readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isFile() &&
        SERVED_TEXT.test(entry.name) &&
        !NON_PUBLIC_TEXT.has(entry.name),
    )
    .map((entry) => entry.name);

const sourceFiles = async () => {
  const rootHtml = (await fs.readdir(repoRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name);
  return [
    ...rootHtml,
    ...(await collectHtml(path.join(repoRoot, "posts"), "posts")),
    ...(await servedTextFiles(repoRoot)),
  ].sort();
};

const suites = [
  { id: "source", root: repoRoot, files: await sourceFiles() },
];
if (await exists(path.join(repoRoot, "dist"))) {
  const distRoot = path.join(repoRoot, "dist");
  const files = [
    ...(await collectHtml(distRoot)),
    ...(await servedTextFiles(distRoot)),
  ];
  suites.push({ id: "dist", root: distRoot, files: files.sort() });
}

const policy = JSON.parse(await fs.readFile(policyPath, "utf8"));
const errors = [];

if (policy.schemaVersion !== 1) {
  errors.push("public claims policy schemaVersion must be 1");
}

const compile = (rule) => {
  try {
    return new RegExp(rule.pattern, rule.flags);
  } catch (error) {
    errors.push(`${rule.id} has an invalid regular expression: ${error.message}`);
    return null;
  }
};

const hardBlocks = (policy.hardBlocks ?? []).map((rule) => ({
  ...rule,
  expression: compile(rule),
  allowedContexts: Array.isArray(rule.allowedContexts) ? rule.allowedContexts : [],
}));

// A match is exempt only when it sits wholly inside an exact, reviewed phrase
// recorded on the rule (for example, a legally required response period).
const allowedSpans = (text, phrases) => {
  const spans = [];
  for (const phrase of phrases) {
    let cursor = text.indexOf(phrase);
    while (cursor !== -1) {
      spans.push([cursor, cursor + phrase.length]);
      cursor = text.indexOf(phrase, cursor + 1);
    }
  }
  return spans;
};
const evidenceSurfaces = (policy.evidenceSurfaces ?? []).map((rule) => ({
  ...rule,
  expression: compile(rule),
}));

const excerpt = (text, match) => {
  const start = Math.max(0, match.index - 90);
  const end = Math.min(text.length, match.index + match[0].length + 130);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
};

for (const suite of suites) {
  const recordsByEvidenceRule = new Map(
    evidenceSurfaces.map((rule) => [rule.id, []]),
  );

  for (const relative of suite.files) {
    const raw = await fs.readFile(path.join(suite.root, relative), "utf8");
    const text = relative.endsWith(".html")
      ? publicText(raw)
      : relative.endsWith(".xml")
        ? publicText(raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"))
        : decodeEntities(raw).replace(/\s+/g, " ").trim();

    for (const rule of hardBlocks) {
      if (!rule.expression) continue;
      rule.expression.lastIndex = 0;
      const spans = allowedSpans(text, rule.allowedContexts);
      const matches = [...text.matchAll(rule.expression)].filter(
        (match) =>
          !spans.some(
            ([start, end]) =>
              match.index >= start && match.index + match[0].length <= end,
          ),
      );
      rule.expression.lastIndex = 0;
      for (const match of matches) {
        errors.push(
          `[${suite.id}] ${relative}: ${rule.label}: "${excerpt(text, match)}"`,
        );
      }
    }

    for (const rule of evidenceSurfaces) {
      if (!rule.expression) continue;
      rule.expression.lastIndex = 0;
      const matches = [...text.matchAll(rule.expression)].map(
        (match) => match[0],
      );
      rule.expression.lastIndex = 0;
      if (matches.length > 0) {
        recordsByEvidenceRule.get(rule.id).push({ path: relative, matches });
      }
    }
  }

  for (const rule of evidenceSurfaces) {
    const records = recordsByEvidenceRule.get(rule.id);
    const snapshot = rule.snapshots?.[suite.id];
    if (!snapshot) {
      errors.push(`[${suite.id}] ${rule.id} is missing an evidence snapshot`);
      continue;
    }
    const matchCount = records.reduce(
      (total, record) => total + record.matches.length,
      0,
    );
    const digest = createHash("sha256")
      .update(JSON.stringify(records))
      .digest("hex");

    if (
      records.length !== snapshot.matchedFiles ||
      matchCount !== snapshot.matchCount ||
      digest !== snapshot.sha256
    ) {
      errors.push(
        `[${suite.id}] ${rule.id} evidence surface drifted: expected ${snapshot.matchCount} match(es) in ${snapshot.matchedFiles} file(s), sha256 ${snapshot.sha256}; found ${matchCount} match(es) in ${records.length} file(s), sha256 ${digest}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(
    `Public claims policy validation failed with ${errors.length} issue(s):`,
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${hardBlocks.length} fail-closed public claim categories and ${evidenceSurfaces.length} frozen evidence surfaces across ${suites
    .map((suite) => `${suite.id} (${suite.files.length} files)`)
    .join(" and ")}.`,
);
