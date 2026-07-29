#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const APPROVAL_DATE = "2026-07-27";
const APPROVED_STATES = "Arizona and California";
const OCCUPANCY_SHORT =
  "Owner-occupied and primary-residence eligibility is limited and reviewed case by case.";
const OCCUPANCY_CASE =
  "Owner-occupied, primary-residence, or consumer-purpose transactions, if available, are considered only in limited, case-specific circumstances and may require additional documentation and review. Contact Grand Funding before applying.";
const OCCUPANCY_FULL = `Grand Funding primarily offers business-purpose real estate financing. ${OCCUPANCY_CASE}`;
const TERMS_NOTE =
  "Rates, points, loan sizing, leverage, and final terms are provided only after Grand Funding reviews the specific transaction. This website is not a commitment to lend.";
const FOOTER_DISCLOSURE =
  "Grand Funding primarily offers business-purpose real estate financing in Arizona and California. Owner-occupied, primary-residence, or consumer-purpose transactions, if available, are considered only in limited, case-specific circumstances and may require additional documentation and review. This is not a commitment to lend. All financing is subject to transaction-specific review and final documentation.";

const OFFER_NUMBER_PATTERN =
  /(?:\b(?:rates?|APR|origination(?:\s+(?:fee|fees|point|points))?|points?)\b.{0,50}?(?:\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s+(?:origination\s+)?points?)|(?:\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s+(?:origination\s+)?points?).{0,50}?\b(?:rates?|APR|origination(?:\s+(?:fee|fees|point|points))?|points?)\b|\b(?:loan\s+(?:amounts?|range|limits?|minimum|maximum)|minimum\s+loan|maximum\s+loan|max\s+loan|borrow|fund(?:ing)?\s+up\s+to|up\s+to)\b.{0,55}?\$[\d,.]+\s*(?:[KkMm]|million|thousand)?|\$[\d,.]+\s*(?:[KkMm]|million|thousand)?.{0,55}?\b(?:loan\s+(?:amounts?|range|limits?|minimum|maximum)|minimum|maximum|max\s+loan|borrow)\b|\b(?:LTV|ARV|LTC|CLTV)\b.{0,45}?\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*%.{0,45}?\b(?:LTV|ARV|LTC|CLTV)\b|\d+(?:\.\d+)?\s*%\s+of\s+(?:the\s+)?(?:purchase\s+price|project\s+costs?|rehab(?:\s+costs?)?|after-repair\s+value))/i;

const DISALLOWED_SERVICE_PATTERN =
  /\b(?:nationwide|select deals nationwide|outside Arizona or California)\b/i;
const DISALLOWED_COMPARATIVE_PATTERN = /\bbest hard money lenders?\b/i;
const SANITIZED_OFFER_FRAGMENT_PATTERN =
  /\b(?:deal-specific leverage|deal-specific loan sizing|a deal-specific amount|terms provided after deal review provided after deal review|points provided after deal review provided after deal review)\b/i;
const RESIDUAL_NUMERIC_OFFER_PATTERN =
  /(?:\b(?:rates?|APR|interest|origination|points?|mortgage)\b.{0,90}?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%|\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%.{0,90}?\b(?:rates?|APR|interest|origination|points?|mortgage)\b|\b(?:up to|maximum|max(?:imum)?(?:\s+loan)?|minimum|loan\s+(?:amount|range|limit|size)|fund(?:ing)?\s+up to)\b.{0,80}?\$[\d,.]+\s*(?:[KkMm]\+?|million|thousand)?|\$[\d,.]+\s*(?:[KkMm]\+?|million|thousand)?.{0,80}?\b(?:maximum|max(?:imum)?(?:\s+loan)?|minimum|loan\s+(?:amount|range|limit|size)|ceiling|cap)\b|\b(?:up to|within|at|from|lends?|finances?|funds?)\b.{0,70}?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%\s*(?:combined\s+)?(?:LTV|ARV|LTC|CLTV|loan-to-value|of\s+(?:the\s+)?(?:purchase|project|cost|property|rehab|after[ -]repair|post[ -]completion))|\b(?:LTV|ARV|LTC|CLTV|leverage|loan-to-value)\b.{0,55}?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%|\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%\s*(?:combined\s+)?(?:LTV|ARV|LTC|CLTV|loan-to-value|of\s+(?:the\s+)?(?:purchase|project|cost|property|rehab|after[ -]repair|post[ -]completion)))/i;

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    mdash: "—",
    nbsp: " ",
    ndash: "–",
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    if (body[0] !== "#") return named[body.toLowerCase()] ?? entity;
    const hexadecimal = body[1]?.toLowerCase() === "x";
    const codePoint = Number.parseInt(
      body.slice(hexadecimal ? 2 : 1),
      hexadecimal ? 16 : 10,
    );
    return Number.isFinite(codePoint)
      ? String.fromCodePoint(codePoint)
      : entity;
  });
}

