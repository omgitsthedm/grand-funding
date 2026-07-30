# Grand Funding Site Reinvention Dossier

- Project: Grand Funding LLC public website
- Canonical repository: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- Audit branch: `agent/grand-funding-project-reinvention-20260729`
- Audit date: 2026-07-29
- Status: final hardened production release complete, verified, and recorded
- Truth model: confirmed facts, client-attested claims, observed implementation, and unresolved decisions are kept separate

## 1. Authority and boundaries

This dossier applies the following acceptance contract:

1. `/Users/davidmarsh/Desktop/LITTLE-FIGHT-NYC-MASTER-CLIENT-PROJECT-REINVENTION-HANDOFF-JULY-2026.md`
2. `/Users/davidmarsh/Desktop/FRONTEND-MODERNIZATION-BRIEF.md`
3. `AGENTS.md`
4. `SOURCE_OF_TRUTH.md`
5. `CLAUDE.md`
6. `.ai/STATE.md`
7. `.lifi/quality.yml`
8. `docs/GRAND-FUNDING-CLIENT-WEBSITE-APPROVAL-2026-07-27.md`

### Authorized in this work

- Audit the complete source and generated public artifact.
- Repair implementation defects, stale integrations, fragile build behavior, accessibility issues, performance regressions, and visual inconsistency.
- Remove or neutralize public wording that exceeds the documented client website approval without adding a new lending promise.
- Preserve the site history, old assets, prior deploys, forms, and litigation-hold material.
- Produce a local, reviewable release candidate.

### Not authorized by this work

- Mark any lending-counsel decision resolved.
- Invent a rate, point, limit, leverage value, eligibility rule, underwriting policy, draw policy, fee policy, testimonial, funded-deal fact, or referral policy.
- Delete preserved source or historical assets.
- Submit a production form or inspect production submissions.
- Change DNS, advertising accounts, analytics consent, environment variables, borrower records, or production hosting state.
- Deploy to production without a new release-specific instruction.

## 2. Source of truth

### Confirmed

- The project is a deterministic static HTML/CSS/JavaScript site.
- `scripts/build-site.mjs` is the public-artifact build entrypoint.
- `dist/` is the only publish directory.
- Required Node runtime: `24.18.0`.
- Netlify project ID: `055c5942-aeaa-478a-9508-a34406994d5d`.
- The current production release is deploy `6a6acd18828f50c85c77a2e5`, published from the exact hardened artifact associated with production-source merge `b64b409e91e457c99c0b98853be77aae85d495b7`.
- The current branch includes the separate hero video/playback repair from commit `57d52307`.

### Preservation contract

- Keep the desert-night setting, teal and ember accents, DM Sans, moving Arizona hero, and poster fallback.
- Keep direct access to Logan, the project planning calculator, existing Netlify form contracts, clean-URL routing, and route-level organic-search coverage.
- Keep historical files and unreferenced assets under hold until external URL and preservation contracts are verified.

## 3. Client website decision record

The supplied CSV contains one response row and 22 columns. Every required selection was answered.

| Topic | Exact client answer | Website boundary |
| --- | --- | --- |
| Owner occupied / primary residence | Only in specific cases | Use limited case-specific wording only |
| Products | Fix and flip; Bridge; Construction; Cash-out refinance; Second position; Land / other | Promote only these six families |
| Rates, points, loan limits, leverage | Remove these claims for now | No published numeric offer claims |
| Timing | Yes, the current timing is approved | Existing timing language may remain |
| Service area | Arizona statewide; California statewide | No nationwide or out-of-area implication |
| Aggregate volume | Keep both, records support them | Retain `1,500 loans` / `$350 million` as client-attested, documentary support still pending |
| Best lender | I need to confirm | No self-awarded best/premier comparison |
| Google Ads | We are not using Google Ads yet | Conversion labels stay dormant |
| DNS | Client will make the change and send a screenshot | No DNS action in this repository |
| Approval | Approved to update regulated website claims from these answers | Website-only approval, not legal advice |

