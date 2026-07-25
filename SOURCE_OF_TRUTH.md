# Grand Funding — Source of Truth

Last verified: 2026-07-25

## Canonical code

- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Candidate branch: `agent/grand-funding-continuous-elevation-july-2026`
- Candidate base: `e135a678cb4c284cd8857ed3c32eba2bd545db3b`
- `origin/master` at verification: the same commit

The current elevation passed the full local release suite. Its production release is explicitly authorized and in progress.

The checkout under `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12` is archived and out of scope.

## Build truth

- Stack: static HTML, CSS, and JavaScript with Node build and QA scripts
- Runtime: Node `24.18.0`
- Install: `npm ci`
- Fast gate: `npm run quality:fast`
- Full gate: `npm run quality:full`
- Local server: `npm run serve -- --dir dist --port 8888`
- Public artifact: `dist/`
- Netlify configuration: `netlify.toml`

Never publish the repository root or use `--dir=.`.

## Hosting truth

- Live URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Admin URL: `https://app.netlify.com/projects/grandfundingllc`
- Current observed production deploy: `6a64616a5602a06cd8001b9c`
- Production state: `ready`
- Published: `2026-07-25T07:10:35.407Z`
- Deploy metadata has no commit reference; release is manual, not Git-linked

A Git commit or push does not publish the site.

## Current candidate artifact

- 279 public files
- 88 HTML documents
- 87 SEO-validated real documents
- 80 indexable pages
- 169 redirect rules
- 18 RSS items
- five managed premium social-card families plus approved post-specific art

## Release truth

Safe sequence:

```bash
npm ci
npm run quality:release
npm run deploy:preview
# Verify the preview and obtain explicit production authorization.
npm run deploy:production
```

`quality:release` is intentionally blocked by seven unresolved client/legal claim decisions. David Marsh explicitly authorized one exact-baseline production release after disclosure of that blocker. The scope and controls are recorded in `docs/PRODUCTION-RELEASE-AUTHORIZATION-2026-07-25.md`; the exception does not approve claims or carry forward to future releases.

## External state

- Google Ads lead, contact, and phone labels are placeholders and remain dormant.
- Apex DNS currently resolves to both `75.2.60.5` and obsolete `99.83.190.102`; the latter fails TLS for this domain.
- Client DNS instructions are at `/Users/davidmarsh/Desktop/GRAND-FUNDING-CLIENT-DNS-FIX-HANDOFF-2026-07-25.md`.
- No PostHog integration or login is required.

## Safety

Do not alter regulated claims without approved facts and legal review. Do not submit production forms during QA. Do not expose secrets, client records, or submission data. Preserve the `dist/` public boundary and exact Netlify target guard.
