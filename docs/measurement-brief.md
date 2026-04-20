# Grand Funding LLC — Post-Launch Measurement Brief

**Written:** 2026-04-20
**For:** Logan Sullivan
**Purpose:** Tell whether Phases 1–3 are actually improving the business.

---

## What was shipped (recap)

**Phase 1 — conversion polish**
- `apply.html` form upgraded with 4 pre-qualification fields (loan amount, ARV, exit strategy, experience)
- Product-page CTAs tightened
- `partners.html` copy refined (AZ → AZ + CA, $70K loan-range consistency)

**Phase 2 — education pillar pages**
- `/hard-money-loan-requirements.html`
- `/how-hard-money-loans-work.html`
- `/hard-money-vs-conventional.html`
- `/arv-explained.html`

**Phase 3 — city expansion**
- `/mesa-hard-money-lender.html`
- `/tucson-hard-money-lender.html`
- `/orange-county-hard-money-lender.html`
- `/inland-empire-hard-money-lender.html`

**Plus:** site-wide reciprocal internal linking across 30+ pages, sitemap updated, Article + FAQPage + FinancialService schema in place.

---

## Immediate actions (do these within the first 48 hours after launch)

### 1. Submit new URLs to Google Search Console

Open Search Console → `https://www.grandfundingllc.com` property → **URL Inspection** tool.

Paste each URL, then click **"Request Indexing"**:

**Phase 2 pillar pages:**
```
https://www.grandfundingllc.com/hard-money-loan-requirements.html
https://www.grandfundingllc.com/how-hard-money-loans-work.html
https://www.grandfundingllc.com/hard-money-vs-conventional.html
https://www.grandfundingllc.com/arv-explained.html
```

**Phase 3 city pages:**
```
https://www.grandfundingllc.com/mesa-hard-money-lender.html
https://www.grandfundingllc.com/tucson-hard-money-lender.html
https://www.grandfundingllc.com/orange-county-hard-money-lender.html
https://www.grandfundingllc.com/inland-empire-hard-money-lender.html
```

This typically gets first impressions within 24-72 hours instead of waiting 2-4 weeks for passive crawl.

### 2. Resubmit sitemap

Search Console → **Sitemaps** → confirm `sitemap.xml` shows status **Success** and last read date is recent. If not, click "Submit" again.

### 3. First-submission form test

Submit one real test lead through `/apply.html` yourself. Confirm in Netlify's Forms dashboard that all new fields appear:
- `loan_amount` (dropdown value)
- `property_value`
- `exit_strategy`
- `investor_experience`

If they don't appear, Netlify's form-detection pass may not have registered the new fields during the deploy. Redeploy will fix it.

### 4. Email notification check

