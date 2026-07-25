# Grand Funding — Project Status

> Cold-start entry point. Updated 2026-07-24 during the local reinvention pass.

## Outcome

Grand Funding’s next site experience is implemented locally as **Desert Deal Room / Desert Ledger**. It replaces a repetitive, card-heavy journey with a focused editorial homepage, better proof and founder access, scenario-led navigation, purpose-built social sharing, stricter SEO/AEO generation, and broader browser QA while preserving the established brand, real forms, approved regulated facts, legal routes, and analytics contracts.

This pass did not commit, push, preview, or deploy. The live site is unchanged.

## Current production

| Item | Current truth |
|---|---|
| Live URL | `https://www.grandfundingllc.com` |
| Netlify project | `grandfundingllc` |
| Site ID | `055c5942-aeaa-478a-9508-a34406994d5d` |
| Published deploy | `6a61b4aafec5909a1591fa8b` |
| Published at | `2026-07-23T06:29:02.459Z` |
| Git branch | `master` |
| Baseline commit | `fd6cffdadca004d6b8ae4ec879af9dec36cfb9f4` |
| Publish directory | `dist/` |
| Deployment | Manual; Git pushes do not publish |

The canonical Git root is `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`, with remote `https://github.com/omgitsthedm/grand-funding.git`.

## Implemented locally

- Rebuilt the homepage into eight purposeful sections: deal-room hero, funded proof, Logan access, scenario ledger, preserved calculator, approved-deal route, FAQ, and preserved intake.
- Added tactile desert-ledger styling and restrained motion with reduced-motion, Save-Data, and low-resource fallbacks.
- Replaced the universal engagement block with route-aware, lower-friction next steps.
- Removed unsupported “Logan is available” status language from the built application route while preserving contact access.
- Added four art-directed 1200×630 social-share compositions for home, funded deals, founder/direct-lender, and editorial routes.
- Added premium Open Graph/Twitter image metadata, a correct 180×180 Apple touch icon, route-specific descriptions, canonical-aligned connected schema, and SEO/AEO validation.
- Corrected malformed built blog headings and known generated-copy duplication.
- Added a cross-viewport reinvention QA suite covering key discovery, proof, editorial, market, and conversion routes.
- Tightened CI to test the built branch artifact; the separate production premium workflow is now a manual read-only monitor.
- Added a Netlify target assertion and corrected the local link from the Chromatic project to Grand Funding.

## Final local validation

- Clean install: zero dependency vulnerabilities.
- Build/static checks: 277 public files; 88 HTML documents validated; SEO validation passed for 87 HTML documents.
- Reinvention QA: 536 checks across six routes and four viewports; zero failures.
- Full crawl: 174 runtime checks across 87 routes at mobile and desktop widths; zero failures.
- Premium gate: 2,849 checks across 37 pages and seven breakpoints; zero total, watchlist, or unique-page failures.
- Python generator compile, dependency audit, Netlify target assertion, and diff-integrity checks passed.
- `netlify build --context deploy-preview` preserved the exact artifact hash: `4d6dc1ce4794022187247ba72bd7cbc1808b290f0be19b687b7e09aeb686e684`.

## Release procedure

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
npm run verify:netlify-target
```

After the complete local suite passes, create and inspect a preview. A production deploy requires clear, scoped authorization for that specific live action. Never publish the repository root or use `--dir=.`.

## Non-negotiable boundaries

- NMLS `2466872`; AZ MLO `1048901`.
- Do not change rates, licenses, lending or approval claims, disclosures, testimonials, funded-deal facts, legal content, analytics identifiers, or lead destinations without approved facts.
- Do not submit production `/apply`, `/contact`, or programmatic forms without explicit authorization.
- Do not read or publish secrets, `.env*`, client records, or submission contents.
- Preserve the deterministic `dist/` allowlist and the current live release until a new release is approved.

## Remaining before release

1. Resolve or explicitly accept the apex A-record split TLS issue.
2. Identify and remove/reconcile duplicate host-injected analytics listeners.
3. Verify or reconfigure the host-installed Lighthouse plugin on an authorized preview; local Netlify build reported a document-request 404 without changing the artifact.
4. Obtain approved Google Ads lead and call conversion labels.
5. Review compliance-sensitive unsupported claims in `llms.txt` with the owner/legal reviewer.
6. Approve a brand-kit direction or deliberately retain the current identity.
7. Create and inspect a Netlify preview, then request separate production authorization.

Detailed scope: `docs/GRAND-FUNDING-REINVENTION-2026-07-24.md`.
