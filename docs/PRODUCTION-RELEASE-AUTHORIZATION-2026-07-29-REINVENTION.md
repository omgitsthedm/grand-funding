# Grand Funding Reinvention Production Release Authorization

- Date: 2026-07-29
- Status: executed, verified, and closed
- Authorized by: David Marsh
- Production URL: `https://www.grandfundingllc.com`
- Netlify project: `grandfundingllc`
- Netlify site ID: `055c5942-aeaa-478a-9508-a34406994d5d`

## Authorized scope

Publish the complete, verified Grand Funding project-reinvention candidate on branch `agent/grand-funding-project-reinvention-20260729` to the existing production site.

The authorization also covered the tightly scoped claim-hardening follow-up required when the final focused copy probe found a legacy asset-based formulation in the otherwise verified candidate. That follow-up did not broaden the public offer or resolve any strict claim.

David received the completed audit and was told that:

- all local implementation and browser gates passed;
- the source and generated artifact contain no Forward, NMLS, MLO, sponsored-license identifier, or Grand Funding licensing assertion;
- the strict release gate still stops on seven client/lending-counsel decisions;
- individual funded-deal details, testimonial provenance, paid-referral language, and business identity/history claims remain frozen pending documentary review; and
- the candidate had not yet been committed, pushed, or deployed.

After that disclosure, David explicitly instructed Codex: “let's push it all live.”

## Claims boundary

This is one-time operational authorization to publish the exact reviewed candidate. It is not lending-counsel approval and does not verify or resolve:

1. occupancy and consumer-purpose policy;
2. future rates and points policy;
3. future numeric loan-sizing policy;
4. future numeric leverage policy;
5. formal timing taxonomy;
6. licensed service-area confirmation; or
7. documentary support and counsel approval for aggregate volume or comparative proof.

The strict release gate remains unchanged. The default gate may pass only against the registered, fail-closed claim controls and exact frozen evidence surfaces.

## Authorized artifact

- Public boundary: `dist/` only
- Required runtime: Node `24.18.0`
- Public files: 294
- Deterministic aggregate SHA-256: `8af2323876df6cd2d6e4ef857ee9a8ecbdfd9f2bfccbe7c422528dacebd1c6e6`
- Full browser matrix: 1,623 checks, zero failures
- Lighthouse median: 90 performance; 100 accessibility, best practices, and SEO

## One-time release controls

1. Commit and push the complete scoped candidate.
2. Verify the exact GitHub repository, default branch, Netlify project name, and Netlify site ID.
3. Deploy `dist/` only to an immutable preview.
4. Verify the preview without submitting a form or enabling third-party telemetry.
5. Merge the reviewed source to `master`.
6. Deploy the same unchanged `dist/` artifact to production.
7. Verify the production deploy, public domain, restricted-token separation, representative routes, assets, metadata, hero media, and browser behavior.
8. Record the source commit, merge, preview deploy, production deploy, artifact identity, checks, and rollback target.

Do not change DNS, activate Google Ads conversion labels, submit a live form, inspect form submissions, change borrower or client records, mark a strict claim resolved, restore a pre-removal deployment, or publish the repository root.

## Release result

### Source and review

- Initial candidate commit: `b6d070970aae69e32ff01d8ef7ad803e0b659a70`
- Initial review: [PR #16](https://github.com/omgitsthedm/grand-funding/pull/16)
- Initial merge to `master`: `f201615d60b6601383f3f9cecae7501240890fb2`
- Focused claim-hardening commit: `28dcfcddcef3075068b721bc8e8f74cac5a6073c`
- Final review: [PR #17](https://github.com/omgitsthedm/grand-funding/pull/17)
- Final production-source merge: `b64b409e91e457c99c0b98853be77aae85d495b7`
- Both independent GitHub `deployable-artifact` gates passed before their merges.

### Netlify release

- Initial immutable preview: `6a6ac209b9f827221dcca3f5`
- Interim production deploy: `6a6ac663cc09269d86bad25c`
- Final hardened immutable preview: `6a6acad9385847c56c5c2015`
- Final production deploy: `6a6acd18828f50c85c77a2e5`
- Published: `2026-07-30T04:03:49.811Z`
- Production state: `ready`
- Production URL: `https://www.grandfundingllc.com`
- Final aggregate SHA-256: `8af2323876df6cd2d6e4ef857ee9a8ecbdfd9f2bfccbe7c422528dacebd1c6e6`

The interim production deploy was superseded after a focused post-deploy copy probe found the legacy homepage formulation “Income docs: None — asset-based.” The public wording and validator were hardened to reject every asset-based formulation before the final preview, merge, and production publish. The final source and generated artifact contain zero such matches.

### Verification

- Local full matrix: 1,623 checks, zero failures.
- Final preview live matrix: 1,606 checks, zero failures.
- Final custom-domain live matrix: 1,606 checks, zero failures.
- Both the deploy-specific URL and custom domain account for all 294 artifact files: 205 non-HTML assets are byte-identical; 88 HTML documents match visible text, metadata, JSON-LD, and normalized Netlify form behavior; all 18 form contracts match.
- The final live artifact has zero matches for Forward Loans, Forward Holdings, NMLS, MLO, `2466872`, `1048901`, any Grand Funding licensing assertion, `asset-based`, or the rejected no-income-document comparison.
- The desktop hero MP4 returned HTTP `206`, reached playable state, and was actively playing.
- The hero title and primary action render with solid fills, the hero subtree has zero visible gradient backgrounds or masks, and the measured gap before the next section is 20 pixels at the desktop verification viewport.
- In a reduced-motion browser, the video is hidden, no source is attached, the MP4 receives zero requests, and the 1,280-pixel poster is loaded and visible.
- Netlify reports `6a6acd18828f50c85c77a2e5` as the current production deploy for site `055c5942-aeaa-478a-9508-a34406994d5d`.

### Boundaries and rollback

No DNS, advertising, environment-variable, production-form, submission-review, borrower-record, or analytics-consent change was made. No live form was submitted.

The seven strict claim categories remain unresolved and the strict release gate remains intentionally blocking. Pre-hardening deploys, including `6a6ac663cc09269d86bad25c`, contain wording removed by this release and are not approved rollback targets. If rollback is operationally required, redeploy this final frozen artifact or use a later artifact that passes the same claim, parity, and live-browser gates.