### Unanswered policy areas discovered in the public site

The form did not ask for, and therefore did not approve, the following public claims:

- credit-score thresholds or “no minimum FICO” eligibility;
- blanket no-income-document, no-tax-return, or no-W-2 underwriting promises;
- no-prepayment-penalty or minimum-interest-period policy;
- fixed term ranges;
- numeric draw counts, inspection costs, or draw-release policy;
- categorical “no hidden fee” assurances;
- unrestricted use-of-funds promises;
- categorical interest-only or other payment-structure promises;
- categorical contractor, inspection, or project-document requirements;
- categorical property-eligibility statements;
- individual funded-deal details and amounts;
- testimonial identity, wording, or provenance;
- paid referral compensation.

These areas must not be inferred from the completed survey.

## 4. Baseline inventory

### Public surface

- 87 source HTML routes plus the Google verification document.
- 88 generated HTML documents.
- 80 indexable pages.
- 18 forms across the route set.
- 281 generated public files.
- Generated artifact size: 22.1 MiB.
- Root source files include 16 CSS files, 6 browser JavaScript files, 25 Node scripts, and 2 dormant Python generators.

### Architecture

The current site uses a layered migration architecture:

1. large inline legacy CSS in most HTML files;
2. `styles-v2.css`;
3. trust, motion, polish, token, and conversion layers;
4. build-time runtime patching;
5. build-time experience patching;
6. build-time HTML normalization;
7. build-time client-approval sanitization;
8. final public license/association redaction.

This is operationally stable but hard to reason about. Public behavior is often created after source copy rather than being obvious in the source document.

### Confirmed stale or duplicate reachability

- 68 public source pages and 68 generated pages include duplicate links to:
  - `trust-pack.css`;
  - `premium-motion.css`;
  - `premium-polish.css`;
  - `conversion-tools.css`.
- The 69 root HTML files contain approximately 4.87 MiB of repeated inline CSS.
- One 71,358-byte inline style block is repeated across 50 pages.
- One 4,658-byte inline style block is repeated across 68 pages.
- `premium.css` and `styles.css` are tracked but not production-referenced.
- `generate_pages.py` is dormant and contains stale lending language; it must not be run.
- 98 of 168 image files have no repository reference, but deletion remains prohibited pending external-URL and preservation verification.
- `.netlify/`, `dist/`, `node_modules/`, and `artifacts/` are generated/ignored data rather than public source.

## 5. Baseline validation

All baseline commands were run with Node `24.18.0`.

### Existing project gates

- deterministic build: pass;
- public artifact validation: pass;
- technical SEO: pass;
- NMLS/MLO/Forward separation in source and artifact: pass;
- July 27 client-approval validator: pass;
- frozen regulated-claim baseline: pass;
- route crawl: 174 page/viewport checks, zero failures;
- preservation: 505 checks, zero failures;
- accessibility: 20 route/profile audits, zero failures;
- conversion contracts: 17 checks, zero failures, local POSTs intercepted;
- cross-browser: 60 document checks, zero failures;
- responsive premium watchlist: 847 checks, zero failures.

### Dependency health

- `npm audit`: zero known vulnerabilities.
- `npm outdated`: no outdated direct dependencies.
- No production JavaScript dependencies.

### Mobile Lighthouse baseline

Three consecutive Lighthouse 13.4.1 mobile runs were identical:

| Category / metric | Result |
| --- | ---: |
| Performance | 85 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 2.7 s |
| LCP | 3.8 s |
| TBT | 30 ms |
| CLS | 0–0.004 |

Primary opportunities:

- approximately 93 KiB of unused CSS on the homepage;
- approximately 21 KiB of unminified CSS;
- three render-blocking global CSS requests;
- a 139 KiB initial HTML document in the local uncompressed baseline;
- approximately 44 KiB of avoidable portrait-image delivery;
- a 38 ms forced reflow attributed to `script.js`;
- unused Google analytics/tag-manager preconnects before consent.

### Accessibility gap missed by the current suite

