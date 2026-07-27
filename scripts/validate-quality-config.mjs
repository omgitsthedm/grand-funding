#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";

const root = process.cwd();
const errors = [];
const requiredFiles = [
  ".lifi/quality.yml",
  ".lifi/dead-code-candidates.yml",
  ".lifi/debt-and-exceptions.yml",
  ".lifi/regulated-claims.json",
  ".node-version"
];
const requiredScripts = [
  "quality:fast",
  "quality:full",
  "quality:release",
  "quality:live",
  "quality:maintenance",
  "test:a11y",
  "test:conversion",
  "test:cross-browser",
  "validate:claims",
  "validate:license-separation",
  "verify:netlify-target"
];

const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8");

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const loadYaml = relative => {
  if (!fs.existsSync(path.join(root, relative))) return null;
  const document = parseDocument(read(relative), {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true
  });
  if (document.errors.length) {
    for (const error of document.errors) {
      errors.push(`${relative}: ${error.message}`);
    }
    return null;
  }
  return document.toJS();
};

const sameMembers = (actual, expected) =>
  Array.isArray(actual) &&
  actual.length === expected.length &&
  [...actual].sort().every((value, index) => value === [...expected].sort()[index]);

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) {
    errors.push(`missing required quality file ${relative}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
for (const name of requiredScripts) {
  assert(Boolean(packageJson.scripts?.[name]), `missing npm script ${name}`);
}

const expectedComposition = {
  "quality:fast": [
    "npm run build",
    "npm run validate",
    "npm run validate:seo",
    "npm run validate:license-separation",
    "npm run validate:claims",
    "npm run validate:quality"
  ],
  "quality:full": ["npm run quality:fast", "npm run test:browser"],
  "quality:release": [
    "npm run quality:fast",
    "npm run validate:claims:release",
    "npm run test:browser",
    "npm run verify:netlify-target"
  ],
  "quality:live": ["scripts/run-site-qa.mjs", "--live"],
  "quality:maintenance": [
    "npm run validate:quality",
    "scripts/audit-dead-code.mjs"
  ]
};
for (const [name, fragments] of Object.entries(expectedComposition)) {
  const command = packageJson.scripts?.[name] || "";
  for (const fragment of fragments) {
    assert(
      command.includes(fragment),
      `${name} is missing required step: ${fragment}`
    );
  }
}

const quality = loadYaml(".lifi/quality.yml");
if (quality) {
  assert(quality.version === 1, "quality.yml version must be 1");
  assert(quality.project === "grand-funding", "quality.yml project is incorrect");
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(String(quality.updated || "")),
    "quality.yml updated must be YYYY-MM-DD"
  );

  const expectedCommands = {
    fast: "npm run quality:fast",
    full: "npm run quality:full",
    release: "npm run quality:release",
    live: "BASE_URL=https://www.grandfundingllc.com npm run quality:live",
    maintenance: "npm run quality:maintenance"
  };
  for (const [name, command] of Object.entries(expectedCommands)) {
    assert(
      quality.commands?.[name] === command,
      `quality.yml commands.${name} must equal ${command}`
    );
  }

  for (const gate of ["fast", "full", "release"]) {
    assert(
      Array.isArray(quality.required_gates?.[gate]) &&
        quality.required_gates[gate].length > 0,
      `quality.yml required_gates.${gate} must be a non-empty list`
    );
  }

  const nodeVersion = read(".node-version").trim();
  assert(
    quality.runtime?.target_node === nodeVersion,
    "quality.yml runtime.target_node must match .node-version"
  );
  assert(
    packageJson.engines?.node === ">=24 <27",
    "package.json engines.node must remain >=24 <27"
  );
  assert(
    quality.runtime?.package_manager === "npm",
    "quality.yml runtime.package_manager must be npm"
  );
  assert(
    quality.runtime?.publish_directory === "dist",
    "quality.yml runtime.publish_directory must be dist"
  );
  assert(
    sameMembers(quality.runtime?.browsers, [
      "chromium",
      "firefox",
      "webkit"
    ]),
    "quality.yml runtime.browsers must be chromium, firefox, and webkit"
  );
  for (const browser of quality.runtime?.browsers || []) {
    assert(
      packageJson.scripts?.["playwright:install"]?.includes(browser),
      `playwright:install is missing ${browser}`
    );
  }

  assert(
    quality.production?.site_id ===
      "055c5942-aeaa-478a-9508-a34406994d5d",
    "quality.yml production.site_id is incorrect"
  );
  assert(
    quality.production?.canonical_origin ===
      "https://www.grandfundingllc.com",
    "quality.yml production.canonical_origin is incorrect"
  );
  assert(
    quality.production?.deploy_requires_explicit_user_authorization === true,
    "quality.yml must require explicit deployment authorization"
  );
  for (const section of ["brand", "experience", "forbidden_without_client_approval"]) {
    assert(
      Array.isArray(quality.preservation_contract?.[section]) &&
        quality.preservation_contract[section].length > 0,
      `quality.yml preservation_contract.${section} must be non-empty`
    );
  }
}

const netlify = read("netlify.toml");
assert(
  /\[build\][\s\S]*?\bpublish\s*=\s*"dist"/m.test(netlify),
  "netlify.toml must publish dist"
);
assert(
  /\[build\][\s\S]*?\bcommand\s*=\s*"npm run quality:fast"/m.test(netlify),
  "netlify.toml build command must run quality:fast"
);

const ci = read(".github/workflows/ci.yml");
assert(ci.includes("node-version-file: .node-version"), "CI must use .node-version");
assert(ci.includes("npm run quality:fast"), "CI must run quality:fast");
assert(ci.includes("npm run test:browser"), "CI must run the browser gate");

const claims = JSON.parse(read(".lifi/regulated-claims.json"));
assert(claims.schemaVersion === 1, "regulated claims schemaVersion must be 1");
assert(
  claims.issues?.length === 7 &&
    claims.issues.every(issue => issue.strictBlock === true),
  "regulated claims must retain seven strict-block issues"
);
assert(
  claims.snapshots?.length === 7,
  "regulated claims must retain seven active snapshot categories"
);

const debt = loadYaml(".lifi/debt-and-exceptions.yml");
if (debt) {
  assert(debt.version === 1, "debt ledger version must be 1");
  const entries = [...(debt.open || []), ...(debt.closed || [])];
  const ids = entries.map(entry => entry?.id).filter(Boolean);
  assert(ids.length === entries.length, "every debt entry must have an id");
  assert(new Set(ids).size === ids.length, "debt entry ids must be unique");
  for (const entry of debt.open || []) {
    assert(Boolean(entry.severity), `open debt ${entry.id} is missing severity`);
    assert(Boolean(entry.owner), `open debt ${entry.id} is missing owner`);
    assert(Boolean(entry.detail), `open debt ${entry.id} is missing detail`);
  }
}

const deadCode = loadYaml(".lifi/dead-code-candidates.yml");
if (deadCode) {
  assert(deadCode.version === 1, "dead-code ledger version must be 1");
  assert(
    deadCode.policy?.startsWith("Characterize"),
    "dead-code ledger must retain its non-destructive policy"
  );
  const result = spawnSync(process.execPath, ["scripts/audit-dead-code.mjs"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    errors.push(`dead-code audit failed: ${result.stderr.trim() || "unknown error"}`);
  } else {
    try {
      const report = JSON.parse(result.stdout);
      const assets = deadCode.candidates?.find(
        candidate => candidate.id === "legacy-assets-tree"
      )?.observed;
      const images = deadCode.candidates?.find(
        candidate => candidate.id === "unreferenced-image-candidates"
      )?.observed;
      const scan = /^(\d+) of (\d+) files/.exec(images?.generated_scan || "");

      assert(
        assets?.tracked_files === report.assets.files,
        "dead-code asset file count drifted"
      );
      assert(
        assets?.exact_bytes === report.assets.bytes,
        "dead-code asset byte count drifted"
      );
      assert(
        Number(scan?.[1]) === report.images.unreferencedCandidates &&
          Number(scan?.[2]) === report.images.files,
        "dead-code image candidate count drifted"
      );
      assert(
        images?.exact_candidate_bytes === report.images.unreferencedBytes,
        "dead-code image candidate byte count drifted"
      );
      assert(
        sameMembers(
          report.rootCssCandidates,
          ["premium.css", "styles.css"]
        ),
        "dead-code root CSS candidate set drifted"
      );
    } catch (error) {
      errors.push(`dead-code audit returned invalid JSON: ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(`Quality configuration failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Quality configuration validated: ${requiredFiles.length} files, ` +
    `${requiredScripts.length} commands, 7 claim gates, and current dead-code ledger`
);
