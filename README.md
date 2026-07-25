# Grand Funding LLC Website

Premium static lead-generation site for Grand Funding LLC, a private real-estate lender serving investor audiences. The project preserves its cinematic desert-night identity while using a deterministic `dist/` build, fail-closed regulated-claim governance, responsive browser QA, and manual Netlify releases.

## Local setup

Use Node `24.18.0` from `.node-version`.

```bash
npm ci
npm run quality:fast
npm run quality:full
```

Serve the exact public artifact:

```bash
npm run serve -- --dir dist --port 8888
```

Do not serve or deploy the repository root.

## Quality commands

- `npm run quality:fast` — build, public-boundary validation, SEO validation, claims baseline, quality config
- `npm run quality:full` — fast gate plus crawl, preservation, accessibility, conversion, cross-browser, and premium responsive QA
- `npm run quality:maintenance` — configuration validation and non-destructive dead-code report
- `npm run quality:live` — read-only live browser audit with telemetry blocked and form conversion tests skipped
- `npm run quality:release` — strict client/legal claim approval, all browser gates, and exact Netlify target verification

The release command is intentionally blocked until the seven decisions in `.lifi/regulated-claims.json` are approved and reconciled.

## Public build

`npm run build` creates `dist/` from an allowlisted source set, then:

- preserves and capability-gates the original moving hero
- applies the restrained experience refinements
- normalizes canonical URLs, schema, social metadata, and redirects
- generates five premium social-card families
- generates an 18-item RSS feed with neutral descriptions
- fingerprints local CSS and JavaScript query versions from file content

The current validated artifact contains 279 public files, including 88 HTML documents and 80 indexable pages.

## Forms and analytics

Netlify form names, actions, honeypots, and native POST fallbacks are preserved. Browser QA never submits a production lead.

The enhanced runtime adds:

- route-specific submit labels
- accessible pending and recovery status
- duplicate-submit protection
- one-time, consent-aware, PII-free lead conversion events
- one owner for phone-click telemetry

Google Ads labels remain unconfigured and dormant. There is no PostHog integration.

## Deployment

Netlify project: `grandfundingllc`

Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`

Publish directory: `dist/`

Deployment is manual and requires scoped authorization:

```bash
npm run deploy:preview
npm run deploy:production
```

The wrappers use pinned `netlify-cli@27.0.0`. Never use `netlify deploy --dir=.`.

## Handoff

See `docs/GRAND-FUNDING-CLIENT-INDEPENDENT-ELEVATION-2026-07-25.md` for completed work, evidence, client/legal blockers, external configuration, and recovery.
