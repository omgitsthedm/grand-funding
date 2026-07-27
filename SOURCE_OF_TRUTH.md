# Grand Funding — Source of Truth

Last verified: 2026-07-27

## Canonical code

- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Release branch: `agent/grand-funding-license-removal-20260727`
- Production source commit: `e8c3a85462652262b678d6626aed2f1437ac6787`
- PR: `#13`

The public license-separation release is live and production-verified. PR #13 is the authoritative source and closeout record.

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
- Current observed production deploy: `6a67cfd4f0a305b559bbcb3d`
- Production state: `ready`
- Published: `2026-07-27T21:38:35.680Z`
- Verified preview: `6a67cd7fd0fc1d853f8309e5`
- Pre-removal production evidence deploy: `6a6489b013e4771689227e4f`
- Deploy metadata has no commit reference; release is manual, not Git-linked

A Git commit or push does not publish the site.

## Current production artifact

- 281 public files
- Fingerprint: `8cc2b29639889e1f123af792d9d024573b5db808bcdda5bde3733d5542247d83`
- 88 HTML documents
- 87 SEO-validated real documents
- 80 indexable pages
- 169 redirect rules
- 18 RSS items
- clean, cache-busted default and Logan social cards plus redacted historic public image paths
- zero restricted license/association matches in current source, the artifact, production HTML, metadata, JSON-LD, or raster/video OCR

## Release truth

Safe sequence:

```bash
npm ci
npm run quality:release
npm run deploy:preview
# Verify the preview and obtain explicit production authorization.
npm run deploy:production
```

`quality:release` remains intentionally blocked by seven unresolved client/legal claim decisions. David Marsh explicitly authorized one public license-separation release after disclosure of that blocker. Deploy `6a67cfd4f0a305b559bbcb3d` consumed the exception. It approved only the verified removal, did not approve any claim, and does not carry forward.

Netlify confirmed production reused the exact files verified at preview `6a67cd7fd0fc1d853f8309e5`. Preview and production live-mode QA passed with zero failures. Production verification also matched all 192 directly served non-HTML assets byte-for-byte and matched visible text, metadata, JSON-LD, and form contracts across all 88 HTML documents.

## External state

- Google Ads lead, contact, and phone labels are placeholders and remain dormant.
- Apex DNS currently resolves to both `75.2.60.5` and obsolete `99.83.190.102`; the latter fails TLS for this domain.
- Client DNS instructions are at `/Users/davidmarsh/Desktop/GRAND-FUNDING-CLIENT-DNS-FIX-HANDOFF-2026-07-25.md`.
- No PostHog integration or login is required.

## Safety

Do not alter regulated claims without approved facts and legal review. Do not submit production forms during QA. Do not expose secrets, client records, or submission data. Preserve the `dist/` public boundary and exact Netlify target guard. Do not republish a pre-removal deploy as an ordinary rollback because it restores the removed material.
