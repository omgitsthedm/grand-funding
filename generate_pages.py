#!/usr/bin/env python3
"""Generate new SEO landing pages for Grand Funding LLC.
Each page is derived from an existing template with city/loan-type specific content.
"""

import re
import json

# ============================================================
# Page Specifications
# ============================================================

# FAQ sets per loan type
CONSTRUCTION_FAQS_GENERIC = [
    ("How are construction draws structured?",
     "Typical schedule is 4-6 milestone draws based on a third-party inspector validating completed work. First draw at slab/foundation, subsequent draws at framing, MEP, drywall, and final."),
    ("Do I need a licensed GC?",
     "Yes for ground-up new construction. Owner-builders are case-by-case — we look at experience and project complexity."),
    ("Can the loan finance both the lot and the build?",
     "Yes. Most of our construction loans finance acquisition + build in a single instrument."),
    ("What happens if construction runs over budget?",
     "We work with you. Cost overruns are funded as a loan modification or a small junior facility. Logan has been a builder himself — he plans for the messiness."),
]

FIX_FLIP_FAQS_GENERIC = [
    ("What does 90% ARV mean?",
     "It means we'll lend up to 90% of the After Repair Value — the projected value after your renovations are complete. So on a property with a $400K ARV, you could borrow up to $360K."),
    ("Do I need to show income or tax returns?",
     "No. We underwrite the deal, not your W-2. Property value, equity position, and your exit strategy are what matter."),
    ("Can I close in less than a week?",
     "For clean, straightforward deals — yes. Our record is 48 hours from term sheet to funding. Typical close is 3-5 business days."),
    ("What credit score do I need?",
     "Credit is reviewed but not the primary qualifier. Borrowers with scores as low as 550 can qualify depending on the deal structure and equity."),
]

BRIDGE_FAQS_GENERIC = [
    ("What's the maximum LTV on a bridge loan?",
     "75% of the as-is property value. We can go higher case-by-case for strong borrowers with low-leverage exits."),
    ("Is there a prepayment penalty?",
     "No prepayment penalty on most bridge loans. You can sell or refinance early without additional fees."),
    ("How fast can I close a bridge loan?",
     "3-5 business days is standard. For clean title and straightforward equity, we've closed bridge loans in 48 hours."),
    ("What's the typical bridge loan term?",
     "6-24 months. Most bridge borrowers exit within 12 months via sale or refinance into long-term DSCR."),
]

SECOND_POSITION_FAQS_GENERIC = [
    ("What is a second position loan?",
     "A second position loan (also called a second mortgage or junior lien) sits behind your existing first mortgage. It lets you access your equity without disturbing your low first-rate loan."),
    ("What's the maximum CLTV?",
     "We typically go up to 75% Combined Loan-to-Value. So if your first mortgage is 50% LTV, we may lend up to 25% in second position."),
    ("How fast can I fund a second position loan?",
     "7-10 business days is typical — slightly longer than first-lien deals due to subordination review with your first-lien lender."),
    ("When does a second position beat a cash-out refi?",
     "When your first mortgage has a rate below 5-6%, refinancing destroys the economics. A second position loan lets you keep the first and access equity on just the incremental amount."),
]

# ============================================================
# Page Specs: one dict per new page
# ============================================================

