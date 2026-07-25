# Grand Funding Client-Independent Elevation Handoff

Date: 2026-07-25
Status: production release authorized and in progress
Production: pending preview and live verification

## Objective

Sharpen the existing Grand Funding experience without repainting the car a different color: preserve the cinematic desert-night identity, moving Arizona hero, teal and ember palette, Logan-led trust, funded-deal proof, calculator, and native Netlify form flow while removing friction and strengthening reliability, accessibility, sharing, SEO/AEO infrastructure, and release safety.

## Source and separation

- Repository: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Candidate branch: `agent/grand-funding-continuous-elevation-july-2026`
- Base and current committed HEAD: `e135a678cb4c284cd8857ed3c32eba2bd545db3b`
- Live site: `https://www.grandfundingllc.com`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Public build: `dist/`

The verified candidate is ready to commit. Production authorization and the one-time exact-baseline claims exception are recorded in `docs/PRODUCTION-RELEASE-AUTHORIZATION-2026-07-25.md`.

## Completed

### Experience and conversion

- Homepage flow is hero → trust → Logan → calculator → loan choices.
- Mobile keeps three funded-deal cards in a compact horizontal proof strip instead of hiding all proof.
- Funded cards link to the existing funded-deals route.
- Sticky CTAs suppress themselves around heroes, loan finder, calculator, Logan, blog callout, and forms.
- The redundant blog-toolbar CTA was removed while the main conversion callout remains.
- CTA labels and locations are classified without collecting visitor-entered data.

### Forms and measurement

- Application and contact buttons now say `Send Deal Details` and `Send Message`.
- Forms expose accessible pending status, disabled/busy behavior, duplicate-submit prevention, and 12-second recovery.
- Native Netlify POST behavior, form names, actions, honeypots, and no-JS fallback remain intact.
- Lead conversion events require a fresh matching submission marker, matching thank-you route, analytics consent, and a one-time guard.
- Direct thank-you visits and refreshes cannot generate leads.
- Phone tracking has one runtime owner.
- Google Ads events remain dormant while labels are placeholders.
- All analytics payloads added in this scope are PII-free.

### Accessibility and resilience

- FAQ questions are native buttons with controls, expanded state, labeled regions, and true hidden panels.
- Tables have captions, scoped column headers, and labeled blank corner cells.
- Standalone text and phone actions meet mobile touch-target requirements.
- Mobile-menu focus handling and reliable content reveal behavior remain protected.
- Browser QA intercepts local form POSTs and blocks Google, Meta, Clarity, Hotjar, Segment, and PostHog telemetry.

### Motion and performance

- The original hero MP4 and poster remain.
- The MP4 is not attached for reduced motion, Save-Data, 2G/slow-2G, mobile, or hidden documents.
- A capable desktop opened in the background attaches the MP4 when brought to the foreground.
- CSS and JavaScript query versions are generated from content hashes.
- No animation system, calculator behavior, or hero identity was removed.

### SEO, AEO, and premium sharing

- Five managed premium share families cover Logan, funded deals, loan programs, markets, and investor guides; the existing premium home card remains separate.
- Loan/program mapping covers 34 routes; Arizona/California market art covers 10 routes.
- Unique approved article art is preserved; six articles without unique art use the investor-guide family.
- All managed cards are 1200×630 JPEGs with route-appropriate alt text.
- An 18-item RSS feed and discovery links were added.
- Feed descriptions are neutral and do not republish unresolved offer claims.
- Canonicals, schema policy, sitemaps, redirects, social images, alt text, and robots rules remain build-validated.

### Engineering and cleanup

- Node `24.18.0`, Playwright `1.62.0`, and axe `4.12.1` are pinned.
- Netlify CLI calls are pinned to `27.0.0`.
- This checkout has an explicit ignored Netlify site link, and deploy preflight verifies both the `grandfundingllc` name and exact site ID before any upload command can run.
- Unified CI runs the exact built artifact across fast and browser gates.
- Live premium QA is manual, telemetry-blocked, and cannot race a push against production.
- Claims validation actively freezes seven regulated categories in source, built HTML, `llms.txt`, and `feed.xml`.
- Dead-code candidates are inventoried but not deleted without external-URL and source-asset proof.
- Generated QA evidence moved from tracked `scripts/` into ignored `artifacts/`.
- Canonical project documentation now reflects `dist/`, manual deploy truth, and current blockers.

## Validation

