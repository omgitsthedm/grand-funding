# Grand Funding Production Release Authorization

Date: 2026-07-25
Status: executed and closed
Authorized by: David Marsh

## Authorized scope

Publish the complete verified candidate on branch `agent/grand-funding-continuous-elevation-july-2026` to the existing Netlify project `grandfundingllc` and production URL `https://www.grandfundingllc.com`.

David reaffirmed the production instruction after the strict regulated-claims blocker and its seven categories were disclosed.

## Claims boundary

This is operational authorization to republish the exact frozen claims baseline already present on the live site. It is not approval, verification, or resolution of any lending claim.

- All tracked source HTML, all 18 tracked posts, `llms.txt`, and `generate_posts.py` are unchanged.
- The default claims gate passes only because source and built snapshots exactly match the registered baseline.
- All seven issues remain `unresolved` with `strictBlock: true`.
- The client/legal decision handoff remains open.
- The strict release gate remains unchanged and must block future releases unless the claims are reconciled or a new explicit exception is documented.

## One-time release controls

1. Run the full Node `24.18.0` build and browser suite.
2. Verify the exact GitHub repository, branch base, Netlify site name, and Netlify site ID.
3. Commit and push the complete scoped candidate.
4. Deploy `dist/` only to a preview URL.
5. Run live-mode QA against the preview without conversion submissions or third-party telemetry.
6. Deploy the same unchanged `dist/` artifact to production.
7. Run live-mode QA against `https://www.grandfundingllc.com`.
8. Record the commit, deploy ID, verification results, and rollback target.

Do not change DNS, submit a live application or contact form, enable placeholder Google Ads conversions, mark claims resolved, or publish the repository root as part of this authorization.

## Release result

- Candidate commit: `de41e436d60f14d9e117ed32e5857d55f5c248b1`
- Master merge: `f5baf1f620a4b8a6aa1c915d82fbbc9f564ab51b` via PR #11
- GitHub `deployable-artifact`: passed
- Verified preview: `6a647f062aa291182e0c70f1`
- Production deploy: `6a6489b013e4771689227e4f`, ready, published 2026-07-25T10:02:30.817Z
- Rollback target: `6a64616a5602a06cd8001b9c`
- Artifact: 279 files; fingerprint `91e6e9a2e2d37f78a98ab3ef9d8fa7c0f0ec333b83b5fe118972a3a78aef01b0`
- Preview and production route, preservation, accessibility, and premium responsive gates passed with zero failures
- Live, deploy-specific production, and preview root HTML were byte-identical
- A closeout-CI consent-animation timing flake was replaced with functional state verification and the 505-check preservation suite passed
- No DNS edit, live form submission, regulated-copy edit, placeholder Ads activation, or PostHog integration occurred

The authorization is consumed. All seven claims issues remain unresolved and strict-blocking for future releases.
