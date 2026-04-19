# PREMIUM_STANDARDS.md — Grand Funding LLC

**Authoritative UX and copy standard for every page on the site.**
**Editable: no. Read-only reference. Update only with David's approval.**

The litmus test: If it looks like a template, it fails. If it looks like an SEO
landing page, it fails. If it feels like a **$50M boutique fund's digital HQ**,
it passes.

---

## 1. Source of Truth

| Layer | File | Purpose |
|---|---|---|
| Visual system | `/premium-system.css` | Tokens, components, breakpoints. Never overridden per-page. |
| Base stylesheet | `/styles-v2.css` | Legacy styles; do not add to; only prune from. |
| Page-specific | `/blog.css`, `/apply.css`, `/products.css`, `/about.css`, `/compliance.css`, `/lp.css` | Only deltas unique to that page type. |
| JS | `/script.js`, `/premium.js`, `/consent.js` | All `defer`. No blocking. |

Inline `<style>` blocks in HTML are for (a) above-fold critical CSS and (b)
page-specific one-offs wrapped in clearly-labeled `/* === ... === */` markers.

---

## 2. Design Tokens (from `premium-system.css`)

Use CSS custom properties. **Never hard-code values** that exist as tokens.

| Token | Purpose | Example |
|---|---|---|
| `--gf-bg-0..2` | Backgrounds | `#06070B` → `#12161F` |
| `--gf-ink-0..3` | Text (100% → 48%) | `#F4F7FF` → `rgba(244,247,255,.48)` |
| `--gf-teal` / `--gf-ember` | Brand accents | Teal for trust, ember for energy |
| `--gf-spot` | Gradient hero elements | `teal → ember 135deg` |
| `--gf-h1..h3` | Fluid type (clamp) | H1: `1.75rem → 3.75rem` |
| `--gf-s-1..9` | 8pt space scale | `4px, 8, 12, 16, 24, 32, 48, 64, 96` |
| `--gf-r-s..xl` / `pill` | Radius | `10, 16, 22, 28, 999` |
| `--gf-shadow-1..3` | Layered shadows | Card base → glow |
| `--gf-ease` + `--gf-dur*` | Motion | `cubic-bezier(.2,.8,.2,1)` 180/320/500ms |

---

## 3. Component Standards (non-negotiable)

### 3.1 Cards (feature / product / service / value / reason / blog / deal / story)
- Background: `linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.025))`
- Border: `1px solid rgba(255,255,255,.08)`
- Radius: `var(--gf-r-l)` (22px)
- Padding: `clamp(24px, 2vw, 32px)`
- Shadow: `var(--gf-shadow-2)`; on hover → `var(--gf-shadow-3)` + teal border glow
- Hover: `translateY(-2px)`, 320ms `--gf-ease`
- Text: always light on dark (`--gf-ink-0` for h3, `--gf-ink-1` for body)

### 3.2 Icons
Only two approved placements:
1. **Centered above title** (default). Icon uses `margin: 0 auto var(--gf-s-4)`.
2. **Left-inline with title** — parent gets `data-icon-inline`, icon flips to `display: inline-flex; margin: 0 var(--gf-s-3) 0 0`.

Icon chip: **56×56px** squircle, 16px radius, soft teal+ember gradient fill, teal border, inset highlight. Inner SVG: 26×26px, color `--gf-teal`.

**Forbidden:** icon floating in upper-left while text is centered. That fails premium.

### 3.3 CTAs
- Primary: `.btn-primary` / `.cta-btn` — teal→ember gradient pill, `font-weight:700 Poppins`, shadow glow on hover.
- Secondary: `.btn-ghost` / `.btn-secondary` — translucent backdrop-filter, white text, subtle border.
- Size: base `44px+` touch target; large `btn-lg` for hero.
- **Copy rules:** See § 5.

### 3.4 Hero
- Grid 2-col on desktop, stacks single-column at 1024px.
- Hero title: `var(--gf-h1)` fluid clamp, `font-weight:900`, `-0.03em tracking`.
- Badge: uppercase, teal, `0.72rem`, `.12em tracking`.
- Overlay alpha (mobile): `.45→.65→.9` max. Never darker.
- Video: desktop only; mobile background is the `/images/*-poster.webp` via CSS `@media`.
- Hero CTAs: full-width on mobile within `.hero-cta-group`, never global `.btn { width:100% }`.

### 3.5 Footer
- Desktop: 4-col grid `1.5fr 1fr 1fr 1fr`
- Tablet (≤1024): 2-col
- Mobile (≤768): **1-col, uppercase `.72rem` section titles with `.15em tracking`, hairline dividers**
- License + NMLS block: own card with `rgba(255,255,255,.04)` bg + border
- Never dense. Never cramped. Always legible.