Lighthouse identified visible-label/accessibility-name mismatches on:

- homepage funded-deal links with shortened `aria-label` values;
- the footer wordmark link.

The fix is to let the complete visible text supply the accessible name rather than overriding it with a partial label.

## 6. Public claim-surface audit

The existing client-approval validator correctly blocks published numeric rates, points, offer limits, leverage, best-lender language, service-area expansion, licensing association, and categorical occupancy statements. It does not cover several other lending claims.

### Baseline public artifact before this repair

| Unverified category | Routes | Matches | Disposition |
| --- | ---: | ---: | --- |
| Credit eligibility / minimum FICO | 10 | 14 | Neutralize and fail closed |
| Prepayment policy | 17 | 49 | Neutralize categorical promises; allow transaction-specific disclosure wording |
| Blanket income/documentation policy | 21 | 64 | Neutralize and fail closed |
| Fixed term ranges | 9 | 12 | Neutralize and fail closed |
| Draw policy | 12 | 14 | Neutralize and fail closed |
| Categorical fee assurances | 2 | 2 | Neutralize and fail closed |
| Unrestricted use-of-funds promises | 1 | 2 | Neutralize and fail closed |
| Categorical payment-structure promises | Late diff | Previously ungated | Neutralize and fail closed |
| Categorical project requirements | Late diff | Previously ungated | Neutralize and fail closed |
| Categorical property eligibility | Late diff | Previously ungated | Neutralize and fail closed |
| Individual funded-deal facts | 17 | 74 | Preserve, inventory, and require documentary verification before expansion |
| Testimonial signals | 5 | 5 | Preserve, inventory, and require provenance before expansion |
| Paid referral compensation | 1 | 4 | Preserve, inventory, and require client/counsel decision |
| Business identity and history claims | Existing route set | Previously ungated | Freeze pending role and history evidence map |

The zero-tolerance association scan found no Forward Loans, Forward Holdings, NMLS, MLO, `2466872`, or `1048901` reference in the generated public artifact.

### Final local candidate

| Controlled category | Generated files | Matches | Final control |
| --- | ---: | ---: | --- |
| Credit eligibility / minimum FICO | 0 | 0 | Fail closed |
| Categorical prepayment or seasoning policy | 0 | 0 | Fail closed |
| Blanket income/documentation policy | 0 | 0 | Fail closed |
| Fixed term ranges | 0 | 0 | Fail closed |
| Draw policy | 0 | 0 | Fail closed |
| Categorical fee assurances | 0 | 0 | Fail closed |
| Unrestricted use-of-funds promises | 0 | 0 | Fail closed |
| Categorical payment-structure promises | 0 | 0 | Fail closed |
| Categorical project requirements | 0 | 0 | Fail closed |
| Categorical property eligibility | 0 | 0 | Fail closed |
| Individual funded-deal facts | 18 | 77 | Frozen pending documentary verification |
| Testimonial signals | 5 | 9 | Frozen pending provenance |
| Paid referral compensation | 1 | 4 | Frozen pending client/counsel decision |
| Business identity and history claims | 71 | 251 | Frozen pending role and history evidence map |

## 7. Experience audit

### Visitor goal

The primary visitor is an investor, builder, broker, or property operator who needs to know:

1. whether the scenario is in Grand Funding's review territory;
2. what information is needed;
3. what process and timing to expect;
4. how to send the deal or call Logan;
5. what proof is available and how trustworthy it is.

### Baseline strengths retained

- Direct phone and application paths are visible.
- The hero uses authentic Arizona-night footage.
- The project calculator is a useful non-lending planning tool.
- Route coverage answers local and product search intent.
- Forms have labels, local success/error/timeout behavior, and no-JS fallback.
- The site works without a JavaScript-dependent navigation shell.

### Baseline friction identified

