# Grand Funding source of truth

Last verified: 2026-07-29

This document records the current operational state of the Grand Funding website. Dated release records remain historical evidence and do not supersede this file.

## Canonical code

- Visible client path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub repository: `https://github.com/omgitsthedm/grand-funding`
- Default branch: `master`
- Production-source merge: `b64b409e91e457c99c0b98853be77aae85d495b7`
- Production review: pull request #17
- Release-record merge: `cdc425b3e0d5e70e1cf3b1914a0ba1da52c2af55`
- Release-record review: pull request #18

The checkout under `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12` is archived and out of scope.

## Current release records

- Full implementation and audit: `SITE-REINVENTION-DOSSIER.md`
- Consumed production authorization: `docs/PRODUCTION-RELEASE-AUTHORIZATION-2026-07-29-REINVENTION.md`
- Client website decisions: `docs/GRAND-FUNDING-CLIENT-WEBSITE-APPROVAL-2026-07-27.md`
- Complete local closeout: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/SESSION-CLOSEOUT-2026-07-29-WEBSITE-REINVENTION-COMPLIANCE-RELEASE.md`

The earlier client-survey and Forward-separation records remain valid historical evidence in pull request #14 and pull request #13.

## Build truth

- Stack: static Hypertext Markup Language (HTML), Cascading Style Sheets (CSS), and JavaScript with Node build and quality scripts
- Required runtime: Node `24.18.0`
- Install command: `npm ci`
- Fast gate: `npm run quality:fast`
- Full gate: `npm run quality:full`
- Local server: `npm run serve -- --dir dist --port 8888`
- Public artifact: `dist/`
- Netlify configuration: `netlify.toml`

Never publish the repository root or use `--dir=.`.

## Hosting truth

- Production URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Netlify admin: `https://app.netlify.com/projects/grandfundingllc`
- Current production deploy: `6a6acd18828f50c85c77a2e5`
- Production state: `ready`
- Published: `2026-07-30T04:03:49.811Z`
- Verified final preview: `6a6acad9385847c56c5c2015`
- Superseded interim production deploy: `6a6ac663cc09269d86bad25c`
- Last pre-reinvention production deploy: `6a69f55b47ede5d0a16b98ec`

Deployment is manual. A Git commit or push does not publish the site.

## Current production artifact

- 294 public files totaling 18.3 MiB
- Aggregate SHA-256: `8af2323876df6cd2d6e4ef857ee9a8ecbdfd9f2bfccbe7c422528dacebd1c6e6`
- 88 HTML documents
- 87 Search Engine Optimization (SEO) validated documents
- 80 indexable pages
- 169 redirect rules
- 18 Really Simple Syndication (RSS) items
- 18 preserved Netlify form contracts
- 13 deterministic content-addressed CSS bundles
- 205 non-HTML assets verified byte-for-byte against both production surfaces

The generated artifact and current public source contain no Forward, National Mortgage Licensing System (NMLS), mortgage loan originator (MLO), sponsored-license identifier, Grand Funding licensing assertion, asset-based formulation, or rejected no-income-document comparison.

## Production verification

- Local full matrix: 1,623 checks, zero failures
- Final preview live matrix: 1,606 checks, zero failures
- Final custom-domain live matrix: 1,606 checks, zero failures
- Immutable deploy parity: 88 HTML documents, 18 forms, and 205 assets matched
- Custom-domain parity: 88 HTML documents, 18 forms, and 205 assets matched
- Desktop hero: MPEG-4 (MP4) video returned response status `206`, reached playable state, and played
- Hero styling: zero visible gradients and a 20-pixel gap before the next section
- Reduced motion: video hidden, zero MP4 requests, and loaded poster visible

No production form was submitted. Verification blocked third-party telemetry.

## Release truth

The strict release gate remains blocked by seven unresolved lending-counsel decisions. The July 29 production instruction created a one-time operational exception for the exact reviewed artifact.

That exception was consumed and closed by deploy `6a6acd18828f50c85c77a2e5`. It did not approve a lending claim, resolve a strict issue, change Domain Name System (DNS) records, activate ads, submit a form, inspect submissions, or change borrower records.

Use this sequence for future releases:

```bash
npm ci
npm run quality:release
npm run deploy:preview
# Verify the preview and obtain new production authorization.
npm run deploy:production
```

## External state

- Google Ads conversion labels remain dormant placeholders
- The documented Porkbun DNS correction remains client-owned and unverified by this release
- Physical iOS, Android, screen-reader, and constrained-network checks remain external quality work
- No PostHog integration or account is required

## Safety and recovery

Do not alter regulated claims without approved facts and lending-counsel review. Do not submit production forms or inspect form submissions during quality assurance.

Do not restore a pre-hardening deployment as an ordinary rollback. Pre-hardening deployments can restore prohibited association or asset-based wording. Redeploy the final hardened artifact or a later artifact that passes the same claim, parity, and live-browser gates.
