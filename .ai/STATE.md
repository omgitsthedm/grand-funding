# Grand Funding AI-Ops State

## Identity

- Project Code: LFNYC-GFL
- Name: Grand Funding LLC
- Tier: Tier 2 · Risk: Medium (regulated lender + lead form)
- Canonical Path: /Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding
- Git-backed: yes · Remote: https://github.com/omgitsthedm/grand-funding.git · Default branch: `master`

## Current Stamp

- Updated: 2026-06-28
- Updated By: Claude
- Basis: AI-Ops onboarding (handoff-ready). Read-only scope.
- Git HEAD at onboarding: 8b12e327

## Rules Version

- 2026-06-27-aiops-foundation-v1

## State Confidence

- High for path/repo/branch/remote/stack/commands and live domain (repo-evidenced www.grandfundingllc.com).

## Current Live Truth

- Live URL: `https://www.grandfundingllc.com` (apex → www redirect). Host: Netlify, static `publish = "."`, no build.
- `.md`/internal files blocked from serving via `/*.md → 404` redirect (so `.ai/` etc. are private).
- Production QA status: not run by AI-Ops.

## Repo State

- Branch `master`, in sync with origin at onboarding; clean working tree.
- Images: 21 jpg / 70 png / 70 webp — mixed; webp pass is an optional future task.

## Risk / Compliance

- Regulated lender (NMLS 2466872). Rates, license #s, lending claims, disclosures = compliance-sensitive; do not alter without approval.
- `/apply` = real lead form; real submissions are transactional.

## QA-PENDING

- Optional webp conversion pass for jpg/png images.
- Confirm Netlify project name + that the `/*.md` block also catches `.ai/*.md` on live (verify `/.ai/STATE.md` → 404 after deploy).

## Do Not Touch

- `.env`/secrets; NMLS/license/rate/disclosure copy without approval.
- The `/*.md → 404` redirect (keeps internal docs private).
- `git push` to `master` (= production deploy) without `APPROVE LIVE CHANGE`.

## Proposed Changes / Inbox

- None yet.

## Next Steps Queue

- Verify `.ai/*.md` returns 404 on live after this onboarding deploy.
- Optional webp image pass.

## Recent Session History

- 2026-06-28: Claude onboarded Grand Funding to AI-Ops (handoff-ready). Created `.ai/{LOCK,RULES_HEADER,RULES,STATE}.md` + AGENTS pointer; added Commands + AI-Ops pointer to existing CLAUDE.md. No source/content change; `.md` files already excluded from public serving. Static site, branch `master`.

## Next Agent Directive

Read `.ai/RULES.md` + `.ai/STATE.md` + `CLAUDE.md` first. Static lender site on `master`. Compliance-sensitive copy (NMLS/rates/disclosures) — don't change without approval. `git push` to `master` = production deploy (gated). Real `/apply` leads are transactional. Keep the `/*.md → 404` redirect. Don't read `.env`/secrets.

## Emergency / Bypass Notes

- No bypass for deploy/push/compliance-copy/lead-form/production mutations.
- Bypass/YOLO is only an execution accelerator for approved local setup and read-only verification.
- Emergency mode: stop, preserve evidence, smallest reversible action.
