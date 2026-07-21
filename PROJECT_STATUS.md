# Grand Funding — Project Status

> Cold-start entry point. Last updated 2026-07-20 by Codex after the full-site production release.

## Current outcome

Grand Funding LLC is a live, mobile-first hard-money lender marketing and lead-generation site for Arizona and California. The complete code, UI/UX, design, accessibility, responsive, performance, security, form, and deployment audit is complete and published.

- Live: `https://www.grandfundingllc.com`
- Netlify: `grandfundingllc` · `055c5942-aeaa-478a-9508-a34406994d5d`
- Production deploy: `6a5efef6c589f88c9d2f4684` · `ready`
- Release source: `ff779628` · GitHub PR `#3` into `master`
- Public artifact: 265 allowlisted files in `dist/`
- Live Lighthouse mobile: 99 Performance · 100 Accessibility · 100 Best Practices · 100 SEO
- Full live premium QA: 2,849 checks · zero failures
- Full live crawl: 86 pages × mobile/desktop · 172 checks · zero failures

## Canonical locations

| Item | Source of truth |
|---|---|
| Visible client path | `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding` |
| Resolved Git root | `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding` |
| GitHub | `https://github.com/omgitsthedm/grand-funding.git` · default `master` |
| Hosting | Netlify project `grandfundingllc` |
| Forms | Netlify Forms; `pre-approval`, `contact`, and programmatic landing-page forms |
| Audit | `docs/FULL-SITE-AUDIT-2026-07-20.md` |

The separate checkout at `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12` is archived. Do not modify or deploy it.

## Release changes

- Replaced repository-root publishing with a deterministic `dist/` build. Package files, generators, QA reports, internal standards, docs, and local Netlify state are no longer public.
- Repaired the invisible mobile hamburger, malformed homepage trust strip, homepage Netlify form declaration, sub-44px mobile fields, four broken links/assets, 39 incomplete document endings, iframe titles, and implicit input types.
- Added complete build validation, a dependency-free local server, an 86-page two-viewport browser crawler, expanded premium UI checks, and a project-specific GitHub Actions rail.
- Removed 7,447 unreferenced Material Design SVGs, tracked `.DS_Store` files, and tracked machine-specific Netlify files. Local Netlify linkage remains intact and ignored by Git.
- Preserved the established cinematic desert-night visual identity and all approved lender claims, licenses, rates, testimonials, disclosures, and lead destinations.

## Deployment truth

Netlify is not Git-linked. Pushing or merging Git does not publish production. Release flow:

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
netlify deploy --context deploy-preview
# Verify the draft, then with scoped production authorization:
netlify deploy --prod --context production
```

Do not use `--dir=.`. The build and `netlify.toml` intentionally publish only `dist/`.

## Non-negotiable boundaries

- Regulated lender: NMLS 2466872; AZ MLO 1048901.
- Never alter rates, licensing, underwriting claims, disclosures, testimonials, or funded-deal claims without approved facts.
- Real forms are transactional. Do not submit test leads without explicit approval.
- Never read or publish secrets, credentials, `.env*`, client records, or submission contents.
- Keep internal/source paths private and the `dist/` allowlist intact.

## Remaining dependency

Google Ads lead and phone conversion labels remain placeholders in `consent.js`. The approved labels are not present in the repository. Obtain them from the authorized Ads account owner before enabling conversion events; do not infer or invent them.

No code, design, accessibility, responsive, performance, security, form-recognition, source-publish, Git, or production-deploy loose ends remain from this audit.
