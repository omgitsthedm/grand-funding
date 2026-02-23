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

**Version**: v4 (Cinematic Noir + Netlify Form)