### 3.6 Reveal animation
- CSS default: `.reveal { opacity:1 }` (visible). JS opts-IN by adding `.js-reveal-init` before observing.
- Never tag section wrappers taller than viewport; IO threshold can't fire.
- No-JS, bots, reduced-motion → always visible. Fail-safe.

---

## 4. Typography Rules

- Body: Inter (self-hosted `/fonts/inter.woff2`), Inter-fallback system-metric-adjusted.
- Headings: Poppins (600/700/800/900 self-hosted), Poppins-fallback.
- Line-height: body 1.65–1.7, headings 1.05–1.15.
- Letter-spacing: headings `-0.02em` to `-0.03em` (premium tightness).
- **No widows.** Use `&nbsp;` or `text-wrap: balance` on headlines.
- Line length: body 60–75ch max (enforced by container or explicit `max-width`).

---

## 5. Copy Standards

| Forbidden | Required instead |
|---|---|
| "Learn More" | "Request Deal Review" / "Submit Your Scenario" |
| "Click Here" | "Speak With Grand Funding" / "See the Process" |
| "Get Started" | "Request Pre-Approval" / "Talk to a Lender" |
| "Book a Call" (vague) | "Call (602) 935-0371" (direct) |
| "Contact Us" as CTA | "Submit a Loan Scenario" |

Tone target:
- **Experienced, fast, calm, premium, direct, trustworthy, investor-aware.**
- Avoid: cheap, generic, salesy, loud, gimmicky, corporate-mushy.

---

## 6. Mobile Breakpoint Matrix (non-negotiable tests)

| Width | Device | Must work |
|---|---|---|
| 320 | iPhone SE 1st gen | Header CTA hidden (hamburger only), no overflow |
| 375 | iPhone SE 2/3, iPhone 12/13 mini | Hero fits, footer 1-col |
| 390/393 | iPhone 12/13/14, Pixel | Standard mobile baseline |
| 430 | iPhone Pro Max | Still feels deliberate, not stretched |
| 768 | iPad portrait | Tablet transition, not stretched mobile |
| 1024 | iPad landscape | Hero moves to 2-col |
| 1280 | Laptop | Full grid, elegant air |
| 1440 | Desktop | Peak premium, nothing lost in space |

**Zero horizontal overflow at any width.** This is the premium killer.

---

## 7. Trust Proximity Rule

**NMLS + funded deal evidence + license badges must appear within one scroll of every primary CTA.** Never buried in the footer dungeon.

Approved placements for trust signals:
- Sticky header license strip (mobile)
- Hero badge ("40+ Years" / "NMLS 2466872")
- Trust strip directly under hero
- Below hero-loans sidebar (funded-deals snapshot)
- Above the form CTA on `/apply`

---

## 8. AEO "Loan Clarity" Block

Every money page (11 pages) must include a **`.loan-clarity`** section near the bottom with 5–8 Q&A pairs. Requirements:

- 2-sentence max per answer (Featured Snippet length).
- Plain English, no finance jargon soup.
- Wrapped in `FAQPage` JSON-LD schema.
- Heading: `H2` "Loan Clarity" or "Quick Answers".

---

## 9. Schema Standards (JSON-LD)

| Page type | Required schema |
|---|---|
| Homepage | `Organization`, `FAQPage`, `WebSite` |
| Location page (city/state) | `LocalBusiness` + geo, `FAQPage` |
| Product page (loan type) | `Service` + `FAQPage` |
| Blog post | `BlogPosting` + `Person` (author) + `BreadcrumbList` |
| About | `Organization` + `Person` (Logan) |

**Valid schema only.** Validate via Google's Rich Results tool before shipping any new schema.

---

## 10. Deployment QA Guardrail

Before every deploy, run `scripts/qa-premium.mjs` (Playwright). Ship only if:
- Zero horizontal overflow at every breakpoint in § 6
- No `.reveal` elements stuck at opacity:0
- All card h3 elements have luminance ≥ 60/255 on dark theme
- All icons either centered (±20px from card center) or within 25px of left edge
- Footer is 1-col grid at ≤ 768px

**Script location:** `/scripts/qa-premium.mjs`. Run: `node scripts/qa-premium.mjs`.

---

## 11. The Litmus Test (the only question that matters)

> Would an investor closing a $2M hard-money deal on their iPhone at 11:47 PM feel they are dealing with a **serious, expensive, trustworthy lender** — or a **generic landing page**?

If there is **any ambiguity**, the page is not done.
