# Grand Funding AI-Ops Rules Header

Project Code:

LFNYC-GFL

Project Name:

Grand Funding LLC

Business Line:

Client Projects under Little Fight NYC

Tier:

Tier 2 — live lead-gen site for a regulated lender

Risk:

Medium — real-estate / private-lending site with NMLS licensing + an `/apply` lead form; copy is compliance-sensitive

Canonical Path:

/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding

Remote:

https://github.com/omgitsthedm/grand-funding.git  (default branch: `master`)

Host:

Netlify — **static site, `publish = "."`** (whole repo root), no build (`command = echo`). `.md`/internal files are already blocked from public serving via a `/*.md → 404` redirect (so `.ai/`, `CLAUDE.md`, `AGENTS.md` are NOT public).

Live URL:

`https://www.grandfundingllc.com` (apex → www via netlify redirect)

Stack:

Static HTML/CSS/JS (75 pages), DM Sans variable font (subsetted). Playwright premium-QA scripts (`npm run test:premium`). No framework, no build step.

## Commands

- Dev / preview: serve the folder statically (e.g. `npx serve .` or Netlify dev); no build needed.
- Build: none (`publish = "."`, static).
- Premium QA: `npm run test:premium` (Playwright; `:local` variant for localhost).
- Deploy: `git push origin master` → Netlify auto-publishes (push = production deploy → gated by `APPROVE LIVE CHANGE`).

## Locked Rules

- Live lender site — treat as production. Branch is `master` (not main).
- **Compliance-sensitive copy:** NMLS #, license #s, rates, lending claims, and disclosures must not be altered without David/Logan approval. Don't invent rates or legal/financial claims.
- `/apply` is a real lead form — do not submit test leads against production.
- Images `.webp` + `width`/`height` + lazy-load (mixed jpg/png/webp present — webp pass is a future option).
- Mobile-first, WCAG AA, LiFi footer. Preserve the dark cinematic palette (see CLAUDE.md).
- `git push` (to `master`) = production deploy → gated. `.env`/secrets never read.
- `.ai/`, `CLAUDE.md`, `AGENTS.md` stay private via the existing `/*.md → 404` redirect — do not remove that rule.

## Grand Funding QA Harness Map

Observational (agent may run): `git status/log`, read source/config, static local serve, `npm run test:premium:local`, public GET to www.grandfundingllc.com, read-only Netlify deploy metadata.

Transactional/gated (David-run / approved): `git push`/Netlify deploy; real `/apply` lead submissions; any change to NMLS/license/rate/disclosure copy; DNS/domain/env changes.
