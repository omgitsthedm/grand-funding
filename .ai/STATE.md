# Grand Funding AI-Ops State

## Identity

- Project Code: LFNYC-GFL
- Name: Grand Funding LLC
- Tier: Tier 2 · Risk: Medium (regulated lender + lead form)
- Canonical Path: /Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding
- Git-backed: yes · Remote: https://github.com/omgitsthedm/grand-funding.git · Default branch: `master`

## Current Stamp

- Updated: 2026-06-30
- Updated By: Codex
- Basis: Agency consolidation pass on `codex/agency-standard-grand-funding-20260629`; read-only live checks plus branch-only documentation/standardization.
- Git HEAD at latest verification: 336175e4

## Rules Version

- 2026-06-27-aiops-foundation-v1

## State Confidence

- High for path/repo/branch/remote/stack/commands and live domain (repo-evidenced www.grandfundingllc.com).

## Current Live Truth

- Live URL: `https://www.grandfundingllc.com` (apex → www redirect). Host: Netlify, static `publish = "."`, no build.
- Netlify project: `grandfundingllc`; site id: `055c5942-aeaa-478a-9508-a34406994d5d`.
- Live root returned HTTP 200 on 2026-06-30.
- `.md`/internal files blocked from serving via `/*.md → 404` redirect; `/.ai/STATE.md` returned HTTP 404 on 2026-06-30.
- Production deploy metadata warning: latest Netlify deploys inspected on 2026-06-30 had `branch: null` and `commit_ref: null`, so production is not currently proven git-linked. Treat any deploy-wiring reconciliation as approval-gated.
- Production QA status: observational headers only; no transactional lead-form QA was run.

## Repo State

- Branch `master` was fast-forwarded locally to `origin/master` at `336175e4`; standardization work is on branch `codex/agency-standard-grand-funding-20260629`.
- Recovery branches pushed for dirty duplicate clones: `recovered/website-current-20260629` and `recovered/website-sibling-20260629`.
- Images: 21 jpg / 70 png / 70 webp — mixed; webp pass is an optional future task.

## Risk / Compliance

- Regulated lender (NMLS 2466872). Rates, license #s, lending claims, disclosures = compliance-sensitive; do not alter without approval.
- `/apply` = real lead form; real submissions are transactional.

## QA-PENDING

- Optional webp conversion pass for jpg/png images.
- Reconcile deploy model: Netlify latest deploy metadata has null branch/commit refs. Safe path is read-only diff/preview first; changing deploy wiring requires David approval.

## Do Not Touch

- `.env`/secrets; NMLS/license/rate/disclosure copy without approval.
- The `/*.md → 404` redirect (keeps internal docs private).
- `git push` to `master` (= production deploy) without `APPROVE LIVE CHANGE`.

## Proposed Changes / Inbox

- Promote the deploy-metadata warning into `.ai/RULES_HEADER.md` after David confirms whether git auto-deploy should be repaired or intentionally left manual.

## Next Steps Queue

- Verify `.ai/*.md` returns 404 on live after this onboarding deploy.
- Optional webp image pass.

## Recent Session History

- 2026-06-28: Claude onboarded Grand Funding to AI-Ops (handoff-ready). Created `.ai/{LOCK,RULES_HEADER,RULES,STATE}.md` + AGENTS pointer; added Commands + AI-Ops pointer to existing CLAUDE.md. No source/content change; `.md` files already excluded from public serving. Static site, branch `master`.
- 2026-06-30: Codex consolidation pass preserved two dirty stale duplicate clones to remote recovery branches, verified live root 200 and `/.ai/STATE.md` 404, identified Netlify deploy metadata with null branch/commit refs, and added `SOURCE_OF_TRUTH.md` on a non-production branch.

## Next Agent Directive

Read `.ai/RULES.md` + `.ai/STATE.md` + `CLAUDE.md` first. Static lender site with production branch `master`, but latest Netlify deploy metadata has null branch/commit refs, so do not assume git/live alignment. Compliance-sensitive copy (NMLS/rates/disclosures) requires approval. Real `/apply` leads are transactional. Keep the `/*.md → 404` redirect. Don't read `.env`/secrets.

## Emergency / Bypass Notes

- No bypass for deploy/push/compliance-copy/lead-form/production mutations.
- Bypass/YOLO is only an execution accelerator for approved local setup and read-only verification.
- Emergency mode: stop, preserve evidence, smallest reversible action.