- The homepage leads with a large claim disclaimer instead of a concise scenario-readiness explanation.
- Funded deals dominate the hero before their documentary provenance is represented in the repository.
- Product and location pages repeat broad template sections and long claim-heavy FAQs.
- The products page starts with a generic “comprehensive solutions” title and a large quiz card rather than a precise deal-selection frame.
- Cookie consent occupies a large portion of mobile viewport height.
- Repeated pre-approval language can imply a stronger decision than the form's limited scope explains.
- Multiple visual systems compete: desert cinema, generic dark SaaS, glass cards, gradient headings, pill buttons, stats, and repeated three-column grids.

This branch resolves the generic products-page framing, mobile consent density, and competing gradient/glass visual layers, and removes the unverified proof panel from the mobile/tablet hero. The claim-first hero copy, desktop proof provenance, and long-tail content consolidation remain decision-owner or later editorial work.

## 8. Committed design direction

### Direction: Arizona Night Deal Desk

Grand Funding should feel like a private deal desk operating after dark, not a generic fintech dashboard.

Core characteristics:

- preserve the moving Arizona hero as the only cinematic layer;
- use flat ink-black and graphite surfaces outside the hero;
- use teal for action/readiness and ember for timing or attention;
- use thin ruled lines, document-like metadata, and restrained corners;
- favor scenario files, underwriting checklists, and process ledgers over generic feature cards;
- remove gradient text, gradient buttons, ornamental glows, and default glass panels;
- reserve pills for true statuses or product tags;
- keep motion short, purposeful, and transform/opacity only;
- make proof read like a dossier with provenance, not a vanity stat wall.

### Deliberately rejected patterns

- gradient headings;
- gradient CTA fills;
- glassmorphism as a default surface;
- nested rounded cards;
- repeated “three benefits” grids;
- decorative stat strips without a decision role;
- shimmer effects;
- ambient animated glows;
- raw arrow glyphs used as primary iconography;
- fabricated urgency, fabricated metrics, or unsupported proof.

## 9. Implementation waves

### Wave 1 — truth, build, and quality spine — completed

- Add a public-claims policy validator for the uncovered categories.
- Neutralize unapproved credit, documentation, prepayment, fixed-term, payment-structure, draw, project-requirement, property-eligibility, use-of-funds, and fee promises without inventing replacements.
- Keep the client-approved timing values and aggregate volume language without adding a new claim; remove timing occurrences only when they are inseparable from unsupported policy copy.
- Dedupe repeated stylesheet references in the generated artifact.
- Remove pre-consent analytics preconnects.
- Fix known accessible-name mismatches.
- Add budgets and newly discovered decision gaps to `.lifi/quality.yml` and the debt ledger.

### Wave 2 — delivery and runtime — completed

- Produce deterministic minified CSS bundles while preserving cascade order and legacy direct URLs.
- Externalize and content-hash large repeated inline CSS blocks in the generated artifact.
- Preserve route-specific CSS after the shared layers.
- Keep form names/actions and all no-JS POST behavior unchanged.
- Measure the new artifact with three mobile Lighthouse runs.

### Wave 3 — visual system — completed

- Apply the flat Arizona Night Deal Desk system through the authoritative refinement layer.
- Remove gradient headings/buttons, excessive glass, and ornamental card lift.
- Tighten mobile cookie-consent density.
- Preserve the hero video, reduced-motion fallback, Save-Data/slow-network fallback, and poster.
- Verify representative routes at mobile, tablet, laptop, and desktop sizes.

### Wave 4 — proof and content decisions — decision-owner work remains

These are decision-owner items, not implied implementation permission:

- documentary source for every individual funded deal;
- testimonial source, approved wording, identity/attribution, and permission;
- paid-referral eligibility, compensation, disclosures, and jurisdictional constraints;
- formal lending-counsel treatment of the seven existing strict categories;
- credit/documentation/prepayment/term/draw/fee policy if any specific language should return.

## 10. Implemented result

### Truth and claims

- Added a fail-closed public-claims policy with ten hard-block categories:
  - credit and adverse-credit eligibility;
  - blanket income, documentation, asset-based, or no-credit-pull promises;
  - categorical prepayment or seasoning promises;
  - fixed loan-term ranges;
  - construction and rehabilitation draw policies;
  - categorical fee assurances;
  - unrestricted use-of-funds promises;
  - categorical payment-structure promises;
  - categorical contractor, inspection, or project requirements;
  - categorical property-eligibility statements.
