# Grand Funding LLC — Working Contract

> Current as of 2026-07-29. Read `.ai/STATE.md`, `SOURCE_OF_TRUTH.md`, and this file before working.

## Source of truth

- Resolved repository: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Current release branch: `agent/grand-funding-client-approvals-20260729`
- Stack: static HTML, CSS, and JavaScript with a deterministic Node build
- Required runtime: Node `24.18.0`
- Netlify publish directory: `dist/`

The generated `.ai/RULES.md` still contains obsolete 2026-06-28 root-publish commands. Do not use its build or deployment section until the canonical AI-Ops generator regenerates it from the updated `.ai/RULES_HEADER.md`.

## Commands

```bash
npm ci
npm run quality:fast
npm run quality:full
npm run serve -- --dir dist --port 8888
```

`npm run quality:release` is fail-closed. It must remain blocked while the seven regulated-claim decisions in `.lifi/regulated-claims.json` are unresolved.

Never publish the repository root. Never use `--dir=.`.

Deployment is manual and requires clear, scoped authorization:

```bash
npm run deploy:preview
# Verify the preview, then only with explicit production authorization:
npm run deploy:production
```

Both deployment wrappers use pinned `netlify-cli@27.0.0`, run the release gate, and verify the exact Netlify site identity before any upload.

## Production

- Live URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Current observed production deploy: `6a69f55b47ede5d0a16b98ec`, ready, published 2026-07-29 at 12:43:16Z
- Production source commit: `79a17a20af56112e9b7856f52a0f686b0c0dd038`
- Release PR: `#14`
- Previous production deploy: `6a67cfd4f0a305b559bbcb3d`
- Netlify is not Git-linked; a push does not publish this site
- The July 27 client-survey implementation is deployed and live-verified

## Experience preservation contract

Preserve the original cinematic desert-night identity:

- background `#07080B`
- teal `#4FE3D2`
- ember `#F0B26B`
- DM Sans typography
- moving Arizona hero with poster and constrained-device fallback
- direct access to Logan
- funded-deal proof
- loan calculator behavior
- original Netlify form names, actions, honeypots, and no-JS POST fallback

Elevate through clearer flow, stronger CTA context, accessible behavior, premium original sharing art, reliable forms, performance, and safer release rails. Do not replace the identity with a generic SaaS or portfolio design.

## Regulated boundaries

The exact July 27 client survey decisions are preserved in `docs/GRAND-FUNDING-CLIENT-WEBSITE-APPROVAL-2026-07-27.md` and implemented by the deterministic website-approval sanitizer. Do not expand or invent rates, fees, points, loan amounts, leverage, timing promises, occupancy policy, consumer-purpose policy, licenses, service area, testimonials, funded-deal facts, or comparative claims beyond that record without new written approval and lending-counsel review.

Do not submit production forms during QA. Never read or expose credentials, `.env*`, client records, or form submissions.

The strict release gate remains blocked by seven lending-counsel approvals:

1. Occupancy and consumer-purpose policy
2. Rates and points
3. Loan amounts
4. LTV, ARV, LTC, and CLTV leverage
5. Approval, term-sheet, closing, and funding timing
6. Licensed service area
7. Volume and comparative proof

Google Ads conversion labels remain placeholders and dormant. There is no PostHog integration or PostHog dependency.

## Current handoff

Use `docs/GRAND-FUNDING-CLIENT-APPROVAL-RELEASE-2026-07-29.md` for the current scope, validation, blockers, preservation record, and release evidence.
