# Grand Funding Site — Source of Truth

Last reconciled 2026-07-24 against the resolved Git checkout, repository configuration, local Netlify linkage, current production deploy metadata, and the active reinvention worktree.

## Canonical code

- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Visible client path may resolve here from `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Canonical branch: `master`
- Released source commit: `ecb197c900dc413756e8677faf81c309ddaab369`
- The separate `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12` checkout is archived and out of scope.

## Production authority

- Live URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Current published deploy: `6a64420313e477e0eb227ec3`
- Published: `2026-07-25T04:56:39.880Z`
- Build command: `npm run build`
- Public artifact: `dist/`
- Deployment mode: manual Netlify release; Git pushes do not publish.

The local Netlify link was found pointing at the unrelated `chromatic-painting-design` site and was corrected to Grand Funding on 2026-07-24. `npm run verify:netlify-target` now enforces both expected site name and ID before release work.

## Build and verification

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
npm run verify:netlify-target
```

`npm test` builds the allowlisted public artifact, validates site structure and asset references, and validates SEO/AEO contracts. Browser suites must run against `dist/`, not the repository root.

Final local validation on 2026-07-24 passed:

- 277 public files; 88 HTML documents validated; SEO validation passed for 87 HTML documents;
- 536 reinvention checks across six routes and four viewports, zero failures;
- 174 crawl checks across 87 routes at mobile and desktop widths, zero failures;
- 2,849 premium checks across 37 pages and seven breakpoints, zero failures;
- Python generator compile, dependency audit, exact Netlify target assertion, and diff-integrity checks;
- Netlify-aware local build with an unchanged artifact hash of `4d6dc1ce4794022187247ba72bd7cbc1808b290f0be19b687b7e09aeb686e684`.

## Released 2026-07-24 reinvention

The current local worktree contains the Desert Deal Room reinvention:

- focused eight-section homepage with preserved calculator and pre-approval form;
- funded proof, founder access, scenario ledger, FAQ, and direct-intake hierarchy;
- approved-deal-route motion with reduced-motion, Save-Data, and low-resource safeguards;
- route-aware conversion blocks and removal of repetitive universal engagement;
- premium 1200×630 social art and complete Open Graph/Twitter image metadata;
- normalized canonicals, route-specific descriptions, connected schema graphs, visible FAQ/schema parity, and automated SEO validation;
- a dedicated cross-viewport reinvention browser suite and stricter CI artifact gate.

The work was merged through GitHub PR #4. Preview deploy `6a643ffee17381e219647c04` passed 536 focused checks, 174 runtime crawl checks, and 847 premium watchlist checks with zero failures. Production deploy `6a64420313e477e0eb227ec3` is `ready`; 536 live interaction checks and an 80-URL sitemap HTTP crawl passed, representative asset MIME types are correct, and Netlify recognizes the forms without a test submission.

## Safety and compliance

- Regulated identifiers: NMLS `2466872`; AZ MLO `1048901`.
- Preserve approved rates, licenses, lending claims, disclosures, testimonials, funded-deal facts, legal text, analytics identifiers, and lead destinations.
- `/apply`, `/contact`, and programmatic forms are transactional. Do not submit production test leads without explicit authorization.
- Keep credentials, `.env*`, client records, submissions, source tools, docs, and local Netlify metadata outside the public artifact.
- Production deploy requires passing local checks, `npm run verify:netlify-target`, an inspected preview, and explicit authorization for the production action.

## External dependencies and risks

- The apex host’s two A records exhibit split TLS behavior; resolve domain/certificate provisioning with the DNS owner or Netlify.
- Host-injected click tracking appears to duplicate source analytics listeners; resolve at the hosting/analytics layer.
- The host-installed Lighthouse plugin returned a local document-request 404 during the Netlify-aware build; verify or reconfigure it on an authorized preview. The build completed and the artifact remained byte-identical.
- Approved Google Ads lead/call conversion labels are absent and must not be invented.
- `llms.txt` contains compliance-sensitive unsupported claims requiring owner/legal review.
- Brand-kit directions A/B/C remain unapproved; preserve the current identity until one is selected.