- Added frozen evidence inventories for individual funded-deal facts, testimonials, paid referral compensation, and business identity/history claims.
- Neutralized unsupported long-tail wording across source and generated routes, including glossary and FAQ variants that the client survey did not ask about.
- Removed every remaining `asset-based` formulation after the final production copy probe found a legacy “Income docs: None” comparison claim; the public-claims policy now rejects any recurrence in source or generated output.
- Preserved the client-approved timing and aggregate-volume wording without expanding it.
- Confirmed that current source and generated public output contain no Forward, NMLS, MLO, `2466872`, `1048901`, or Grand Funding licensing assertion.

### Build and delivery

- Added a deterministic CSS optimizer to preserve cascade order, deduplicate route styles, remove pre-consent analytics preconnects, repair known accessible names, minify with Lightning CSS, and emit content-addressed bundles.
- Every generated website page now uses one stylesheet and no inline `<style>` block; the standalone Google verification token document intentionally has no stylesheet.
- The final build contains 294 public files and is 18.3 MiB, compared with the 22.1 MiB baseline.
- Thirteen content-addressed CSS bundles remove 6.2 MiB of repeated generated HTML while preserving route-specific styling.
- Two consecutive final builds produced the same aggregate SHA-256:
  `8af2323876df6cd2d6e4ef857ee9a8ecbdfd9f2bfccbe7c422528dacebd1c6e6`.

### Experience and accessibility

- Applied the flat Arizona Night Deal Desk system across the full route set.
- Rendered-route inspection found zero visible gradient backgrounds, masks, headings, buttons, glows, or border effects.
- Kept the Arizona hero video as the sole cinematic layer and added a true static poster behind it.
- Normal-motion verification: the MP4 resolves, reaches a playable media state, and plays.
- Reduced-motion verification: the video is hidden, the Arizona poster remains visible, and the MP4 makes zero requests.
- Removed the unverified funded-deal proof panel from the mobile and tablet hero while keeping the decision path and approved timing signals.
- Fixed contrast regressions exposed by flattening legacy gradient fills.
- Tightened mobile consent density and preserved the requested gap between the hero and the following content.

## 11. Final local validation

All commands used Node `24.18.0`.

| Gate | Final result |
| --- | --- |
| Static build and artifact validation | 88 HTML documents / 294 public files, pass |
| Technical SEO | 87 HTML documents, pass |
| License and association separation | Source and generated artifact, pass |
| Client website approval | Source and generated artifact, pass |
| Public claim policy | 10 fail-closed categories / 4 frozen evidence surfaces, pass |
| Frozen regulated-claim baseline | 1,100 source / 1,189 generated matches, pass |
| Runtime route crawl | 174 page/viewport checks, 0 failures |
| Preservation | 505 checks, 0 failures |
| Accessibility | 20 page/profile audits, 0 failures |
| Conversion contracts | 17 checks, 0 failures; local POSTs intercepted |
| Cross-browser profiles | 60 document checks, 0 failures |
| Responsive watchlist | 847 checks, 0 failures |
| Dependency audit | 0 known vulnerabilities; no outdated direct dependencies |
| Netlify target assertion | `grandfundingllc` / `055c5942-aeaa-478a-9508-a34406994d5d`, pass |

### Mobile Lighthouse candidate

Three final-artifact Lighthouse 13.4.1 runs produced performance scores of 89, 90, and 90.

| Category / metric | Baseline | Candidate median |
| --- | ---: | ---: |
| Performance | 85 | 90 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 2.7 s | 2.25 s |
| LCP | 3.8 s | 3.30 s |
| TBT | 30 ms | 0 ms |
| CLS | 0–0.004 | 0.004 |

