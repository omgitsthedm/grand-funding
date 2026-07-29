# Grand Funding — Source of Truth

Last verified: 2026-07-29

## Canonical code

- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Release branch: `agent/grand-funding-client-approvals-20260729`
- Production source commit: `79a17a20af56112e9b7856f52a0f686b0c0dd038`
- PR: `#14`

The client-approved website-claims release is live and production-verified. PR #14 and `docs/GRAND-FUNDING-CLIENT-APPROVAL-RELEASE-2026-07-29.md` are the authoritative source and closeout record. The earlier public license-separation release remains preserved in PR #13.

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
- Current observed production deploy: `6a69f55b47ede5d0a16b98ec`
- Production state: `ready`
- Published: `2026-07-29T12:43:16.713Z`
- Verified preview: `6a69f35b5fb2e1401318c2b3`
- Previous production deploy: `6a67cfd4f0a305b559bbcb3d`
- Pre-removal production evidence deploy: `6a6489b013e4771689227e4f`
- Deploy metadata has no commit reference; release is manual, not Git-linked

A Git commit or push does not publish the site.

## Current production artifact

- 281 public files
- Fingerprint: `27df43de0f2c91f76919c1dfba290f37bf1c569c9c07a566c11048d648c3c73c`
- 88 HTML documents
- 87 SEO-validated real documents
- 80 indexable pages
- 169 redirect rules
- 18 RSS items
- clean, cache-busted default and Logan social cards plus redacted historic public image paths
- zero restricted license/association matches in current source, the artifact, production HTML, metadata, or JSON-LD
- all 192 directly served non-HTML production assets match the reviewed artifact byte-for-byte
- client-approved product, pricing-claim, calculator, occupancy, service-area, timing, volume, comparative, and dormant-Ads decisions enforced in source and artifact

## Release truth

Safe sequence:

```bash
npm ci
npm run quality:release
npm run deploy:preview
# Verify the preview and obtain explicit production authorization.
npm run deploy:production
```

`quality:release` remains intentionally blocked by seven unresolved lending-counsel approvals. The July 27 client survey supplied exact website decisions, and David Marsh explicitly authorized publication of the verified implementation. Deploy `6a69f55b47ede5d0a16b98ec` consumed that one-time release authorization. It does not represent lending-counsel approval, mark a strict issue resolved, or carry forward.

Preview `6a69f35b5fb2e1401318c2b3` and production both served artifact fingerprint `27df43de0f2c91f76919c1dfba290f37bf1c569c9c07a566c11048d648c3c73c`. Preview and production live-mode QA passed with zero failures. Remote verification matched all 192 directly served non-HTML assets byte-for-byte and found no restricted association, active direct Ads-ID, or malformed-copy match across all 88 HTML documents.

## External state

- Google Ads lead, contact, and phone labels are placeholders and remain dormant.
- The client said they will make the documented Porkbun DNS correction and send a screenshot; completion is not verified by this release.
- Client DNS instructions are at `/Users/davidmarsh/Desktop/GRAND-FUNDING-CLIENT-DNS-FIX-HANDOFF-2026-07-25.md`.
- No PostHog integration or login is required.

## Safety

Do not alter regulated claims without approved facts and legal review. Do not submit production forms during QA. Do not expose secrets, client records, or submission data. Preserve the `dist/` public boundary and exact Netlify target guard. Do not republish a pre-removal deploy as an ordinary rollback because it restores the removed material.
