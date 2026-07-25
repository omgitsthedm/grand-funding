# Grand Funding — Project Status

> Cold-start entry point. Updated 2026-07-24 during the local reinvention pass.

## Outcome

Grand Funding’s next site experience is implemented locally as **Desert Deal Room / Desert Ledger**. It replaces a repetitive, card-heavy journey with a focused editorial homepage, better proof and founder access, scenario-led navigation, purpose-built social sharing, stricter SEO/AEO generation, and broader browser QA while preserving the established brand, real forms, approved regulated facts, legal routes, and analytics contracts.

The reinvention was merged through GitHub PR #4 and published to production on 2026-07-25. Post-release checks passed without submitting a form.

## Current production

| Item | Current truth |
|---|---|
| Live URL | `https://www.grandfundingllc.com` |
| Netlify project | `grandfundingllc` |
| Site ID | `055c5942-aeaa-478a-9508-a34406994d5d` |
| Published deploy | `6a64420313e477e0eb227ec3` |
| Published at | `2026-07-25T04:56:39.880Z` |
| Git branch | `master` |
| Released source commit | `ecb197c900dc413756e8677faf81c309ddaab369` |
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
- Preview deploy `6a643ffee17381e219647c04`: 536 focused checks, 174 route/viewport crawl checks, and 847 premium watchlist checks passed with zero failures.
- Production deploy `6a64420313e477e0eb227ec3`: state `ready`; 536 live interaction checks passed; all 80 sitemap URLs returned successfully; representative HTML, XML, PNG, and JPEG resources returned correct status and MIME types.
- Netlify recognizes the production form definitions; no test form was submitted.

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

For a future release, repeat the complete local suite, inspect a preview, obtain scoped production authorization, and publish only `dist/`. Never publish the repository root or use `--dir=.`.

## Non-negotiable boundaries

- NMLS `2466872`; AZ MLO `1048901`.
- Do not change rates, licenses, lending or approval claims, disclosures, testimonials, funded-deal facts, legal content, analytics identifiers, or lead destinations without approved facts.
- Do not submit production `/apply`, `/contact`, or programmatic forms without explicit authorization.
- Do not read or publish secrets, `.env*`, client records, or submission contents.
- Preserve the deterministic `dist/` allowlist and the current live release until a new release is approved.

## Remaining external follow-ups

1. Resolve or explicitly accept the apex A-record split TLS issue.
2. Identify and remove/reconcile duplicate host-injected analytics listeners.
3. Verify or reconfigure the host-installed Lighthouse plugin on an authorized preview; local Netlify build reported a document-request 404 without changing the artifact.
4. Obtain approved Google Ads lead and call conversion labels.
5. Review compliance-sensitive unsupported claims in `llms.txt` with the owner/legal reviewer.
6. Approve a brand-kit direction or deliberately retain the current identity.

Detailed scope: `docs/GRAND-FUNDING-REINVENTION-2026-07-24.md`.
