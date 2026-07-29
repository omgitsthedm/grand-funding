#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const approvalRecord = path.join(
  root,
  "docs",
  "GRAND-FUNDING-CLIENT-WEBSITE-APPROVAL-2026-07-27.md",
);
const surveyHash =
  "d0f6e1bfd394cd28878e80f5303793318d17af598e2d440d0b8c2727ac442bff";
const occupancySentence =
  "Owner-occupied, primary-residence, or consumer-purpose transactions, if available, are considered only in limited, case-specific circumstances and may require additional documentation and review.";
const volumeSentence =
  "We've funded over 1,500 loans totaling more than $350 million.";
const expectedHomeProducts = [
  "Fix & Flip Loans",
  "Bridge Loans",
  "Construction Loans",
  "Cash-Out Refinance",
  "Land Loans",
  "Second Position Loans",
];

const errors = [];

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
      if (body[0] !== "#") return named.get(body.toLowerCase()) ?? entity;
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

const compact = (value) => decodeEntities(value).replace(/\s+/g, " ").trim();

const publicText = (raw) => {
  const metadata = [
    ...raw.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi),
    ...raw.matchAll(
      /<meta\b[^>]*\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi,
    ),
  ]
    .map((match) => match[1] ?? match[2] ?? "")
    .join(" ");
  const visible = raw
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return compact(`${metadata} ${visible}`);
};

const exists = async (target) =>
  fs
    .stat(target)
    .then(() => true)
    .catch((error) => {
      if (error?.code === "ENOENT") return false;
      throw error;
    });

const walkHtml = async (directory, prefix = "") => {
  if (!(await exists(directory))) return [];
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtml(target, relative)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative);
    }
  }
  return files.sort();
};

const sourceFiles = async () => {
  const rootHtml = (await fs.readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name);
  return [
    ...rootHtml,
    ...(await walkHtml(path.join(root, "posts"), "posts")),
    "llms.txt",
  ].sort();
};

const distFiles = async () => {
  const dist = path.join(root, "dist");
  if (!(await exists(dist))) return [];
  const files = await walkHtml(dist);
  if (await exists(path.join(dist, "llms.txt"))) files.push("llms.txt");
  return files.sort();
};

const countExact = (haystack, needle) => {
  let count = 0;
  let cursor = 0;
  while (cursor <= haystack.length - needle.length) {
    const offset = haystack.indexOf(needle, cursor);
    if (offset < 0) break;
    count += 1;
    cursor = offset + needle.length;
  }
  return count;
};

const excerpt = (text, expression) => {
  const match = expression.exec(text);
  expression.lastIndex = 0;
  if (!match) return "";
  const start = Math.max(0, match.index - 80);
  const end = Math.min(text.length, match.index + match[0].length + 120);
  return compact(text.slice(start, end));
};

const assertAbsent = (suite, relative, text, label, expression) => {
  expression.lastIndex = 0;
  if (!expression.test(text)) return;
  errors.push(
    `[${suite}] ${relative}: ${label}: "${excerpt(text, expression)}"`,
  );
};

const suites = [{ id: "source", directory: root, files: await sourceFiles() }];
const generated = await distFiles();
if (generated.length > 0) {
  suites.push({
    id: "dist",
    directory: path.join(root, "dist"),
    files: generated,
  });
}

