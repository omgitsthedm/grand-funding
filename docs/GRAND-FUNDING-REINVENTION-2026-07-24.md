# Grand Funding Reinvention — 2026-07-24

## Executive handoff

Grand Funding’s next website has been implemented locally as **Desert Deal Room / Desert Ledger**: a more focused, editorial, human lending experience that uses the language of title work, surveys, deal files, and desert geography instead of default SaaS grids.

The work preserves the existing regulated-content and transaction contracts while rebuilding the public artifact through a deterministic `dist/` pipeline. It adds purpose-built social-share art, route-aware metadata, canonical-aligned connected schema, a clearer homepage narrative, resilient motion, and a dedicated cross-viewport QA suite.

The reinvention was merged through GitHub PR #4 and published to production on 2026-07-25. Post-release verification passed without submitting any form.

## Verified authority

| Item | Current truth |
|---|---|
| Canonical Git root | `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding` |
| Branch | `master` |
| Remote | `https://github.com/omgitsthedm/grand-funding.git` |
| Released source commit | `405425596a705c05e3dfc009530e0d1b313a708d` |
| Live URL | `https://www.grandfundingllc.com` |
| Netlify project | `grandfundingllc` |
| Netlify site ID | `055c5942-aeaa-478a-9508-a34406994d5d` |
| Current live deploy | `6a644622ea5f470fa52d2f07` |
| Published | `2026-07-25T05:14:14.825Z` |
| Build | `npm run build` |
| Public directory | `dist/` |
| Deploy mode | Manual; Git pushes do not publish |

The local Netlify project link was discovered pointing at `chromatic-painting-design`. It was safely unlinked and relinked to Grand Funding without changing production. `scripts/assert-netlify-target.mjs` now fails release preflight unless both the expected project name and site ID match.

## Preservation contract

The following were treated as constraints, not redesign material:

- NMLS `2466872`
- AZ MLO `1048901`
- approved rates, product terms, underwriting language, lending and approval claims
- disclosures, testimonials, funded-deal facts, legal text, and contact details
- real `/apply`, `/contact`, and programmatic form destinations and field contracts
- calculator behavior
- existing analytics identifiers and consent behavior
- current routes, redirects, and index/noindex intent
- established cinematic desert identity and current production logo

No production form was submitted. No compliance-sensitive fact was invented.

## Experience direction

### Core idea

The product should feel like entering an experienced lender’s deal room, not opening another fintech dashboard. The design combines:

- dark Sonoran-night atmosphere;
- warm title-document and survey-paper surfaces;
- parcel lines, docket labels, route traces, stamps, and deal-file typography;
- direct access to Logan;
- verified proof before feature inventory;
- restrained interaction that helps a borrower understand the path to closing.

### Homepage hierarchy

The generated homepage is deliberately reduced to eight major sections:

1. Deal-room hero with a scenario docket
2. Funded-deal proof
3. Direct Logan/founder access
4. Scenario ledger
5. Preserved loan calculator
6. Approved-deal route
7. Six visible frequently asked questions
8. Preserved pre-approval intake

The original calculator and Netlify form are extracted from source and inserted into the new template during the build, avoiding an independent copy that could drift.

### Interaction and motion

- The signature motion draws the deal route from scenario through closing.
- Docket controls expose contextual guidance without implying approval or commitment.
- One reveal system replaces overlapping animation behavior.
- Reduced-motion, Save-Data, effective-connection, and device-memory signals reduce or remove nonessential motion.
- Content remains visible without JavaScript; reveals fail open.
- Mobile navigation manages focus on open, Escape, and close.
- Sticky conversion UI yields to consent and is removed from routes where it would duplicate the primary action.

## Conversion and content improvements

- Removed the repetitive universal engagement block from the built experience.
- Added compact route-aware next actions that respect each page’s intent.
- Removed unsupported real-time availability language from the built application route.
- Kept direct founder access without duplicating Logan panels.
- Repaired the blog index into 18 independent article cards with one title and one link each.
- Corrected malformed blog-card heading markup and known “Loan Loans” and “California, California” copy defects.
- Removed duplicate immediate GTM and Google Ads loaders from the generated contact page where deferred source loaders already exist.
- Corrected mutable-image caching while retaining immutable caching for dated social assets.
- Replaced generic duplicate descriptions with route-specific, conservative descriptions.
- Preserved exact approved funded proof, including the Payson and Scottsdale examples already present in source.

