# Grand Funding LLC

Production private-lending website with regulated claims and real Netlify forms.

## Truth

- Local: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `omgitsthedm/grand-funding`; canonical branch `master`
- Netlify: `grandfundingllc`, site ID `055c5942-aeaa-478a-9508-a34406994d5d`
- Live: `https://www.grandfundingllc.com`
- Production is a manual Netlify release from `dist/`; GitHub pushes do not deploy.

## Commands

- Install: `npm ci` (Node `24.18.0`)
- Fast/full gates: `npm run quality:fast` / `npm run quality:full`
- Serve artifact: `npm run serve -- --dir dist --port 8888`
- `npm run quality:release` must remain fail-closed while regulated decisions are unresolved.

## Safety

- Never publish the repository root or use `--dir=.`.
- Do not invent or broaden rates, fees, points, loan amounts, leverage, timing, occupancy, consumer-purpose, licensing, service-area, testimonial, funded-deal, or comparative claims.
- Never submit production forms or expose credentials or borrower data.
- Preserve current form contracts and the approved public quote language.
- Current written client/legal approvals remain in `docs/`; read them only when the task needs claim or release evidence.
- Read `SOURCE_OF_TRUTH.md` for hosting/release facts only; historical reports are not startup context.

Before edits run `git status --short`; before handoff run proportional quality gates and report Git, Netlify, and live state separately.
