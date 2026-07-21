# Grand Funding Site — Source of Truth

Last verified 2026-07-20 by Codex against the resolved checkout, GitHub remote, Netlify API/CLI metadata, draft deploy, production deploy, and live public site.

## Canonical code

- Visible workspace: `/Users/davidmarsh/Desktop/LiFi NYC/Clients/Grand Funding/grand-funding`
- Resolved Git root: `/Users/davidmarsh/Code/LiFi NYC/Clients/Grand Funding/grand-funding`
- GitHub: `https://github.com/omgitsthedm/grand-funding.git`
- Canonical branch: `master`
- Release source: `ff779628` through PR `#3`
- Archived and out of scope: `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12`

## Technology and commands

- Stack: static HTML/CSS/JavaScript with Node.js build/QA scripts and Python content generators
- Install: `npm ci`
- Build and validate: `npm test`
- Serve built artifact: `npm run serve -- --dir dist --port 8888`
- Full page crawl: `BASE_URL=http://127.0.0.1:8888 npm run test:crawl`
- Responsive premium gate: `BASE_URL=http://127.0.0.1:8888 npm run test:premium`
- Netlify publish directory: `dist/`

## Production authority

- Netlify project: `grandfundingllc`
- Site ID: `055c5942-aeaa-478a-9508-a34406994d5d`
- Live URL: `https://www.grandfundingllc.com`
- Verified production deploy: `6a5efef6c589f88c9d2f4684` · state `ready`
- Deployment is manual Netlify CLI. GitHub repo/provider/branch build linkage is absent; Git pushes do not publish.
- Preview before production. Do not publish the repository root or use `--dir=.`.

## Verified release quality

- 87 HTML artifacts and 265 public files pass build validation.
- 86 real pages pass mobile and desktop runtime crawling.
- 37 representative pages pass 11 interface checks at seven breakpoints: 2,849 live checks, zero failures.
- Live Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- Tested source/package/internal routes return 404; security headers are present.
- Netlify Forms are recognized; no test lead was submitted.

## Safety and compliance

- Keep credentials, `.env*`, client records, form submissions, and production data out of Git and agent output.
- NMLS 2466872, AZ MLO 1048901, rates, licenses, claims, testimonials, funded-deal facts, disclosures, and live form destinations require approved facts before changes.
- Google Ads conversion labels are the only known external release dependency; approved values are not in this repository and must not be invented.
