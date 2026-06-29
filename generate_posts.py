#!/usr/bin/env python3
"""Generate new blog posts from the bridge loan guide template."""

import re
import json
import os

TEMPLATE = "posts/arizona-bridge-loan-guide-real-estate-investors.html"

POSTS = {
    "scottsdale-construction-loans-guide": {
        "title": "Scottsdale Construction Loans: Build Guide for AZ Investors | Grand Funding LLC",
        "description": "How Scottsdale construction loans work, draw schedules, and what lenders check. Grand Funding closes construction loans in 3–5 days statewide.",
        "og_title": "Scottsdale Construction Loans: Build Guide for AZ Investors | Grand Funding LLC Blog",
        "og_description": "How Scottsdale construction loans work, draw schedules, and what lenders check. Grand Funding closes in 3–5 days.",
        "og_image_slug": "scottsdale-construction-loans-guide",
        "h1": "Scottsdale Construction Loans: Build New, Tear Down, or Expand in the Luxury Market",
        "date_iso": "2026-06-29",
        "date_display": "June 29, 2026",
        "category": "Construction",
        "reading_time": "7 min read",
        "faqs": [
            {
                "q": "How do Scottsdale construction loan draws work?",
                "a": "Construction draws are milestone-based — typically 4 to 6 disbursements tied to project completion checkpoints like foundation pour, framing, rough mechanicals, drywall, and final. Grand Funding verifies each milestone before releasing the next draw."
            },
            {
                "q": "Can I use a construction loan for an ADU in Scottsdale?",
                "a": "Yes. Accessory dwelling units are an approved use case for construction loans. Scottsdale and surrounding cities have streamlined ADU permitting, making these deals attractive. We fund ADU construction from $250,000 and up."
            },
            {
                "q": "Do I need permits before getting a construction loan in Scottsdale?",
                "a": "You need approved plans and a building permit pulled before we release the first draw. We can fund loan closing while permits are in process, but ground cannot break — and the first draw won't release — until the permit is issued."
            },
            {
                "q": "What is the maximum LTC for a Scottsdale construction loan?",
                "a": "Grand Funding lends up to 80% of total project cost (land + construction budget) for Scottsdale new construction. That means you're bringing 20% to the table. Maximum loan amount is $5 million."
            }
        ],
        "breadcrumb_title": "Scottsdale Construction Loans: Build Guide for AZ Investors",
        "main_html": """<main id="main"><section class="blog-hero" style="padding-bottom:24px"><div class="container"><p class="eyebrow" style="margin-bottom:10px"><a href="/blog.html" style="color:inherit;text-decoration:none;opacity:.85"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" style="vertical-align:middle;margin-right:4px"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/></svg>Back to Blog</a></p><h1>Scottsdale Construction Loans: Build New, Tear Down, or Expand in the Luxury Market</h1><div class="post-byline" data-post-byline style="display:flex;align-items:center;gap:.85rem;margin:.5rem 0 1.75rem;color:rgba(244,247,255,.72);font-size:.9rem;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:.5rem"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4FE3D2,#F0B26B);display:flex;align-items:center;justify-content:center;color:#0B1014;font-weight:900;font-size:.78rem">LS</div><span style="color:#F0F0EC;font-weight:700">By Logan Sullivan</span></div><span style="color:rgba(244,247,255,.5)" aria-hidden="true">·</span><time datetime="2026-06-29" style="color:rgba(244,247,255,.7)">June 29, 2026</time><span style="color:rgba(244,247,255,.5)" aria-hidden="true">·</span><span style="color:rgba(244,247,255,.7)">Direct Lender · NMLS #2466872</span></div><div class="post-meta" style="justify-content:center"><span class="post-date">June 29, 2026</span><span class="post-category">Construction</span></div></div></section><section class="section" style="padding-top:0"><div class="container" style="max-width:860px"><figure class="blog-hero-image"><picture><source srcset="/images/og/scottsdale-construction-loans-guide.webp" type="image/webp"><img src="/images/og/scottsdale-construction-loans-guide.png" alt="" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" role="presentation"></picture></figure><article class="blog-post" style="display:block"><div class="post-content">
<p>Scottsdale is one of the most active new-construction markets in the country. Teardown-rebuilds in Old Town, custom luxury estates in North Scottsdale, spec homes in McCormick Ranch, and ADUs in Paradise Valley — the building activity is constant. This guide explains how Scottsdale construction loans work, what lenders actually look at, and how to structure a deal that closes fast.</p>

<h2>Why Scottsdale Construction Financing Is Different From Phoenix</h2>
<p>Scottsdale deals skew larger and more custom. You're frequently looking at $1M–$5M projects with architectural drawings, high-end finishes, and extended build timelines. That changes how lenders underwrite the deal:</p>
<ul>
<li><strong>Higher project costs</strong> — $300–$600 per square foot on luxury builds versus $180–$280 for standard Phoenix construction</li>
<li><strong>Longer timelines</strong> — 12 to 18 months typical versus 8 to 12 months for production builds</li>
<li><strong>Stricter permit review</strong> — Scottsdale's design review process adds time; lenders price that in</li>
<li><strong>Stronger exit values</strong> — Scottsdale luxury market comps support higher post-construction appraised values, which means more room on LTV</li>
</ul>
<p>Grand Funding lends up to 80% of total project cost on Scottsdale construction, with loans from $250,000 to $5 million and terms of 12 to 18 months.</p>

<h2>The Four Most Common Scottsdale Construction Loan Use Cases</h2>

<h3>1. Teardown-Rebuild on Established Lots</h3>
<p>Old Town Scottsdale, Arcadia, and South Scottsdale have significant teardown inventory — older homes on premium lots where the land value exceeds the structure. Investors buy, demo, and build new. The construction loan funds the acquisition and build simultaneously, with the land purchase rolled in at closing and construction draws released as milestones hit.</p>

<h3>2. Custom Spec Homes in North Scottsdale</h3>
<p>North Scottsdale — Troon, Desert Highlands, Silverleaf, DC Ranch — is spec home territory for experienced builders. These projects run $2M–$5M+. A construction loan sized at 80% of project cost means you're putting in $400K–$1M in equity while we fund the rest through the draw schedule.</p>

<h3>3. ADU Additions in Paradise Valley and Scottsdale</h3>
<p>Arizona relaxed ADU permitting statewide, and Scottsdale followed. Adding a detached ADU to an existing property adds significant ARV while creating a rentable unit. We fund ADU-only construction loans when the total loan fits within 80% of the post-completion value.</p>

<h3>4. Infill Development and Multi-Unit</h3>
<p>Scottsdale's urban core — near Fashion Square, Old Town, and the entertainment district — has infill opportunities for 2–8 unit projects. We fund small multi-family construction the same way we fund single-family: draw-based, asset-secured, and based on completed project value.</p>

<h2>How Scottsdale Construction Loan Draws Work</h2>
<p>Unlike a purchase loan that funds once, construction loans fund in stages. Here's the typical draw schedule:</p>
<ul>
<li><strong>Draw 1 (Foundation):</strong> Released when foundation is poured and inspected. Usually 15–20% of construction budget.</li>
<li><strong>Draw 2 (Framing):</strong> Released when frame is complete and inspected. Another 20–25% of budget.</li>
<li><strong>Draw 3 (Rough Mechanicals):</strong> Electrical, plumbing, and HVAC roughed in. 15–20%.</li>
<li><strong>Draw 4 (Drywall + Exterior):</strong> Interior drywall and exterior skin complete. 15–20%.</li>
<li><strong>Draw 5 (Completion):</strong> Certificate of Occupancy issued, punch list done. Remaining balance.</li>
</ul>
<p>We require a third-party inspection before releasing each draw. The inspection costs $300–$500 and takes 24–48 hours — it protects both sides. Budget for this in your project timeline.</p>

<h2>What Scottsdale Construction Lenders Actually Look At</h2>
<p>Hard money construction underwriting is asset-based, but Scottsdale deals require more than just "good land." Here's what we review:</p>
<ul>
<li><strong>Approved plans and permits</strong> — City-approved architectural drawings and building permit pulled (or in process) before first draw</li>
<li><strong>Contractor license and insurance</strong> — Licensed GC with ROC registration in Arizona and $1M general liability minimum</li>
<li><strong>Detailed construction budget</strong> — Line-item breakdown with contingency. Scottsdale luxury projects should budget 10–15% contingency</li>
<li><strong>Total project cost vs. ARV</strong> — We want to see the completed value comfortably above the loan amount. Scottsdale comps support this well</li>
<li><strong>Your experience track record</strong> — First-time builders can qualify with an experienced GC; seasoned builders get more flexibility on terms</li>
</ul>

<h2>Scottsdale Construction Loan Timeline: What to Expect</h2>
<p>From first call to funded loan:</p>
<ul>
<li><strong>Day 1:</strong> Submit deal basics — address, plans, construction budget, GC name, exit strategy</li>
<li><strong>Day 1–2:</strong> We review and issue a term sheet with rate, loan amount, draw schedule</li>
<li><strong>Day 2–3:</strong> You accept, title company engaged, preliminary title ordered</li>
<li><strong>Day 3–5:</strong> Appraisal ordered (or BPO on smaller deals), docs drawn</li>
<li><strong>Day 5–10:</strong> Loan closes. First draw can release once permits confirmed</li>
</ul>
<p>Scottsdale deals often take 7–10 days rather than 3–5 because of appraisal timelines on luxury product. If you have a pending lot and a full plan set ready, tell us up front — we can accelerate.</p>

<h2>Costs Borrowers Frequently Underestimate in Scottsdale</h2>
<p>Scottsdale construction projects have cost categories that Phoenix investors sometimes miss:</p>
<ul>
<li><strong>Design review fees:</strong> Scottsdale's Architectural Review Committee adds 4–8 weeks and fees for projects in certain districts</li>
<li><strong>Premium finishes:</strong> Buyers in North Scottsdale expect Sub-Zero/Wolf appliances, porcelain tile throughout, and smart-home systems. Under-budget here and you under-sell</li>
<li><strong>Landscaping:</strong> Desert landscaping with mature plants, putting green, pool, and hardscape can run $150K–$400K on luxury builds — often underfunded</li>
<li><strong>Carrying costs:</strong> Interest on a $2M construction loan at 10.99% runs ~$18,000/month. At 14 months average timeline, that's $252,000 in interest alone</li>
</ul>
<p>Build all of these into your proforma before you close. Surprises at draw 4 are not a position you want to be in.</p>

<h2>Scottsdale vs. Phoenix Construction Loans: Key Differences</h2>
<ul>
<li><strong>Minimum loan size:</strong> We fund $250K on Scottsdale builds (same as Phoenix)</li>
<li><strong>Rate:</strong> Same rate structure — pricing is deal-based, not location-based</li>
<li><strong>Timeline:</strong> Scottsdale luxury projects often run 14–18 months vs. 10–12 months on standard Phoenix builds</li>
<li><strong>Exit:</strong> Strong luxury buyer demand in Scottsdale supports faster absorption than comparable build costs in other Valley cities</li>
</ul>

<h2>What to Bring to Your First Conversation With Us</h2>
<ul>
<li>Property address (or target neighborhood)</li>
<li>Plans and permit status (approved, in review, or being drawn)</li>
<li>Contractor name and license number (ROC#)</li>
<li>Line-item construction budget</li>
<li>Your estimate of completed value with 3 comps if you have them</li>
<li>Your target close date and construction timeline</li>
</ul>
<p>That's enough for us to give you a term sheet. No tax returns. No income verification. Asset-based means the project is the application.</p>
</div><div class="section" style="padding:28px 0 0"><div class="cta-box" style="text-align:center"><h2 style="margin-top:0">Planning a Scottsdale Build?</h2><p style="margin:10px auto 18px;max-width:56ch">Tell us the project. We'll tell you what we can lend, on what terms, and how fast we can close.</p><div class="cta-row" style="justify-content:center"><a class="cta-btn" data-cta-arrow href="/apply.html">Get Pre-Approved</a><a class="ghost-btn" href="/construction-loans-scottsdale.html">Scottsdale Construction Loans</a></div></div></div></article></div></section></main>"""
    },

    "second-position-loans-arizona-guide": {
        "title": "Second Position Loans Arizona: Unlock Equity Without Refinancing | Grand Funding LLC",
        "description": "Use an Arizona second position loan to access equity without touching your first mortgage. Grand Funding funds up to 75% CLTV statewide in 3–5 days.",
        "og_title": "Second Position Loans Arizona: Unlock Equity Without Refinancing | Grand Funding LLC Blog",
        "og_description": "Access equity without touching your first mortgage. Grand Funding funds second position loans up to 75% CLTV statewide in 3–5 days.",
        "og_image_slug": "second-position-loans-arizona-guide",
        "h1": "Second Position Loans Arizona: Tap Equity Without Touching Your First Mortgage",
        "date_iso": "2026-06-29",
        "date_display": "June 29, 2026",
        "category": "Strategy",
        "reading_time": "6 min read",
        "faqs": [
            {
                "q": "What is a second position loan in Arizona?",
                "a": "A second position loan (also called a second mortgage or 2nd lien) is a loan secured by real estate that already has an existing first mortgage. If the borrower defaults, the first lender gets paid first; the second position lender gets paid from remaining equity. Because of this higher risk, second position loans carry higher rates than first position loans."
            },
            {
                "q": "How much can I borrow with an Arizona second position loan?",
                "a": "Grand Funding lends up to 75% combined loan-to-value (CLTV). That means your first mortgage balance plus the second position loan cannot exceed 75% of the property's current appraised value. Loan amounts range from $70,000 to $2 million."
            },
            {
                "q": "Is a second position loan better than a cash-out refinance in Arizona?",
                "a": "It depends on your first mortgage. If your first mortgage has a low fixed rate (under 5%), a cash-out refi forces you to give that up and refinance everything at current market rates — which could add thousands per month to your payment. A second position loan lets you keep your existing first mortgage untouched while accessing equity separately."
            },
            {
                "q": "How fast can Grand Funding close an Arizona second position loan?",
                "a": "Typically 3 to 5 business days for straightforward deals. We need a current payoff statement from your first lender, a title search to confirm lien position, and an appraisal or BPO. Have those ready and we can move quickly."
            }
        ],
        "breadcrumb_title": "Second Position Loans Arizona: Unlock Equity Without Refinancing",
        "main_html": """<main id="main"><section class="blog-hero" style="padding-bottom:24px"><div class="container"><p class="eyebrow" style="margin-bottom:10px"><a href="/blog.html" style="color:inherit;text-decoration:none;opacity:.85"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" style="vertical-align:middle;margin-right:4px"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/></svg>Back to Blog</a></p><h1>Second Position Loans Arizona: Tap Equity Without Touching Your First Mortgage</h1><div class="post-byline" data-post-byline style="display:flex;align-items:center;gap:.85rem;margin:.5rem 0 1.75rem;color:rgba(244,247,255,.72);font-size:.9rem;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:.5rem"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4FE3D2,#F0B26B);display:flex;align-items:center;justify-content:center;color:#0B1014;font-weight:900;font-size:.78rem">LS</div><span style="color:#F0F0EC;font-weight:700">By Logan Sullivan</span></div><span style="color:rgba(244,247,255,.5)" aria-hidden="true">·</span><time datetime="2026-06-29" style="color:rgba(244,247,255,.7)">June 29, 2026</time><span style="color:rgba(244,247,255,.5)" aria-hidden="true">·</span><span style="color:rgba(244,247,255,.7)">Direct Lender · NMLS #2466872</span></div><div class="post-meta" style="justify-content:center"><span class="post-date">June 29, 2026</span><span class="post-category">Strategy</span></div></div></section><section class="section" style="padding-top:0"><div class="container" style="max-width:860px"><figure class="blog-hero-image"><picture><source srcset="/images/og/second-position-loans-arizona-guide.webp" type="image/webp"><img src="/images/og/second-position-loans-arizona-guide.png" alt="" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" role="presentation"></picture></figure><article class="blog-post" style="display:block"><div class="post-content">
<p>Arizona real estate investors are sitting on more equity than they've ever had. The problem: accessing it without losing a 3.5% first mortgage can feel impossible when banks won't touch non-owner properties and cash-out refis would triple your monthly payment. A second position loan is often the answer. Here's how it works, when it makes sense, and what Grand Funding looks at to approve one.</p>

<h2>What Is a Second Position Loan?</h2>
<p>A second position loan is a loan secured by real estate that already has a first mortgage on it. You keep your existing first mortgage exactly as it is — rate, payment, and terms unchanged. The second position loan sits behind the first in lien priority and gives you access to the equity you've built.</p>
<p>In practice: if your property is worth $800,000 and you owe $300,000 on your first mortgage, you have $500,000 in equity. A second position loan can access a portion of that equity — typically up to 75% combined loan-to-value (CLTV), or $600,000 total debt. That means up to a $300,000 second position loan without touching the first.</p>

<h2>Second Position vs. Cash-Out Refinance: The Real Trade-Off</h2>
<p>The choice between a second position loan and a cash-out refi comes down to one question: what rate is on your first mortgage?</p>
<ul>
<li><strong>If your first is below 5%:</strong> A cash-out refi forces you to give up that rate and refinance everything at current market — often 7–8%+ on investment property. On a $300K first mortgage, that's an extra $5,000–$7,500 per year in interest, permanently. A second position loan lets you keep the first mortgage locked at 3.5% while borrowing the equity separately.</li>
<li><strong>If your first is at current market rates:</strong> The math shifts. A cash-out refi consolidates at one rate. A second position loan carries a higher rate than a first position (more risk to the lender) — so if you're already at current market on the first, a second position may cost more in blended rate. Do the math for your specific situation.</li>
<li><strong>If you need funds quickly:</strong> Second position loans can close in 3–5 days. Conventional cash-out refis take 30–45 days. If you have a time-sensitive deal, the decision may be made for you.</li>
</ul>

<h2>Five Scenarios Where Arizona Investors Use Second Position Loans</h2>

<h3>1. Fund the Next Acquisition Without Selling</h3>
<p>You own a Phoenix rental free and clear (or with a small first mortgage) and want to buy another property. Instead of selling the existing asset, you take a second position loan against it and use the proceeds as the down payment or full purchase on the next deal. You keep the existing cash flow and add a new asset.</p>

<h3>2. Fund a Renovation Without Selling</h3>
<p>A Scottsdale property needs $150K in renovations before it's ready to sell or refinance. You don't want to sell it in its current condition. A second position loan funds the renovation, you complete the work, the property appraises higher, and you exit via sale or refi.</p>

<h3>3. Bridge to a Better Exit</h3>
<p>Your investment timeline has shifted. You planned to sell in 2 months, but the market is soft right now. A second position loan gives you 12 months of runway — capital to cover operating costs, carry the property, and wait for better conditions. Cheaper than selling at the wrong time.</p>

<h3>4. Business Capital Without Business Financing</h3>
<p>Arizona investors with real estate equity often find it faster and cheaper to borrow against their property than to go through business lenders. Second position loans on investment real estate are asset-based — your property's equity is the collateral, not your business cash flow.</p>

<h3>5. Unlock Equity on a Low-Rate First You Can't Refinance</h3>
<p>The most common scenario right now: you locked a 3.5% first mortgage in 2021. You have $400K in equity. A cash-out refi at 7.5% would cost you an extra $9,000/year in interest on the existing balance — forever. A second position loan at 11.99% on a $200K draw costs about $24,000/year in interest, but you keep paying $9,000/year less on the first. Run the full-stack math.</p>

<h2>How Grand Funding Underwrites Second Position Loans in Arizona</h2>
<p>Our underwriting process is asset-based, not income-based. Here's what we review:</p>
<ul>
<li><strong>Current property value:</strong> We order an appraisal or BPO. The property needs to be worth enough that first + second is at or below 75% CLTV.</li>
<li><strong>First mortgage payoff balance:</strong> We need a current payoff statement from your first lender. We verify the balance and confirm no missed payments (a default on the first puts both loans at risk).</li>
<li><strong>Title search:</strong> We confirm lien position and that there are no other liens we don't know about.</li>
<li><strong>Exit strategy:</strong> How does this loan get paid off? Sale, refi, cash payoff? We need a believable exit.</li>
<li><strong>Entity structure:</strong> If the property is held in an LLC, bring the operating agreement and proof of your membership interest.</li>
</ul>
<p>We do not require tax returns, W-2s, or income verification. The equity in the property is the underwriting.</p>

<h2>Arizona Second Position Loan Terms: What to Expect</h2>
<ul>
<li><strong>Rate:</strong> Starting at 11.99% interest-only</li>
<li><strong>Maximum CLTV:</strong> 75% (first mortgage + second position combined)</li>
<li><strong>Loan amounts:</strong> $70,000 to $2,000,000</li>
<li><strong>Term:</strong> 12 to 24 months</li>
<li><strong>Close timeline:</strong> 3 to 5 business days</li>
<li><strong>Properties:</strong> Investment real estate in Arizona and California (non-owner occupied)</li>
</ul>

<h2>What Gets Second Position Loans Denied</h2>
<p>Understanding the no-gos saves everyone time:</p>
<ul>
<li><strong>CLTV above 75%:</strong> If the first mortgage is already at 80% LTV, there's no room for a second position loan within our guidelines. The first needs to be paid down first.</li>
<li><strong>First mortgage in default:</strong> A missed payment on the first is a disqualifier. Current status on the first is non-negotiable.</li>
<li><strong>Owner-occupied residential property:</strong> We fund investment property only. Primary residences fall under TRID and QM rules — different product entirely.</li>
<li><strong>No clear exit strategy:</strong> "I'll figure it out" isn't an exit. We need a specific, realistic plan for loan repayment within the term.</li>
</ul>

<h2>Arizona Second Position Loan Checklist</h2>
<ul>
<li>Property address and current estimated value</li>
<li>First mortgage lender name, balance, and monthly payment</li>
<li>Amount you need and what you'll use it for</li>
<li>Your exit strategy (sale date, refi plan, or cash payoff timeline)</li>
<li>Entity docs if property is held in an LLC</li>
</ul>
<p>That's enough for a same-day term sheet. Call us at (602) 935-0371 or submit at the link below.</p>
</div><div class="section" style="padding:28px 0 0"><div class="cta-box" style="text-align:center"><h2 style="margin-top:0">Have Equity You're Not Using?</h2><p style="margin:10px auto 18px;max-width:56ch">Tell us the property address and what you owe on the first. We'll tell you what's available and on what terms — same day.</p><div class="cta-row" style="justify-content:center"><a class="cta-btn" data-cta-arrow href="/apply.html">Get Pre-Approved</a><a class="ghost-btn" href="/second-position-loans-phoenix.html">Second Position Loans</a></div></div></div></article></div></section></main>"""
    }
}


