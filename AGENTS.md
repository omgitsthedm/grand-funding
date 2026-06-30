# AGENTS.md — Grand Funding Sibling Recovery Branch

> Shared brain for this recovered clone. This branch preserves local work from
> `Clients/Grand Funding/Website/grand-funding`; it is not confirmed as the
> production source.

## What this is
- Project: Grand Funding LLC static lender website.
- Live URL: https://www.grandfundingllc.com
- Stack: static HTML/CSS/JS on Netlify.
- Branch: `recovered/website-sibling-20260629`.

## Source of truth
- Production uses the `omgitsthedm/grand-funding` repo.
- `git push origin master` is production-sensitive and requires David approval.
- This branch preserves local files from a stale sibling clone that was 186
  commits behind `origin/master` when recovered.
- See `SOURCE_OF_TRUTH.md` for current recovery facts.

## Commands
- Dev: `npx serve .` or `netlify dev`.
- Build: none; Netlify publish dir is `.`.
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
