# Grand Funding Public License-Separation Release

> Historical release record. Its identifiers describe this dated release, not current production. Use `SOURCE_OF_TRUTH.md` for current state.

- Date: 2026-07-27
- Status: executed and production-verified
- Site: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`

## Objective and authorization

David Marsh directed an urgent, fine-tooth website update after receiving a written notice requiring removal of the named originator's sponsored licensing identifiers and anything that could imply an affiliation with Forward Loans or Forward Holdings LLC.

The authorized public-site scope is:

- remove NMLS `2466872` and Arizona MLO `1048901` from every current page, footer, metadata field, structured-data object, generated feed, machine-readable file, and public image;
- remove public NMLS and MLO wording, NMLS Consumer Access links, Forward names and domains, Grand Funding licensing assertions, and the partner-page statement that tied "licensed, compliant" operation to the originator's identifier;
- preserve the site's complete pre-change Git history, deploy history, files, and immutable hosting versions;
- publish only the exact reviewed `dist/` artifact to the existing site after preview verification.

The following are explicitly outside this release:

- publishing a separation statement before Forward's requested review;
- attorney contact, consumer-purpose loan review, MU4 disclosure, the 2023 submission search, or any email response;
- reading or changing form submissions, analytics, DNS, environment variables, or client records;
- changing or approving rates, points, loan amounts, leverage, timing, occupancy, purpose, service-area, volume, or comparative claims.

## Pre-change preservation

- Pre-change Git HEAD: `76de067339be26208b2314cfd39b4f2a77c1b983`
- Pre-change production deploy confirmed through Netlify: `6a6489b013e4771689227e4f`, state `ready`

The following local evidence archives were created before source redaction:

| Archive | SHA-256 |
| --- | --- |
| `grand-funding-pre-removal-history-2026-07-27.bundle` | `cfa00209b53bdf130b680bc26b9d165b63d21426d0bc041ce9922b2520390322` |
| `grand-funding-pre-removal-source-76de067-2026-07-27.tar.gz` | `9b4f6f34487430f68558ac28d7e1dba3960c69054524bd08524c3de177df96b3` |
| `grand-funding-pre-removal-dist-2026-07-27.tar.gz` | `e343521f6a240159e9804c1c2c6b637b27abb853cd598652ad45d2f15c862b17` |

No historic commit, deploy, or externally addressable asset path was deleted.

## Publication-history findings

- The first Git commit that added both identifiers was `b9cb63749574c14251a9c007af79e86ff3d72c6a`, authored `2026-02-23T03:12:37-07:00`, with subject `Initial commit: Grand Funding LLC business website`.
- The earliest production deploy still retained by Netlify was `69afa20fb63e32aa3ff6a2d4`, created `2026-03-10T04:46:07.494Z` and published `2026-03-10T04:46:14.934Z`.
- Direct inspection of that immutable deploy confirmed both identifiers on the homepage and application page.

The defensible source date is February 23, 2026. The earliest retained live deploy that can be verified is March 10, 2026. The retained hosting record does not establish whether an earlier production deploy existed, so no earlier live-publication date is asserted.

## Implementation controls

- Current public source files were redacted once, while Git and the preservation archives retain the originals.
- Every build runs a canonical public-license redactor before the artifact is finalized.
- The fast quality gate includes a fail-closed validator that scans the current public source and complete deploy artifact for identifiers, NMLS/MLO wording and links, Forward names/domains, and Grand Funding licensing assertions.
- Organization and person JSON-LD no longer emit licensing identifiers or credentials.
- Clean, cache-busted default and Logan social cards replace prior metadata URLs.
- Historic public image URLs remain available but their baked-in licensing text was removed in place.
- OCR is required across every raster image in `dist/`; five frames from each public video are also sampled.
- The capitalized generic headline "Ready to Move Forward?" was changed to "Ready to Discuss Your Deal?" so the public artifact contains no capitalized `Forward` brand term at all.

Internal validators and this preservation record necessarily name the restricted terms. The public-boundary build and validator prove those internal files cannot enter `dist/`.

## Claims and release exception

Seven existing regulated-claims categories remain unresolved and strict-blocking. The default baseline validator proves that this release does not expand those claims. The strict release gate remains unchanged and is expected to stop on those seven decisions.

The one-time operational exception was limited to removing the public license/association material required by the July 27 written notice. Production deploy `6a67cfd4f0a305b559bbcb3d` consumed it. It did not approve any regulated claim and cannot be reused for another release.

## Verification record

- production source commit: `e8c3a85462652262b678d6626aed2f1437ac6787`
- pull request: `#13`
- artifact: 281 files; SHA-256 fingerprint `8cc2b29639889e1f123af792d9d024573b5db808bcdda5bde3733d5542247d83` over each sorted relative path, a NUL byte, and the file bytes
- full local quality gate: passed twice after repair, including 174 route/viewport checks, 505 preservation checks, 20 accessibility audits, 17 conversion contracts, 60 cross-browser document checks, and 847 responsive watchlist checks, all with zero failures
- expected strict claims stop: confirmed; the unchanged strict gate stopped only on the seven documented unresolved decisions
- public separation scans: zero restricted text/source/artifact matches and zero capitalized `Forward` brand matches
- media scans: zero OCR matches across all raster images and five sampled frames from each of two public videos
- preview deploy: `6a67cd7fd0fc1d853f8309e5`, ready; 174 route/viewport checks, 505 preservation checks, 20 accessibility audits, 60 cross-browser document checks, and 847 responsive checks passed with zero failures
- production deploy: `6a67cfd4f0a305b559bbcb3d`, ready and current; published `2026-07-27T21:38:35.680Z`
- production live-mode QA: the same 174 route/viewport checks, 505 preservation checks, 20 accessibility audits, 60 cross-browser document checks, and 847 responsive checks passed with zero failures
- remote artifact verification: 192 non-HTML files matched byte-for-byte; all 88 HTML documents matched visible text, metadata, JSON-LD, and form contracts after Netlify's expected clean-URL/form rewrite; no restricted term survived
- hosting identity: Netlify re-confirmed `grandfundingllc`, site ID `055c5942-aeaa-478a-9508-a34406994d5d`, with production deploy `6a67cfd4f0a305b559bbcb3d` current and ready
- external-state boundary: no live form submission, analytics activation, DNS edit, environment-variable change, form-submission access, or client-record access occurred

During the first full browser pass, the gate caught a redactor defect that had converted JavaScript logical-OR operators in the analytics initializer into bitwise-OR operators. No preview or production deploy had occurred. The separator regex was corrected, all 86 affected current pages were regenerated from preserved HEAD, a fast-gate regression assertion was added, and the complete browser suite passed twice afterward.

## Rollback boundary

Netlify and Git retain the prior site intact for evidentiary preservation. Republishing a prior deploy would restore the material this notice requires removed and therefore must not be used as an ordinary operational rollback. Any rollback that reintroduces those references requires explicit legal/client direction. Forward fixes should instead be released from the clean source lineage.
