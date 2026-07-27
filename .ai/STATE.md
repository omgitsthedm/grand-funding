# Grand Funding AI-Ops State

## Identity

- Project code: `LFNYC-GFL`
- Client: Grand Funding LLC
- Risk: regulated lender with live lead forms
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`

## Current stamp

- Updated: 2026-07-27
- Release branch: `agent/grand-funding-license-removal-20260727`
- Production source commit: `e8c3a85462652262b678d6626aed2f1437ac6787`
- Release PR: `#13`
- Release state: live and verified

## Generated-rules warning

`.ai/RULES.md` was generated on 2026-06-28 and incorrectly says the project has no build, publishes the repository root, and deploys on Git push. Do not follow those commands.

`.ai/RULES_HEADER.md` now contains current truth. Regenerate `.ai/RULES.md` only through the canonical AI-Ops generator when that generator is available; do not hand-edit the generated file.

## Live truth

- URL: `https://www.grandfundingllc.com`
- Netlify site: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- This checkout carries an ignored local site link; the pinned preflight verifies both name and ID before deploy commands.
- Current observed deploy: `6a67cfd4f0a305b559bbcb3d`, ready, published 2026-07-27 at 21:38:35Z
- Verified preview: `6a67cd7fd0fc1d853f8309e5`
- Pre-removal production evidence deploy: `6a6489b013e4771689227e4f`
- Do not use a pre-removal deploy as an ordinary rollback because it restores prohibited public license/association material.
- Deployment is manual and publishes only `dist/`
- A Git push does not publish

## Release quality

- 281 public files
- Artifact fingerprint: `8cc2b29639889e1f123af792d9d024573b5db808bcdda5bde3733d5542247d83`
- 88 HTML documents
- 87 SEO-validated documents
- 80 indexable pages
- 169 redirect rules
- 18 RSS items
- Current public source and artifact contain no named NMLS/MLO identifiers, NMLS/MLO wording or verification links, Forward brand/domain reference, or Grand Funding licensing assertion.
- Raster OCR across every public image and five sampled frames from each of two public videos found zero restricted references.
- Full local route, preservation, accessibility, conversion, cross-browser, and responsive QA passed twice after the redactor repair, with zero failures.
- Preview and production each passed 174 route checks, 505 preservation checks, 20 accessibility audits, 60 cross-browser document checks, and 847 premium responsive checks with zero failures.
- Production verification fetched 280 served files: 192 non-HTML assets matched the reviewed artifact byte-for-byte and all 88 HTML documents matched visible text, metadata, JSON-LD, and form contracts after Netlify's expected clean-URL/form rewrite.
- Netlify reported that production reused the exact preview files with no new upload.
- No live form was submitted and telemetry was blocked during QA.

## Release state

Strict release is blocked by seven unresolved decisions: occupancy/purpose, rates/points, amounts, leverage, timing, service area, and volume/comparative proof.

David Marsh explicitly authorized the July 27 public license-separation release after disclosure of the unchanged strict blocker. That one-time exception was consumed by production deploy `6a67cfd4f0a305b559bbcb3d`. It authorized only removal of the sponsored identifiers and possible Forward-association material; it did not resolve the seven issues or weaken future strict validation.

Google Ads labels remain dormant placeholders. Porkbun DNS still needs the client-owned apex cleanup documented on the Desktop. There is no PostHog integration.

## Directive

Read `SOURCE_OF_TRUTH.md`, `CLAUDE.md`, and `docs/FORWARD-LICENSE-SEPARATION-RELEASE-2026-07-27.md`. Build with Node `24.18.0` and `npm run quality:full`. Never deploy the repository root, submit a production form, mark claims resolved, restore a pre-removal deploy, or change regulated wording without approval. The consumed exception does not carry forward.