PAGES = {

    # ---- CONSTRUCTION LOANS ----

    'construction-loans-scottsdale': {
        'source': 'construction-loans-phoenix.html',
        'city': 'Scottsdale',
        'CITY': 'SCOTTSDALE',
        'loan_type': 'Construction Loan',
        'LOAN_TYPE': 'CONSTRUCTION LOAN',
        'slug': 'construction-loans-scottsdale',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '10.99%',
        'ltv': '80% of cost',
        'term': '12-18 months',
        'loan_range': '$250K-$5M',
        'title': 'Scottsdale Construction Loans | 10.99% From | Grand Funding LLC',
        'meta_desc': 'Scottsdale construction loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 80% of project cost, $250K–5M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Construction loans for Scottsdale, Arizona real estate investors. Up to 80% of cost, from 10.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Scottsdale Construction Loans',
        'hero_sub': "Up to 80% of cost. Milestone draws aligned with your build schedule. $5M cap. Built for luxury custom home builders and investor-developers in Arizona's premier market. Funding investors from North Scottsdale, Old Town, Paradise Valley, DC Ranch and across Arizona.",
        'h2': 'Construction Loans built for Scottsdale deals',
        'market_p1': "Scottsdale is Arizona's luxury real estate capital — median home values exceed $800K and high-end construction ARVs regularly reach $1.5M to $3M+. Custom builders and investor-developers here need a lender who can underwrite high-value projects quickly and fund in 3-5 days.",
        'market_context': "North Scottsdale luxury new construction regularly closes above $1.5M ARV. ADU additions in McCormick Ranch and DC Ranch areas have seen 40–60% equity uplift in recent years.",
        'neighborhoods': 'North Scottsdale, Old Town, Paradise Valley, McCormick Ranch, DC Ranch',
        'who': "Custom home builders and investor-developers with a permitted plan, licensed GC, and a clear exit. We finance acquisition + construction with milestone draws. Common Scottsdale use cases include luxury fix-and-flip, custom home builds, estate rehabilitation, and ADU additions.",
        'coverage': 'Statewide in Arizona, including Scottsdale',
        'cta_h3': 'Have a Scottsdale deal under contract?',
        'cta_p': 'Logan personally reviews every construction loan request. Term sheet in 24 hours.',
        'form_name': 'scottsdale-construction',
        'faqs': CONSTRUCTION_FAQS_GENERIC + [
            ("What Scottsdale neighborhoods does Grand Funding serve?",
             "We fund construction projects across all of Scottsdale: North Scottsdale, Old Town, Scottsdale Airpark, McCormick Ranch, DC Ranch, Paradise Valley adjacent, and Gainey Ranch."),
        ],
        'explore': [
            ('/fix-and-flip-loans-scottsdale', 'Fix & Flip Loans', 'Scottsdale Fix & Flip'),
            ('/bridge-loans-scottsdale', 'Bridge Loans', 'Scottsdale Bridge Loans'),
            ('/cash-out-refinance-scottsdale', 'Cash-Out Refi', 'Scottsdale Cash-Out'),
            ('/scottsdale-hard-money-lender', 'City Hub', 'All Scottsdale Loans'),
            ('/construction-loans-arizona', 'AZ Construction', 'Arizona Construction Loans'),
        ],
        'schema_faq': [
            ("How are construction draws structured?", "Typical schedule is 4-6 milestone draws based on a third-party inspector validating completed work. First draw at slab/foundation, subsequent draws at framing, MEP, drywall, and final."),
            ("Do I need a licensed GC for Scottsdale construction?", "Yes for ground-up new construction. Owner-builders are reviewed case-by-case — we look at experience and project complexity. Scottsdale permits require licensed contractors for most structural work."),
            ("What is the maximum loan for a Scottsdale construction project?", "Grand Funding construction loans go up to $5,000,000. This covers luxury custom homes, large fix-and-flip projects, and multi-unit new construction in the Scottsdale market."),
            ("Can the loan finance both the land and the build?", "Yes. Most of our Scottsdale construction loans finance acquisition + build in a single instrument, simplifying the closing process."),
        ],
    },

    'construction-loans-san-diego': {
        'source': 'construction-loans-phoenix.html',
        'city': 'San Diego',
        'CITY': 'SAN DIEGO',
        'loan_type': 'Construction Loan',
        'LOAN_TYPE': 'CONSTRUCTION LOAN',
        'slug': 'construction-loans-san-diego',
        'state': 'California',
        'state_abbr': 'CA',
        'rate': '10.99%',
        'ltv': '80% of cost',
        'term': '12-18 months',
        'loan_range': '$250K-$5M',
        'title': 'San Diego Construction Loans | 10.99% From | Grand Funding LLC',
        'meta_desc': 'San Diego construction loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 80% of cost, $250K–5M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Construction loans for San Diego, California real estate investors. Up to 80% of cost, from 10.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'San Diego Construction Loans',
        'hero_sub': "Up to 80% of cost. Milestone draws on your schedule. $5M cap. Built for San Diego builders and investor-developers navigating coastal permitting and high-value new construction. Funding investors from La Jolla, Pacific Beach, North Park, Encinitas, and across California.",
        'h2': 'Construction Loans built for San Diego deals',
        'market_p1': "San Diego is one of California's most constrained real estate markets — coastal supply is limited, demand is relentless, and new construction carries some of the highest ARVs in the state. Builders and investor-developers need a lender who understands California construction permitting and can fund in 3-5 days.",
        'market_context': "San Diego ADU builds average $250K–$400K in cost but add $600K–$1M+ in property value in coastal zip codes. New construction in La Jolla and Del Mar regularly exceeds $3M ARV.",
        'neighborhoods': 'La Jolla, Pacific Beach, North Park, Encinitas, Del Mar',
        'who': "Builder-investors with a permitted plan, licensed California GC, and a clear exit. We finance acquisition + build in a single instrument. Common San Diego use cases include coastal ADU additions, ground-up luxury builds, fix-and-flip rehabs, and teardown-rebuilds.",
        'coverage': 'Statewide in California, including San Diego',
        'cta_h3': 'Have a San Diego deal under contract?',
        'cta_p': 'Logan personally reviews every construction loan request. Term sheet in 24 hours. We fund California.',
        'form_name': 'san-diego-construction',
        'faqs': CONSTRUCTION_FAQS_GENERIC + [
            ("Do you fund ADU construction in San Diego?",
             "Yes. ADU additions are one of the most common use cases in San Diego and across California. We finance the full cost of an ADU build as a construction loan against the primary property's value."),
        ],
        'explore': [
            ('/fix-and-flip-loans-san-diego', 'Fix & Flip Loans', 'San Diego Fix & Flip'),
            ('/bridge-loans-san-diego', 'Bridge Loans', 'San Diego Bridge Loans'),
            ('/san-diego-hard-money-lender', 'City Hub', 'All San Diego Loans'),
            ('/construction-loans-california', 'CA Construction', 'California Construction Loans'),
            ('/california-hard-money-lender', 'California Hub', 'All California Loans'),
        ],
        'schema_faq': [
            ("How are construction draws structured?", "Typical schedule is 4-6 milestone draws based on a third-party inspector validating completed work. First draw at slab/foundation, subsequent draws at framing, MEP, drywall, and final."),
            ("Do you fund ADU construction in San Diego?", "Yes. ADU additions are one of the most common use cases in San Diego and across California. We finance the full cost of an ADU build as a construction loan against the primary property's value."),
            ("What is the maximum loan for San Diego construction?", "Grand Funding construction loans go up to $5,000,000. This covers luxury coastal builds, multi-unit new construction, and large ADU projects in the San Diego market."),
            ("Do you require a licensed GC in California?", "Yes. California requires licensed contractors for construction permits, and we require a licensed GC for ground-up new construction loans in San Diego and statewide."),
        ],
    },

    'construction-loans-los-angeles': {
        'source': 'construction-loans-phoenix.html',
        'city': 'Los Angeles',
        'CITY': 'LOS ANGELES',
        'loan_type': 'Construction Loan',
        'LOAN_TYPE': 'CONSTRUCTION LOAN',
        'slug': 'construction-loans-los-angeles',
        'state': 'California',
        'state_abbr': 'CA',
        'rate': '10.99%',
        'ltv': '80% of cost',
        'term': '12-18 months',
        'loan_range': '$250K-$5M',
        'title': 'Los Angeles Construction Loans | 10.99% From | Grand Funding LLC',
        'meta_desc': 'Los Angeles construction loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 80% of cost, $250K–5M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Construction loans for Los Angeles, California real estate investors. Up to 80% of cost, from 10.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Los Angeles Construction Loans',
        'hero_sub': "Up to 80% of cost. Milestone-based draws. $5M cap. Built for LA developers navigating LADBS permitting, teardown-rebuilds, multi-family projects, and high-value coastal construction. Funding investors from Venice, Silver Lake, Highland Park, Culver City, and across California.",
        'h2': 'Construction Loans built for Los Angeles deals',
        'market_p1': "Los Angeles is the largest construction market in the Western United States. Land values are extreme, teardown-rebuilds are common, and ADU additions have exploded under SB 9. Investor-developers need a lender who understands LA's permitting complexity and can fund in 3-5 days.",
        'market_context': "LA ADU builds have a 12–18 month average return horizon and add significant value in high-demand ZIP codes. Teardown-rebuild projects in Venice, Silver Lake, and Highland Park routinely close above $2M ARV.",
        'neighborhoods': 'Venice, Silver Lake, Highland Park, Culver City, Los Feliz',
        'who': "Investor-developers with a licensed CA GC, approved permits or an active permit timeline, and a clear exit strategy. We finance acquisition + build. Common LA use cases include teardown-rebuilds, ADU additions, multi-family conversions, and coastal new construction.",
        'coverage': 'Statewide in California, including Los Angeles',
        'cta_h3': 'Have an LA deal under contract?',
        'cta_p': 'Logan personally reviews every construction loan request. Term sheet in 24 hours. We fund California.',
        'form_name': 'los-angeles-construction',
        'faqs': CONSTRUCTION_FAQS_GENERIC + [
            ("Do you fund ADU construction in Los Angeles?",
             "Yes. ADU projects are a primary use case in LA. SB 9 and AB 2221 have expanded ADU rights substantially — we fund ADU construction loans across the greater Los Angeles area."),
        ],
        'explore': [
            ('/fix-and-flip-loans-los-angeles', 'Fix & Flip Loans', 'LA Fix & Flip'),
            ('/bridge-loans-los-angeles', 'Bridge Loans', 'LA Bridge Loans'),
            ('/los-angeles-hard-money-lender', 'City Hub', 'All LA Loans'),
            ('/construction-loans-california', 'CA Construction', 'California Construction Loans'),
            ('/california-hard-money-lender', 'California Hub', 'All California Loans'),
        ],
        'schema_faq': [
            ("How are construction draws structured for LA projects?", "Typical schedule is 4-6 milestone draws based on a third-party inspector validating completed work. First draw at foundation, subsequent draws at framing, MEP, drywall, and final. We align with your LADBS inspection schedule."),
            ("Do you fund ADU construction in Los Angeles?", "Yes. ADU projects are a primary use case in LA. SB 9 and AB 2221 have expanded ADU rights substantially — we fund ADU construction loans across the greater Los Angeles area."),
            ("What is the maximum loan for a Los Angeles construction project?", "Grand Funding construction loans go up to $5,000,000. This covers teardown-rebuilds, luxury new construction, multi-family projects, and large ADU builds in the LA market."),
            ("Do you require a licensed GC in California?", "Yes. California law and LADBS require licensed contractors for permitted construction work, and we require a licensed GC for ground-up new construction loans in Los Angeles."),
        ],
    },

    # ---- SECOND POSITION LOANS ----

    'second-position-loans-scottsdale': {
        'source': 'second-position-loans-phoenix.html',
        'city': 'Scottsdale',
        'CITY': 'SCOTTSDALE',
        'loan_type': '2nd Position Loan',
        'LOAN_TYPE': '2ND POSITION LOAN',
        'slug': 'second-position-loans-scottsdale',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '11.99%',
        'ltv': '75% CLTV',
        'term': '12-24 months',
        'loan_range': '$70K-$2M',
        'title': 'Scottsdale 2nd Position Loans | 11.99% From | Grand Funding LLC',
        'meta_desc': 'Scottsdale second position loans from Grand Funding. Keep your low-rate first, access equity. 24-hour approval, 7-10 day funding. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Second position loans for Scottsdale, Arizona investors. Keep your low-rate first, access equity up to 75% CLTV. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Scottsdale 2nd Position Loans',
        'hero_sub': "Keep your low-rate first. Add a junior lien up to 75% CLTV. Funds in 7-10 days. Better than refinancing if your first is sub-5%. Funding Scottsdale investors from North Scottsdale, Old Town, Paradise Valley, McCormick Ranch and across Arizona.",
        'h2': '2nd Position Loans built for Scottsdale investors',
        'market_p1': "Scottsdale's luxury property values have created significant equity positions for long-term investors and fix-and-flip operators. A second position loan lets you access that equity without disturbing your existing low-rate first mortgage — ideal for Scottsdale investors who locked in rates before 2022.",
        'market_context': "Scottsdale luxury properties routinely carry 40–60% equity for investors who bought pre-2022. A second position loan unlocks that equity at a fraction of the cost of a full cash-out refinance.",
        'neighborhoods': 'North Scottsdale, Old Town, Paradise Valley, McCormick Ranch, Gainey Ranch',
        'who': "Investors who have a low-rate first mortgage they don't want to touch, but need capital for a next deal, renovation, or bridge transaction. Common Scottsdale use cases include down-payment funding for the next acquisition, renovation capital, and bridge financing.",
        'coverage': 'Statewide in Arizona, including Scottsdale',
        'cta_h3': 'Have a Scottsdale property with equity?',
        'cta_p': "Logan reviews every second position request personally. If the equity is there, we can usually have a term sheet within 24 hours.",
        'form_name': 'scottsdale-second-position',
        'faqs': SECOND_POSITION_FAQS_GENERIC + [
            ("What Scottsdale properties qualify for a second position loan?",
             "Most Scottsdale residential and investment properties qualify — single-family, townhomes, condos, and small multi-family. We evaluate CLTV and exit strategy, not just credit."),
        ],
        'explore': [
            ('/fix-and-flip-loans-scottsdale', 'Fix & Flip Loans', 'Scottsdale Fix & Flip'),
            ('/bridge-loans-scottsdale', 'Bridge Loans', 'Scottsdale Bridge Loans'),
            ('/cash-out-refinance-scottsdale', 'Cash-Out Refi', 'Scottsdale Cash-Out Refi'),
            ('/scottsdale-hard-money-lender', 'City Hub', 'All Scottsdale Loans'),
            ('/second-position-loans-arizona', 'AZ 2nd Position', 'Arizona 2nd Position Loans'),
        ],
        'schema_faq': [
            ("What is a second position loan?", "A second position loan sits behind your existing first mortgage. It lets you access your equity without refinancing your low-rate first mortgage."),
            ("What is the maximum CLTV for Scottsdale second position loans?", "We typically go up to 75% Combined Loan-to-Value. If your first mortgage is at 50% LTV, we may lend up to 25% in second position."),
            ("How fast can I fund a Scottsdale second position loan?", "7-10 business days is typical — slightly longer than first-lien deals due to subordination review with your first-lien lender."),
            ("When does a second position beat a cash-out refi in Scottsdale?", "When your first mortgage has a rate below 5-6%, refinancing in today's environment destroys the economics. A second position loan preserves the first and accesses equity on just the incremental balance."),
        ],
    },

    # ---- FIX & FLIP LOANS - SECONDARY AZ CITIES ----

    'fix-and-flip-loans-tucson': {
        'source': 'fix-and-flip-loans-phoenix.html',
        'city': 'Tucson',
        'CITY': 'TUCSON',
        'loan_type': 'Fix & Flip',
        'LOAN_TYPE': 'FIX & FLIP',
        'slug': 'fix-and-flip-loans-tucson',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '90% ARV',
        'term': '6-18 months',
        'loan_range': '$70K-$2M',
        'title': 'Tucson Fix & Flip Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Tucson fix and flip loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 90% ARV, from 9.99%, $70K–2M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Fix & flip loans for Tucson, Arizona real estate investors. Up to 90% ARV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Tucson Fix & Flip Loans',
        'hero_sub': "Up to 90% of ARV. Asset-based — no income docs. Funded in 3-5 days so you don't lose the deal. Funding Tucson investors from Barrio Viejo, Midtown, the Foothills, Sam Hughes, and across Southern Arizona.",
        'h2': 'Fix & Flip loans built for Tucson deals',
        'market_p1': "Tucson is Southern Arizona's largest real estate market — home to the University of Arizona, multiple healthcare systems, and a growing remote-worker migration. Fix-and-flip margins in Tucson's established neighborhoods are strong, and the lower entry price points (median home ~$340K) mean faster closing for investors with speed-to-capital.",
        'market_context': "Tucson fix-and-flip ARVs range from $250K in midtown to $600K+ in the Catalina Foothills. Median rehab timeline is 90-120 days. Campus-adjacent properties near UA consistently sell within 30 days of listing.",
        'neighborhoods': 'Barrio Viejo, Midtown, Catalina Foothills, Sam Hughes, Armory Park',
        'who': "Investors with a Tucson property under contract or recently acquired that needs cosmetic-to-medium rehab work. Common use cases include SFR flips near UA, midtown value-adds, and Foothills estate renovations.",
        'coverage': 'Statewide in Arizona, including Tucson',
        'cta_h3': 'Have a Tucson deal under contract?',
        'cta_p': 'Logan personally reviews every fix and flip request. Term sheet in 24 hours.',
        'form_name': 'tucson-fix-flip',
        'faqs': FIX_FLIP_FAQS_GENERIC + [
            ("What Tucson neighborhoods does Grand Funding serve?",
             "We fund fix-and-flip projects across all of Tucson: Barrio Viejo, Midtown, Downtown, Sam Hughes, Armory Park, Catalina Foothills, Tanque Verde, and all surrounding communities."),
        ],
        'explore': [
            ('/bridge-loans-tucson', 'Bridge Loans', 'Tucson Bridge Loans'),
            ('/tucson-hard-money-lender', 'City Hub', 'All Tucson Loans'),
            ('/fix-and-flip-loans-arizona', 'AZ Fix & Flip', 'Arizona Fix & Flip Loans'),
            ('/arizona-hard-money-lender', 'Arizona Hub', 'All Arizona Loans'),
        ],
        'schema_faq': [
            ("What does 90% ARV mean for Tucson fix and flip loans?", "It means we'll lend up to 90% of the After Repair Value — the projected value after your renovations are complete. On a $350K ARV Tucson property, you could borrow up to $315K."),
            ("How fast can I close a fix and flip loan in Tucson?", "3-5 business days is standard. For clean title and straightforward deals in Tucson, we've closed in 48 hours."),
            ("What Tucson neighborhoods does Grand Funding serve?", "We fund fix-and-flip projects across all of Tucson: Barrio Viejo, Midtown, Downtown, Sam Hughes, Catalina Foothills, Tanque Verde, and all surrounding communities."),
            ("Do I need income docs for a Tucson fix and flip loan?", "No. We underwrite the deal — property value, equity position, and exit strategy — not your W-2 or tax returns."),
        ],
    },

    'bridge-loans-tucson': {
        'source': 'bridge-loans-phoenix.html',
        'city': 'Tucson',
        'CITY': 'TUCSON',
        'loan_type': 'Bridge Loan',
        'LOAN_TYPE': 'BRIDGE LOAN',
        'slug': 'bridge-loans-tucson',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '75% LTV',
        'term': '6-24 months',
        'loan_range': '$70K-$2M',
        'title': 'Tucson Bridge Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Tucson bridge loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 75% LTV, from 9.99%, $70K–2M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Bridge loans for Tucson, Arizona real estate investors. Up to 75% LTV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Tucson Bridge Loans',
        'hero_sub': "3-5 day close. 24-month term ceiling. No prepayment penalty on most loans. Built for Tucson investors who need speed and flexibility. Funding investors from Barrio Viejo, Midtown, the Foothills, and across Southern Arizona.",
        'h2': 'Bridge Loans built for Tucson deals',
        'market_p1': "Tucson's real estate market moves quickly for well-priced properties — especially near the University of Arizona and in Midtown. Bridge loans give Tucson investors the speed to acquire before competing buyers and the flexibility to exit via sale or refinance within 24 months.",
        'market_context': "Tucson investors regularly use bridge financing for campus-adjacent acquisitions (where tenants are guaranteed), midtown value-add holds, and Foothills estate transitions.",
        'neighborhoods': 'Barrio Viejo, Midtown, Catalina Foothills, Sam Hughes, Downtown Tucson',
        'who': "Investors who need to close fast on a Tucson property and refinance into long-term DSCR or sell within 24 months. Common use cases include campus-adjacent buy-and-hold, midtown value-add acquisitions, and short-term rental transitional financing.",
        'coverage': 'Statewide in Arizona, including Tucson',
        'cta_h3': 'Have a Tucson deal under contract?',
        'cta_p': 'Logan personally reviews every bridge loan request. Term sheet in 24 hours.',
        'form_name': 'tucson-bridge',
        'faqs': BRIDGE_FAQS_GENERIC + [
            ("What Tucson properties qualify for a bridge loan?",
             "Most residential and light commercial investment properties qualify — SFR, duplex, triplex, fourplex, small mixed-use. We evaluate the as-is value and your exit strategy."),
        ],
        'explore': [
            ('/fix-and-flip-loans-tucson', 'Fix & Flip Loans', 'Tucson Fix & Flip'),
            ('/tucson-hard-money-lender', 'City Hub', 'All Tucson Loans'),
            ('/bridge-loans-arizona', 'AZ Bridge', 'Arizona Bridge Loans'),
            ('/arizona-hard-money-lender', 'Arizona Hub', 'All Arizona Loans'),
        ],
        'schema_faq': [
            ("What is the maximum LTV on a Tucson bridge loan?", "75% of the as-is property value. We can go higher case-by-case for strong borrowers with low-leverage exits."),
            ("How fast can I close a bridge loan in Tucson?", "3-5 business days is standard. For clean title and straightforward equity, we've closed Tucson bridge loans in 48 hours."),
            ("Is there a prepayment penalty on Tucson bridge loans?", "No prepayment penalty on most bridge loans. You can sell or refinance early without additional fees."),
            ("What's the typical Tucson bridge loan term?", "6-24 months. Most Tucson bridge borrowers exit within 12 months via sale or refinance into long-term DSCR."),
        ],
    },

    'fix-and-flip-loans-mesa': {
        'source': 'fix-and-flip-loans-phoenix.html',
        'city': 'Mesa',
        'CITY': 'MESA',
        'loan_type': 'Fix & Flip',
        'LOAN_TYPE': 'FIX & FLIP',
        'slug': 'fix-and-flip-loans-mesa',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '90% ARV',
        'term': '6-18 months',
        'loan_range': '$70K-$3M',
        'title': 'Mesa Fix & Flip Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Mesa fix and flip loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 90% ARV, from 9.99%, $70K–3M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Fix & flip loans for Mesa, Arizona real estate investors. Up to 90% ARV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Mesa Fix & Flip Loans',
        'hero_sub': "Up to 90% of ARV. Asset-based — no income docs. Funded in 3-5 days so you don't lose the deal. Funding Mesa investors from Downtown Mesa, Eastmark, Red Mountain, Dobson Ranch, and across the East Valley.",
        'h2': 'Fix & Flip loans built for Mesa deals',
        'market_p1': "Mesa is the third-largest city in Arizona and one of the most active fix-and-flip markets in the Phoenix metro. Suburban demand is strong, entry price points are investor-friendly, and East Valley buyers move fast on renovated properties with good school zones and easy freeway access.",
        'market_context': "Mesa fix-and-flip ARVs range from $350K in core Mesa neighborhoods to $700K+ in Eastmark and Gilbert adjacent areas. Median days on market for renovated SFR is under 30 days.",
        'neighborhoods': 'Downtown Mesa, Eastmark, Red Mountain, Dobson Ranch, Mesa Grande',
        'who': "Investors with a Mesa property under contract that needs cosmetic-to-medium rehab work. Common use cases include East Valley suburban SFR flips, Dobson Ranch pool-home renovations, and Eastmark new-finish upgrades.",
        'coverage': 'Statewide in Arizona, including Mesa',
        'cta_h3': 'Have a Mesa deal under contract?',
        'cta_p': 'Logan personally reviews every fix and flip request. Term sheet in 24 hours.',
        'form_name': 'mesa-fix-flip',
        'faqs': FIX_FLIP_FAQS_GENERIC + [
            ("What Mesa neighborhoods does Grand Funding serve?",
             "We fund fix-and-flip projects across all of Mesa: Downtown Mesa, Eastmark, Red Mountain, Dobson Ranch, Mesa Grande, Gilbert border communities, and all surrounding East Valley markets."),
        ],
        'explore': [
            ('/bridge-loans-mesa', 'Bridge Loans', 'Mesa Bridge Loans'),
            ('/mesa-hard-money-lender', 'City Hub', 'All Mesa Loans'),
            ('/fix-and-flip-loans-arizona', 'AZ Fix & Flip', 'Arizona Fix & Flip Loans'),
            ('/arizona-hard-money-lender', 'Arizona Hub', 'All Arizona Loans'),
        ],
        'schema_faq': [
            ("What does 90% ARV mean for Mesa fix and flip loans?", "It means we'll lend up to 90% of the After Repair Value. On a $420K ARV Mesa property, you could borrow up to $378K."),
            ("How fast can I close a fix and flip loan in Mesa?", "3-5 business days is standard. For clean title and straightforward deals, we've closed in 48 hours."),
            ("What Mesa neighborhoods does Grand Funding serve?", "We fund projects across all of Mesa: Downtown, Eastmark, Red Mountain, Dobson Ranch, Mesa Grande, and East Valley adjacent communities."),
            ("Do I need income docs for a Mesa fix and flip loan?", "No. We underwrite the deal — property value, equity, and exit strategy — not your W-2."),
        ],
    },

    'bridge-loans-mesa': {
        'source': 'bridge-loans-phoenix.html',
        'city': 'Mesa',
        'CITY': 'MESA',
        'loan_type': 'Bridge Loan',
        'LOAN_TYPE': 'BRIDGE LOAN',
        'slug': 'bridge-loans-mesa',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '75% LTV',
        'term': '6-24 months',
        'loan_range': '$70K-$3M',
        'title': 'Mesa Bridge Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Mesa bridge loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 75% LTV, from 9.99%, $70K–3M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Bridge loans for Mesa, Arizona real estate investors. Up to 75% LTV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Mesa Bridge Loans',
        'hero_sub': "3-5 day close. 24-month term ceiling. No prepayment penalty on most loans. Built for Mesa investors who need speed and flexibility across the East Valley. Funding investors from Eastmark, Red Mountain, Dobson Ranch, and across Arizona.",
        'h2': 'Bridge Loans built for Mesa deals',
        'market_p1': "Mesa's East Valley location makes it one of the most liquid real estate markets in Arizona — strong buyer demand, rapid absorption, and consistent rental yields. Bridge loans give Mesa investors the capital speed to compete on deals before competitors with slower financing.",
        'market_context': "Mesa bridge financing is commonly used for East Valley buy-and-hold acquisitions, suburban SFR transitional holds, and 1031 exchange bridge situations where timing is tight.",
        'neighborhoods': 'Downtown Mesa, Eastmark, Red Mountain, Dobson Ranch, East Mesa',
        'who': "Mesa investors who need to close fast and refinance into long-term DSCR or sell within 24 months. Common use cases include suburban buy-and-hold acquisitions, East Valley transitional holds, and 1031 exchange bridge periods.",
        'coverage': 'Statewide in Arizona, including Mesa',
        'cta_h3': 'Have a Mesa deal under contract?',
        'cta_p': 'Logan personally reviews every bridge loan request. Term sheet in 24 hours.',
        'form_name': 'mesa-bridge',
        'faqs': BRIDGE_FAQS_GENERIC + [
            ("What Mesa properties qualify for a bridge loan?",
             "Most SFR, duplex, triplex, and small multi-family investment properties in Mesa qualify. We evaluate as-is value and your exit strategy, not just credit."),
        ],
        'explore': [
            ('/fix-and-flip-loans-mesa', 'Fix & Flip Loans', 'Mesa Fix & Flip'),
            ('/mesa-hard-money-lender', 'City Hub', 'All Mesa Loans'),
            ('/bridge-loans-arizona', 'AZ Bridge', 'Arizona Bridge Loans'),
            ('/phoenix-hard-money-lender', 'Phoenix Hub', 'Phoenix Loans'),
        ],
        'schema_faq': [
            ("What is the maximum LTV on a Mesa bridge loan?", "75% of the as-is property value. We can go higher case-by-case for strong borrowers with clear exits."),
            ("How fast can I close a bridge loan in Mesa?", "3-5 business days is standard. For clean title and solid equity, we've closed Mesa bridge loans in 48 hours."),
            ("Is there a prepayment penalty?", "No prepayment penalty on most bridge loans. You can sell or refinance early without additional fees."),
            ("What's the typical Mesa bridge loan term?", "6-24 months. Most Mesa bridge borrowers exit within 12 months via sale or refinance into long-term DSCR."),
        ],
    },

    'fix-and-flip-loans-tempe': {
        'source': 'fix-and-flip-loans-phoenix.html',
        'city': 'Tempe',
        'CITY': 'TEMPE',
        'loan_type': 'Fix & Flip',
        'LOAN_TYPE': 'FIX & FLIP',
        'slug': 'fix-and-flip-loans-tempe',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '90% ARV',
        'term': '6-18 months',
        'loan_range': '$70K-$2M',
        'title': 'Tempe Fix & Flip Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Tempe fix and flip loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 90% ARV, from 9.99%, $70K–2M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Fix & flip loans for Tempe, Arizona real estate investors. Up to 90% ARV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Tempe Fix & Flip Loans',
        'hero_sub': "Up to 90% of ARV. Asset-based — no income docs. Funded in 3-5 days. Tempe's ASU proximity, Mill Ave corridor, and Tempe Town Lake keep buyer demand strong for renovated properties. Funding investors from Old Town Tempe, South Tempe, and across the Valley.",
        'h2': 'Fix & Flip loans built for Tempe deals',
        'market_p1': "Tempe sits at the heart of the Phoenix metro — directly adjacent to ASU, Scottsdale, and Phoenix. Demand for renovated SFR and small multi-family in Tempe is consistently strong from both owner-occupants and investors seeking proximity to employment, entertainment, and the airport.",
        'market_context': "Tempe fix-and-flip ARVs average $400K–$550K for SFR near ASU and the Tempe Town Lake waterfront. Multi-family small complexes near Mill Avenue regularly trade above $250K per door.",
        'neighborhoods': "Old Town Tempe, South Tempe, Tempe Town Lake, Mill Ave Corridor, Warner Ranch",
        'who': "Investors with a Tempe property under contract that needs cosmetic-to-medium rehab. Common use cases include campus-adjacent SFR flips, multi-family value-add near ASU, and South Tempe suburban renovations.",
        'coverage': 'Statewide in Arizona, including Tempe',
        'cta_h3': 'Have a Tempe deal under contract?',
        'cta_p': 'Logan personally reviews every fix and flip request. Term sheet in 24 hours.',
        'form_name': 'tempe-fix-flip',
        'faqs': FIX_FLIP_FAQS_GENERIC + [
            ("What Tempe neighborhoods does Grand Funding serve?",
             "We fund fix-and-flip projects across all of Tempe: Old Town, South Tempe, Warner Ranch, Tempe Town Lake area, and all communities adjacent to Arizona State University."),
        ],
        'explore': [
            ('/bridge-loans-tempe', 'Bridge Loans', 'Tempe Bridge Loans'),
            ('/tempe-hard-money-lender', 'City Hub', 'All Tempe Loans'),
            ('/fix-and-flip-loans-arizona', 'AZ Fix & Flip', 'Arizona Fix & Flip Loans'),
            ('/fix-and-flip-loans-scottsdale', 'Scottsdale', 'Scottsdale Fix & Flip'),
        ],
        'schema_faq': [
            ("What does 90% ARV mean for Tempe fix and flip loans?", "It means we'll lend up to 90% of the After Repair Value. On a $480K ARV Tempe property, you could borrow up to $432K."),
            ("How fast can I close a fix and flip loan in Tempe?", "3-5 business days is standard. For clean title and straightforward deals near ASU or Tempe Town Lake, we've closed in 48 hours."),
            ("What Tempe neighborhoods does Grand Funding serve?", "We fund projects across all of Tempe: Old Town, South Tempe, Warner Ranch, Tempe Town Lake, and ASU-adjacent communities."),
            ("Do I need income docs for a Tempe fix and flip loan?", "No. We underwrite the deal — property value, equity, and your exit strategy — not your tax returns."),
        ],
    },

    'bridge-loans-tempe': {
        'source': 'bridge-loans-phoenix.html',
        'city': 'Tempe',
        'CITY': 'TEMPE',
        'loan_type': 'Bridge Loan',
        'LOAN_TYPE': 'BRIDGE LOAN',
        'slug': 'bridge-loans-tempe',
        'state': 'Arizona',
        'state_abbr': 'AZ',
        'rate': '9.99%',
        'ltv': '75% LTV',
        'term': '6-24 months',
        'loan_range': '$70K-$2M',
        'title': 'Tempe Bridge Loans | 9.99% From | Grand Funding LLC',
        'meta_desc': 'Tempe bridge loans from Grand Funding. 24-hour approval, 3-5 day funding. Up to 75% LTV, from 9.99%, $70K–2M. Direct private lender. NMLS #2466872. Call (602) 935-0371.',
        'og_desc': 'Bridge loans for Tempe, Arizona real estate investors. Up to 75% LTV, from 9.99%, funded in 3-5 days. Direct lender. NMLS #2466872. Call (602) 935-0371.',
        'h1': 'Tempe Bridge Loans',
        'hero_sub': "3-5 day close. 24-month term ceiling. No prepayment penalty on most loans. Tempe's central location and consistent demand make it ideal for short-term bridge holds. Funding investors from Old Town Tempe, South Tempe, and across the Valley.",
        'h2': 'Bridge Loans built for Tempe deals',
        'market_p1': "Tempe's central position in the Phoenix metro — between Phoenix, Scottsdale, and Chandler — creates a liquid real estate market where buyers are plentiful year-round. Bridge loans let Tempe investors acquire quickly and exit via sale or refinance within their investment window.",
        'market_context': "Tempe bridge financing is commonly used for ASU-adjacent buy-and-hold acquisitions, Mill Ave corridor transitional holds, and properties near the Tempe Town Lake waterfront that are pending repositioning.",
        'neighborhoods': "Old Town Tempe, South Tempe, Warner Ranch, Tempe Town Lake, McClintock Corridor",
        'who': "Investors who need to close fast on a Tempe property and refinance into long-term DSCR or sell within 24 months. Common use cases include ASU-adjacent student housing acquisitions, Tempe Town Lake transitional holds, and 1031 exchange bridges.",
        'coverage': 'Statewide in Arizona, including Tempe',
        'cta_h3': 'Have a Tempe deal under contract?',
        'cta_p': 'Logan personally reviews every bridge loan request. Term sheet in 24 hours.',
        'form_name': 'tempe-bridge',
        'faqs': BRIDGE_FAQS_GENERIC + [
            ("What Tempe properties qualify for a bridge loan?",
             "Most SFR, duplex, triplex, fourplex, and small multi-family investment properties in Tempe qualify — including ASU-adjacent student housing and Tempe Town Lake adjacent units."),
        ],
        'explore': [
            ('/fix-and-flip-loans-tempe', 'Fix & Flip Loans', 'Tempe Fix & Flip'),
            ('/tempe-hard-money-lender', 'City Hub', 'All Tempe Loans'),
            ('/bridge-loans-arizona', 'AZ Bridge', 'Arizona Bridge Loans'),
            ('/bridge-loans-scottsdale', 'Scottsdale', 'Scottsdale Bridge Loans'),
        ],
        'schema_faq': [
            ("What is the maximum LTV on a Tempe bridge loan?", "75% of the as-is property value. We can go higher case-by-case for strong borrowers with low-leverage exits."),
            ("How fast can I close a bridge loan in Tempe?", "3-5 business days is standard. For clean title and good equity, we've closed Tempe bridge loans in 48 hours."),
            ("Is there a prepayment penalty on Tempe bridge loans?", "No prepayment penalty on most bridge loans. You can sell or refinance early without additional fees."),
            ("What's the typical Tempe bridge loan term?", "6-24 months. Most Tempe bridge borrowers exit within 12 months via sale or refinance into long-term DSCR."),
        ],
    },

}


