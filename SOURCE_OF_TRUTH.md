# SOURCE_OF_TRUTH.md — Grand Funding LLC

Last verified: 2026-06-30 by Codex.

Grand Funding is a live regulated-lender static site. Treat production changes,
lead forms, lending claims, license/NMLS copy, secrets, and deploy wiring as
approval-gated.

## Production Linkage
- Host: Netlify
- Netlify project: `grandfundingllc`
- Netlify site id: `055c5942-aeaa-478a-9508-a34406994d5d`
- Live URL: https://www.grandfundingllc.com
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Default branch: `master`
- Build command: `echo 'No build command needed - static site'`
- Publish dir: `.`

## Deploy Truth
- Latest observed live status: HTTP 200 from Netlify on 2026-06-30.
- Latest observed internal-doc protection: `/.ai/STATE.md` returns HTTP 404 on
  live.
- Latest Netlify deploy metadata checked with `netlify api listSiteDeploys`:
  recent production deploys have `branch: null` and `commit_ref: null`.
- Therefore, production is not currently proven to be git-linked. Do not assume
  `origin/master` exactly matches live without a live diff.

## Canonical Local Clone
- Canonical path: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Current local branch when verified: `codex/agency-standard-grand-funding-20260629`
- Canonical source branch to reconcile from: `master`
- Current fetched `origin/master`: `336175e48c4063d014bbae94d9aa2c6102f276e2`

## Preserved Recovery Branches
- `recovered/website-current-20260629`: preserves dirty local work from
  `Clients/Grand Funding/Website/current/grand-funding`, which was 187 commits
  behind `origin/master`.
- `recovered/website-sibling-20260629`: preserves dirty local work from
  `Clients/Grand Funding/Website/grand-funding`, which was 186 commits behind
  `origin/master`.
- Review and cherry-pick selectively if useful. Do not promote either recovery
  branch wholesale.

## Secrets
- Real secrets live in Netlify/host settings or 1Password, never in git.
- `.env*`, local Netlify state, dependencies, build output, and archives are
  gitignored.
- Commit only `.env.example` or `.env.sample`.

## Red Items Requiring David Approval
- Pushing or merging to `master` if it could alter production.
- Reconnecting, changing, or retiring Netlify deploy wiring.
- Manual production deploys.
- Real `/apply` lead submissions.
- Changes to NMLS/license/rate/disclosure/lending-claim copy.
- Secrets, DNS, domains, auth, billing, or form notification settings.

## Verification Commands Run
- `curl -I -L https://www.grandfundingllc.com` -> HTTP 200.
- `curl -I -L https://www.grandfundingllc.com/.ai/STATE.md` -> HTTP 404.
- `netlify status` -> project `grandfundingllc`, site id
  `055c5942-aeaa-478a-9508-a34406994d5d`.
- `netlify api listSiteDeploys` -> latest deploys have no branch/commit ref.
