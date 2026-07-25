# CLAUDE.md — Grand Funding LLC

> Human operating summary. Read `.ai/RULES.md` and `.ai/STATE.md` first; use current Git, Netlify, and build evidence over historical notes.

## Current truth — 2026-07-24

- Canonical repository: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Branch: `master`
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Live URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Current published deploy: `6a61b4aafec5909a1591fa8b`
- Published at: `2026-07-23T06:29:02.459Z`
- Netlify builds with `npm run build` and publishes only `dist/`.
- Git pushes do not deploy this site. Production publishing is manual and separately authorized.
- The 2026-07-24 reinvention is implemented locally but was not deployed in this pass.

## Required commands

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
```

Optional maintenance:

```bash
npm run generate:social
npm run verify:netlify-target
```

`npm test` creates `dist/`, validates the public allowlist, and runs SEO/AEO validation. Always test the built artifact, never the repository root.

## Release contract

Before any Netlify preview or production deploy:

1. Begin from a reviewed, intentional Git state.
2. Run the required local checks above.
3. Run `npm run verify:netlify-target`.
4. Confirm the linked site is exactly `grandfundingllc` / `055c5942-aeaa-478a-9508-a34406994d5d`.
5. Create and inspect a preview deploy.
6. Deploy production only after David gives clear authorization for that specific production action.

Never use `--dir=.`. Never infer deployment authorization from a commit or push.

The local `.netlify` link was corrected on 2026-07-24 after it was found pointing at the unrelated Chromatic project. The target assertion script is now a mandatory preflight.

## Product and experience direction

The current local direction is **Desert Deal Room / Desert Ledger**:

- an editorial, title-office-inspired experience rather than generic SaaS cards;
- a focused eight-section homepage with scenario-led deal navigation;
- founder access and verified funded-deal proof carried forward;
- a restrained approved-deal route animation with reduced-motion, Save-Data, and low-resource fallbacks;
- route-aware calls to action in place of the repetitive universal engagement block;
- the existing calculator, real forms, approved facts, legal routes, and analytics contracts preserved;
- purpose-built 1200×630 social artwork for the homepage, funded deals, founder/direct-lender routes, and editorial routes;
- normalized canonicals, connected schema graphs, premium Open Graph/Twitter metadata, visible FAQ/schema parity, and automated SEO checks;
- dedicated reinvention QA at mobile, tablet, and desktop widths.

Do not flatten this into a generic fintech template. Preserve the cinematic desert identity, tactile paper/ledger contrast, direct human tone, and purposeful motion.

## Regulated-content boundaries

- Business: Grand Funding LLC, direct private hard-money lender
- NMLS: `2466872`
- Arizona MLO license: `1048901`
- Phone: `(602) 935-0371`
- Email: `Logan@grandfundingllc.com`
- Real transactional paths: `/apply`, `/contact`, and programmatic lead forms

Do not alter rates, license identifiers, lending or approval claims, disclosures, testimonials, funded-deal facts, legal content, or form destinations without approved facts. Do not submit production forms without explicit authorization. Never read or expose credentials, `.env*`, client records, or submissions.

## Open production and approval dependencies

- Apex DNS currently resolves across two A records with split TLS behavior; domain/certificate provisioning needs Netlify or DNS-owner review before declaring the apex path healthy.
- Host-injected click tracking appears to duplicate repository analytics listeners; diagnose at the Netlify/analytics layer before changing source tracking.
- Google Ads lead and call conversion labels are absent. Do not invent them.
- `llms.txt` includes compliance-sensitive claims that require owner/legal review before revision or reliance.
- Brand-kit directions A/B/C are not approved. The current production identity remains authoritative until a direction is selected.

See `docs/GRAND-FUNDING-REINVENTION-2026-07-24.md` for the implementation and handoff record.