# ============================================================
# Generator
# ============================================================

def build_main_html(spec):
    """Build the <main> HTML content for a page."""
    city = spec['city']
    CITY = spec['CITY']
    loan_type = spec['loan_type']
    LOAN_TYPE = spec['LOAN_TYPE']
    state = spec['state']

    # Build FAQ items
    faq_html = ''
    for q, a in spec['faqs']:
        a_html = a.replace('—', '&mdash;').replace('"', '&quot;')
        faq_html += f'''
<details style="margin-bottom:1rem;padding:1rem 1.25rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px">
<summary style="font-weight:700;color:#F0F0EC;cursor:pointer;font-size:1.05rem">{q}</summary>
<p style="margin-top:.85rem;color:rgba(244,247,255,.78);line-height:1.6">{a}</p>
</details>'''

    # Build explore-more links
    explore_html = ''
    for href, kicker, title in spec['explore']:
        explore_html += f'''
<a class="explore-link" href="{href}">
<span><span class="explore-link__kicker">{kicker}</span><span class="explore-link__title">{title}</span></span>
<span class="explore-link__arrow">→</span>
</a>'''

    market_p2 = f'<strong style="color:#7AF1E5">Market context:</strong> {spec["market_context"]}'

    return f'''<main id="main">
<section class="lp-hero" style="padding:5rem 0 3rem;background:linear-gradient(180deg,rgba(7,8,11,.4),rgba(7,8,11,0)),radial-gradient(70% 90% at 50% 0%,rgba(79,227,210,.1),transparent 70%)">
<div class="container">
<div style="max-width:800px;margin:0 auto;text-align:center">
<div style="display:inline-block;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#7AF1E5;font-weight:700;margin-bottom:.85rem">{CITY} · {LOAN_TYPE}</div>
<h1 style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:clamp(2rem,4.5vw,3.4rem);letter-spacing:-.025em;line-height:1.06;margin:0 0 1.25rem;background:linear-gradient(135deg,#7AF1E5 0%,#4FE3D2 35%,#F0B26B 100%);-webkit-background-clip:text;background-clip:text;color:transparent">{spec['h1']}</h1>
<p class="hero-subtitle">{spec['hero_sub']}</p>
<div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;margin-top:1.75rem">
<a class="btn-primary" href="tel:6029350371">Call Logan: (602) 935-0371</a>
<a class="btn-secondary" href="/apply.html">Get Pre-Approved &rarr;</a>
</div>
</div>
</div>
</section>

<section class="lp-section" style="padding:4rem 0">
<div class="container" style="max-width:900px">
<h2 style="font-size:clamp(1.75rem,3.5vw,2.4rem);font-weight:800;letter-spacing:-.02em;margin-bottom:1.25rem">{spec['h2']}</h2>
<p style="font-size:1.1rem;line-height:1.65;color:rgba(244,247,255,.85);margin-bottom:1.25rem">{spec['market_p1']}</p>
<p style="font-size:1.05rem;line-height:1.6;color:rgba(244,247,255,.78);margin-bottom:2rem">{market_p2}</p>

<h3 style="font-size:1.4rem;font-weight:700;margin:2rem 0 1rem;color:#F0F0EC">Who this loan is built for</h3>
<p style="font-size:1.05rem;line-height:1.65;color:rgba(244,247,255,.85)">{spec['who']}</p>

<h3 style="font-size:1.4rem;font-weight:700;margin:2.25rem 0 1rem;color:#F0F0EC">Loan terms at a glance</h3>
<ul style="line-height:2;color:rgba(244,247,255,.86);font-size:1.05rem;list-style:none;padding:0">
<li>&rarr; <strong>Loan range:</strong> {spec['loan_range']}</li>
<li>&rarr; <strong>Rate from:</strong> {spec['rate']}</li>
<li>&rarr; <strong>Maximum LTV/ARV:</strong> {spec['ltv']}</li>
<li>&rarr; <strong>Term:</strong> {spec['term']}</li>
<li>&rarr; <strong>Approval:</strong> 24-hour term sheet</li>
<li>&rarr; <strong>Funding:</strong> 3-5 business days standard</li>
<li>&rarr; <strong>Income docs:</strong> None required (asset-based)</li>
<li>&rarr; <strong>Coverage:</strong> {spec['coverage']}</li>
</ul>

<h3 style="font-size:1.4rem;font-weight:700;margin:2.25rem 0 1rem;color:#F0F0EC">Common questions from {city} investors</h3>
{faq_html}

<div style="margin-top:3rem;padding:2rem;border-radius:18px;background:linear-gradient(135deg,rgba(79,227,210,.12),rgba(240,178,107,.06));border:1px solid rgba(79,227,210,.25);text-align:center">
<h3 style="font-size:1.5rem;font-weight:800;color:#F4F1EA;margin:0 0 .6rem">{spec['cta_h3']}</h3>
<p style="color:rgba(244,247,255,.85);margin:0 0 1.5rem;font-size:1.05rem">{spec['cta_p']}</p>
<div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center">
<a class="btn-primary" href="tel:6029350371">Call Logan: (602) 935-0371</a>
<a class="btn-secondary" href="/apply.html">Get Pre-Approved &rarr;</a>
</div>
</div>

</div>
</section>

<section class="engagement-block" aria-label="Why investors choose Grand Funding">
<div class="engagement-block__inner">
<div class="engagement-trust">
<div class="engagement-trust__item"><div class="engagement-trust__icon"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="engagement-trust__num">NMLS</div><div class="engagement-trust__label">Licensed &middot; #2466872</div></div>
<div class="engagement-trust__item"><div class="engagement-trust__icon"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10S22 17.52 22 12 17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg></div><div class="engagement-trust__num">24hr</div><div class="engagement-trust__label">Term Sheet</div></div>
<div class="engagement-trust__item"><div class="engagement-trust__icon"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg></div><div class="engagement-trust__num">3-5</div><div class="engagement-trust__label">Day Funding</div></div>
<div class="engagement-trust__item"><div class="engagement-trust__icon"><svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div class="engagement-trust__num">Direct</div><div class="engagement-trust__label">No Brokers &middot; Logan Decides</div></div>
</div>

<div class="engagement-logan">
<div class="engagement-logan__photo"><img src="/images/logan/logan-face-240.webp" srcset="/images/logan/logan-face-128.webp 128w,/images/logan/logan-face-240.webp 240w" sizes="84px" width="84" height="84" alt="Logan Sullivan, Founder of Grand Funding LLC" loading="lazy"></div>
<div class="engagement-logan__copy">
<div class="engagement-logan__name">Logan Sullivan, Founder &amp; Direct Lender</div>
<div class="engagement-logan__title">NMLS #2466872 &middot; AZ MLO #1048901 &middot; 40+ Years in AZ + CA Real Estate</div>
<div class="engagement-logan__quote">I personally review every deal. If you have a property under contract, call me &mdash; we can usually have a term sheet in 24 hours.</div>
</div>
<div class="engagement-logan__actions">
<a class="engagement-logan__call" href="tel:6029350371"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1A17 17 0 0 1 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>Call Logan</a>
<a class="engagement-logan__apply" href="/apply.html">Get Pre-Approved &rarr;</a>
</div>
</div>

<div class="engagement-next">
<a class="engagement-next__card" href="/apply.html">
<div class="engagement-next__step">Step 1 &middot; Apply</div>
<div class="engagement-next__title">60-second pre-approval</div>
<div class="engagement-next__desc">Send the basics. Logan reviews and responds with terms, typically within 24 hours. No commitment, no credit pull.</div>
<span class="engagement-next__cta">Start application &rarr;</span>
</a>
<a class="engagement-next__card" href="tel:6029350371">
<div class="engagement-next__step">Step 2 &middot; Talk it through</div>
<div class="engagement-next__title">Call Logan directly</div>
<div class="engagement-next__desc">Five-minute conversation. Logan walks through your specific deal &mdash; rate, timeline, draw schedule, exit. No queue.</div>
<span class="engagement-next__cta">(602) 935-0371 &rarr;</span>
</a>
<a class="engagement-next__card" href="/products.html">
<div class="engagement-next__step">Step 3 &middot; Browse</div>
<div class="engagement-next__title">Find your loan product</div>
<div class="engagement-next__desc">Fix-and-flip, bridge, construction, cash-out, second-position. Take the 60-second quiz to find the right fit.</div>
<span class="engagement-next__cta">Loan finder &rarr;</span>
</a>
</div>
</div>
</section>

<section class="explore-more" aria-label="Related pages">
<div class="container">
<div class="explore-more__header">
<h2>Explore More {city} &amp; {state} Loans</h2>
<p class="explore-more__intro">Find the right product for your next deal</p>
</div>
<div class="explore-more__grid">
{explore_html}
</div>
</div>
</section>
</main>'''