def build_schemas(spec, slug):
    """Build JSON-LD schemas for the blog post."""
    person_schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Logan Sullivan",
        "givenName": "Logan",
        "familyName": "Sullivan",
        "jobTitle": "Founder & Direct Lender",
        "url": "https://www.grandfundingllc.com/about",
        "image": "https://www.grandfundingllc.com/images/logan/logan-portrait-720.webp",
        "description": "Logan Sullivan is the founder of Grand Funding LLC, a direct private hard money lender for Arizona and California real estate investors. With 40+ years of real estate, lending, and investment experience, Logan underwrites and closes every loan personally.",
        "knowsAbout": ["Hard money lending", "Private money lending", "Fix and flip loans", "Bridge loans", "Construction loans", "Second position loans", "Arizona real estate investment", "California real estate investment"],
        "hasCredential": [
            {"@type": "EducationalOccupationalCredential", "name": "NMLS License #2466872"},
            {"@type": "EducationalOccupationalCredential", "name": "AZ MLO License #1048901"}
        ],
        "worksFor": {"@type": "Organization", "name": "Grand Funding LLC", "url": "https://www.grandfundingllc.com"}
    }

    webpage_schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".hero-content", ".section-header", "h1", "h2"]
        }
    }

    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq["q"],
                "acceptedAnswer": {"@type": "Answer", "text": faq["a"]}
            }
            for faq in spec["faqs"]
        ]
    }

    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.grandfundingllc.com/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.grandfundingllc.com/blog"},
            {"@type": "ListItem", "position": 3, "name": spec["breadcrumb_title"], "item": f"https://www.grandfundingllc.com/posts/{slug}"}
        ]
    }

    def minify_json(obj):
        return json.dumps(obj, separators=(',', ':'))

    blocks = []
    for schema in [person_schema, webpage_schema, faq_schema, breadcrumb_schema]:
        blocks.append(f'<script type="application/ld+json">{minify_json(schema)}</script>')
    return ''.join(blocks)


