# Grand Funding owner directives — 2026-10-27

Decision owner: Logan Sullivan (owner, Grand Funding LLC). Relayed to the website team on 2026-10-27 and applied locally on branch `codex/grand-funding-schema-20261025`. This record narrows public claims; it does not record lending-counsel approval and does not resolve any of the seven strict release gates in `.lifi/regulated-claims.json`.

## Directives

1. **Business-purpose only.** Grand Funding is business-purpose only. Every page and every form carries the statement: "Business-purpose loans for real estate investors only. Not for owner-occupied or consumer purposes." Nothing on the site is aimed at homeowners or owner-occupied borrowers. This replaces the 2026-07-27 limited, case-specific occupancy wording. Legally required disclosures stay in place.
2. **No published terms.** The site publishes no rates, points, fees, leverage limits (LTV/LTC/ARV percentages), loan amounts or ranges, credit-score minimums, or term lengths or timelines as promises. Public copy says "Call for terms" with (602) 935-0371 and the quote request form. This replaces the 2026-07-27 answer "Yes, the current timing is approved."
3. **No unverified funded stories.** Individual funded or closed deal stories are relabeled as hypothetical example scenarios ("Hypothetical examples to discuss, not records of individual loans or completed closings.") or replaced with what Grand Funding needs to review a deal.
4. **Social profile.** The only social profile is Instagram @logan.loans (https://www.instagram.com/logan.loans/). It is a visible footer link and the Organization `sameAs`. Grand Funding has no other accounts.
5. **No public address.** The service area is Arizona and California. No street address is published.

## Enforcement

- `.lifi/public-claims-policy.json` hard blocks (fail the build): published timing promises, term lengths, loan amounts/ranges, credit-score minimums, leverage/rate/fee percentages, non-business-purpose eligibility wording, and unverified funded stories. Scope: visible copy, metadata, JSON-LD, and every served `.txt`/`.json`/`.webmanifest`/`.xml` file.
- `scripts/validate-client-website-approval.mjs`: the business-purpose statement on every page, inside every form, and the Instagram link on every HTML page.

## Pending owner step

Five plain-English investor guides are drafted in `drafts-for-logan-review/` (not linked, not in the sitemap, not built into `dist/`; `scripts/validate-site.mjs` fails if the folder reaches `dist/`). Logan approves the content before anything is published.
