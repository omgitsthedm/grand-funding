# Grand Funding AI-Ops Lock

Status: Inactive — production release closed 2026-07-25
Owner: David Marsh
Agent: Codex
Source Branch: agent/grand-funding-continuous-elevation-july-2026
Closeout Branch: agent/grand-funding-production-closeout-july-2026
Worktree: /Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding
Task: Publish the verified exact-baseline elevation under explicit production authorization
Files:
- .github/workflows/
- .lifi/
- .ai/STATE.md
- .ai/LOCK.md
- original-refinement.css
- original-refinement.js
- scripts/
- package.json
- package-lock.json
- project closeout documents
Started: 2026-07-25
Release Started: 2026-07-25
Authorization: docs/PRODUCTION-RELEASE-AUTHORIZATION-2026-07-25.md
Claims Boundary: Seven issues remain unresolved and strict-blocking; the authorized release may republish only the exact frozen baseline
Candidate Commit: de41e436d60f14d9e117ed32e5857d55f5c248b1
Master Merge: f5baf1f620a4b8a6aa1c915d82fbbc9f564ab51b via PR #11
Verified Preview: 6a647f062aa291182e0c70f1
Production Deploy: 6a6489b013e4771689227e4f, ready, published 2026-07-25T10:02:30.817Z
Rollback Deploy: 6a64616a5602a06cd8001b9c
Artifact: 279 files; fingerprint 91e6e9a2e2d37f78a98ab3ef9d8fa7c0f0ec333b83b5fe118972a3a78aef01b0
Result: Source merged, preview verified, production verified, live/deploy/preview roots byte-identical
Production Safety: No DNS edit, live form submission, regulated-copy edit, placeholder Ads activation, or PostHog integration occurred
Recovery Note: Live regulated-lender site (static, branch `master`). Treat push/deploy + `/apply` lead submissions + compliance-copy edits as production actions. `.ai/`/`*.md` are kept private via the netlify `/*.md → 404` redirect.

## Use

Before parallel AI-Ops work, set this lock or explicitly assign one agent as the owner of the target file/task.
The lock does not override safety gates.
