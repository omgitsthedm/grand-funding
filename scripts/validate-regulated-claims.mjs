#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(repoRoot, ".lifi", "regulated-claims.json");
const strict = process.env.CLAIMS_STRICT === "1";

const decodeEntities = (value) => {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["mdash", "—"],
    ["nbsp", " "],
    ["ndash", "–"],
    ["quot", "\""]
  ]);

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    if (body[0] === "#") {
      const radix = body[1]?.toLowerCase() === "x" ? 16 : 10;
      const digits = radix === 16 ? body.slice(2) : body.slice(1);
      const codePoint = Number.parseInt(digits, radix);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }

    return named.get(body.toLowerCase()) ?? entity;
  });
};

const normalizePublicText = (value) =>
  decodeEntities(value)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countExact = (haystack, needle) => {
  const offsets = [];
  let cursor = 0;

  while (cursor <= haystack.length - needle.length) {
    const offset = haystack.indexOf(needle, cursor);
    if (offset === -1) break;
    offsets.push(offset);
    cursor = offset + Math.max(needle.length, 1);
  }

  return offsets;
};

const exists = async (target) => {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
};

const collectHtml = async (directory, prefix = "") => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
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

const collectSourceFiles = async () => {
  const rootEntries = await readdir(repoRoot, { withFileTypes: true });
  const rootFiles = rootEntries
    .filter(
      (entry) =>
        entry.isFile() && (entry.name.endsWith(".html") || entry.name === "llms.txt")
    )
    .map((entry) => entry.name);
  const postsRoot = path.join(repoRoot, "posts");
  const postFiles = (await exists(postsRoot))
    ? (await collectHtml(postsRoot, "posts"))
    : [];

  return [...rootFiles, ...postFiles].sort();
};

const collectSuites = async () => {
  const suites = [
    {
      id: "source",
      root: repoRoot,
      files: await collectSourceFiles()
    }
  ];
  const distRoot = path.join(repoRoot, "dist");

  if (await exists(distRoot)) {
    const distHtml = await collectHtml(distRoot);
    const distLlms = (await exists(path.join(distRoot, "llms.txt"))) ? ["llms.txt"] : [];
    const distFeed = (await exists(path.join(distRoot, "feed.xml"))) ? ["feed.xml"] : [];
    suites.push({
      id: "dist",
      root: distRoot,
      files: [...distHtml, ...distLlms, ...distFeed].sort()
    });
  }

  return suites;
};

