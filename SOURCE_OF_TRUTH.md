# Grand Funding source of truth

Verified: 2026-08-11

- Local: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `https://github.com/omgitsthedm/grand-funding`
- Canonical/default branch: `master`
- Netlify site: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Production URL: `https://www.grandfundingllc.com`
- Production source commit: `0e43bc16b8c9356b87fd738d51fd3619a9784f87`
- Production deploy: `6a7bdfd3e639979f12a74301`
- Rollback deploy: `6a7bd9e3458e4e2c35158cfd`
- Production artifact SHA-256: `d41bf1d7e802e17364710ad0094627e056229501f3647008dcbb0fbb1bf129ae`
- Deploy method: manual Netlify Drop from the exact merged-source `dist/` artifact; GitHub is not connected.

The deploy commit is preserved in this history. The superseded `Website/grandfundingv12` checkout is no longer a production source; its stale local Netlify link does not override the deploy and artifact evidence here. The production artifact owns `_headers` and `_redirects`, so manual Drop releases retain the same edge behavior as a configuration-aware deploy. Netlify Forms remains enabled; Netlify's expected form-tag normalization is the only observed HTML transformation between the immutable artifact and production.

The 2026-08-11 release changed care/quality infrastructure and did not add or rebaseline a regulated business claim. The strict claims gate remains blocked by seven unresolved counsel/client decisions: occupancy and consumer purpose, rates and points, loan amounts, leverage, timing taxonomy, service area, and volume/comparative proof. Current written approvals remain in `docs/` as on-demand legal/recovery evidence and do not authorize a future claim change. Never restore a pre-hardening artifact as an ordinary rollback.

## 2026-09-27 — published acquisition/privacy maintenance release

- State: PR [#26](https://github.com/omgitsthedm/grand-funding/pull/26) merged cleanly to `master` as source commit `1510d3e394626190141c0fa2f30c7c77abc6d868`; its required `deployable-artifact` check passed. No DNS, form submission, claims change, or claims-baseline update occurred.
- Candidate behavior: consented analytics is exact-host/canonical-path gated; QA, noindex, storage failure, non-HTTPS, and localhost stay silent. Query strings, fragments, referrers, and local receipt IDs are excluded. A receipt conversion requires the exact fresh native pending form type and local ID. All 18 existing Netlify forms retain their action/name/fields; busy, retry, and truthful ambiguous-receipt states are progressive client-side behavior.
- Local evidence: `npm run quality:fast` passed. The complete `npm run test:browser` suite passed: 174 responsive crawl, 505 preservation, 20 accessibility, 19 intercepted-form, 60 cross-browser, and 847 premium checks; each reported zero telemetry requests from loopback. The production build reran `quality:fast` successfully and produced the 297-file artifact SHA-256 `00814ece683cfb4914c16e03111ee26cc6b2c9ef50cfe71a96d8f210a126b942`.
- Provider readback: GA4 property `533608887`, stream `14390528961`, measurement `G-K825ENLYS6`; enhanced measurement off; Google-tag history pageviews, scrolls, outbound clicks, form interactions, video, downloads, and user-provided data off; event/user retention two months with reset off; Google signals off; granular location/device collection off; advertising personalization blocked in 307/307 regions; consent screen reports behavioral and advertising signals inactive; active `Developer traffic` exclusion filters `debug_mode`/`debug_event`. Existing `GTM-NCCHQ32T` has one Google tag for `G-K825ENLYS6`, no configuration parameters, and zero pending workspace changes; no new GTM tags or version were created.
- Release: Netlify CLI published the exact `dist/` artifact to `grandfundingllc` (`055c5942-aeaa-478a-9508-a34406994d5d`) as production deploy `6aba0ee968ad7ddaafb2cc8b`, ready at `https://6aba0ee968ad7ddaafb2cc8b--grandfundingllc.netlify.app` and `https://www.grandfundingllc.com`. Both served the new consent copy with HTTPS 200. The deploy uploaded 90 changed assets; no billing or DNS change occurred.
- HTTPS repair: the existing Let’s Encrypt certificate had expired after an earlier ACME challenge failure against a retired apex address. Current DNS was already correct (`75.2.60.5`), so the existing Netlify certificate was renewed without DNS changes. Netlify reports it issued through `2026-12-27T05:58:14Z`; verified TLS covers `grandfundingllc.com` and `www.grandfundingllc.com`.
- Strict release remains blocked pending the existing seven named decisions: (1) counsel/Logan occupancy and consumer-purpose policy, (2) future rates/points policy, (3) loan-size policy, (4) leverage definitions, (5) operations/counsel timing taxonomy, (6) licensed Arizona/California footprint conditions, and (7) dated proof plus counsel approval for the retained volume statement. David's production instruction covered this non-claims maintenance release only; it does not resolve a strict claim or permit a future claim change. The strict gate remains fail-closed.
