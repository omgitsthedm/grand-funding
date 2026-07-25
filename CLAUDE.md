# Grand Funding LLC — Working Contract

> Current as of 2026-07-25. Read `.ai/STATE.md`, `SOURCE_OF_TRUTH.md`, and this file before working.

## Source of truth

- Resolved repository: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Candidate branch: `agent/grand-funding-continuous-elevation-july-2026`
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
- Current observed production deploy: `6a6489b013e4771689227e4f`, ready, published 2026-07-25 at 10:02:30Z
- Release merge: `f5baf1f620a4b8a6aa1c915d82fbbc9f564ab51b`
- Rollback deploy: `6a64616a5602a06cd8001b9c`
- Netlify is not Git-linked; a push does not publish this site
- The current elevation is merged to `master`, deployed, and live-verified

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

Do not change or invent rates, fees, points, loan amounts, leverage, timing promises, occupancy policy, consumer-purpose policy, licenses, service area, testimonials, funded-deal facts, or comparative claims without approved client facts and lending-counsel review.

Do not submit production forms during QA. Never read or expose credentials, `.env*`, client records, or form submissions.

The strict release gate is blocked by seven decisions:

1. Occupancy and consumer-purpose policy
2. Rates and points
3. Loan amounts
4. LTV, ARV, LTC, and CLTV leverage
5. Approval, term-sheet, closing, and funding timing
6. Licensed service area
7. Volume and comparative proof

Google Ads conversion labels remain placeholders and dormant. There is no PostHog integration or PostHog dependency.

## Current handoff

Use `docs/GRAND-FUNDING-CLIENT-INDEPENDENT-ELEVATION-2026-07-25.md` for the candidate scope, validation, blockers, rollback, and next action.
