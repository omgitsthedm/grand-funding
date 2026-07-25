# Grand Funding AI-Ops Rules Header

Project Code:

LFNYC-GFL

Project Name:

Grand Funding LLC

Business Line:

Client Projects under Little Fight NYC

Tier:

Tier 2 — live lead-generation site for a regulated lender

Risk:

Medium — real-estate private-lending site with licensing, regulated claims, analytics, and live lead forms

Canonical Path:

/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding

Visible Client Path:

/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding

Remote:

https://github.com/omgitsthedm/grand-funding.git (default branch: `master`)

Host:

Netlify project `grandfundingllc`, site ID `055c5942-aeaa-478a-9508-a34406994d5d`. Deterministic build publishes only `dist/`. Deployment is manual and is not triggered by Git push.

Live URL:

`https://www.grandfundingllc.com`

Stack:

Static HTML/CSS/JavaScript with Node `24.18.0` build, validation, Playwright, axe, and release scripts.

## Commands

- Install: `npm ci`
- Fast gate: `npm run quality:fast`
- Full gate: `npm run quality:full`
- Serve exact artifact: `npm run serve -- --dir dist --port 8888`
- Release gate: `npm run quality:release`
- Preview deployment: `npm run deploy:preview`
- Production deployment: `npm run deploy:production`

Never serve or deploy the repository root. Never use `--dir=.`.

## Locked Rules

- Preserve the cinematic desert-night identity, teal/ember palette, moving Arizona hero, calculator, funded-deal proof, and Netlify form contracts.
- Rates, fees, points, amounts, leverage, timing, occupancy, consumer purpose, licenses, service area, testimonials, funded-deal facts, and comparative claims require approved facts and lending-counsel review.
- Strict release remains blocked while any issue in `.lifi/regulated-claims.json` is unresolved.
- Do not submit production forms during QA.
- Do not read or expose `.env*`, credentials, client records, or submission data.
- Commit, push, preview deploy, production deploy, DNS, and external-account changes require the authorization appropriate to that action.
- Google Ads labels must remain dormant until approved values are supplied.
- No PostHog account or integration is required.

## QA Harness Map

Observational: Git status/log, source/config inspection, local build/server, `quality:fast`, `quality:full`, telemetry-blocked live GET audits, read-only Netlify metadata, DNS lookup.

Transactional: form submission, commit, push, deploy, DNS mutation, external-account configuration, or regulated-copy change.