The work improves clarity and eligibility for discovery; it does not promise rankings, answer-engine inclusion, lead volume, or market dominance.

## Social-share system

Four art-directed 1200×630 JPEGs replace generic screenshots:

- `images/social/og-home-desert-deal-room-20260724.jpg`
- `images/social/og-funded-deals-20260724.jpg`
- `images/social/og-logan-direct-lender-20260724.jpg`
- `images/social/og-deal-desk-brief-20260724.jpg`

Route profiles assign the appropriate composition to home, funded proof, founder/conversion, and editorial pages. Existing strong article artwork is preserved where available.

The build adds or normalizes:

- `og:image`, type, width, height, and alt text
- `og:site_name` and `og:locale`
- Twitter card, title, description, image, and alt text
- route-appropriate absolute image URLs
- a correct 180×180 Apple touch icon

`scripts/generate-social-art.mjs` provides deterministic regeneration rather than relying on page screenshots.

## SEO and AEO hardening

The generated public artifact now:

- aligns schema URLs with each canonical;
- emits one connected JSON-LD graph per indexable document;
- uses Organization, WebSite, WebPage or CollectionPage, BreadcrumbList, and only route-supported entities;
- adds BlogPosting to editorial posts;
- emits FAQ schema only where each complete question and complete answer are visibly present, with exact normalized parity across supported routes;
- removes inherited Arizona schema from California routes;
- removes schema from noindex documents;
- avoids unsupported address, geo, and speakable entities;
- fixes malformed heading output;
- normalizes route-specific descriptions;
- updates generated sitemap modification dates;
- corrects the AI-crawler directive to `Google-Extended`;
- enforces premium social metadata and schema/canonical parity with `scripts/validate-seo.mjs`.

`llms.txt` was intentionally not rewritten. It contains compliance-sensitive unsupported claims and requires owner/legal review before it can be treated as authoritative or changed.

## Build and public-artifact boundaries

- `scripts/build-site.mjs` is the release compiler.
- `templates/home-main.html` remains private source and is not published.
- Only allowlisted public pages/assets are copied into `dist/`.
- `grand-experience.css` and `grand-experience.js` are public experience layers.
- Source files, package metadata, generators, QA scripts, internal docs, and `.netlify` metadata remain outside the public artifact.
- Root legacy HTML remains source material; the generated `dist/` artifact is release truth.

Never deploy the repository root and never use `--dir=.`.

## QA and CI

### Local release sequence

```bash
npm ci
npm test
npm run serve -- --dir dist --port 8888
BASE_URL=http://127.0.0.1:8888 npm run test:reinvention
BASE_URL=http://127.0.0.1:8888 npm run test:crawl
BASE_URL=http://127.0.0.1:8888 npm run test:premium
npm run verify:netlify-target
```

The reinvention suite exercises:

- `/`
- `/apply`
- `/blog`
- `/bridge-loans-california`
- `/funded-deals`
- `/thanks-contact`

at 390×844, 768×1024, 800×900, and 1440×900. It checks response health, one H1/main, horizontal overflow, experience assets, premium social metadata, connected schema, canonical alignment, broken images, route markers, real-user animation behavior, post-scroll reveal safety, consent/sticky collisions, mobile-menu focus, preserved homepage form/calculator/FAQ, application-route contracts, blog semantics, analytics isolation, and thank-you-route suppression.

The branch/PR CI workflow serves and tests the built artifact. The separate premium workflow is now a manual read-only monitor for an already-published URL, avoiding the previous implication that a Git push deployed production.

### Completed closeout evidence

