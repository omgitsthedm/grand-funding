# Grand Funding full-site audit — 2026-07-20

> **Historical release snapshot.** Keep this for evidence, but use `SOURCE_OF_TRUTH.md` and `docs/GRAND-FUNDING-CLIENT-INDEPENDENT-ELEVATION-2026-07-25.md` for current commands, blockers, and release state.

## Objective

Audit and repair the complete Grand Funding site across source quality, UI/UX, accessibility, responsive behavior, performance, security, forms, and deployment. Preserve approved lender facts and never submit a real lead during QA.

## Baseline

- Canonical site: `https://www.grandfundingllc.com`
- Netlify site: `grandfundingllc` (`055c5942-aeaa-478a-9508-a34406994d5d`)
- Architecture: 86 public pages plus one Google ownership-verification HTML artifact, shared CSS/JS, and two Python content generators
- Live Lighthouse mobile homepage: Performance 99, Accessibility 100, Best Practices 100, SEO 100
- Existing premium gate: 616 checks passed, but it did not test visible menu affordances, raw document integrity, links, or publish exposure

## Findings

| Severity | Finding | Evidence |
|---|---|---|
| Critical | Repository-root publishing exposed implementation files | Live `package.json`, `package-lock.json`, `generate_pages.py`, `scripts/qa-report.json`, and `PREMIUM_STANDARDS.md` returned 200 |
| Critical | Mobile navigation control was visually absent | Toggle existed at 390px, but all three bars computed to `height: 0px` |
| High | Homepage trust strip shipped with malformed HTML | `class="trust-stripsection class="trust-strip"` was present locally and live |
| High | 39 pages lacked explicit `</body></html>` closers | Full source structure scan |
| High | Four user-facing references were broken | Two Orange County loan links and two blog hero/OG image paths |
| High | Homepage lead form lacked source-level Netlify declaration | Form had `form-name` but no `data-netlify` or honeypot declaration on the form |
| Medium | Apply-page text fields were 42px tall on mobile | Real-browser touch-target measurement |
| Medium | Generic CI skipped the project’s actual QA | No exact `test` or `build` script existed, so both conditional steps were bypassed |
| Medium | 7,447 unused Material Design icons were tracked | Zero source references; 29 MiB under `assets/icons/mdi-all` |
| Low | Two article titles exceeded 70 characters and GTM iframes lacked titles | Targeted HTML standards validation |

## Repairs

- Added an allowlisted `dist/` build and changed Netlify to publish only that directory.
- Added structural/link/schema/form/image validation for all built documents.
- Added a dependency-free local static server and a real CI rail: build, validate, install Chromium, then run the ranking-page premium gate.
- Repaired the mobile menu bars and added automated checks for visibility, viewport placement, trust-strip class integrity, and mobile form touch targets.
- Repaired homepage trust markup and its Netlify form declaration without submitting a lead.
- Added explicit document closers to 39 pages and generator safeguards to keep them present.
- Repaired the four broken references using existing approved site destinations/assets.
- Added explicit input types, GTM iframe titles, and shorter article titles without altering lending claims.
- Removed the unreferenced 7,447-file icon dump from the repository; preserved client photo/media source assets outside the public build.
- Preserved all rates, license identifiers, underwriting claims, testimonials, disclosures, funded-deal claims, and conversion copy.

## Validation

- `npm test`: pass — 87 HTML artifacts and 265 public files validated inside the allowlisted `dist/` boundary
- HTML structural validation: pass — no parser errors, missing closers, missing iframe titles, implicit input types, or malformed attribute spacing on repaired targets
- Internal links/assets: pass — zero missing local targets or anchors
- JSON-LD: pass — every structured-data block parses
- Responsive UI: manual mobile review pass at 390px — menu closed/open, trust strip, sticky CTA, and consent layout
- Reduced motion: pass — reveal content visible, hero video disabled, smooth scrolling disabled; only a 0.01ms lazy-image fail-safe remains
- Runtime console: no homepage errors or warnings in mobile browser review
- Full premium matrix: pass locally and live — 2,849 checks across 37 representative pages, seven breakpoints, and 11 interface invariants; zero failures
- Full runtime crawl: pass locally, on Netlify preview, and live — 86 pages at mobile and desktop, 172 page/viewport checks per environment; zero failures
- Netlify preview `6a5efd18ddccd28205ccb724`: pass — public pages 200; source, QA, package, internal docs, and intake paths 404; CSP/HSTS and supporting security headers present
- Production deploy `6a5efef6c589f88c9d2f4684`: `ready` — key public routes 200, tested source/internal routes 404, preview-only noindex absent, and security headers present
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4s, LCP 1.8s, TBT 10ms, CLS 0, Speed Index 2.8s
- Netlify Forms: all existing forms remain recognized; `pre-approval` and `contact` submission counts remained 10 and 3 respectively; no QA lead was submitted

## Remaining external dependency

Google Ads conversion labels remain placeholders in `consent.js`. The existing Ads account ID is present elsewhere in approved page code, but phone/lead conversion label values are not available in the repository and were not invented. Analytics consent, UTM persistence, and Netlify lead capture remain functional.