def build_schema_blocks(spec):
    """Build the JSON-LD schema blocks for a page."""
    city = spec['city']
    state = spec['state_abbr']
    state_full = spec['state']
    slug = spec['slug']
    loan_type = spec['loan_type']
    h1 = spec['h1']
    base_url = 'https://www.grandfundingllc.com'

    # FAQPage schema
    faq_items = []
    for q, a in spec['schema_faq']:
        faq_items.append({
            '@type': 'Question',
            'name': q,
            'acceptedAnswer': {'@type': 'Answer', 'text': a}
        })

    faq_schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faq_items
    }

    # BreadcrumbList schema
    breadcrumb_schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': f'{base_url}/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Loan Products', 'item': f'{base_url}/products'},
            {'@type': 'ListItem', 'position': 3, 'name': h1, 'item': f'{base_url}/{slug}'},
        ]
    }

    # FinancialProduct schema
    fp_schema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        'name': h1,
        'category': 'HardMoneyLoan',
        'provider': {
            '@type': 'Organization',
            'name': 'Grand Funding LLC',
            'url': base_url
        },
        'areaServed': {
            '@type': 'City' if city not in ['Arizona', 'California'] else 'State',
            'name': city,
            'containedInPlace': {'@type': 'State', 'name': state_full}
        },
        'url': f'{base_url}/{slug}'
    }

    s1 = f'<script type="application/ld+json">{json.dumps(faq_schema, separators=(",", ":"))}</script>'
    s2 = f'<script type="application/ld+json">{json.dumps(breadcrumb_schema, separators=(",", ":"))}</script>'
    s3 = f'<script type="application/ld+json">{json.dumps(fp_schema, separators=(",", ":"))}</script>'
    return s1 + s2 + s3


