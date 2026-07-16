# Grand Funding — PROJECT STATUS (cold-start entry point)

> **Read this first.** If you are a person or an AI agent picking this up cold, this file tells you what Grand Funding is, exactly where it stands, what to do next, and where everything lives. One screen to orientation.
>
> **Last updated:** 2026-07-16 · **Updated by:** Claude Code (LiFi NYC) · **Stage:** Live client site (static)

---

## 1. What it is
Grand Funding LLC is a **live marketing + lead-gen website** for a direct private **hard-money lender** serving Arizona (Phoenix metro + Tucson) and California (LA, San Diego, statewide). It is a premium, mobile-first **static HTML/CSS/JS site** (no build) on Netlify, with a real Netlify Forms lead pipeline (`/apply`, `/contact`) that emails `Logan@grandfundingllc.com`. Regulated lender — NMLS 2466872.

## 2. Current state (2026-07-16)
- **Status:** ✅ Live and in production. Full site deployed; forms verified end-to-end (2026-05-03). Last content/feature work 2026-05-03; recent commits are docs/agent-ops only.
- **Live URL:** https://www.grandfundingllc.com — **200 OK, last verified 2026-07-16** (apex → www 301 redirect).
- **Git:** clean — 0 uncommitted, 0 unpushed (in sync with origin). Last commit `60da6a4a` 2026-07-11 — "docs: replace agent truth templates".
- ⚠️ **Branch:** `chore/plain-language-live-confirmation-20260711` — **NOT `master`.** This branch is 2 commits ahead of `master` (docs/agent-truth files only) and 0 behind. `master` is the canonical/default branch (`origin/HEAD → origin/master`, last commit `bb2c999c` 2026-07-04). Confirm the intended branch before any content or deploy work.
- ⚠️ **Deploy is MANUAL to Netlify.** GitHub → Netlify auto-deploy is **broken** (documented 2026-04-18; `commit_ref: None`). Pushing to git does **NOT** publish. Ship only via `netlify deploy --prod --dir=.` — so pushing this file has no site impact.
- Compliance-sensitive: NMLS #, license #s, rates, disclosures, and the real `/apply` lead form must not be altered without David/Logan approval.

## 3. Where everything lives
| Thing | Location |
|---|---|
| **Canonical code (this repo)** | `~/Code/LiFi NYC/Clients/Grand Funding/grand-funding` — edit + push from here (`~/Code` is canonical; the `~/Desktop/...` path in older docs is the same repo via symlink) |
| **GitHub** | `github.com/omgitsthedm/grand-funding` — **CANONICAL LIVE MASTER** (the archived `grandfundingv12` repo is the older version; ignore it) |
| **Hosting** | Netlify project `grandfundingllc` (site id `055c5942-aeaa-478a-9508-a34406994d5d`) → https://www.grandfundingllc.com. Static `publish = "."`, no build. **Manual deploy only.** |
| **Database** | None (static site) |
| **Forms / leads** | Netlify Forms (`pre-approval` on `/apply`, `contact` on `/contact`) → email notifications to `Logan@grandfundingllc.com` |
| **Analytics** | GA4 `G-K825ENLYS6` (deferred load, consent-gated) |
| **Design / handoff material** | In-repo: `docs/`, `Logan-Handoff/` (off-site SEO packet), plus this repo's own MD docs |
| **Secrets** | None committed. `.env*` blocked from git and public serving; `/*.md → 404` redirect keeps internal docs private on live |

⚠️ There is a second local repo at `~/Code/LiFi NYC/Clients/Grand Funding/Website/grandfundingv12` — that is the **archived old version**. Do not write to it.

## 4. What's done
Full production site: ~52+ pages incl. 11 money pages (5 scenario + 6 location) with FinancialService + FAQPage schema, 3 noindexed paid-search LP pages, 12 blog posts (branded OG heroes, BlogPosting + Person/E-E-A-T schema), 28 programmatic SEO pages (loan×city, city hubs, glossary DefinedTerm, comparison guides), press page, funded-deals, partners, about, contact, apply, thanks, 404. "Cinematic Noir" dark design system (`premium-system.css` / `styles-v2.css`), self-hosted fonts, security headers (CSP/HSTS) in `netlify.toml`, `llms.txt` + AI-bot `robots.txt` (AEO), `sitemap.xml`. Lighthouse Desktop 99–100, Mobile 85 (LCP is a throttled-sim ceiling). Universal engagement/conversion block sitewide. **Forms verified live end-to-end** (the critical form-submission bug where a global JS handler swallowed all submits was found and fixed 2026-05-03).

## 5. What's next (immediate)
From `CLAUDE.md` "What's pending" + `.ai/STATE.md` QA-PENDING:
- **Needs from Logan (blocks paid search go-live):** Google Ads conversion IDs — fill `AW_ID`, `AW_LEAD_LABEL`, `AW_CALL_LABEL` in `consent.js` (lines 3–5). Enable Ads auto-tagging (`gclid`). Optionally add a Google Reviews widget to LP pages once reviews accumulate.
- **Fix (low priority):** repair the broken GitHub → Netlify auto-deploy link, or continue manual deploys.
- **Housekeeping:** decide whether `chore/plain-language-live-confirmation-20260711` should merge into `master`. Verify `/.ai/STATE.md` returns 404 on live (private-docs check). Optional webp image conversion pass for remaining jpg/png.

## 6. How to run / build / deploy
```bash
cd "~/Code/LiFi NYC/Clients/Grand Funding/grand-funding"
# No build — static site (publish = ".")
npx serve .                       # local preview (or `netlify dev`)

# Premium QA gate (Playwright, 7 breakpoints vs live)
npm install
npx playwright install --with-deps chromium   # once per machine
npm run test:premium              # full audit against production
npm run test:premium:watchlist    # ranking-critical pages only
BASE_URL=http://localhost:8888 npm run test:premium   # audit local dev

# DEPLOY (MANUAL — git push does NOT publish, auto-deploy is broken):
netlify deploy --prod --dir=. --message "..."
```

## 7. Non-negotiable boundaries (do not break)
- **`git push` does not deploy** — production ships ONLY via manual `netlify deploy --prod --dir=.`. Never assume a push went live.
- **Compliance copy is sacred:** NMLS 2466872, AZ MLO 1048901, rates, license #s, lending claims, disclosures — no changes without David/Logan approval.
- `/apply` and `/contact` are **real transactional lead forms** → `Logan@grandfundingllc.com`. Do not break the submit path (the global JS handler must skip `[type="submit"]` and elements inside a `<form>`).
- Keep the `/*.md → 404` redirect (keeps `.ai/`, docs, etc. private on live).
- Never commit secrets / `.env*` / client records.
- Do not touch the archived `grandfundingv12` repo.
- Premium QA gate: fix the underlying cause, never patch CSS/HTML or disable a check just to make QA pass (`PREMIUM_STANDARDS.md` is the standard).

## 8. Deeper docs (read in this order)
`README.md` → `CLAUDE.md` (decisions log + current status — the richest source) → `.ai/STATE.md` + `.ai/RULES.md` (AI-Ops authoritative) → `SOURCE_OF_TRUTH.md` → `PREMIUM_STANDARDS.md` → `docs/HANDOFF-2026-04-20.md` + `docs/audit-results.md` → `AGENTS.md`.
