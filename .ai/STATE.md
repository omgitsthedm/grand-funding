# Grand Funding AI-Ops State

## Identity

- Project code: `LFNYC-GFL`
- Client: Grand Funding LLC
- Risk: regulated lender with live lead forms
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`

## Current stamp

- Updated: 2026-07-25
- Release branch: `agent/grand-funding-continuous-elevation-july-2026`
- Candidate commit: `de41e436d60f14d9e117ed32e5857d55f5c248b1`
- `origin/master`: `f5baf1f620a4b8a6aa1c915d82fbbc9f564ab51b` via PR #11
- Release state: live and verified

## Generated-rules warning

`.ai/RULES.md` was generated on 2026-06-28 and incorrectly says the project has no build, publishes the repository root, and deploys on Git push. Do not follow those commands.

`.ai/RULES_HEADER.md` now contains current truth. Regenerate `.ai/RULES.md` only through the canonical AI-Ops generator when that generator is available; do not hand-edit the generated file.

## Live truth

- URL: `https://www.grandfundingllc.com`
- Netlify site: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- This checkout carries an ignored local site link; the pinned preflight verifies both name and ID before deploy commands.
- Current observed deploy: `6a6489b013e4771689227e4f`, ready, published 2026-07-25 at 10:02:30Z
- Verified preview: `6a647f062aa291182e0c70f1`
- Rollback target: `6a64616a5602a06cd8001b9c`
- Deployment is manual and publishes only `dist/`
- A Git push does not publish

## Release quality

- 279 public files
- 88 HTML documents
- 87 SEO-validated documents
- 80 indexable pages
- 169 redirect rules
- 18 RSS items
- Full route, preservation, accessibility, conversion, cross-browser, and responsive QA passed with zero failures
- Local Lighthouse passed at mobile 85 performance and 100 accessibility/best practices/SEO, with desktop 100 across all four categories and zero layout shift on both profiles
- Production dependency audit passed with zero vulnerabilities
- GitHub `deployable-artifact` passed on PR #11
- Production passed 174 route checks, 505 preservation checks, 20 accessibility audits, and 847 premium responsive checks with zero failures
- Live, production-deploy, and preview root HTML hashes match
- External Playwright Firefox could not connect to any HTTPS host in this runner; the same Firefox profiles passed locally, while remote Chromium and WebKit passed against the preview

## Release state

Strict release is blocked by seven unresolved decisions: occupancy/purpose, rates/points, amounts, leverage, timing, service area, and volume/comparative proof.

David Marsh explicitly authorized one production release after disclosure of the strict blocker. That exact-baseline exception was consumed by deploy `6a6489b013e4771689227e4f`. It did not resolve the seven issues or weaken future strict validation.

Google Ads labels remain dormant placeholders. Porkbun DNS still needs the client-owned apex cleanup documented on the Desktop. There is no PostHog integration.

## Directive

Read `SOURCE_OF_TRUTH.md`, `CLAUDE.md`, `docs/GRAND-FUNDING-CLIENT-INDEPENDENT-ELEVATION-2026-07-25.md`, and the executed release authorization. Build with Node `24.18.0` and `npm run quality:full`. Never deploy the repository root, submit a production form, mark claims resolved, or change regulated wording without approval. The consumed exception does not carry forward.