const validateRegistry = (registry) => {
  const errors = [];
  const issueIds = new Set();
  const ruleIds = new Set();
  const occurrenceIds = new Set();
  const snapshotIssueIds = new Set();
  const snapshotRuleIds = new Set();

  if (registry.schemaVersion !== 1) {
    errors.push("Registry schemaVersion must be 1.");
  }

  for (const issue of registry.issues ?? []) {
    if (!issue.id || issueIds.has(issue.id)) {
      errors.push(`Issue id is missing or duplicated: ${issue.id ?? "(missing)"}`);
    }
    issueIds.add(issue.id);
    if (!["unresolved", "resolved"].includes(issue.status)) {
      errors.push(
        `Issue ${issue.id ?? "(missing)"} has invalid status ${
          issue.status ?? "(missing)"
        }; expected unresolved or resolved.`
      );
    }
    if (issue.strictBlock !== true) {
      errors.push(
        `Issue ${issue.id ?? "(missing)"} must remain a strict release block.`
      );
    }
    if (issue.status === "resolved") {
      if (typeof issue.approvedBy !== "string" || !issue.approvedBy.trim()) {
        errors.push(`Resolved issue ${issue.id} must record approvedBy.`);
      }
      if (
        typeof issue.approvedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}(?:T[\d:.+-]+Z?)?$/.test(issue.approvedAt)
      ) {
        errors.push(
          `Resolved issue ${issue.id} must record approvedAt as an ISO date or timestamp.`
        );
      }
      if (typeof issue.decision !== "string" || !issue.decision.trim()) {
        errors.push(`Resolved issue ${issue.id} must record the approved decision.`);
      }
      if (
        !Array.isArray(issue.sources) ||
        issue.sources.length === 0 ||
        issue.sources.some(
          (source) => typeof source !== "string" || !source.trim()
        )
      ) {
        errors.push(
          `Resolved issue ${issue.id} must record at least one approval source.`
        );
      }
    }
  }

  for (const rule of registry.rules ?? []) {
    if (!rule.id || ruleIds.has(rule.id)) {
      errors.push(`Rule id is missing or duplicated: ${rule.id ?? "(missing)"}`);
    }
    ruleIds.add(rule.id);
    try {
      new RegExp(rule.pattern, rule.flags);
    } catch (error) {
      errors.push(`Rule ${rule.id} has an invalid pattern: ${error.message}`);
    }
    if (!rule.flags?.includes("g")) {
      errors.push(`Rule ${rule.id} must include the global (g) flag.`);
    }
  }

  for (const snapshot of registry.snapshots ?? []) {
    if (!issueIds.has(snapshot.issueId)) {
      errors.push(
        `Snapshot ${snapshot.ruleId ?? "(missing)"} references unknown issue ${
          snapshot.issueId
        }.`
      );
    }
    if (!ruleIds.has(snapshot.ruleId)) {
      errors.push(
        `Snapshot for ${snapshot.issueId ?? "(missing)"} references unknown rule ${
          snapshot.ruleId
        }.`
      );
    }
    if (snapshotRuleIds.has(snapshot.ruleId)) {
      errors.push(`Rule ${snapshot.ruleId} has more than one snapshot baseline.`);
    }
    snapshotIssueIds.add(snapshot.issueId);
    snapshotRuleIds.add(snapshot.ruleId);

    for (const suiteId of ["source", "dist"]) {
      const expected = snapshot[suiteId];
      if (!expected || typeof expected !== "object") {
        errors.push(`Snapshot ${snapshot.ruleId} is missing its ${suiteId} baseline.`);
        continue;
      }
      if (!Number.isInteger(expected.matchedFiles) || expected.matchedFiles < 0) {
        errors.push(
          `Snapshot ${snapshot.ruleId} ${suiteId}.matchedFiles must be a non-negative integer.`
        );
      }
      if (!Number.isInteger(expected.matchCount) || expected.matchCount < 0) {
        errors.push(
          `Snapshot ${snapshot.ruleId} ${suiteId}.matchCount must be a non-negative integer.`
        );
      }
      if (!/^[a-f\d]{64}$/.test(expected.sha256 ?? "")) {
        errors.push(
          `Snapshot ${snapshot.ruleId} ${suiteId}.sha256 must be a lowercase SHA-256 digest.`
        );
      }
    }
  }

  for (const occurrence of registry.occurrences ?? []) {
    if (!occurrence.id || occurrenceIds.has(occurrence.id)) {
      errors.push(
        `Occurrence id is missing or duplicated: ${occurrence.id ?? "(missing)"}`
      );
    }
    occurrenceIds.add(occurrence.id);

    if (!issueIds.has(occurrence.issueId)) {
      errors.push(
        `Occurrence ${occurrence.id} references unknown issue ${occurrence.issueId}.`
      );
    }
    if (!ruleIds.has(occurrence.ruleId)) {
      errors.push(
        `Occurrence ${occurrence.id} references unknown rule ${occurrence.ruleId}.`
      );
    }
    if (
      !occurrence.path ||
      path.isAbsolute(occurrence.path) ||
      occurrence.path.split("/").includes("..")
    ) {
      errors.push(`Occurrence ${occurrence.id} has an unsafe or missing path.`);
    }
    if (!occurrence.phrase || typeof occurrence.phrase !== "string") {
      errors.push(`Occurrence ${occurrence.id} must define a non-empty phrase.`);
    }
    if (!Number.isInteger(occurrence.count) || occurrence.count < 1) {
      errors.push(`Occurrence ${occurrence.id} must define a positive integer count.`);
    }
    if (
      occurrence.distCount !== undefined &&
      (!Number.isInteger(occurrence.distCount) || occurrence.distCount < 1)
    ) {
      errors.push(
        `Occurrence ${occurrence.id} distCount must be a positive integer when set.`
      );
    }
  }

  for (const issue of registry.issues ?? []) {
    const referenced = [
      ...(issue.affirmativeOccurrenceIds ?? []),
      ...(issue.restrictiveOccurrenceIds ?? [])
    ];
    for (const occurrenceId of referenced) {
      if (!occurrenceIds.has(occurrenceId)) {
        errors.push(`Issue ${issue.id} references unknown occurrence ${occurrenceId}.`);
      }
    }
    if (
      issue.status === "unresolved" &&
      issue.strictBlock === true &&
      !snapshotIssueIds.has(issue.id)
    ) {
      errors.push(
        `Strict-block issue ${issue.id} must have an active snapshot baseline.`
      );
    }
  }

  return errors;
};

