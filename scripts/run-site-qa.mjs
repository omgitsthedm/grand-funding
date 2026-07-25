#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";

const live = process.argv.includes("--live");
const host = "127.0.0.1";
const port = Number(process.env.QA_PORT || 8888);
const localBase = `http://${host}:${port}`;
const baseUrl = (
  process.env.BASE_URL ||
  (live ? "https://www.grandfundingllc.com" : localBase)
).replace(/\/+$/, "");

const suites = [
  { label: "route crawl", script: "scripts/crawl-site.mjs" },
  { label: "preservation", script: "scripts/qa-preservation.mjs" },
  { label: "accessibility", script: "scripts/qa-a11y.mjs" },
  { label: "conversion", script: "scripts/qa-conversion.mjs" },
  { label: "cross-browser", script: "scripts/qa-cross-browser.mjs" },
  {
    label: "premium watchlist",
    script: "scripts/qa-premium.mjs",
    env: { WATCHLIST_ONLY: "1" }
  }
].filter(suite => !live || suite.label !== "conversion");

const run = ({ label, script, env = {} }) =>
  new Promise((resolve, reject) => {
    console.log(`\nQuality suite: ${label}`);
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BASE_URL: baseUrl,
        ...env
      },
      stdio: "inherit"
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${label} failed${signal ? ` with ${signal}` : ` with exit ${code}`}`
        )
      );
    });
  });

const waitForSite = async () => {
  let lastError = null;
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`, {
        redirect: "manual",
        signal: AbortSignal.timeout(1_500)
      });
      if (response.status >= 200 && response.status < 400) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Site did not become ready at ${baseUrl}: ${lastError}`);
};

let server = null;
try {
  if (!live && baseUrl === localBase) {
    server = spawn(
      process.execPath,
      ["scripts/serve-site.mjs", "--dir", "dist", "--port", String(port)],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ["ignore", "inherit", "inherit"]
      }
    );
  }

  await waitForSite();
  for (const suite of suites) await run(suite);
  console.log(`\nAll browser quality suites passed against ${baseUrl}`);
} finally {
  if (server && !server.killed) {
    server.kill("SIGTERM");
  }
}
