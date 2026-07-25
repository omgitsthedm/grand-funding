# Grand Funding LLC

Premium, mobile-first marketing and lead-generation website for Grand Funding LLC, a private hard-money lender serving approved Arizona and California markets. The site is static HTML/CSS/JavaScript with deterministic Node build and Playwright QA tooling, hosted on Netlify.

## Current experience

The 2026-07-24 local reinvention evolves the established cinematic desert-night identity into **Desert Deal Room / Desert Ledger**:

- a focused eight-section homepage instead of repetitive card stacks;
- scenario-led navigation, funded-deal proof, and direct founder access;
- tactile survey/title-document surfaces and restrained deal-route motion;
- preserved calculator, real forms, regulated content, legal paths, and analytics contracts;
- art-directed 1200×630 social-share images rather than page screenshots;
- connected schema, canonical alignment, route-specific metadata, and automated SEO/AEO validation;
- graceful reduced-motion, Save-Data, and low-resource behavior.

The reinvention is live. Core experience PR #4 and manifest-hardening PR #6 are represented by released source commit `405425596a705c05e3dfc009530e0d1b313a708d`; Netlify production deploy `6a644622ea5f470fa52d2f07` was published on `2026-07-25T05:14:14.825Z` and passed post-release verification.

## Repository and hosting

| Item | Value |
|---|---|
| Canonical repository | `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding` |
| Branch | `master` |
| Remote | `https://github.com/omgitsthedm/grand-funding.git` |
| Live site | `https://www.grandfundingllc.com` |
| Netlify project | `grandfundingllc` |
| Netlify site ID | `055c5942-aeaa-478a-9508-a34406994d5d` |
| Build command | `npm run build` |
| Publish directory | `dist/` |

The repository root is source, not a deployable artifact. `scripts/build-site.mjs` creates an allowlisted `dist/` release containing the public pages and required assets only.

## Local setup and validation

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
```

With the server running:

```bash
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
```

Useful focused commands:

```bash
npm run validate
npm run validate:seo
npm run generate:social
npm run verify:netlify-target
```

The reinvention suite exercises six discovery, application, editorial, market, proof, and completion routes at 390, 768, 800, and 1440 px widths. It verifies document structure, overflow, experience assets, social metadata, schema/canonical alignment, visible motion behavior, route markers, mobile-navigation focus, preserved forms/calculator, analytics isolation, thank-you behavior, and key content contracts. The 2026-07-24 closeout passed 536 focused checks, 174 full-route crawl checks, and 2,849 premium checks with zero failures.

## Deployment

Git pushes do not publish production. Netlify deployment is manual.

Before a preview:

```bash
npm ci
npm test
npm run verify:netlify-target
```

Then create a preview through the project’s Netlify workflow and inspect the built `dist/` artifact. A production deploy may happen only after clear authorization for that specific live action.

Never deploy with `--dir=.`. The local Netlify link was corrected on 2026-07-24 after it was found pointing to the unrelated Chromatic project; `npm run verify:netlify-target` prevents a recurrence.

## Compliance and forms

Grand Funding is a regulated lender:

- NMLS `2466872`
- AZ MLO `1048901`
- real Netlify Forms at `/apply`, `/contact`, and programmatic landing pages

Do not change rates, licensing, lending or approval claims, disclosures, testimonials, funded-deal facts, legal content, or form destinations without approved facts. Do not submit test leads to production without explicit approval.

Netlify form notifications are configured at the hosting layer, not in this repository. Google Ads conversion labels are still an external dependency and must not be invented.

## Known external follow-ups

- Resolve split TLS behavior across the apex domain’s two A records with the DNS owner or Netlify.
- Remove or reconcile host-injected duplicate analytics listeners at the hosting/analytics layer.
- Obtain approved Google Ads lead/call conversion labels.
- Review compliance-sensitive unsupported claims in `llms.txt` with the owner/legal reviewer.
- Approve one brand-kit direction before replacing the current identity.

See `SOURCE_OF_TRUTH.md`, `PROJECT_STATUS.md`, and `docs/GRAND-FUNDING-REINVENTION-2026-07-24.md` for current operational detail.