for (const suite of suites) {
  const records = [];
  for (const relative of suite.files) {
    const raw = await fs.readFile(path.join(suite.directory, relative), "utf8");
    const text = relative.endsWith(".html") ? publicText(raw) : compact(raw);
    records.push({ relative, raw, text });

    for (const [label, expression] of [
      [
        "contains a Forward brand or domain reference",
        /\bForward(?: Loans| Holdings)?\b|forward\.loans/,
      ],
      [
        "contains an NMLS or MLO reference",
        /\bNMLS\b|\bMLO\b|2466872|1048901/i,
      ],
      [
        "contains a direct Google Ads tag",
        /\bAW-\d+\b|googleadservices\.com|googleads\.g\.doubleclick\.net/i,
      ],
      [
        "contains a removed investment-property form option",
        /<option>\s*Investment Property\s*<\/option>/i,
      ],
      [
        "contains a removed loan-estimate calculator marker",
        /\bdata-loan-calc\b|data-calc\s*=\s*["']loan-amount["']/i,
      ],
    ]) {
      assertAbsent(suite.id, relative, raw, label, expression);
    }

    for (const [label, expression] of [
      [
        "contains an unapproved best/premier-lender comparison",
        /\b(?:best|premier) hard money lenders?\b/i,
      ],
      [
        "contains service-area wording beyond the approved states",
        /\bnationwide\b|\bHonolulu,\s*HI\b/i,
      ],
      [
        "contains categorical owner-occupancy or consumer-purpose wording",
        /\b(?:do not|does not|not)\s+(?:originate|offer|fund)[^.]{0,90}\b(?:owner[- ]occupied|primary residence|consumer-purpose)\b|\b(?:owner[- ]occupied|primary residences?)\b[^.]{0,90}\b(?:are|is)\s+(?:excluded|not eligible)\b/i,
      ],
      [
        "contains a published numeric rate, APR, or points claim",
        /(?:\b(?:rates?|APR|origination points?|points?)\b.{0,70}?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%|\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%.{0,70}?\b(?:rates?|APR|origination points?|points?)\b|\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s+(?:origination\s+)?points?\b)/i,
      ],
      [
        "contains a published numeric loan limit or range",
        /\b(?:loans?|loan amounts?|loan range|minimum|maximum|max(?:imum)? loan|lend|fund(?:ing)?)\b.{0,70}?\b(?:from|between|up to|minimum|maximum|max)\b.{0,35}?\$[\d,.]+|\b(?:minimum|maximum|max(?:imum)? loan|loan range)\b.{0,60}?\$[\d,.]+/i,
      ],
      [
        "contains a published numeric leverage or borrower-contribution claim",
        /(?:\b(?:LTV|LTC|CLTV|leverage)\b.{0,70}?\d+(?:\.\d+)?%|\d+(?:\.\d+)?%[^.]{0,70}\b(?:LTV|LTC|CLTV|leverage)\b|\b(?:requires?|contribution|down payment|skin in the game)\b.{0,70}?\d+(?:\.\d+)?%|\d+(?:\.\d+)?%[^.]{0,70}\b(?:from the borrower|down payment|borrower contribution)\b)/i,
      ],
      [
        "contains a removed standalone investment-property product offer",
        /\bInvestment Property Loans?\b/i,
      ],
      [
        "contains a malformed sanitizer fragment",
        /\b(?:amountin|amountThis|reviewin|reviewThis|provided after deal review provided after deal review)\b/i,
      ],
    ]) {
      assertAbsent(suite.id, relative, text, label, expression);
    }
  }

  const corpus = records.map((record) => record.text).join(" ");
  const volumeCount = countExact(corpus, volumeSentence);
  if (volumeCount !== 1) {
    errors.push(
      `[${suite.id}] expected the client-attested volume statement exactly once; found ${volumeCount}`,
    );
  }
  if (!corpus.includes(occupancySentence)) {
    errors.push(
      `[${suite.id}] missing the approved limited, case-specific occupancy wording`,
    );
  }
  if (
    !/\bStatewide in Arizona and California\b/i.test(corpus) ||
    !/\bArizona\b/i.test(corpus) ||
    !/\bCalifornia\b/i.test(corpus)
  ) {
    errors.push(
      `[${suite.id}] missing the approved statewide Arizona and California service-area wording`,
    );
  }

  const home = records.find((record) => record.relative === "index.html");
  if (!home) {
    errors.push(`[${suite.id}] index.html is missing`);
    continue;
  }
  const homeProducts = [
    ...home.raw.matchAll(
      /<h3\b[^>]*class\s*=\s*(?:"[^"]*\bproduct-title\b[^"]*"|'[^']*\bproduct-title\b[^']*')[^>]*>([\s\S]*?)<\/h3>/gi,
    ),
  ].map((match) => compact(match[1].replace(/<[^>]+>/g, " ")));
  if (JSON.stringify(homeProducts) !== JSON.stringify(expectedHomeProducts)) {
    errors.push(
      `[${suite.id}] homepage product cards must be exactly the six approved products; found ${JSON.stringify(homeProducts)}`,
    );
  }
  for (const marker of [
    'data-project-calc="purchase"',
    'data-project-calc="rehab"',
    'data-project-calc="value"',
    'data-project-calc="cost"',
    'data-project-calc="spread"',
  ]) {
    if (!home.raw.includes(marker)) {
      errors.push(
        `[${suite.id}] homepage project calculator is missing ${marker}`,
      );
    }
  }
}

if (!(await exists(approvalRecord))) {
  errors.push("source approval record is missing");
} else {
  const record = await fs.readFile(approvalRecord, "utf8");
  if (!record.includes(surveyHash)) {
    errors.push(
      "source approval record does not preserve the supplied survey hash",
    );
  }
  for (const answer of [
    "Only in specific cases",
    "Remove these claims for now",
    "Yes, the current timing is approved",
    "Arizona statewide; California statewide",
    "Keep both, records support them",
    "I need to confirm",
    "We are not using Google Ads yet",
    "Approved to update regulated website claims from these answers",
  ]) {
    if (!record.includes(answer)) {
      errors.push(`source approval record is missing exact answer: ${answer}`);
    }
  }
}

if (errors.length > 0) {
  console.error(
    `Client website approval validation failed with ${errors.length} issue(s):`,
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated the 2026-07-27 client website approval across ${suites
    .map((suite) => `${suite.id} (${suite.files.length} files)`)
    .join(" and ")}.`,
);
