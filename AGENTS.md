# AGENTS.md — Grand Funding Recovery Branch

> Shared brain for this recovered clone. This branch preserves local work from
> `Clients/Grand Funding/Website/current/grand-funding`; it is not confirmed as
> the production source.

## What this is
- Project: Grand Funding LLC static lender website.
- Live URL: https://www.grandfundingllc.com
- Stack: static HTML/CSS/JS on Netlify.
- Branch: `recovered/website-current-20260629`.

## Source of truth
- Production uses the `omgitsthedm/grand-funding` repo.
- `git push origin master` is production-sensitive and requires David approval.
- This recovery branch exists only to preserve previously uncommitted local work
  from a stale clone that was 187 commits behind `origin/master` when recovered.
- See `SOURCE_OF_TRUTH.md` for current recovery facts.

## Commands
- Dev: `npx serve .` or `netlify dev`.
- Build: none; Netlify publish dir is `.`.
- QA: inspect static pages manually; newer canonical work may have npm scripts in
  the up-to-date clone.
- Deploy: do not deploy from this branch.

## Secrets
- Real secrets live in Netlify/host settings, never in git.
- `.env*`, build output, and local Netlify state are ignored.
- The pre-commit hook blocks secret-looking files and content.

## Before Work
1. Compare this branch against `origin/master` before using anything from it.
2. Treat compliance, NMLS/license/rate/disclosure, and form behavior as sensitive.
3. Do not submit real `/apply` leads.

## Do Not Touch Without David
- Production deploys.
- `master` pushes.
- Netlify deploy wiring.
- NMLS/license/rate/disclosure copy.
- Secrets or form notification settings.