def generate_page(spec):
    """Generate a complete HTML page from spec and template."""
    source = spec['source']
    slug = spec['slug']
    city = spec['city']
    h1 = spec['h1']
    state = spec['state']
    state_abbr = spec['state_abbr']
    base_url = 'https://www.grandfundingllc.com'

    with open(source) as f:
        template = f.read()

    # ---- Replace head metadata ----
    # Title
    old_title_m = re.search(r'<title>(.*?)</title>', template)
    old_title = old_title_m.group(0) if old_title_m else ''
    template = template.replace(old_title, f'<title>{spec["title"]}</title>', 1)

    # Meta description
    old_desc_m = re.search(r'<meta name="description" content="[^"]*">', template)
    if old_desc_m:
        template = template.replace(old_desc_m.group(0),
            f'<meta name="description" content="{spec["meta_desc"]}">', 1)

    # Canonical
    old_canon_m = re.search(r'<link href="[^"]*" rel="canonical">', template)
    if old_canon_m:
        template = template.replace(old_canon_m.group(0),
            f'<link href="{base_url}/{slug}" rel="canonical">', 1)

    # OG title
    old_og_title_m = re.search(r'<meta content="[^"]*" property="og:title">', template)
    if old_og_title_m:
        template = template.replace(old_og_title_m.group(0),
            f'<meta content="{spec["title"]}" property="og:title">', 1)

    # OG description
    old_og_desc_m = re.search(r'<meta content="[^"]*" property="og:description">', template)
    if old_og_desc_m:
        template = template.replace(old_og_desc_m.group(0),
            f'<meta content="{spec["og_desc"]}" property="og:description">', 1)

    # OG URL
    old_og_url_m = re.search(r'<meta content="[^"]*" property="og:url">', template)
    if old_og_url_m:
        template = template.replace(old_og_url_m.group(0),
            f'<meta content="{base_url}/{slug}" property="og:url">', 1)

    # ---- Replace schema blocks ----
    # Remove old FAQPage, BreadcrumbList, FinancialProduct schemas
    # Keep LocalBusiness schema (it's general)
    # We'll append new schemas before </head>
    new_schemas = build_schema_blocks(spec)

    # Remove old FAQPage schema
    template = re.sub(
        r'<script type="application/ld\+json">\{"@context":"https://schema\.org","@type":"FAQPage".*?</script>',
        '', template, flags=re.DOTALL)

    # Remove old BreadcrumbList schema
    template = re.sub(
        r'<script type="application/ld\+json">\{"@context":"https://schema\.org","@type":"BreadcrumbList".*?</script>',
        '', template, flags=re.DOTALL)

    # Remove old FinancialProduct schema
    template = re.sub(
        r'<script type="application/ld\+json">\{"@context":"https://schema\.org","@type":"FinancialProduct".*?</script>',
        '', template, flags=re.DOTALL)

    # Insert new schemas before </head>
    template = template.replace('</head>', new_schemas + '</head>', 1)

    # ---- Replace <main> section ----
    main_start = template.find('<main id="main">')
    main_end = template.find('</main>') + len('</main>')

    new_main = build_main_html(spec)
    template = template[:main_start] + new_main + template[main_end:]

    return template


# ============================================================
# Run generator
# ============================================================

generated = []
for slug, spec in PAGES.items():
    print(f"Generating {slug}.html...")
    try:
        html = generate_page(spec)
        outfile = f'{slug}.html'
        with open(outfile, 'w') as f:
            f.write(html)
        print(f"  Written: {outfile} ({len(html):,} bytes)")
        generated.append(slug)
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()

print(f"\nGenerated {len(generated)} pages:")
for s in generated:
    print(f"  ✓ {s}.html")