const excerptAround = (text, offset, length) => {
  const start = Math.max(0, offset - 90);
  const end = Math.min(text.length, offset + length + 130);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
};

const main = async () => {
  let registry;
  try {
    registry = JSON.parse(await readFile(registryPath, "utf8"));
  } catch (error) {
    console.error(
      `Regulated claims validation failed: could not read ${path.relative(
        repoRoot,
        registryPath
      )}: ${error.message}`
    );
    process.exitCode = 1;
    return;
  }

  const registryErrors = validateRegistry(registry);
  if (registryErrors.length > 0) {
    console.error("Regulated claims registry is invalid:");
    for (const error of registryErrors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  const suites = await collectSuites();
  const rules = new Map(
    registry.rules.map((rule) => [
      rule.id,
      {
        ...rule,
        regex: new RegExp(rule.pattern, rule.flags)
      }
    ])
  );
  const snapshotsByRule = new Map(
    registry.snapshots.map((snapshot) => [snapshot.ruleId, snapshot])
  );
  const errors = [];
  const summaries = [];

  for (const suite of suites) {
    const fileSet = new Set(suite.files);
    const textByPath = new Map();
    const coveredByPathAndRule = new Map();
    const recordsByRule = new Map(
      registry.snapshots.map((snapshot) => [snapshot.ruleId, []])
    );

    for (const relativePath of suite.files) {
      const raw = await readFile(path.join(suite.root, relativePath), "utf8");
      textByPath.set(relativePath, normalizePublicText(raw));
    }

    for (const occurrence of registry.occurrences) {
      if (!fileSet.has(occurrence.path)) {
        errors.push(
          `[${suite.id}] Missing registered public file ${occurrence.path} for ${occurrence.id}.`
        );
        continue;
      }

      const text = textByPath.get(occurrence.path);
      const offsets = countExact(text, occurrence.phrase);
      const expectedCount =
        suite.id === "dist" && Number.isInteger(occurrence.distCount)
          ? occurrence.distCount
          : occurrence.count;
      if (offsets.length !== expectedCount) {
        errors.push(
          `[${suite.id}] ${occurrence.id} in ${occurrence.path}: expected ${
            expectedCount
          } exact occurrence(s), found ${offsets.length}. Expected wording: "${
            occurrence.phrase
          }"`
        );
      }

      const coverageKey = `${occurrence.path}\u0000${occurrence.ruleId}`;
      const coverage = coveredByPathAndRule.get(coverageKey) ?? [];
      for (const offset of offsets) {
        coverage.push({
          start: offset,
          end: offset + occurrence.phrase.length,
          occurrenceId: occurrence.id
        });
      }
      coveredByPathAndRule.set(coverageKey, coverage);
    }

    let highRiskMatches = 0;
    for (const [relativePath, text] of textByPath) {
      for (const rule of rules.values()) {
        rule.regex.lastIndex = 0;
        const matches = [...text.matchAll(rule.regex)];
        highRiskMatches += matches.length;
        if (matches.length > 0 && recordsByRule.has(rule.id)) {
          recordsByRule.get(rule.id).push({
            path: relativePath,
            matches: matches.map((match) => match[0])
          });
        }
        const coverage =
          coveredByPathAndRule.get(`${relativePath}\u0000${rule.id}`) ?? [];

        for (const match of matches) {
          if (snapshotsByRule.has(rule.id)) continue;
          const start = match.index;
          const end = start + match[0].length;
          const registered = coverage.some(
            (span) => start >= span.start && end <= span.end
          );

          if (!registered) {
            errors.push(
              `[${suite.id}] Unregistered ${rule.label.toLowerCase()} wording in ${relativePath}: "${excerptAround(
                text,
                start,
                match[0].length
              )}". Register the exact reviewed phrase or remove/correct it after Logan/legal approval.`
            );
          }
        }
      }
    }

    for (const [ruleId, records] of recordsByRule) {
      const snapshot = snapshotsByRule.get(ruleId);
      const expected = snapshot[suite.id];
      if (!expected) {
        errors.push(
          `[${suite.id}] Snapshot ${ruleId} has no baseline for this output suite.`
        );
        continue;
      }

      const matchCount = records.reduce(
        (total, record) => total + record.matches.length,
        0
      );
      const digest = createHash("sha256")
        .update(JSON.stringify(records))
        .digest("hex");

      if (
        records.length !== expected.matchedFiles ||
        matchCount !== expected.matchCount ||
        digest !== expected.sha256
      ) {
        const samples = records
          .slice(0, 4)
          .map(
            (record) =>
              `${record.path}: "${record.matches
                .slice(0, 2)
                .join('" | "')}"`
          )
          .join("; ");
        errors.push(
          `[${suite.id}] ${ruleId} claim snapshot drifted. Expected ${
            expected.matchCount
          } match(es) in ${expected.matchedFiles} file(s), sha256 ${
            expected.sha256
          }; found ${matchCount} match(es) in ${
            records.length
          } file(s), sha256 ${digest}. Current samples: ${
            samples || "(no matches)"
          }. Review the changed public claim and update the baseline only after the named client/legal decision owner approves it.`
        );
      }
    }

    summaries.push({
      id: suite.id,
      files: suite.files.length,
      highRiskMatches,
      categories: recordsByRule.size
    });
  }

  const unresolvedStrictBlocks = registry.issues.filter(
    (issue) => issue.status === "unresolved" && issue.strictBlock === true
  );

  if (strict) {
    for (const issue of unresolvedStrictBlocks) {
      errors.push(
        `[strict] ${issue.id}: ${issue.summary} Decision required from ${issue.decisionOwner}: ${issue.decisionNeeded}`
      );
    }
  }

  if (errors.length > 0) {
    console.error(
      `Regulated claims validation failed (${errors.length} issue${
        errors.length === 1 ? "" : "s"
      }):`
    );
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("Regulated claims baseline validated.");
  for (const summary of summaries) {
    console.log(
      `  - ${summary.id}: ${summary.files} public file(s), ${summary.highRiskMatches} registered high-risk match(es) across ${summary.categories} strict-block categories`
    );
  }

  if (unresolvedStrictBlocks.length > 0) {
    console.log(
      `  - ${unresolvedStrictBlocks.length} unresolved client/legal decision(s) remain documented; default validation permits the exact frozen baseline.`
    );
    console.log(
      "  - Strict release validation remains blocked: run CLAIMS_STRICT=1 node scripts/validate-regulated-claims.mjs"
    );
  }
};

await main();
