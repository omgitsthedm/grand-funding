# GRAND FUNDING LLC - CINEMATIC PACK (v4)

Premium, mobile-first static site for Netlify. Updated to a darker, more dramatic "Cinematic Noir" palette with spotlight whites, improved approved-loans cards, and a working Netlify form flow.

## What Changed (v4)

### Visual + Layout Fixes
- ✅ New palette: dark + dramatic, with warm highlights and teal glow (no stale "teal on teal")
- ✅ Approved Loans cards are a clean grid (not stacked), with digestible facts per card
- ✅ Header is now dark "glass" so it matches the site (no white bar)
- ✅ About / Products / Blog pages re-skinned so there are no jarring full-width white blocks

### Working Pre-Approval Form (Netlify)
- ✅ New page: `apply.html` (Netlify form)
- ✅ New page: `thanks.html` (post-submit confirmation)
- ✅ Pretty URLs:
  - `/apply` rewrites to `/apply.html`
  - `/thanks` rewrites to `/thanks.html`

## Files Included

### Pages
- `index.html`
- `about.html`
- `products.html`
- `blog.html`
- `faq.html`
- `apply.html`
- `thanks.html`

### Styles
- `styles.css` (global)
- `apply.css` (apply/thanks)
- `about.css`
- `products.css`
- `blog.css`

### Media
- `images/arizona-hero.mp4` (hero video)
- `images/*` (site imagery)

## Deploy to Netlify

1. Drag-and-drop the whole folder into Netlify (or connect a Git repo).
2. Set the publish directory to the project root (this folder).
3. Confirm redirects are active via `netlify.toml`.

### IMPORTANT: Make the form email you
Netlify Forms can email submissions, but the email recipient is configured in Netlify, not in the code.

In Netlify:
1. Site settings -> Forms -> Enable form detection
2. Forms -> `pre-approval` -> Notifications
3. Add **Email notification** -> enter the receiving email (ex: `info@grandfundingllc.com`)

Optional:
- Enable spam filtering and keep the honeypot field (`bot-field`) in the code.

## Quick Checks

- `/apply` loads and submits -> lands on `/thanks`
- `Forms` tab in Netlify shows new submissions
- Mobile: hero cards become 1-column and form inputs are easy to tap

## Palette (Cinematic Noir)

- Background: #07080B
- Surface: rgba(255,255,255,0.05 to 0.08)
- Spotlight White: #F4F7FF
- Teal glow: #4FE3D2
- Warm sand: #F0B26B

---

## Premium QA (merge gate)

Every push and PR is gated by `.github/workflows/premium-qa.yml`, which runs
`/scripts/qa-premium.mjs` via Playwright against the live site at **7 breakpoints**:
`320 / 375 / 393 / 430 / 768 / 1280 / 1440`.

### What the gate protects

The script enforces seven invariants. Any regression fails the build:

| # | Check | Fails when… |
|---|---|---|
| 1 | `horizontal-overflow` | `documentElement.scrollWidth > innerWidth` at any breakpoint |
| 2 | `header-cta-wrap` | The `.header .cta-btn` renders taller than 42px (text wrapping) |
| 3 | `card-text-contrast` | A card h3 has luminance `< 80/255` on the dark theme (dark-on-dark) |
| 4 | `icon-misaligned` | A card icon is neither centered (±25px) nor left-inline (<30px from edge) |
| 5 | `footer-grid-mobile` | The footer grid has >1 column at ≤768px |
| 6 | `reveal-stuck` | A `.reveal`/`.reveal-stagger` element in viewport has opacity < 0.3 |
| 7 | `blog-card-broken` | Blog card image <80% of card width, not loaded, or title invisible/dark |

### Ranking watchlist

A failure on any of these pages **blocks merge with exit code 2** (higher priority than a regular fail):

- `/` (homepage)
- `/phoenix-hard-money-lender.html`
- `/arizona-hard-money-lender.html`
- `/fix-and-flip-loans-arizona.html`
- `/bridge-loans-arizona.html`

### Run it locally before pushing

```bash
# First-time setup (once per machine)
npm install
npx playwright install --with-deps chromium

# Run the full audit against production
npm run test:premium

# Fast watchlist-only run (ranking-critical pages only)
npm run test:premium:watchlist

# Audit Netlify local dev server instead
BASE_URL=http://localhost:8888 npm run test:premium
```

The script writes `scripts/qa-report.json` with a full failure breakdown.

### Exit codes

| Code | Meaning |
|---|---|
| `0` | All checks passed — safe to ship |
| `1` | Premium regression on non-watchlist page |
| `2` | Premium regression on a ranking-watchlist page (blocks merge with higher priority) |
| `3` | Runner crashed (network, Playwright, etc.) |

### Source of truth

Do not patch CSS/HTML to make QA pass without fixing the underlying cause.
The standard is:

1. `/PREMIUM_STANDARDS.md` — human-readable rules (tokens, components, copy, schema, trust)
2. `/premium-system.css` — authoritative design layer inlined into every HTML page
3. `/scripts/qa-premium.mjs` — automated enforcement

If the QA script has a false positive, fix the script. If it catches a real regression, fix the code. Never disable a check to ship.

---

**Version**: v4 (Cinematic Noir + Netlify Form) · Premium QA gate added 2026-04-19
