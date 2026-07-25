# Grand Funding AI-Ops State

## Identity

- Project Code: LFNYC-GFL
- Name: Grand Funding LLC
- Tier: Tier 2 · Risk: Medium (regulated lender + live lead forms)
- Visible Path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git Root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Remote: `https://github.com/omgitsthedm/grand-funding.git` · Default branch: `master`

## Current Stamp

- Updated: 2026-07-20
- Updated By: Codex
- Basis: full code, design, accessibility, responsive, performance, security, form, preview, deploy, and live verification pass
- Release source commit: `ff779628` · PR: `#3`

## Current Live Truth

- Live URL: `https://www.grandfundingllc.com` (apex redirects to www)
- Netlify project: `grandfundingllc` · site ID `055c5942-aeaa-478a-9508-a34406994d5d`
- Production deploy: `6a5efef6c589f88c9d2f4684` · state `ready` · published 2026-07-21T05:09:14Z
- Deployment is manual Netlify CLI. The site is not Git-linked; a Git push does not publish.
- Netlify runs `npm run build` and publishes only `dist/` (265 allowlisted public files).
- Source, package, QA, internal docs, and local Netlify state are excluded from production and verified 404.

## Verified Quality

- `npm test`: 87 HTML artifacts and 265 public files validated.
- Full live premium matrix: 2,849 checks across 37 pages, seven breakpoints, and 11 invariants; zero failures.
- Full live runtime crawl: 86 pages at mobile and desktop; 172 page/viewport checks; zero failures.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.8s, TBT 10ms, CLS 0.
- Production security headers present; public routes 200; tested internal/source routes 404.
- Netlify Forms remain recognized. No QA lead was submitted and submission counts did not change.

## Risk and Compliance

- Regulated lender: NMLS 2466872; AZ MLO 1048901.
- Rates, license identifiers, lending claims, disclosures, testimonials, funded-deal claims, and lead destinations remain compliance-sensitive and were preserved.
- `/apply`, `/contact`, and programmatic lead forms are transactional. Never submit test leads without explicit approval.

## Remaining External Dependency

- `consent.js` still contains placeholder Google Ads conversion labels. Approved lead/call conversion-label values are not in the repository and must not be invented.

## Next Agent Directive

Read `.ai/RULES.md`, this file, `PROJECT_STATUS.md`, and `docs/FULL-SITE-AUDIT-2026-07-20.md`. Build with `npm test`; run locally with `npm run serve -- --dir dist --port 8888`; use `BASE_URL=... npm run test:crawl` and `npm run test:premium`. Production is manual via `netlify deploy --prod` after scoped authorization and preview verification. Do not read secrets or submit a real lead.

## Emergency Notes

- Preserve the live release and the `dist/` publish boundary.
- If a deploy appears wrong, verify the Netlify deploy ID/state and public artifact before rollback or escalation.
- Keep all regulated content unchanged unless approved facts are provided.