The final median transferred 837,805 bytes. The remaining measured frontend opportunity is route-level CSS pruning: Lighthouse estimates approximately 92.5 KiB of homepage CSS can still be removed, while reporting zero unused JavaScript bytes. That is recorded as debt rather than addressed with unsafe cross-route selector deletion in this litigation-hold and static-template context.

## 12. Remaining decision-owner gates

Strict release validation intentionally remains blocked on seven documented decisions:

1. occupancy and consumer-purpose policy;
2. future rates and points policy;
3. future numeric loan-sizing policy;
4. future numeric leverage policy;
5. formal timing taxonomy;
6. licensed service-area confirmation;
7. documentary support and counsel approval for aggregate volume and any comparative proof.

The funded-deal records, testimonial provenance, referral-compensation policy, direct-lender language, history/experience language, and capital-source language must not be expanded without their named documentary and counsel owners.

## 13. Release state

This dossier did not itself authorize deployment. After receiving the completed audit, zero-failure quality results, and disclosure of the remaining client/counsel decisions, David supplied a new release-specific instruction on 2026-07-29: “let's push it all live.”

That one-time authorization has been consumed and closed.

### Reviewed release chain

- Candidate commit `b6d070970aae69e32ff01d8ef7ad803e0b659a70` passed the independent GitHub gate and merged through [PR #16](https://github.com/omgitsthedm/grand-funding/pull/16) as `f201615d60b6601383f3f9cecae7501240890fb2`.
- Immutable preview `6a6ac209b9f827221dcca3f5` and interim production deploy `6a6ac663cc09269d86bad25c` passed the full live matrix and artifact-parity checks.
- The final focused copy probe then found a legacy “Income docs: None — asset-based” formulation that the earlier category expression did not catch. It was removed everywhere, and the public-claims validator was strengthened to reject any asset-based formulation.
- Hardening commit `28dcfcddcef3075068b721bc8e8f74cac5a6073c` passed the independent GitHub gate and merged through [PR #17](https://github.com/omgitsthedm/grand-funding/pull/17) as `b64b409e91e457c99c0b98853be77aae85d495b7`.
- Hardened preview `6a6acad9385847c56c5c2015` passed 1,606 live checks with zero failures.
- The exact unchanged hardened artifact was published as production deploy `6a6acd18828f50c85c77a2e5` at `2026-07-30T04:03:49.811Z`.

### Final production evidence

- Netlify reports deploy `6a6acd18828f50c85c77a2e5` as `ready`, `production`, and current for `https://www.grandfundingllc.com`.
- Artifact SHA-256: `8af2323876df6cd2d6e4ef857ee9a8ecbdfd9f2bfccbe7c422528dacebd1c6e6`.
- Local matrix: 1,623 checks, zero failures.
- Final preview matrix: 1,606 checks, zero failures.
- Final custom-domain matrix: 1,606 checks, zero failures.
- Artifact parity passed on both the immutable deploy URL and custom domain: all 294 files accounted for, 205 non-HTML assets byte-identical, 88 HTML documents semantically identical after expected Netlify form normalization, and all 18 form contracts intact.
- Both deployed surfaces returned zero Forward, NMLS, MLO, sponsored-license identifier, Grand Funding licensing assertion, asset-based, or rejected no-income-document matches.
- On the custom domain, the desktop hero video returned HTTP `206`, reached `readyState 3`, and played. The hero title and primary action had no gradient; the full visible hero subtree had zero gradient backgrounds or masks; and the measured break before the next section was 20 pixels.
- In the reduced-motion profile, the video was hidden and paused, no media source was attached, the MP4 made zero requests, and the loaded 1,280-pixel poster remained visible.

No DNS, advertising, environment-variable, production-form, submission-review, borrower-record, analytics-consent, or strict-claim state was changed. No live form was submitted. The seven strict claim categories and named proof-provenance decisions remain unresolved.

Pre-hardening deploys can reintroduce the wording removed in the final pass and are not approved rollback targets. An operational rollback must redeploy this exact hardened artifact or use a later artifact that passes the same claims, parity, and live-browser gates.
