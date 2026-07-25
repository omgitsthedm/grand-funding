# Grand Funding AI-Ops State

## Identity

- Project code: `LFNYC-GFL`
- Name: Grand Funding LLC
- Tier: Tier 2
- Risk: Medium — regulated lender with live lead forms
- Canonical Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Branch: `master`

## Current stamp

- Updated: `2026-07-24`
- Updated by: Codex
- Basis: repository, build configuration, local Netlify target, production deploy metadata, and active reinvention worktree
- Baseline commit: `fd6cffdadca004d6b8ae4ec879af9dec36cfb9f4`
- Worktree: local reinvention changes present; not committed, pushed, previewed, or deployed

## Current live truth

- Live URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Production deploy: `6a61b4aafec5909a1591fa8b`
- State: `ready`
- Published: `2026-07-23T06:29:02.459Z`
- Netlify builds with `npm run build` and publishes only `dist/`.
- Deployment is manual. Git pushes do not publish.
- The local Netlify link was corrected from the unrelated Chromatic project and now targets Grand Funding.

## Local reinvention state

- Direction: Desert Deal Room / Desert Ledger
- Homepage: focused eight-section hierarchy with preserved calculator and pre-approval form
- Experience: funded proof, Logan access, scenario-led navigation, approved-deal route motion, FAQ, direct intake
- Motion: reduced-motion, Save-Data, and low-resource safeguards
- Conversion: repetitive universal engagement replaced by route-aware next steps
- Social: purpose-built 1200×630 assets and complete Open Graph/Twitter metadata
- SEO/AEO: route-specific descriptions, corrected copy/semantics, canonical-aligned connected schema, visible FAQ/schema parity, corrected robots directive, automated validator
- QA: dedicated reinvention browser suite across six representative routes and four viewports, plus full-route crawl and seven-breakpoint premium suites
- Release safety: exact Netlify site-name/site-ID assertion available as `npm run verify:netlify-target`

## Required validation

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
npm run verify:netlify-target
```

Final local validation completed on 2026-07-24:

- `npm ci`: three packages installed; zero vulnerabilities.
- `npm test`: 277 public files built; 88 HTML documents and 277 public files validated; SEO validation passed for 87 HTML documents.
- Reinvention browser QA: 536 checks across six routes and four viewports; zero failures.
- Full crawl: 174 runtime checks across 87 routes at mobile and desktop widths; zero failures.
- Premium gate: 2,849 checks across 37 pages and seven breakpoints; zero total, watchlist, or unique-page failures.
- Python generator compile, production dependency audit, Netlify target assertion, and `git diff --check`: passed.
- Netlify-aware local build completed with an artifact hash identical before and after the command: `4d6dc1ce4794022187247ba72bd7cbc1808b290f0be19b687b7e09aeb686e684`.

## Risk and compliance

- Preserve NMLS `2466872`, AZ MLO `1048901`, approved rates, lending claims, disclosures, testimonials, funded-deal facts, legal content, analytics identifiers, and lead destinations.
- `/apply`, `/contact`, and programmatic forms are transactional. Never submit live test leads without explicit approval.
- Never read or publish credentials, `.env*`, client records, or submission contents.
- Production release requires the complete local suite, an exact Netlify-target check, an inspected preview, and explicit authorization for that specific live action.

## External blockers

- Apex DNS has two A records with split TLS behavior; Netlify or the DNS owner must reconcile certificate/domain provisioning.
- Host-injected click tracking appears to duplicate source analytics listeners; resolve at the hosting/analytics layer.
- The host-installed Lighthouse plugin returned a local document-request 404 during `netlify build --context deploy-preview`, while Netlify still completed the build and the artifact remained byte-identical. Verify or reconfigure the plugin on an authorized preview.
- Google Ads lead/call conversion labels are absent and must not be invented.
- `llms.txt` includes compliance-sensitive unsupported claims requiring owner/legal review.
- Brand-kit directions A/B/C remain unapproved.

## Proposed changes / inbox

- Proposal: regenerate `.ai/RULES.md` from an updated project rules header.
- Reason: the generated rules still describe repository-root publishing, no build step, and push-to-production behavior.
- Risk: a future agent could follow stale operational guidance.
- Source evidence: `netlify.toml`, `package.json`, current Netlify project metadata, and the 2026-07-24 target-link correction.
- Suggested owner: Little Fight NYC AI-Ops maintainer.

## Next agent directive

Read this file, `CLAUDE.md`, `PROJECT_STATUS.md`, and `docs/GRAND-FUNDING-REINVENTION-2026-07-24.md`. Preserve the verified dirty worktree and completed local candidate. The next possible action is an inspected Netlify preview of `dist/`, but only with explicit preview authorization. Do not commit, push, preview, deploy, submit forms, or mutate DNS/analytics without the corresponding scoped authorization.
