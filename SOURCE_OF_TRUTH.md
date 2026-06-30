# SOURCE_OF_TRUTH.md — Grand Funding Recovery Branch

Last verified: 2026-06-29 by Codex.

This folder is a preserved stale local clone, not confirmed canonical production
source.

## Production Linkage
- Remote: `https://github.com/omgitsthedm/grand-funding.git`
- Live URL: https://www.grandfundingllc.com
- Host: Netlify
- Build command: `echo 'No build command needed - static site'`
- Publish dir: `.`
- Production branch: `master`

## Recovery Facts
- Local path: `Clients/Grand Funding/Website/current/grand-funding`
- Recovery branch: `recovered/website-current-20260629`
- Base before recovery: `b9cb63749574c14251a9c007af79e86ff3d72c6a`
- `origin/master` after fetch: `336175e4`
- Local clone was 187 commits behind `origin/master` when recovered.
- Recovery commit preserves uncommitted local files only; it should be reviewed
  and cherry-picked selectively, not promoted wholesale.

## Safety
- Do not push `master` or deploy without David approval.
- Do not change Netlify deploy wiring from this branch.
- Do not modify secrets, form notification settings, or regulated lending copy
  without approval.

## Archive Notes
- Keep this branch until David confirms whether any recovered assets/content are
  still useful.
