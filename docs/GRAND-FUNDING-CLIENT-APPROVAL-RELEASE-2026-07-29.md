# Grand Funding Client-Approval Website Release

> Historical release record. Its identifiers describe this dated release, not current production. Use `SOURCE_OF_TRUTH.md` for current state.

- Date: 2026-07-29
- Status: executed and production-verified
- Site: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`

## Source and authorization

David Marsh supplied the client's completed `Grand Funding - 60-Second Website Approval.csv` and directed that the approved website changes be completed carefully and pushed live.

- Survey response timestamp: `2026-07-27 7:28:25 PM MDT`
- Survey SHA-256: `d0f6e1bfd394cd28878e80f5303793318d17af598e2d440d0b8c2727ac442bff`
- Preserved response record: `docs/GRAND-FUNDING-CLIENT-WEBSITE-APPROVAL-2026-07-27.md`

The CSV has no respondent name or email. David identified it as the client's response. This release records public website decisions only; it is not a legal opinion or a representation that lending counsel approved them.

## Implemented website decisions

- Promote only fix-and-flip, bridge, construction, cash-out refinance, second position, and land/other products.
- Remove published numeric rates, points, loan minimums, maximums, ranges, leverage limits, and borrower-contribution thresholds from visible copy, metadata, structured data, machine-readable content, interactive estimates, and product-selection explanations.
- Replace the loan-estimate calculator with a user-entered project-cost and gross-spread planning tool that does not calculate lending terms.
- Describe owner-occupied, primary-residence, and consumer-purpose eligibility as limited and case-specific.
- Limit stated service coverage to statewide Arizona and statewide California.
- Keep the client-approved timing language and the client-attested `1,500 loans` / `$350 million` statement.
- Remove best/premier-lender comparisons pending written confirmation.
- Keep Google Ads conversion labels dormant.
- Preserve the existing public separation from Forward Loans, Forward Holdings LLC, NMLS, and MLO identifiers and from Grand Funding licensing assertions.

Every build now runs the same sanitizer and a dedicated source/artifact approval validator, preventing legacy generators or refiners from reintroducing the removed claims.

## Preservation

Before the survey changes were applied, the exact source and built artifact were archived outside the repository:

| Archive | SHA-256 |
| --- | --- |
| `/Users/davidmarsh/Documents/Codex/2026-07-27/ok-lok/outputs/grand-funding-pre-survey-source-a305850-2026-07-29.tar.gz` | `461b582d8113d7dbfead0ad1a0fe4e450c2daceeb0b2530efa1cb12c6d13405d` |
| `/Users/davidmarsh/Documents/Codex/2026-07-27/ok-lok/outputs/grand-funding-pre-survey-dist-2026-07-29.tar.gz` | `60811a726229e83236dd921217719d56fee1703e26393a4857df707202b310e5` |

Git history, prior Netlify deploys, hosting records, analytics, forms, and correspondence were not deleted or altered.

## Claims and release boundary

The default regulated-claims gate passes against the exact updated baseline. The strict gate remains intentionally blocked by seven counsel-controlled categories:

1. occupancy and consumer-purpose policy;
2. rates and points;
3. loan amounts;
4. leverage;
5. timing taxonomy;
6. service area and licensing conditions;
7. documentary support for volume and comparative claims.

David's production instruction was used once for this exact, risk-reducing public artifact. Production deploy `6a69f55b47ede5d0a16b98ec` consumed that scoped authorization. It did not mark any strict issue resolved, provide lending-counsel approval, authorize new claims, change DNS, activate ads, submit a form, access a submission, or change borrower records.

## Verification record

- production source commit: `79a17a20af56112e9b7856f52a0f686b0c0dd038`
- pull request: `#14`
- artifact: 281 files; SHA-256 fingerprint `27df43de0f2c91f76919c1dfba290f37bf1c569c9c07a566c11048d648c3c73c` over each sorted relative path, a NUL byte, and the file bytes
- local build/public/SEO/separation/client-approval/baseline/quality gates: passed
- full local browser suite: 174 route checks, 505 preservation checks, 20 accessibility audits, 17 conversion contracts, 60 cross-browser document checks, and 847 responsive checks; zero failures
- expected strict claims stop: confirmed only on the seven documented unresolved categories
- immutable preview: `6a69f35b5fb2e1401318c2b3`, ready
- preview live-mode QA: 174 route checks, 505 preservation checks, 20 accessibility audits, 60 cross-browser document checks, and 847 responsive checks; zero failures
- preview remote verification: all 88 HTML documents had zero restricted association, active direct Ads-ID, or malformed-copy matches; all 192 directly served non-HTML assets matched byte-for-byte
- production deploy: `6a69f55b47ede5d0a16b98ec`, ready and current
- production published: `2026-07-29T12:43:16.713Z`
- production live-mode QA: the same route, preservation, accessibility, cross-browser, and responsive suites passed with zero failures
- production remote verification: all 88 HTML documents had zero restricted association, active direct Ads-ID, or malformed-copy matches; all 192 directly served non-HTML assets matched byte-for-byte
- no live form submission, analytics activation, DNS edit, environment-variable change, form-submission access, or client-record access occurred

## External follow-up

- The client said they will make the Porkbun DNS correction and provide a screenshot; this release did not alter or verify DNS.
- Google Ads conversion labels remain placeholders and dormant.
- Lending counsel and the named business owners still control the seven formal approvals listed above.