- `npm ci`: three packages installed; zero vulnerabilities.
- `npm test`: 277 public files built; 88 HTML documents and 277 public files validated; SEO validation passed for 87 HTML documents.
- Reinvention QA: 536 checks across six routes and four viewports; zero failures.
- Full crawl: 174 runtime checks across 87 routes at mobile and desktop widths; zero failures.
- Premium gate: 2,849 checks across 37 pages and seven breakpoints; zero total, watchlist, or unique-page failures.
- Python generator compile, production dependency audit, exact Netlify target assertion, and `git diff --check`: passed.
- An independent adversarial verifier found no remaining code, schema, metadata, asset, form, or responsive regression in the fresh artifact.
- `netlify build --context deploy-preview` completed without changing the generated artifact; the SHA-256 before and after was `4d6dc1ce4794022187247ba72bd7cbc1808b290f0be19b687b7e09aeb686e684`.

The host-installed `@netlify/plugin-lighthouse` returned a local document-request 404 during that Netlify-aware build, although Netlify reported the plugin and build complete. Verify the plugin against an authorized preview or reconfigure it at the hosting layer; this did not alter or invalidate the local artifact.

### Release verification

- GitHub PR #4 merged cleanly after the Grand Funding QA workflow passed.
- Preview deploy `6a643ffee17381e219647c04`: 536 reinvention checks, 174 runtime crawl checks, and 847 premium watchlist checks passed with zero failures.
- Production deploy `6a644622ea5f470fa52d2f07`: Netlify state `ready`.
- Production: 536 interaction checks across six routes and four viewports passed.
- All 80 production sitemap URLs returned successfully.
- Representative HTML, XML, Apple icon, and social-card requests returned correct status and MIME types.
- Post-release PR #6 added an explicit manifest header; `site.webmanifest` now returns `application/manifest+json` with `nosniff`.
- Netlify recognizes the deployed forms; no test lead was submitted.

## Changed areas

### Experience and assets

- `templates/home-main.html`
- `grand-experience.css`
- `grand-experience.js`
- `images/social/`
- `scripts/generate-social-art.mjs`

### Build, search, and QA

- `scripts/build-site.mjs`
- `scripts/validate-seo.mjs`
- `scripts/qa-reinvention.mjs`
- `scripts/assert-netlify-target.mjs`
- `generate_pages.py`
- `robots.txt`
- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/premium-qa.yml`

### Operational documentation

- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `SOURCE_OF_TRUTH.md`
- `PROJECT_STATUS.md`
- `.ai/STATE.md`
- this handoff

## Open dependencies and risks

### Release blockers

1. **Apex TLS split:** the apex domain’s two A records do not behave consistently under TLS. Resolve certificate/domain provisioning with the DNS owner or Netlify before claiming full apex health.
2. **Host-injected duplicate analytics:** click listeners appear to be injected outside this repository and duplicate source tracking. Reconcile at the Netlify/analytics layer.
3. **Google Ads labels:** approved lead and call conversion labels are not present. Do not invent them.
4. **`llms.txt` review:** unsupported compliance-sensitive claims require owner/legal review.
5. **Brand approval:** directions A/B/C remain unapproved; keep the current identity until one is selected.
6. **Host Lighthouse plugin:** verify or reconfigure the host-installed plugin on an authorized preview after its local document-request 404.

### Generated-rule drift

`.ai/RULES.md` is generated and still describes the obsolete root-publish/push-deploy workflow. It was not hand-edited. `.ai/STATE.md` records a proposal to update the rules header and regenerate the canonical rules through the proper AI-Ops path.

## Exact next actions

1. Obtain owner/legal decisions for `llms.txt`, Ads labels, and brand direction.
2. Resolve or explicitly accept the apex TLS and host-injected analytics risks.
3. Reconfigure or deliberately remove the host-installed Lighthouse plugin if a future Netlify build is expected to use it.
4. Monitor production analytics for duplicate measurement after the release.
5. For any future release, repeat the target guard, local suite, inspected preview, scoped authorization, production deploy, and live verification sequence.

## Release statement

The reinvention is live at `https://www.grandfundingllc.com` on deploy `6a644622ea5f470fa52d2f07`. The released source is GitHub commit `405425596a705c05e3dfc009530e0d1b313a708d`. DNS, host analytics, Ads labels, `llms.txt`, brand approval, and the optional host Lighthouse plugin remain external follow-ups.