If you have Netlify email notifications configured for the `pre-approval` form, either:
- **A)** Confirm the default raw-field email template still works — it will auto-include the new fields
- **B)** If you have a custom HTML email template, update it to include the 4 new fields (or accept that new fields will be missing from the email even though they're captured in Netlify)

---

## Weekly check (10 minutes, every Monday)

### A. Search Console — Performance report

Navigate to: **Performance → Search Results**

Set date range: **Last 7 days**

### Query tracker (copy these into the Query filter one at a time):

**Pillar page queries:**
- `hard money loan requirements`
- `how hard money loans work`
- `hard money vs conventional`
- `arv explained` / `what is arv`

**City queries (AZ):**
- `hard money lender mesa`
- `hard money lender tucson`
- `mesa hard money` / `tucson hard money`

**City queries (CA):**
- `hard money lender orange county`
- `hard money lender inland empire`
- `orange county hard money` / `inland empire hard money`

**Program queries (established pages — for comparison baseline):**
- `hard money lender arizona`
- `hard money lender california`
- `fix and flip loan arizona`
- `bridge loan arizona`

### What to record weekly in a simple spreadsheet:

| Week | Query | Impressions | Clicks | Position | URL |
|---|---|---|---|---|---|

### What "good" looks like at each timeline:

**Week 1-2:** New pages start appearing in Search Console with 0-5 impressions on their primary keyword. Anything > 0 means Google indexed and ranked (even poorly).

**Week 3-6:** Impressions grow to 10-50 per new page. Average position lands somewhere between 30-80 for the primary keyword. Still early.

**Week 6-12:** Impressions grow to 50-300 per page. Average positions start moving from 40s → 20s for well-built pages. Click-through begins.

**Week 12+:** Pages that are going to rank have usually surfaced into positions 10-25. Pages that are never going to rank stay stuck at 40+ with no movement.

### Red flags to watch:

- **Zero impressions after 2 weeks** on a page → likely not indexed. Re-submit via URL Inspection.
- **Impressions grow but position stays > 50** after 8 weeks → page isn't competitive enough on its target keyword. Consider rewriting the H1/title or adding depth.
- **Position is strong (< 15) but clicks are zero** → the meta description or title isn't compelling enough to click. A/B test the meta description.

---

## Monthly check (30 minutes, first of each month)

### A. Page group performance

In Search Console **Performance** report, filter by **Page** (click Pages tab, not Queries). Group mentally into:

**Pillar pages (4):**
Expected role: gather informational queries that eventually funnel to money pages via internal links.

**City pages (8 total — 4 existing + 4 new):**
Expected role: capture geographic commercial intent.

**Money/program pages (7):**
Expected role: rank for "[program] loans [location]" commercial queries.

**Education blog posts (12):**
Expected role: long-tail education traffic that builds topical authority.

For each group, answer:
- How many pages have any impressions this month?
- What's the average position across the group?
- Which pages are outperforming / underperforming the group average?

### B. Netlify Forms — lead quality check

Open Netlify → **Site → Forms → pre-approval** → review last 30 days of submissions.

### Lead quality questions to answer monthly:

**Form field utilization:**
- What % of submissions have the new `loan_amount` field populated? (should be 100% — it's required)
- What % of submissions have `property_value` populated? (may be < 100% since it's optional)
- What % pick "First Deal" vs "1-3" vs "4-10" vs "10+" in `investor_experience`?
- What's the distribution across `exit_strategy` options?

**Lead relevance:**
- How many submissions are genuinely real estate investor scenarios vs junk/spam?
- How many fit Grand Funding's actual box (AZ or CA, property-backed, $70K-$5M)?
- How many are out-of-state / non-real-estate / mismatched?

**Source attribution (UTM):**
The form captures `utm_source`, `utm_medium`, `utm_campaign`, `gclid` automatically. Check the hidden fields on submissions to see:
- Which marketing channels produce the best lead quality
- Whether organic (no UTM, direct, or `referrer` from google.com) improves over time

### C. Loan amount dropdown decision point

**After 10-20 submissions**, decide:

- **Keep dropdown** if: submissions are cleanly segmenting into useful qualification buckets, and you don't find yourself calling back to ask the exact number on most leads.
- **Revert to free-text input** if: you're frequently asking borrowers for the exact number anyway, or if specific amounts in the middle of a range ($340K when they picked "$250K-$500K") are causing underwriting back-and-forth.

If reverting: one-file edit in `apply.html`, 30 seconds, no design changes.

---

## Quarterly check (first of each quarter — 90 minutes)

### A. Full Search Console "before vs after" comparison

Set date range: **Last 3 months** vs **Previous 3 months** (Search Console has a built-in compare toggle).

Track:
- Total impressions growth % on the site
- Total clicks growth %
- Non-brand query count (queries that don't contain "grand funding")
- Top 10 rising queries
- Top 10 rising pages

### B. SpyFu re-check

Revisit `https://www.spyfu.com/seo/keywords/domain?query=grandfundingllc.com`.

**What should have changed vs the April 2026 baseline (11 keywords, 0 clicks):**

By Q3 2026 (3 months post-launch):
- Keyword count should roughly double (11 → 20-30)
- Top organic keywords should shift away from "refinance mortgage arizona" junk toward hard-money-specific terms
- Estimated clicks should move off zero

If SpyFu STILL shows 11 keywords and 0 clicks 3 months after launch, something is wrong — check for crawl errors in Search Console, confirm no `noindex` accidentally on money pages, confirm pages are actually discoverable.

### C. Internal path performance

Look at Search Console → **Links → Internal links** report.

Verify:
- Pillar pages (requirements, how-it-works, etc.) show up as major internal-link destinations
- New city pages have 10+ internal links pointing to them
- No important page has < 3 internal links pointing in

---

## Specific monitoring rules by page group

### Phase 2 pillar pages

**Expected behavior:** Pillar pages earn impressions on broad educational queries. They may not convert directly (high intent is on money pages), but they feed the money pages via internal links.

**Healthy signal:** High impressions, mid-range CTR (2-5%), low direct conversion rate. This is correct — pillar pages are top-of-funnel.

**Unhealthy signal:** Zero impressions after 8 weeks → thin content or indexing issue. Zero internal clicks to money pages → internal linking isn't working.

### Phase 3 city pages

**Expected behavior:** City pages should rank for "hard money lender [city]" within 3-6 months. Competition varies: Mesa/Tucson should be achievable top-10; Orange County / Inland Empire are more competitive.

**Healthy signal:** Primary keyword position moves from 50+ → 25 → 15 → 10 over 3-4 months.

**Unhealthy signal:** Stuck at position 40+ after 6 months. Likely means the page isn't strong enough vs competition. Add depth: local testimonials, genuinely local market data, Logan's actual experience in that submarket.

### Existing money/program pages

**Expected behavior:** These are your established pages. They should continue to rank and now benefit from reciprocal inbound links from the new pillar + city pages.

**Healthy signal:** Position moves up 2-5 slots for primary keywords within 6-12 weeks of Phase 2-3 launch, as internal link equity flows in.

**Unhealthy signal:** No movement after 12 weeks → internal linking isn't passing authority OR target keyword is too competitive. Consider building more supporting content for those pages specifically.

---

## Lead-quality feedback loop

Every 10-20 form submissions, quickly note:

1. Was this a **real** deal inquiry (not spam, not out-of-state, not wrong industry)? Yes/No
2. Did it fit Grand Funding's **actual box** ($70K-$5M, AZ/CA, property-backed)? Yes/No
3. Did the borrower's self-reported **experience level** match what was actually true once you called? Accurate / Overstated / Understated
4. Did the **exit strategy** they picked match what the deal actually was? Yes/No
5. Which **marketing source** did this come from (UTM or referrer)?

After 50-100 submissions you'll have real data on which form fields are predictive of deal quality vs noise.

---

## When to re-engage me (your developer) for follow-up work

**Build Phase 4 when:**
- Phase 3 city pages are consistently ranking in the top 20 for their primary keywords (indicates organic strategy is working and worth expanding)
- Lead volume from organic has grown enough that 4-6 more city pages would be a meaningful addition
- Logan has real closed-deal examples from the new cities we can populate actual `.lp-deals` blocks with (swaps the "Common scenarios" framing for authentic funded deals — higher trust + ranking signal)

**Potential Phase 4 candidates:**
- Additional AZ cities: Gilbert, Chandler, Glendale, Peoria, Flagstaff
- Additional CA cities: Sacramento, Santa Barbara, Palm Springs, Fresno
- Deal calculators: ARV calculator, fix-flip profit estimator, bridge loan sizing tool
- Competitor comparison pages (only if there's documented demand — e.g., "Kiavi vs Grand Funding" if Search Console shows real branded-comparison queries)
- Additional pillar pages: "Hard money vs private money", "What is DSCR", "1031 exchange bridge loans"

**Don't build Phase 4 until Phase 3 pages show evidence they're working.** Building in the dark is how sites bloat. Build on signal.

**Rebuild / refactor work that's independent of new content:**
- `loan_amount` dropdown → free-text revert (if Logan finds dropdown too restrictive after 10-20 leads)
- Netlify form email template update (if you configure a custom template and need new fields included)
- Performance optimization pass if Lighthouse scores drop below 90 on any page group
- Schema updates if Google adds new rich-result types relevant to financial services

---

## Success criteria (90 days post-launch)

This is what "Phases 1-3 worked" looks like:

- **Search Console:** non-brand organic impressions up 2-5× vs April 2026 baseline
- **Search Console:** at least 4 of the 8 new pages (pillars + cities) rank top-20 for their primary keyword
- **SpyFu:** recognized keyword count doubles, keyword mix shifts toward hard-money terms
- **Netlify Forms:** average lead quality scored by Logan improves (higher % of "real deal inquiries" vs noise)
- **Lead volume:** organic-source submissions appear in form dashboard (meaning the funnel is working, not just paid)

If those five things happen, the system is working. If 2-3 of them happen, adjustments needed (likely on the underperforming pages). If 0-1 happen by Q3, re-audit what's broken (indexing? site structure? deeper SEO issue?).

---

**Bottom line:** Phases 1-3 created the structure. Measurement tells us whether the structure is earning attention. The plan above gives Logan a specific, repeatable way to tell.