Verified final closeout baseline:

- Build: 279 public files
- HTML: 88 documents
- Indexable pages: 80
- Redirect rules: 169
- RSS: 18 items
- SEO: 87 real documents
- Claims: 2,268 source and 1,623 built high-risk matches frozen across seven categories
- Runtime crawl: 174 mobile/desktop page checks, zero failures
- Accessibility: 20 audits, zero failures
- Conversion: 17 contract checks, zero failures, local POST interception only
- Cross-browser: 60 document checks across Chromium, Firefox, WebKit, Android, and iPhone profiles, zero failures
- Premium responsive gate: 847 checks, zero failures
- Local Lighthouse: mobile 85 performance and 100 accessibility/best practices/SEO; desktop 100 in all four categories; zero layout shift on both profiles
- Production dependency audit: zero vulnerabilities

These closeout commands passed after the last source change:

```bash
npm run quality:fast
npm run quality:full
npm audit --omit=dev
```

The local candidate is verified. `npm run validate:claims:release` correctly fails on exactly seven unresolved decisions. David Marsh explicitly authorized one production release after that blocker was disclosed. The authorization permits only the exact frozen baseline already present on the live site; it does not approve or resolve any claim, and the strict gate remains unchanged for future releases.

## Client/legal decisions required

1. Authoritative owner-occupancy and consumer-purpose policy
2. Approved rate and points ranges by product, with qualifiers and effective date
3. Approved minimum and maximum loan amounts by product
4. Approved LTV, ARV, LTC, and CLTV definitions and caps by product
5. Separate qualified expectations for decision, term sheet, closing, and funding
6. Licensed origination footprint and rules for any transaction outside Arizona and California
7. Documentary support or removal authorization for lending-volume and `best lender` claims

The exact conflict evidence and owners are in `.lifi/regulated-claims.json`. Strict release must remain blocked until those decisions are reconciled across every public surface.

## External configuration

- Google Ads: obtain approved application, contact, and phone conversion labels from the authorized account owner. Do not invent them.
- Porkbun DNS: remove only the failing apex `A` record `99.83.190.102`, preserving `75.2.60.5`, the `www` CNAME, and every unrelated record. Client instructions are on the Desktop.
- Physical QA: spot-check real iOS Safari, Android Chrome, keyboard/screen-reader use, and constrained networks before production.

No PostHog account, login, or integration is required.

## Deferred, controlled engineering work

- Consolidate overlapping legacy observers and motion code only in small batches behind the preservation suite.
- Do not run or revive `generate_pages.py` until it consumes one approved claims source and passes uniqueness governance.
- Do not delete `assets/`, legacy CSS, or unreferenced-image candidates until direct external URLs, ads, email, cache history, and irreplaceable originals are checked.
- Regenerate `.ai/RULES.md` through the canonical AI-Ops generator; the source header is current, but the generated file is stale.

## Release and recovery

Default release:

```bash
npm ci
npm run quality:release
npm run deploy:preview
# Verify preview, then obtain explicit production authorization.
npm run deploy:production
```

Never publish the repository root. Future releases must use strict claims validation unless a new, explicit, narrowly scoped exception is documented after the blocker is disclosed.

The 2026-07-25 release is governed by the separately documented one-time operator authorization. It must use `dist/` only, pass the complete non-strict baseline and browser suite, verify a preview, publish the same artifact, and leave all seven claims issues unresolved.

If a committed candidate must be reversed, use a normal revert commit. If a production deploy must be reversed, select a known-good deploy in Netlify deploy history. Do not force-push or use a destructive local reset as an operational rollback.

## Changed areas

- Quality: `.github/workflows/`, `.lifi/`, `.node-version`, `package.json`, `package-lock.json`
- Runtime: `consent.js`, `original-refinement.css`, `original-refinement.js`
- Build: `scripts/build-site.mjs`, refinement, normalization, RSS, social-art, and validators
- QA: crawl, preservation, accessibility, conversion, cross-browser, premium, and unified runner
- Assets: two new premium social cards under `images/social/`
- Documentation: canonical project docs, AI-Ops state/header, and this handoff

## Next action

Send `/Users/davidmarsh/Desktop/GRAND-FUNDING-CLIENT-DECISIONS-HANDOFF-2026-07-25.md` to Logan and lending counsel. Once the answers and supporting sources return, reconcile claims once, run the strict release gate, preview, verify, and request production authorization.