function compactText(value) {
  return decodeEntities(
    String(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceElementContent(block, content) {
  const opening = block.match(/^<([a-z][\w:-]*)\b[^>]*>/i)?.[0];
  const closing = block.match(/<\/([a-z][\w:-]*)>\s*$/i)?.[0];
  if (!opening || !closing) return block;
  return `${opening}${content}${closing}`;
}

function classNames(openingTag) {
  const match = openingTag.match(
    /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  );
  return new Set(
    (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").split(/\s+/).filter(Boolean),
  );
}

function matchingTagEnd(html, tagName, openingIndex) {
  const tag = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tag.lastIndex = openingIndex;
  let depth = 0;

  for (let match = tag.exec(html); match; match = tag.exec(html)) {
    if (/^<\//.test(match[0])) depth -= 1;
    else if (!/\/>$/.test(match[0])) depth += 1;
    if (depth === 0) return match.index + match[0].length;
  }

  throw new Error(`Unbalanced <${tagName}> element`);
}

function replaceBalancedElements(html, tagName, replacementFor) {
  let output = html;
  let cursor = 0;
  let changes = 0;

  while (cursor < output.length) {
    const opening = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
    opening.lastIndex = cursor;
    const match = opening.exec(output);
    if (!match) break;

    const end = matchingTagEnd(output, tagName, match.index);
    const block = output.slice(match.index, end);
    const replacement = replacementFor(block, match[0]);
    if (replacement === null || replacement === undefined) {
      cursor = match.index + match[0].length;
      continue;
    }

    output = `${output.slice(0, match.index)}${replacement}${output.slice(end)}`;
    cursor = match.index + replacement.length;
    changes += 1;
  }

  return { output, changes };
}

function replaceSimpleElements(html, tagName, replacementFor) {
  let changes = 0;
  const expression = new RegExp(
    `<${tagName}\\b[^>]*>(?:(?!<\\/${tagName}>)[\\s\\S])*?<\\/${tagName}>`,
    "gi",
  );
  const output = html.replace(expression, (block) => {
    const replacement = replacementFor(block);
    if (replacement === null || replacement === undefined) return block;
    changes += 1;
    return replacement;
  });
  return { output, changes };
}

function removeLegacyJsonLd(html) {
  return html.replace(
    /<script\b(?=[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json))[^>]*>[\s\S]*?<\/script>/gi,
    "",
  );
}

function replaceMetaDescriptions(html) {
  const heading =
    compactText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") ||
    compactText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
      .split("|")[0]
      .trim() ||
    "Grand Funding real estate financing";
  const safeHeading = heading
    .replace(/\b(?:best|fastest|#1|number one)\b/gi, "")
    .replace(
      /(?:\$[\d,.]+\s*(?:[KkMm]|million|thousand)?|\d+(?:\.\d+)?\s*%)/g,
      "",
    )
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  const base = `Review ${safeHeading} with Grand Funding LLC, including common use cases, approved timing, and direct next steps for investors in Arizona and California.`;
  const description =
    base.length <= 175
      ? base
      : `Review ${safeHeading.slice(0, 92).trim()} with Grand Funding LLC and get direct next steps for a real estate transaction in Arizona or California.`;

  return html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const keyMatch = tag.match(
      /\b(?:name|property)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const key = (
      keyMatch?.[1] ??
      keyMatch?.[2] ??
      keyMatch?.[3] ??
      ""
    ).toLowerCase();
    if (
      !["description", "og:description", "twitter:description"].includes(key)
    ) {
      return tag;
    }

    const contentMatch = tag.match(
      /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const current =
      contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? "";
    if (
      !OFFER_NUMBER_PATTERN.test(decodeEntities(current)) &&
      !RESIDUAL_NUMERIC_OFFER_PATTERN.test(decodeEntities(current)) &&
      !SANITIZED_OFFER_FRAGMENT_PATTERN.test(decodeEntities(current)) &&
      !DISALLOWED_SERVICE_PATTERN.test(decodeEntities(current)) &&
      !DISALLOWED_COMPARATIVE_PATTERN.test(decodeEntities(current)) &&
      !/\bowner[- ]occupied\s+OK\b/i.test(decodeEntities(current))
    ) {
      return tag;
    }

    const attribute = key.startsWith("og:") ? "property" : "name";
    return `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(
      description,
    )}">`;
  });
}

function cleanClaimHeading(value) {
  return decodeEntities(value)
    .replace(/\bLoan Loans\b/gi, "Loans")
    .replace(/\s*\|\s*\d+(?:\.\d+)?%\s+From\s*(?=\||$)/gi, " ")
    .replace(/\s*\|\s*a deal-specific amount\s*(?=\||$)/gi, " ")
    .replace(/\s*[—–-]\s*deal-specific leverage(?:,\s*Close in Days)?/gi, "")
    .replace(/\bdeal-specific leverage\b/gi, "Direct deal review")
    .replace(/\bdeal-specific loan sizing\b/gi, "Transaction-specific review")
    .replace(/\s+\|\s+\|/g, " |")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hasHeadingOfferClaim(value) {
  return (
    RESIDUAL_NUMERIC_OFFER_PATTERN.test(value) ||
    SANITIZED_OFFER_FRAGMENT_PATTERN.test(value) ||
    /\b\d+(?:\.\d+)?%\s+From\b/i.test(value) ||
    /\bLoan Loans\b/i.test(value)
  );
}

function replaceHeadClaims(html) {
  let output = html.replace(/<(title|h1)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    const current = compactText(block);
    if (!hasHeadingOfferClaim(current)) {
      return block;
    }
    return replaceElementContent(block, escapeText(cleanClaimHeading(current)));
  });

  const title =
    compactText(
      output.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    ) || "Grand Funding LLC";
  output = output.replace(/<meta\b[^>]*>/gi, (tag) => {
    const keyMatch = tag.match(
      /\b(?:name|property)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const key = (
      keyMatch?.[1] ??
      keyMatch?.[2] ??
      keyMatch?.[3] ??
      ""
    ).toLowerCase();
    if (!["og:title", "twitter:title"].includes(key)) return tag;

    const contentMatch = tag.match(
      /\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    );
    const current =
      contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? "";
    if (!hasHeadingOfferClaim(decodeEntities(current))) {
      return tag;
    }

    const attribute = key.startsWith("og:") ? "property" : "name";
    return `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(
      title,
    )}">`;
  });
  return output;
}

function productStrip() {
  const products = [
    ["Fix &amp; Flip", "Loan product"],
    ["Bridge", "Loan product"],
    ["Construction", "Loan product"],
    ["Cash-Out", "Refinance"],
    ["2nd Position", "Loan product"],
    ["Land / Other", "Case review"],
  ];
  const items = products
    .map(
      ([name, label]) =>
        `<span class="rate-strip__item"><span class="rate-strip__num">${name}</span><span class="rate-strip__label">${label}</span></span>`,
    )
    .join('<span class="rate-strip__divider" aria-hidden="true"></span>');
  return `<aside class="rate-strip" aria-label="Available loan products">${items}<span class="rate-strip__fineprint">${TERMS_NOTE}</span></aside>`;
}

function projectCalculator() {
  return `<section class="loan-calc" data-project-calc aria-label="Project planning calculator">
<div class="loan-calc__inputs">
<div class="loan-calc__kicker">Project Snapshot</div>
<h2 class="loan-calc__title">Run the property numbers before you call.</h2>
<div class="loan-calc__fields">
<label class="loan-calc__field"><span class="loan-calc__field-label">Purchase price</span><input class="loan-calc__field-input" type="text" inputmode="numeric" value="$450,000" data-project-calc="purchase" aria-label="Purchase price"></label>
<label class="loan-calc__field"><span class="loan-calc__field-label">Renovation budget (optional)</span><input class="loan-calc__field-input" type="text" inputmode="numeric" value="$80,000" data-project-calc="rehab" aria-label="Renovation budget"></label>
<label class="loan-calc__field"><span class="loan-calc__field-label">Expected value after work</span><input class="loan-calc__field-input" type="text" inputmode="numeric" value="$650,000" data-project-calc="value" aria-label="Expected value after work"></label>
</div>
</div>
<div class="loan-calc__output">
<div class="loan-calc__output-kicker">Based only on the values you enter</div>
<div class="loan-calc__output-amount" data-project-calc="spread">$120,000</div>
<div class="loan-calc__output-label">Estimated gross project spread</div>
<div class="loan-calc__breakdown">
<div class="loan-calc__breakdown-item"><div class="loan-calc__breakdown-label">Purchase price</div><div class="loan-calc__breakdown-value" data-project-calc="purchase-output">$450,000</div></div>
<div class="loan-calc__breakdown-item"><div class="loan-calc__breakdown-label">Renovation budget</div><div class="loan-calc__breakdown-value" data-project-calc="rehab-output">$80,000</div></div>
<div class="loan-calc__breakdown-item"><div class="loan-calc__breakdown-label">Total planned cost</div><div class="loan-calc__breakdown-value" data-project-calc="cost">$530,000</div></div>
<div class="loan-calc__breakdown-item"><div class="loan-calc__breakdown-label">Expected value after work</div><div class="loan-calc__breakdown-value" data-project-calc="value-output">$650,000</div></div>
</div>
<a class="loan-calc__cta" href="/apply.html">Send the deal for a direct review →</a>
<p class="loan-calc__fineprint">Planning tool only. It does not estimate a loan amount, rate, points, fees, leverage, approval, or final terms. Contact Logan at (602) 935-0371 for a transaction-specific review.</p>
</div>
</section>`;
}

function neutralListItem(block) {
  const text = compactText(block);
  if (
    !OFFER_NUMBER_PATTERN.test(text) &&
    !RESIDUAL_NUMERIC_OFFER_PATTERN.test(text) &&
    !SANITIZED_OFFER_FRAGMENT_PATTERN.test(text)
  ) {
    return null;
  }

  const pieces = [];
  if (/\b(?:rates?|APR|interest|origination|points?|mortgage)\b/i.test(text)) {
    pieces.push(
      "<strong>Rates and points:</strong> Provided after deal review",
    );
  }
  if (
    /\b(?:loan amounts?|loan range|minimum|maximum|max loan|borrow|fund)\b/i.test(
      text,
    ) &&
    /\$/i.test(text)
  ) {
    pieces.push("<strong>Loan sizing:</strong> Determined after deal review");
  }
  if (
    /\b(?:LTV|ARV|LTC|CLTV|purchase price|project costs?|rehab costs?)\b/i.test(
      text,
    ) &&
    (/%/.test(text) || /deal-specific leverage/i.test(text))
  ) {
    pieces.push("<strong>Leverage:</strong> Determined after deal review");
  }
  if (/deal-specific loan sizing|a deal-specific amount/i.test(text)) {
    pieces.push("<strong>Loan sizing:</strong> Determined after deal review");
  }

  if (pieces.length === 0) return null;
  return `<li>${[...new Set(pieces)].join(" · ")}</li>`;
}

function dedupeListItems(html) {
  return html.replace(
    /<(ul|ol)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (list, tag, attrs, body) => {
      const seen = new Set();
      const cleaned = body.replace(/<li\b[^>]*>[\s\S]*?<\/li>/gi, (item) => {
        const key = compactText(item).toLowerCase();
        if (!key || seen.has(key)) return "";
        seen.add(key);
        return item;
      });
      return `<${tag}${attrs}>${cleaned}</${tag}>`;
    },
  );
}

function applyExactApprovedWording(value) {
  const replacements = [
    [
      /Arizona\s*&amp;\s*California's Premier Hard Money Lender/gi,
      "Private Real Estate Financing in Arizona &amp; California",
    ],
    [
      /\b(?:Scottsdale|San Diego)'s Premier Hard Money Lender\b/gi,
      (match) =>
        match.startsWith("Scottsdale")
          ? "Direct Scottsdale Deal Review"
          : "Direct San Diego Deal Review",
    ],
    [
      /Grand Funding LLC originates business-purpose, commercial, and investment-property real estate loans in Arizona and California\. This is not a commitment to lend\. All loans are subject to underwriting review, property appraisal, title clearance, and execution of loan documents\./gi,
      FOOTER_DISCLOSURE,
    ],
    [
      /loan product terms, rate and fee ranges, state-specific notices, and consumer protections for Grand Funding LLC borrowers in Arizona and California\./gi,
      "Transaction-specific term practices, state information, and borrower notices for Grand Funding LLC inquiries involving property in Arizona and California.",
    ],
    [
      /Grand Funding LLC lending disclosures:\s*,?\s*AZ \+ CA loan terms, rates, origination fees, prepayment policies, and consumer protections for hard money\./gi,
      "Grand Funding transaction disclosures, term-setting practices, state information, equal-credit notices, privacy information, and regulator contacts for Arizona and California.",
    ],
    [
      /Grand Funding lending disclosures:\s*,?\s*AZ \+ CA loan terms, rates, origination fees, asset-based underwriting, ECOA, Fair Housing, and regulator contacts\./gi,
      "Grand Funding transaction disclosures, term-setting practices, state information, equal-credit notices, privacy information, and regulator contacts for Arizona and California.",
    ],
    [
      /product terms, rate ranges, fees, and state-specific disclosures for Grand Funding LLC loans in Arizona and California\./gi,
      "Transaction-specific term practices, state information, and borrower notices for Grand Funding LLC inquiries involving property in Arizona and California.",
    ],
    [/Loan Product Terms and Ranges/gi, "How Transaction Terms Are Set"],
    [
      /Representative APR and Payment Examples/gi,
      "Transaction-Specific Pricing and Payment Information",
    ],
    [
      /Grand Funding originates <strong>business-purpose, commercial, and investment-property<\/strong> real estate loans secured by property located in Arizona or California\.\s*We do <strong>not<\/strong> originate loans secured by owner-occupied primary residences and do not offer consumer-purpose mortgage products\./gi,
      `Grand Funding primarily offers <strong>business-purpose real estate financing</strong> secured by eligible property in Arizona and California. ${OCCUPANCY_CASE}`,
    ],
    [
      /Grand Funding primarily offers <strong>business-purpose real estate financing<\/strong> secured by eligible property in Arizona and California\.\s*Grand Funding primarily offers business-purpose real estate financing\.\s*/gi,
      "Grand Funding primarily offers <strong>business-purpose real estate financing</strong> secured by eligible property in Arizona and California. ",
    ],
    [/<li>General investment property loans<\/li>/gi, ""],
    [
      /<li>Cash-out refinance on investment properties<\/li>/gi,
      "<li>Cash-out refinance (occupancy eligibility reviewed case by case)</li>",
    ],
    [
      /<li>Land loans<\/li>/gi,
      "<li>Land and other case-reviewed financing</li>",
    ],
    [
      /The table below reflects <strong>typical<\/strong> product ranges\. Final terms offered depend on property condition, location, borrower experience, exit strategy, and current market conditions\. Terms are subject to change without notice\./gi,
      "This website does not publish standardized product ranges. Rates, points, loan sizing, leverage, fees, and final terms are determined only after direct review of the specific transaction and are provided in writing.",
    ],
    [
      /<p style="font-size:\.88rem;color:var\(--muted,#7A8090\)">\*Rate and point ranges are illustrative only and are not an offer\. Actual pricing is determined at time of application based on deal quality, borrower profile, and market conditions\. Rates are typically interest-only with a balloon at maturity\.<\/p>/gi,
      "",
    ],
    [
      /In addition to interest and origination points, borrowers should budget for the following closing items\. Exact amounts are disclosed on each loan's term sheet and final closing statement\./gi,
      "A transaction may include lender charges and third-party costs. The applicable rate, points, fees, and other charges are provided in writing after review and again in the transaction's final documents.",
    ],
    [
      /<li><strong>Origination points:<\/strong>[^<]*<\/li>/gi,
      "<li><strong>Origination charges:</strong> Provided after transaction review</li>",
    ],
    [
      /<li><strong>Processing\s*\/\s*underwriting fee:<\/strong>[^<]*<\/li>/gi,
      "<li><strong>Processing and underwriting:</strong> Transaction-specific</li>",
    ],
    [
      /<li><strong>Appraisal or BPO:<\/strong>[^<]*<\/li>/gi,
      "<li><strong>Appraisal or BPO:</strong> Third-party provider pricing, when required</li>",
    ],
    [
      /<li><strong>Inspection fees \(construction draws\):<\/strong>[^<]*<\/li>/gi,
      "<li><strong>Construction-draw inspections:</strong> Provider and project-specific pricing</li>",
    ],
    [
      /<li><strong>Legal\s*\/\s*document prep:<\/strong>[^<]*<\/li>/gi,
      "<li><strong>Legal and document preparation:</strong> Transaction-specific</li>",
    ],
    [
      /<p><strong>No prepayment penalty on most loan products\.<\/strong> Some specialty or extended-term products may include a minimum interest period; prepayment terms are always disclosed on the term sheet before closing\.<\/p>/gi,
      "<p>Any prepayment provision or minimum-interest period is transaction-specific and is disclosed in writing before closing.</p>",
    ],
    [
      /Business, Commercial, and Investment Purpose/gi,
      "Primary Business-Purpose Focus and Case-Specific Occupancy",
    ],
    [
      /All Grand Funding loans are originated for <strong>business, commercial, or investment purpose<\/strong>\s*[—-]\s*typically for the acquisition, renovation, construction, or refinance of real estate intended for sale, rent, or other business use\.\s*Grand Funding loans are <strong>not<\/strong> consumer-purpose loans subject to the Truth in Lending Act \(TILA\), Real Estate Settlement Procedures Act \(RESPA\), or similar consumer-lending statutes applicable to owner-occupied primary residences\./gi,
      `Grand Funding primarily offers financing for <strong>business, commercial, or investment purposes</strong>, including eligible acquisition, renovation, construction, refinance, and land transactions. ${OCCUPANCY_CASE}`,
    ],
    [
      /Grand Funding primarily offers financing for <strong>business, commercial, or investment purposes<\/strong>, including eligible acquisition, renovation, construction, refinance, and land transactions\.\s*Grand Funding primarily offers business-purpose real estate financing\.\s*/gi,
      "Grand Funding primarily offers financing for <strong>business, commercial, or investment purposes</strong>, including eligible acquisition, renovation, construction, refinance, and land transactions. ",
    ],
    [
      /By applying, you represent that any loan you obtain will be used exclusively for business, commercial, or investment purposes and that the transaction satisfies the applicable occupancy and loan-purpose requirements\./gi,
      "Each applicant must accurately describe the proposed use, property occupancy, and transaction purpose. Eligibility, required disclosures, and documentation are determined for the specific transaction.",
    ],
    [/Arizona Business-Purpose Loans/gi, "Arizona Transaction Review"],
    [
      /Loans Grand Funding originates in Arizona are business-purpose loans secured by eligible real estate under the applicable program\. Loan documents are governed by Arizona law and typically include a deed of trust, promissory note, and business-purpose certification\./gi,
      "Transactions involving Arizona property are reviewed for program eligibility, purpose, occupancy, required documentation, and applicable Arizona requirements.",
    ],
    [/California Business-Purpose Loans/gi, "California Transaction Review"],
    [
      /Loans originated on California property are business-purpose or commercial loans secured by eligible real estate under the applicable program, typically funded under applicable California Finance Lenders Law or private lender exemptions for qualified transactions\. Each California loan is documented with a deed of trust, promissory note, and any occupancy or loan-purpose certification required for the transaction\./gi,
      "Transactions involving California property are reviewed for program eligibility, purpose, occupancy, required documentation, and applicable California requirements.",
    ],
    [
      /The following illustrative examples are for general information only and are <strong>not<\/strong> an offer\. Actual rate, APR, and payment depend on final underwriting\./gi,
      "Grand Funding does not publish representative pricing or payment examples. Any applicable rate, APR, points, fees, payment structure, and total cost are transaction-specific and are provided in writing after review.",
    ],
    [
      /Terms offered to any specific borrower depend on specific deal circumstances and may differ from ranges shown on this page\./gi,
      "Terms for any specific applicant depend on the transaction and are provided only after direct review.",
    ],
    [/Last updated: April 17, 2026/gi, "Last updated: July 29, 2026"],
    [
      /Flexible loan amounts to match any project size\. From single-family to commercial\./gi,
      "Transaction-specific loan sizing based on the property, project, and requested financing.",
    ],
    [
      /No hidden fees\. No surprises\. Just straightforward lending you can understand\./gi,
      "Rates, points, fees, and other terms are provided in writing after transaction review.",
    ],
    [/High-Value Loan Range/gi, "High-Value Deal Review"],
    [/High Loan Amounts/gi, "High-Value Deal Review"],
    [/Same-day rate quote\./gi, "Same-day deal review."],
    [
      /<li><strong>Properties:<\/strong>\s*Investment real estate in Arizona and California \(non-owner occupied\)<\/li>/gi,
      "<li><strong>Properties:</strong> Eligible real estate in Arizona and California; occupancy is reviewed case by case</li>",
    ],
    [
      /<option>Investment Property<\/option>/gi,
      "<option>Second Position</option>",
    ],
    [
      /You don't need to put 30% down like a bank would require\. But you do need skin in the game\. Most Arizona hard money flip loans require 10-20% from the borrower depending on ARV, experience, and deal quality\./gi,
      "The required borrower contribution and leverage are determined after review of the property, project scope, experience, and exit strategy.",
    ],
    [
      /Hard money loans necessitate a larger down payment, typically ranging from 25% to 30% for residential properties and 30% to 40% for commercial properties\. Grand Funding permits cross-collateralizing multiple properties, enhancing approval prospects\./gi,
      "Required borrower contribution and any cross-collateral structure are determined only after review of the specific transaction.",
    ],
    [
      /If it's under 5% and you got it in 2020-2022: keep it\. Use a second position\./gi,
      "If the existing first mortgage has favorable terms, ask whether a second position may be appropriate before replacing it.",
    ],
    [
      /\bGrand Funding, a premier hard money lender,/gi,
      "Grand Funding, a direct private lender,",
    ],
    [
      /From 9\.99%, 6-12 month term, asset-based\./gi,
      "Rates, points, and terms are provided after transaction review.",
    ],
    [
      /Loans from \$50,000 to \$5,000,000/gi,
      "Loan sizing determined after review",
    ],
    [
      /Grand Funding offers(?: loans)?\s+(?:a deal-specific amount|loan sizing determined after review)in Los Angeles/gi,
      "Grand Funding determines loan sizing after review for transactions in Los Angeles",
    ],
    [
      /Grand Funding offers(?: loans)?\s+(?:a deal-specific amount|loan sizing determined after review)in San Diego/gi,
      "Grand Funding determines loan sizing after review for transactions in San Diego",
    ],
    [
      /Grand Funding offers(?: loans)?\s+(?:a deal-specific amount|loan sizing determined after review)in Scottsdale/gi,
      "Grand Funding determines loan sizing after review for transactions in Scottsdale",
    ],
    [
      /Arizona construction loans are available\s+(?:a deal-specific amount|loan sizing determined after review)This/gi,
      "Arizona construction loan sizing is determined after review. This",
    ],
    [
      /Arizona and California,\s*plus select deals nationwide\./gi,
      "Statewide in Arizona and California.",
    ],
    [
      /select deals nationwide/gi,
      "transactions statewide in Arizona and California",
    ],
    [
      /outside Arizona or California/gi,
      "beyond the current Arizona and California service area",
    ],
    [
      /Who is the best hard money lender in Phoenix\?/gi,
      "What should Phoenix investors look for in a hard money lender?",
    ],
    [
      /Who are the best hard money lenders in Los Angeles\?/gi,
      "What should Los Angeles investors look for in a hard money lender?",
    ],
    [/Phoenix's Fastest Hard Money Lender/gi, "Direct Phoenix Deal Review"],
    [/Get a same-day rate quote/gi, "Request a same-day deal review"],
    [/Get My Phoenix Rate Quote/gi, "Request My Phoenix Deal Review"],
    [/Get My LA Rate Quote/gi, "Request My Los Angeles Deal Review"],
    [/Get My San Diego Rate Quote/gi, "Request My San Diego Deal Review"],
    [
      /Yes, we offer owner-occupied loans for primary residences, typically through our cash-out refinance program\./gi,
      OCCUPANCY_FULL,
    ],
    [/Owner-occupied OK/gi, "Case-specific occupancy review"],
    [
      /Owner-Occupied\s*&(?:amp;)?\s*Investment:\s*Both qualify/gi,
      "Occupancy eligibility: case-specific review",
    ],
    [
      /Both investment and owner-occupied properties may qualify depending on the loan type\./gi,
      OCCUPANCY_FULL,
    ],
    [/Primary residences may qualify for certain programs\./gi, OCCUPANCY_FULL],
    [
      /Primary residences are excluded\s*[—-]\s*investment and non-owner-occupied properties only\./gi,
      OCCUPANCY_FULL,
    ],
    [
      /Investment and non-owner-occupied properties only\s*[—-]\s*primary residences are excluded from this program\./gi,
      OCCUPANCY_FULL,
    ],
    [
      /We do not originate loans secured by owner-occupied primary residences and do not offer consumer-purpose mortgage products\./gi,
      OCCUPANCY_FULL,
    ],
    [
      /Grand Funding loans are not consumer-purpose loans subject to the Truth in Lending Act \(TILA\), Real Estate Settlement Procedures Act \(RESPA\), or similar consumer-lending statutes applicable to owner-occupied primary residences\./gi,
      "Applicable disclosures and documentation depend on the transaction's purpose, occupancy, property, and governing requirements.",
    ],
    [
      /the subject property is not and will not be your primary residence\./gi,
      "the transaction satisfies the applicable occupancy and loan-purpose requirements.",
    ],
    [
      /secured by non-owner-occupied investment real estate\./gi,
      "secured by eligible real estate under the applicable program.",
    ],
    [
      /secured by non-owner-occupied real estate,/gi,
      "secured by eligible real estate under the applicable program,",
    ],
    [
      /business-purpose\s*\/\s*non-owner-occupied certification signed at closing\./gi,
      "any occupancy or loan-purpose certification required for the transaction.",
    ],
    [
      /Owner-occupied primary residences \(they only lend on investment\s*\/\s*business-purpose property\)/gi,
      "Owner-occupied or primary-residence transactions without prior case-specific confirmation",
    ],
    [
      /Properties:\s*Investment real estate in Arizona and California \(non-owner occupied\)/gi,
      `Properties: Eligible real estate in ${APPROVED_STATES}; occupancy is reviewed case by case`,
    ],
    [
      /Owner-occupied residential property:\s*We fund investment property only\.\s*Primary residences fall under TRID and QM rules/gi,
      `Owner-occupied residential property: ${OCCUPANCY_SHORT}`,
    ],
    [
      /Grand Funding does not originate loans secured by owner-occupied primary residences/gi,
      OCCUPANCY_SHORT,
    ],
    [
      /Grand Funding offers fix-and-flip loans \([^)]*\), bridge loans \([^)]*\), construction loans with milestone draws \([^)]*\), second position loans \([^)]*\), cash-out refinance for investment properties, land loans, and investment property loans/gi,
      "Grand Funding offers fix-and-flip, bridge, construction, cash-out refinance, second position, and land or other case-reviewed financing",
    ],
    [
      /Grand Funding lends from \$70,000 minimum to \$5,000,000 maximum across Arizona and California\.\s*Loan-to-value limits vary by product:[^<]*/gi,
      "Loan sizing and leverage are determined after review of the specific transaction. Grand Funding serves investors statewide in Arizona and California.",
    ],
    [
      /deal-specific leverage means you can borrow up to 75% of the property value/gi,
      "Leverage is determined after review of the property, requested financing, and transaction details",
    ],
    [
      /Standard fees include origination points \([^)]*\), appraisal fee \([^)]*\), title insurance, escrow fees, and document preparation\.\s*We provide a complete fee breakdown in your loan estimate\s*-\s*no hidden surprises\./gi,
      "Costs vary by transaction. Grand Funding provides rates, points, fees, and other terms in writing after review; third-party appraisal, title, and escrow charges may also apply.",
    ],
    [
      /What's the maximum CLTV\?/gi,
      "How is leverage determined for a second position loan?",
    ],
    [
      /We typically go up to 75% Combined Loan-to-Value\.[^<]*/gi,
      "Second-position leverage is determined after review of the existing liens, property value, requested financing, and exit strategy.",
    ],
    [
      /Grand Funding lends up to 80% of total project cost on Scottsdale construction, with loans from \$250,000 to \$5 million and terms of 12 to 18 months\./gi,
      "Scottsdale construction loan sizing, leverage, term, and draw structure are determined after review of the plans, budget, property, and builder experience.",
    ],
    [
      /existing low-rate existing low-rate mortgage in second position/gi,
      "existing low-rate first mortgage",
    ],
    [
      /Owner-Occupied\s*&amp;\s*Investment:\s*Both qualify/gi,
      "Occupancy eligibility: case-specific review",
    ],
    [
      /terms provided after deal review provided after deal review/gi,
      "terms provided after deal review",
    ],
    [
      /points provided after deal review provided after deal review/gi,
      "points provided after deal review",
    ],
    [
      /\ba any occupancy or loan-purpose certification\b/gi,
      "any occupancy or loan-purpose certification",
    ],
    [/\b([A-Za-z0-9&; -]+) Loan loans\b/gi, "$1 loans"],
    [
      /\bdeal-specific leverage \(ARV\) \(ARV\)\b/gi,
      "leverage determined after deal review",
    ],
    [
      /\bdeal-specific leverage \(CLTV\) \(CLTV\)\b/gi,
      "leverage determined after deal review",
    ],
    [
      /\b70[–-]deal-specific leverage\b/gi,
      "leverage determined after deal review",
    ],
    [
      /\ba deal-specific amount cash-out refi loan\b/gi,
      "a transaction-specific cash-out refinance amount",
    ],
    [
      /\bRates are competitive and transparent\s*-\s*we'll provide clear terms before you commit\./gi,
      "Grand Funding provides transaction-specific terms in writing before you decide whether to proceed.",
    ],
    [
      /\btypically points provided after deal review\b/gi,
      "determined for the specific extension",
    ],
    [
      /\bloan range of deal-specific loan sizing\b/gi,
      "transaction-specific underwriting approach",
    ],
    [
      /\bFunding ranges deal-specific loan sizing\b/gi,
      "Loan sizing is determined after review",
    ],
    [/\bdeal-specific loan sizing Range\b/gi, "Loan sizing"],
    [
      /\ba deal-specific amount to handle California's higher property values\.\s*What's a small deal in Phoenix might be \$1M\+ in San Diego or LA\s*[—-]\s*we're built for both markets\./gi,
      "Larger California transactions are reviewed individually based on the property, requested financing, and exit strategy.",
    ],
    [
      /\bTypical leverage is determined after deal review for residential land and 50-60% for commercial land\./gi,
      "Land-loan leverage is determined after review of the parcel, requested financing, development plan, and exit strategy.",
    ],
    [
      /\bInvestor kept 3\.1% first in place\./gi,
      "Investor kept an existing low-rate first mortgage in place.",
    ],
    [
      /\bScottsdale luxury properties routinely carry 40[–-]60% equity for investors who bought pre-2022\./gi,
      "Scottsdale luxury properties may carry substantial investor equity.",
    ],
    [
      /\bIf you only need \$75,000[–-]\$150,000 and you have a low-rate first at \$300,000, a second position gets you there without disrupting the primary loan\./gi,
      "When the requested amount is modest relative to available equity, a second position may provide capital without replacing the existing first mortgage.",
    ],
    [
      /\bLoan at deal-specific leverage:\s*\$371,250\b/gi,
      "Illustrative financing result: provided after direct review",
    ],
    [/\b70% Rule\b/gi, "Common underwriting guidance"],
    [
      /<strong>Owner-Occupied\s*&amp;\s*Investment:<\/strong>\s*Both qualify/gi,
      "<strong>Occupancy eligibility:</strong> Case-specific review",
    ],
    [
      /<strong>Owner-occupied residential property:<\/strong>\s*We fund investment property only\.\s*Primary residences fall under TRID and QM rules\s*[—-]\s*different product entirely\./gi,
      `<strong>Owner-occupied residential property:</strong> ${OCCUPANCY_SHORT}`,
    ],
    [
      /<strong>leverage determined after deal review:<\/strong>\s*Minimize cash requirements/gi,
      "<strong>Leverage:</strong> Determined after deal review",
    ],
    [
      /<strong>deal-specific rehab funding:<\/strong>\s*Maximize your budget/gi,
      "<strong>Rehab funding:</strong> Determined after deal review",
    ],
    [
      /<strong>Flexible Use:<\/strong>\s*Any legal purpose/gi,
      "<strong>Eligible use:</strong> Reviewed case by case",
    ],
    [
      /\bHome improvements and renovations\b/gi,
      "Property improvements and renovations",
    ],
    [
      /\b80% of total project cost\b/gi,
      "leverage determined after direct review",
    ],
    [
      /\bA bridge loan at terms provided after deal review held for 12 months on \$500K:/gi,
      TERMS_NOTE,
    ],
    [
      /\bA cash-out refi at terms provided after deal review on a 36-month term, also \$500K, also held 12 months before refinancing or selling:/gi,
      TERMS_NOTE,
    ],
    [
      /− Selling costs \(6%\):\s*\$27,900/gi,
      "− Estimated selling costs: $27,900",
    ],
    [
      /\$1\.28M\.\s*financing approved after direct review/gi,
      "$1.28M. Reviewed and funded",
    ],
    [
      /\$495K\.\s*transaction-specific financing funded/gi,
      "$495K. Reviewed and funded",
    ],
    [
      /\bIllustrative financing result:\s*provided after direct review/gi,
      "Review result: provided after direct review",
    ],
    [
      /\bWe offer loans from \$70,000 to \$5 million\.\s*For larger projects exceeding \$5 million, please contact us directly as we may be able to accommodate through specialized programs or partnerships\./gi,
      "Loan sizing is determined only after Grand Funding reviews the specific transaction.",
    ],
    [
      /\bWe can finance leverage determined after deal review, covering both acquisition and renovation costs\./gi,
      "Acquisition and renovation funding, including leverage and draw structure, is determined after direct deal review.",
    ],
    [
      /Contact Grand Funding before applying\.\s*This is useful if you need to access equity quickly or can't qualify for traditional financing due to credit or income issues\./gi,
      "Contact Grand Funding before applying.",
    ],
  ];

  let output = value;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

function neutralizeKnownOfferPhrases(value) {
  return value
    .replace(/\bnationwide\b/gi, "in other states")
    .replace(
      /\b(?:Rate|Rates)\s+from:\s*\d+(?:\.\d+)?%/gi,
      "Terms: after deal review",
    )
    .replace(
      /\bRates?:\s*(?:(?:Starting|From)\s+at\s*)?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%/gi,
      "Rates: provided after deal review",
    )
    .replace(/\bAPR:\s*\d+(?:\.\d+)?%/gi, "APR: provided after deal review")
    .replace(
      /\bInterest rates?\s+(?:typically\s+)?(?:range|start)[^.!?<]{0,80}?\d+(?:\.\d+)?%[^.!?<]*/gi,
      "Rates and points are provided after deal review",
    )
    .replace(
      /\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s*%\s+(?:interest\s+)?rates?\b/gi,
      "market rates",
    )
    .replace(
      /\brates?\s+(?:between|of|below|to)\s+\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%/gi,
      "market rates",
    )
    .replace(
      /\b(?:\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?\s+(?:origination\s+)?points?|origination points?\s*(?:\([^)]*\))?\s*[:\-]?\s*\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?(?:\s+points?)?)(?:\s*\([^)]*\))?/gi,
      "points provided after deal review",
    )
    .replace(
      /\bone point equals 1% of the loan amount\b/gi,
      "current point charges are disclosed after deal review",
    )
    .replace(
      /\b(?:first mortgage|mortgage|existing rate|bank rate)[^.!?<]{0,35}?\(?\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\)?/gi,
      "existing low-rate mortgage",
    )
    .replace(
      /\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+(?:vs\.?\s+)?(?:a\s+)?higher hard money rate\b/gi,
      "an existing low rate compared with a higher short-term financing rate",
    )
    .replace(
      /\b\d+(?:\.\d+)?%\s+with\s+\d+(?:\.\d+)?\s+points?\b/gi,
      "terms provided after deal review",
    )
    .replace(
      /\b\d+(?:\.\d+)?%\s+with\s+points\b/gi,
      "terms provided after deal review",
    )
    .replace(
      /\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+interest,\s*points\b/gi,
      "terms provided after deal review",
    )
    .replace(
      /\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+vs\.?\s+\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+bank rate\b/gi,
      "short-term financing pricing compared with bank pricing",
    )
    .replace(
      /\borigination points?\s*\(\s*\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s*\)/gi,
      "origination charges provided after review",
    )
    .replace(
      /\bpoints provided after deal review\s*=\s*1%\b/gi,
      "point charges are disclosed after deal review",
    )
    .replace(/\brates?\s+(?:and|from)\s+\d+(?:\.\d+)?%/gi, "market rates")
    .replace(
      /\b(?:Loan range|Loan amounts?|Loan size):\s*\$[\d,.]+\s*(?:[KkMm]|million|thousand)?(?:\s*(?:-|–|—|to)\s*\$?[\d,.]+\s*(?:[KkMm]|million|thousand)?)?/gi,
      "Loan sizing: determined after deal review",
    )
    .replace(
      /\b(?:LTV\/ARV|LTV|ARV|LTC|CLTV):\s*(?:Typically\s*)?(?:Up to\s*)?\d+(?:\.\d+)?%/gi,
      "Leverage: determined after deal review",
    )
    .replace(/Fund\s+\$5M\b/gi, "Fund qualifying deals")
    .replace(/\$5M\s+cap\b/gi, "deal-specific loan sizing")
    .replace(
      /\$5M\s+custom build\s*[—-]\s*our loan range[^.!?<]*/gi,
      "larger custom build — loan sizing is determined after review",
    )
    .replace(
      /\$[\d,.]+\s*(?:[KkMm]|million|thousand)?\s+ARV[^.!?<]{0,45}?\byou could borrow[^.!?<]*/gi,
      "Project values and requested financing are reviewed individually",
    )
    .replace(
      /\byou could borrow\s+(?:up to\s+)?\$[\d,.]+\s*(?:[KkMm]|million|thousand)?/gi,
      "requested financing is set after review",
    )
    .replace(
      /\bborrow\s+up to\s+\$[\d,.]+\s*(?:[KkMm]|million|thousand)?/gi,
      "request deal-specific financing",
    )
    .replace(
      /\bup to\s+(?:a\s+)?\$[\d,.]+\s*(?:[KkMm]|million|thousand)?/gi,
      "a deal-specific amount",
    )
    .replace(
      /\bloan amounts?\s+(?:range|span|spanning)[^.!?<]{0,80}?\$[\d,.]+\s*(?:[KkMm]|million|thousand)?[^.!?<]*/gi,
      "Loan sizing is determined after deal review",
    )
    .replace(
      /\$70,000\s+minimum\s+to\s+\$5,000,000\s+maximum\b/gi,
      "deal-specific loan sizing",
    )
    .replace(
      /\bloan amount\s+Example\s+[A-Z]\s+\$[\d,.]+\b/gi,
      "illustrative loan amount",
    )
    .replace(
      /\$[\d,.]+\s*(?:[KkMm]|million|thousand)?\s+loan\b/gi,
      "illustrative loan",
    )
    .replace(/\$40K\s+minimum\b/gi, "minimum target")
    .replace(/\$40K\s+profit at minimum\b/gi, "minimum target profit")
    .replace(/\$[\d,.]+\s*(?:[KkMm])?\s+maximum\b/gi, "calculated maximum")
    .replace(
      /\bloan amount\),\s*appraisal fee\s*\(\$[\d,.]+\s*(?:-|–|—|to)\s*\$?[\d,.]+/gi,
      "requested financing), appraisal fee (provider pricing",
    )
    .replace(
      /\bup to\s+\d+(?:\.\d+)?%\s+of\s+that ARV\s*\(\$[\d,.]+\s*(?:[KkMm])?/gi,
      "ARV-based sizing determined after review",
    )
    .replace(
      /\b(?:up to|max(?:imum)?(?: loan(?: amount| size)?)?)\s+\$5(?:,000,000|M)\b/gi,
      "deal-specific loan sizing",
    )
    .replace(/\$70K\s*(?:-|–|—|to)\s*\$?5M\b/gi, "deal-specific loan sizing")
    .replace(
      /\$70,000\s*(?:-|–|—|to)\s*\$?5,000,000\b/gi,
      "deal-specific loan sizing",
    )
    .replace(
      /\b(?:up to\s+)?(?:65|70|75|80|90)%\s+(?:LTV|ARV|LTC|CLTV|of ARV|of after-repair value|of the after-repair value|of project cost|of project costs|of rehab costs?)\b/gi,
      "deal-specific leverage",
    )
    .replace(
      /\b(?:LTV|ARV|LTC|CLTV)\s+(?:is\s+)?(?:typically\s+)?(?:up to\s+|within\s+)?(?:65|70|75|80|90)%\b/gi,
      "leverage is determined after deal review",
    )
    .replace(
      /\b(?:65|70|75|80|90)%\s+(?:of\s+)?(?:ARV|LTV|LTC|CLTV)\b/gi,
      "deal-specific leverage",
    )
    .replace(
      /\b(?:LTV|LTC|CLTV)(?:\s*\([^)]*\))?[^.!?<]{0,45}?(?:capped at|go up to|is|at)\s+\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%/gi,
      "leverage is determined after deal review",
    )
    .replace(
      /\b\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+(?:LTV|LTC|CLTV)\b/gi,
      "deal-specific leverage",
    )
    .replace(
      /\b100%\s+of\s+rehab(?:\s+costs?)?\b/gi,
      "deal-specific rehab funding",
    )
    .replace(
      /\b(?:up to\s+)?\d+(?:\.\d+)?%\s+of\s+(?:the\s+)?(?:as-is\s+)?property value\b/gi,
      "deal-specific leverage",
    )
    .replace(
      /\b(?:up to|within)\s+\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?%\s+(?:combined\s+)?(?:loan-to-value|of\s+(?:the\s+)?(?:purchase|after[ -]repair value|post[ -]completion value|total project cost))\b(?:\s*\((?:LTV|ARV|LTC|CLTV)\))?/gi,
      "leverage determined after deal review",
    )
    .replace(
      /\bup to\s+\d+(?:\.\d+)?%\s+of\s+(?:the\s+)?cost\b/gi,
      "deal-specific leverage",
    )
    .replace(
      /\bARV\s*(?:×|x)\s*\d+(?:\.\d+)?%/gi,
      "ARV-based sizing after review",
    )
    .replace(
      /\b(?:LTV|CLTV)\??\s*(?:We\s+typically\s+go\s+up\s+to|Grand Funding lends up to|is\s+(?:typically\s+|within\s+|up\s+to\s+)?)\s*\d+(?:\.\d+)?%/gi,
      "leverage is determined after deal review",
    )
    .replace(/\b(?:78|90)%\s+ARV\b/gi, "deal-specific leverage");
}

function neutralizeOfferElements(html) {
  let output = html;

  for (const tagName of ["p", "dd"]) {
    ({ output } = replaceSimpleElements(output, tagName, (block) => {
      const text = compactText(block);
      if (
        !RESIDUAL_NUMERIC_OFFER_PATTERN.test(text) &&
        !SANITIZED_OFFER_FRAGMENT_PATTERN.test(text)
      ) {
        return null;
      }
      return replaceElementContent(block, TERMS_NOTE);
    }));
  }

  ({ output } = replaceSimpleElements(output, "summary", (block) => {
    const text = compactText(block);
    if (!SANITIZED_OFFER_FRAGMENT_PATTERN.test(text)) return null;
    if (/loan sizing/i.test(text)) {
      return replaceElementContent(block, "How is loan sizing determined?");
    }
    return replaceElementContent(block, "How is leverage determined?");
  }));

  for (const tagName of ["a", "span"]) {
    ({ output } = replaceSimpleElements(output, tagName, (block) => {
      const text = compactText(block);
      if (/^deal-specific leverage(?:\s*→)?$/i.test(text)) {
        return replaceElementContent(
          block,
          /→/.test(text) ? "Terms after review →" : "After review",
        );
      }
      if (/^deal-specific loan sizing(?:\s+Loans?)?$/i.test(text)) {
        return replaceElementContent(block, "After review");
      }
      return null;
    }));
  }

  output = output
    .replace(
      /(<div\b[^>]*class\s*=\s*["'][^"']*(?:lp-stat__num|stat-number|deals-stat__num)[^"']*["'][^>]*>)\s*\$5M\s*(<\/div>\s*<div\b[^>]*class\s*=\s*["'][^"']*(?:lp-stat__label|stat-label|deals-stat__label)[^"']*["'][^>]*>)\s*Max Loan(?: Size| Amount)?\s*(<\/div>)/gi,
      "$1Custom$2Loan sizing$3",
    )
    .replace(
      /(<div\b[^>]*class\s*=\s*["'][^"']*lp-stat__num[^"']*["'][^>]*>)\s*(?:80|90)%\s*(<\/div>\s*<div\b[^>]*class\s*=\s*["'][^"']*lp-stat__label[^"']*["'][^>]*>)\s*(?:Max of Cost|ARV on Flips)\s*(<\/div>)/gi,
      "$1Direct$2Deal review$3",
    )
    .replace(
      /(<div\b[^>]*class\s*=\s*["'][^"']*lp-stat__num[^"']*["'][^>]*>)\s*\d+(?:\.\d+)?%\s*(<\/div>\s*<div\b[^>]*class\s*=\s*["'][^"']*lp-stat__label[^"']*["'][^>]*>)\s*Max\s+(?:LTV|ARV|LTC|CLTV)\s*(<\/div>)/gi,
      "$1Direct$2Deal review$3",
    )
    .replace(
      /(<div\b[^>]*>)(?:deal-specific leverage|deal-specific loan sizing)(<\/div>)/gi,
      "$1After review$2",
    )
    .replace(
      /<li\b[^>]*>\s*<strong>\s*Up to 90% of Purchase:\s*<\/strong>[\s\S]*?<\/li>/gi,
      "<li><strong>Leverage:</strong> Determined after deal review</li>",
    );

  return output;
}

function transformHtml(source, { preserveJsonLd = false } = {}) {
  let html = source;
  ({ output: html } = replaceSimpleElements(html, "script", (block) =>
    /\bAW-\d+\b/i.test(block) ? "" : null,
  ));
  if (!preserveJsonLd) html = removeLegacyJsonLd(html);
  html = applyExactApprovedWording(html);
  html = neutralizeKnownOfferPhrases(html);
  html = replaceHeadClaims(html);
  html = replaceMetaDescriptions(html);

  ({ output: html } = replaceBalancedElements(
    html,
    "aside",
    (block, opening) => {
      return classNames(opening).has("rate-strip") ? productStrip() : null;
    },
  ));

  ({ output: html } = replaceBalancedElements(
    html,
    "section",
    (block, opening) => {
      const classes = classNames(opening);
      if (
        (classes.has("loan-calc") || /\bdata-loan-calc\b/i.test(opening)) &&
        !/\bdata-project-calc\b/i.test(opening)
      ) {
        return projectCalculator();
      }
      if (
        /\bclass\s*=\s*(?:"[^"]*\bproduct-section\b[^"]*"|'[^']*\bproduct-section\b[^']*')/i.test(
          opening,
        ) &&
        /\bid\s*=\s*(?:"investment-property"|'investment-property')/i.test(
          opening,
        )
      ) {
        return "";
      }
      return null;
    },
  ));

  ({ output: html } = replaceBalancedElements(html, "table", (block) => {
    const text = compactText(block);
    if (
      !/\b(?:rate range|APR|points?|loan size|loan amount|LTV|ARV|LTC|CLTV)\b/i.test(
        text,
      ) &&
      !RESIDUAL_NUMERIC_OFFER_PATTERN.test(text)
    ) {
      return null;
    }
    return `<div class="approval-note"><h3>Deal-specific terms</h3><p>${TERMS_NOTE}</p></div>`;
  }));

  for (const tagName of ["ul", "ol"]) {
    ({ output: html } = replaceBalancedElements(
      html,
      tagName,
      (block, opening) => {
        const text = compactText(block);
        if (!/\bInterest:\s*\$/i.test(text) || !/\bPoints:\s*\$/i.test(text)) {
          return null;
        }
        return `${opening}<li>Transaction-specific rate, points, fees, term, and total cost are provided in writing after deal review.</li></${tagName}>`;
      },
    ));
  }

  let retainedTermsExample = false;
  ({ output: html } = replaceBalancedElements(html, "div", (block, opening) => {
    const classes = classNames(opening);
    if (
      (classes.has("lp-deal-card") || classes.has("deal-card")) &&
      /\bHonolulu,\s*HI\b/i.test(compactText(block))
    ) {
      return "";
    }
    if (
      classes.has("product-card") &&
      /\bInvestment Property Loans\b/i.test(compactText(block))
    ) {
      return block
        .replace(/\bInvestment Property Loans\b/gi, "Second Position Loans")
        .replace(
          /Financing for rental properties and income-generating real estate\./gi,
          "Access eligible property equity without replacing an existing first mortgage.",
        )
        .replace(
          /<li>DSCR-based approval<\/li><li>No income docs<\/li><li>1-4 units<\/li>/gi,
          "<li>Existing first may remain</li><li>Case-specific lien review</li><li>Loan sizing after direct review</li>",
        )
        .replace(/prod-invest-extra/gi, "prod-second-extra")
        .replace(
          /Buy-and-hold rentals and portfolio growth/gi,
          "Accessing equity while preserving an existing first mortgage",
        )
        .replace(
          /Typical close:<\/strong>\s*5[–-]10 days/gi,
          "Typical close:</strong> 7–10 days",
        )
        .replace(
          /\/products(?:\.html)?#investment-property/gi,
          "/products#second-mortgage",
        )
        .replace(
          /\bInvestment Property Details\b/gi,
          "Second Position Details",
        );
    }
    if (
      classNames(opening).has("faq-item") &&
      /\bWhat is a DSCR loan\?/i.test(compactText(block))
    ) {
      return "";
    }
    if (
      !classNames(opening).has("compliance-callout") ||
      !/\bExample\b/i.test(compactText(block)) ||
      !/\b(?:Rate|APR|Origination)\b/i.test(compactText(block))
    ) {
      return null;
    }
    if (retainedTermsExample) return "";
    retainedTermsExample = true;
    return `<div class="compliance-callout"><h3>Deal-specific terms</h3><p>${TERMS_NOTE}</p></div>`;
  }));

  ({ output: html } = replaceSimpleElements(html, "li", neutralListItem));
  html = dedupeListItems(html);
  html = neutralizeOfferElements(html);

  html = html
    .replace(
      /<a\b[^>]*href\s*=\s*(?:"#investment-property"|'#investment-property')[^>]*>[\s\S]*?<\/a>/gi,
      "",
    )
    .replace(
      /(<h2\b[^>]*>\s*Formula\s*<\/h2>)[\s\S]*?(?=<h3\b[^>]*>\s*Related terms\s*<\/h3>)/i,
      `<h2 style="font-size:1.5rem;font-weight:800;color:#F4F1EA;margin:0 0 1rem">How origination points work</h2>
<p style="font-size:1.08rem;line-height:1.65;color:rgba(244,247,255,.85);margin-bottom:2rem">Origination points are upfront lender charges calculated from the loan amount. Grand Funding does not publish a standard points schedule online; current charges are disclosed in writing after review.</p>
<h2 style="font-size:1.5rem;font-weight:800;color:#F4F1EA;margin:2rem 0 1rem">Why total cost matters</h2>
<p style="font-size:1.08rem;line-height:1.65;color:rgba(244,247,255,.85);margin-bottom:2rem">Compare the complete financing cost, including the rate, points, third-party fees, term, and exit plan. Logan presents the transaction-specific terms in writing before a borrower decides whether to proceed.</p>
`,
    )
    .replace(
      /(<input\b[^>]*\bname\s*=\s*(?:"loan_amount"|'loan_amount')[^>]*\bplaceholder\s*=\s*)("\$[\d,.]+"|'\$[\d,.]+')/gi,
      '$1"Enter requested amount"',
    )
    .replace(
      /(<textarea\b[^>]*\bplaceholder\s*=\s*)("([^"]*\bARV\b[^"]*)"|'([^']*\bARV\b[^']*)')/gi,
      '$1"Property, project scope, timeline, and exit strategy…"',
    )
    .replace(
      /\bWhat are your loan-to-value \(LTV\) limits\?/gi,
      "How are leverage terms determined?",
    )
    .replace(
      /\bHow much can I borrow for a ([^?<]+)\?/gi,
      "How is loan sizing determined for a $1?",
    )
    .replace(
      /\bWhat is the minimum and maximum loan amount\?/gi,
      "How is loan sizing determined?",
    )
    .replace(
      /\bWhat(?: is|'s) the maximum LTV on a bridge loan\?/gi,
      "How is bridge-loan leverage determined?",
    )
    .replace(
      /75% of the as-is property value\.\s*We can go higher case-by-case for strong borrowers with low-leverage exits\./gi,
      "Bridge-loan leverage is determined after review of the property, requested financing, and exit strategy.",
    )
    .replace(/\bat deal-specific leverage\b/gi, "after direct review")
    .replace(
      /\bdeal-specific leverage loan\b/gi,
      "transaction-specific financing",
    )
    .replace(
      /\bdeal-specific leverage approved\b/gi,
      "financing approved after direct review",
    )
    .replace(/\bdeal-specific leverage\b/gi, "leverage determined after review")
    .replace(
      /\bdeal-specific loan sizing\b/gi,
      "loan sizing determined after review",
    )
    .replace(
      /\ba deal-specific amount\b/gi,
      "loan sizing determined after review",
    );

  ({ output: html } = replaceBalancedElements(
    html,
    "article",
    (block, opening) =>
      classNames(opening).has("loan-card") &&
      /\bHonolulu,\s*HI\b/i.test(compactText(block))
        ? ""
        : null,
  ));

  return html.replace(/^[\t ]+$/gm, "");
}

function transformText(source) {
  let output = applyExactApprovedWording(source);
  output = neutralizeKnownOfferPhrases(output);
  output = output
    .replace(/\bdeal-specific leverage\b/gi, "leverage determined after review")
    .replace(
      /\bdeal-specific loan sizing\b/gi,
      "loan sizing determined after review",
    )
    .replace(
      /\ba deal-specific amount\b/gi,
      "loan sizing determined after review",
    );
  return output
    .split(/\r?\n/)
    .filter(
      (line) =>
        !(
          /\bHonolulu,\s*HI\b/i.test(line) ||
          (OFFER_NUMBER_PATTERN.test(line) &&
            !/\b(?:funded|closed|historical|example|market|Federal Reserve|FRED)\b/i.test(
              line,
            ))
        ),
    )
    .join("\n");
}

function transformUntilStable(source, transform, label) {
  let output = source;
  for (let pass = 0; pass < 6; pass += 1) {
    const next = transform(output);
    if (next === output) return output;
    output = next;
  }
  throw new Error(`${label} did not stabilize after six approval passes`);
}

async function collectHtml(directory, prefix = "") {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtml(target, relative)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative);
    }
  }
  return files;
}

export async function applyClientWebsiteApproval({
  root,
  preserveJsonLd = false,
}) {
  const rootEntries = await fs.readdir(root, { withFileTypes: true });
  const rootHtml = rootEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name);
  const postsRoot = path.join(root, "posts");
  const postHtml = await fs
    .stat(postsRoot)
    .then((stats) =>
      stats.isDirectory() ? collectHtml(postsRoot, "posts") : [],
    )
    .catch((error) => {
      if (error?.code === "ENOENT") return [];
      throw error;
    });
  const files = [...rootHtml, ...postHtml].sort();
  const llmsPath = path.join(root, "llms.txt");
  const hasLlms = await fs
    .stat(llmsPath)
    .then((stats) => stats.isFile())
    .catch((error) => {
      if (error?.code === "ENOENT") return false;
      throw error;
    });

  let changedFiles = 0;
  for (const relative of files) {
    const file = path.join(root, relative);
    const source = await fs.readFile(file, "utf8");
    const output = transformUntilStable(
      source,
      (value) => transformHtml(value, { preserveJsonLd }),
      relative,
    );
    if (output === source) continue;
    await fs.writeFile(file, output);
    changedFiles += 1;
  }

  if (hasLlms) {
    const source = await fs.readFile(llmsPath, "utf8");
    const output = transformUntilStable(source, transformText, "llms.txt");
    if (output !== source) {
      await fs.writeFile(llmsPath, output);
      changedFiles += 1;
    }
  }

  return { approvalDate: APPROVAL_DATE, changedFiles };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootFlagIndex = process.argv.indexOf("--root");
  const root =
    rootFlagIndex >= 0
      ? path.resolve(process.argv[rootFlagIndex + 1])
      : repoRoot;
  const result = await applyClientWebsiteApproval({ root });
  console.log(
    `Applied ${result.approvalDate} client website approval to ${result.changedFiles} public source file(s) under ${root}`,
  );
}