def generate_post(slug, spec, template_content):
    """Generate a blog post HTML file from the template."""
    content = template_content

    url = f"https://www.grandfundingllc.com/posts/{slug}"
    og_image_base = f"https://www.grandfundingllc.com/images/og/{spec['og_image_slug']}"

    # Replace title
    content = re.sub(r'<title>.*?</title>', f'<title>{spec["title"]}</title>', content)

    # Replace meta description
    content = re.sub(
        r'<meta name="description" content=".*?"',
        f'<meta name="description" content="{spec["description"]}"',
        content
    )

    # Replace canonical
    content = re.sub(
        r'<link rel="canonical" href=".*?"',
        f'<link rel="canonical" href="{url}"',
        content
    )
    # Also the alternate format href first
    content = re.sub(
        r'<link href="https://www\.grandfundingllc\.com/posts/[^"]*" rel="canonical"',
        f'<link href="{url}" rel="canonical"',
        content
    )

    # Replace og:title
    content = re.sub(
        r'<meta property="og:title" content=".*?"',
        f'<meta property="og:title" content="{spec["og_title"]}"',
        content
    )

    # Replace og:description
    content = re.sub(
        r'<meta property="og:description" content=".*?"',
        f'<meta property="og:description" content="{spec["og_description"]}"',
        content
    )

    # Replace og:url (both attribute orders)
    content = re.sub(
        r'<meta property="og:url" content=".*?"',
        f'<meta property="og:url" content="{url}"',
        content
    )
    content = re.sub(
        r'<meta content="https://www\.grandfundingllc\.com/posts/[^"]*" property="og:url"',
        f'<meta content="{url}" property="og:url"',
        content
    )

    # Replace og:image (both attribute orders)
    content = re.sub(
        r'<meta property="og:image" content="https://www\.grandfundingllc\.com/images/og/[^"]*\.png"',
        f'<meta property="og:image" content="{og_image_base}.png"',
        content
    )
    content = re.sub(
        r'<meta content="https://www\.grandfundingllc\.com/images/og/[^"]*\.png" property="og:image"',
        f'<meta content="{og_image_base}.png" property="og:image"',
        content
    )

    # Replace twitter:image
    content = re.sub(
        r'<meta name="twitter:image" content="https://www\.grandfundingllc\.com/images/og/[^"]*"',
        f'<meta name="twitter:image" content="{og_image_base}.png"',
        content
    )
    content = re.sub(
        r'<meta content="https://www\.grandfundingllc\.com/images/og/[^"]*" name="twitter:image"',
        f'<meta content="{og_image_base}.png" name="twitter:image"',
        content
    )

    # Replace twitter:title
    content = re.sub(
        r'<meta name="twitter:title" content=".*?"',
        f'<meta name="twitter:title" content="{spec["og_title"]}"',
        content
    )
    content = re.sub(
        r'<meta content="[^"]*" name="twitter:title"',
        f'<meta content="{spec["og_title"]}" name="twitter:title"',
        content
    )

    # Replace twitter:description
    content = re.sub(
        r'<meta name="twitter:description" content=".*?"',
        f'<meta name="twitter:description" content="{spec["og_description"]}"',
        content
    )
    content = re.sub(
        r'<meta content="[^"]*" name="twitter:description"',
        f'<meta content="{spec["og_description"]}" name="twitter:description"',
        content
    )

    # Remove all existing JSON-LD schemas
    content = re.sub(r'<script type="application/ld\+json">.*?</script>', '', content, flags=re.DOTALL)

    # Insert new schemas before </head>
    new_schemas = build_schemas(spec, slug)
    content = content.replace('</head>', new_schemas + '</head>', 1)

    # Replace <main> section
    main_start = content.find('<main')
    main_end = content.find('</main>') + 7
    if main_start == -1 or main_end == 6:
        raise ValueError(f"Could not find <main> in content for {slug}")

    content = content[:main_start] + spec["main_html"] + content[main_end:]

    return content


def main():
    with open(TEMPLATE, 'r') as f:
        template_content = f.read()

    for slug, spec in POSTS.items():
        print(f"Generating posts/{slug}.html...")
        output = generate_post(slug, spec, template_content)
        outpath = f"posts/{slug}.html"
        with open(outpath, 'w') as f:
            f.write(output)
        print(f"  Written: {outpath} ({len(output):,} bytes)")

    print(f"\nGenerated {len(POSTS)} blog posts:")
    for slug in POSTS:
        print(f"  ✓ posts/{slug}.html")


if __name__ == "__main__":
    main()
