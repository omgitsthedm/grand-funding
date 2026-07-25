# Grand Funding Production Release Authorization

Date: 2026-07-25
Status: authorized; release in progress
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
