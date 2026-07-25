#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const VERSION = "20260724";
const HOME_ORDER = [
  "hero",
  "trust-strip",
  "meet-logan",
  "products-overview-section",
  "loan-calc",
  "compare-section",
  "story-section",
  "faq-section",
  "testimonials-section",
  "featured-posts",
  "contact-section"
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tagRange(html, tagName, className) {
  const classPattern = escapeRegExp(className);
  const opening = new RegExp(
    `<${tagName}\\b(?=[^>]*\\bclass=(?:\"[^\"]*\\b${classPattern}\\b[^\"]*\"|'[^']*\\b${classPattern}\\b[^']*'))[^>]*>`,
    "i"
  ).exec(html);
  if (!opening || opening.index === undefined) {
    throw new Error(`Original-experience contract failed: missing ${tagName}.${className}`);
  }

  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tokenPattern.lastIndex = opening.index;
  let depth = 0;
  for (let token = tokenPattern.exec(html); token; token = tokenPattern.exec(html)) {
    if (token[0].startsWith("</")) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      return {
        start: opening.index,
        end: tokenPattern.lastIndex,
        html: html.slice(opening.index, tokenPattern.lastIndex)
      };
    }
  }
  throw new Error(`Original-experience contract failed: unclosed ${tagName}.${className}`);
}

function replaceRange(html, range, replacement) {
  return `${html.slice(0, range.start)}${replacement}${html.slice(range.end)}`;
}

function makeHeroIntentClear(hero) {
  hero = hero
    .replace(
      "40+ Years of Excellence",
      "Direct Private Lender · Arizona + California"
    )
    .replace(
      "<a class='btn btn-primary btn-lg' href='/apply'>Get Pre-Approved</a>",
      "<a class='btn btn-primary btn-lg' href='/apply' data-cta-intent='apply' data-cta-location='hero'>Tell Us About Your Deal</a>"
    )
    .replace(
      '<a aria-label="Call (602) 935-0371" class="btn btn-secondary btn-lg" href="tel:6029350371">',
      '<a aria-label="Under contract? Call Logan at (602) 935-0371" class="btn btn-secondary btn-lg" href="tel:6029350371" data-cta-intent="call" data-cta-location="hero">'
    )
    .replace(
      "</svg> (602) 935-0371</a></div><div class=\"hero-stats\">",
      "</svg> Under Contract? Call Logan</a></div><p class=\"hero-deadline-note\"><strong>Have a deadline?</strong> Call Logan directly. Still sizing the deal? Send the basics for real terms.</p><div class=\"hero-stats\">"
    )
    .replace("Grand Funding in Numbers", "Real Deals. Real Timelines.")
    .replace(
      "A snapshot of speed + flexibility across AZ &amp; CA.",
      "A verified snapshot of direct decisions across Arizona and California."
    )
    .replace(
      "<a class='btn btn-primary btn-lg' href='/apply'>Get Pre-Approved</a><div class=\"hero-visual-caption\">",
      "<a class='btn btn-primary btn-lg' href='/apply' data-cta-intent='apply' data-cta-location='hero-funded-panel'>Send Your Deal</a><div class=\"hero-visual-caption\">"
    );

  hero = hero.replace(
    /<div class="stat-number">/g,
    '<div class="stat-number" data-counter-done="1">'
  );
  hero = hero.replace(
    /<article(\s+aria-label="[^"]+"\s+class="loan-card")>([\s\S]*?)<\/article>/gi,
    '<a$1 href="/funded-deals" data-cta-intent="funded-proof" data-cta-location="hero-funded-panel">$2</a>'
  );

  const required = [
    "Direct Private Lender · Arizona + California",
    "Tell Us About Your Deal",
    "Under Contract? Call Logan",
    "Real Deals. Real Timelines.",
    "hero-deadline-note",
    'href="/funded-deals"'
  ];
  for (const marker of required) {
    if (!hero.includes(marker)) {
      throw new Error(`Original-experience contract failed: hero marker ${marker}`);
    }
  }
  return hero;
}

function sharpenHomepage(source) {
  const mainMatch = /<main\b[^>]*>[\s\S]*?<\/main>/i.exec(source);
  if (!mainMatch || mainMatch.index === undefined) {
    throw new Error("Original-experience contract failed: homepage main missing");
  }

  const main = mainMatch[0];
  const mainOpening = main.match(/^<main\b[^>]*>/i)?.[0];
  if (!mainOpening) {
    throw new Error("Original-experience contract failed: homepage main opening tag missing");
  }
  const sections = new Map();
  for (const className of HOME_ORDER) {
    const range = tagRange(main, "section", className);
    sections.set(className, className === "hero" ? makeHeroIntentClear(range.html) : range.html);
  }
  const rateStrip = tagRange(main, "aside", "rate-strip").html;

  const form = sections.get("contact-section")?.match(
    /<form\b(?=[^>]*\bname=["']pre-approval["'])[\s\S]*?<\/form>/i
  )?.[0];
  const calculator = sections.get("loan-calc")?.includes("data-loan-calc");
  if (!form || !calculator) {
    throw new Error("Original-experience contract failed: form or calculator missing");
  }

  let comparison = sections.get("compare-section");
  comparison = comparison.replace(
    /(<table\b[^>]*class="[^"]*\bcompare-table\b[^"]*"[^>]*>[\s\S]*?<\/table>)/i,
    '<div class="compare-table-scroll" role="region" aria-label="Grand Funding lender comparison" tabindex="0">$1</div><p class="compare-scroll-cue" aria-hidden="true">Swipe to compare →</p>'
  );
  if (!comparison.includes("compare-table-scroll")) {
    throw new Error("Original-experience contract failed: comparison table wrapper missing");
  }
  sections.set("compare-section", comparison);

  const refinedMain = [
    mainOpening.replace(/>$/, " data-original-home-refined>"),
    sections.get("hero"),
    rateStrip,
    ...HOME_ORDER.slice(1).map(className => sections.get(className)),
    "</main>"
  ].join("");

  return replaceRange(source, {
    start: mainMatch.index,
    end: mainMatch.index + mainMatch[0].length
  }, refinedMain);
}

function moveProductsHeroFirst(source) {
  const mainMatch = /<main\b[^>]*>[\s\S]*?<\/main>/i.exec(source);
  if (!mainMatch || mainMatch.index === undefined) {
    throw new Error("Original-experience contract failed: products main missing");
  }
  let main = mainMatch[0];
  const quiz = tagRange(main, "section", "quiz");
  const hero = tagRange(main, "section", "products-hero");
  if (hero.start < quiz.start) return source;

  main = `${main.slice(0, quiz.start)}${hero.html}${quiz.html}${main.slice(
    quiz.end,
    hero.start
  )}${main.slice(hero.end)}`;

  return replaceRange(source, {
    start: mainMatch.index,
    end: mainMatch.index + mainMatch[0].length
  }, main);
}

function removeRedundantProductsCta(source) {
  const mainMatch = /<main\b[^>]*>[\s\S]*?<\/main>/i.exec(source);
  if (!mainMatch || mainMatch.index === undefined) {
    throw new Error("Original-experience contract failed: products main missing");
  }

  let main = mainMatch[0];
  if (!main.includes("final-cta") || !main.includes("engagement-block")) {
    throw new Error(
      "Original-experience contract failed: products closeout flow missing"
    );
  }
  const duplicateCta = tagRange(main, "section", "cta-section");
  main = replaceRange(main, duplicateCta, "");

  return replaceRange(
    source,
    {
      start: mainMatch.index,
      end: mainMatch.index + mainMatch[0].length
    },
    main
  );
}

function repairBlogCardStructure(source) {
  const grid = tagRange(source, "div", "blog-grid");
  const firstArticle = tagRange(grid.html, "article", "blog-card");
  const articleLinks = [
    ...firstArticle.html.matchAll(
      /<a\b(?=[^>]*\bclass=(?:"[^"]*\bblog-card__link\b[^"]*"|'[^']*\bblog-card__link\b[^']*'))[^>]*>[\s\S]*?<\/a>/gi
    )
  ].map(match => match[0]);

  if (articleLinks.length === 1) return source;
  if (articleLinks.length !== 5) {
    throw new Error(
      `Original-experience contract failed: expected 5 nested lead blog links, found ${articleLinks.length}`
    );
  }

  const opening = firstArticle.html.match(/^<article\b[^>]*>/i)?.[0];
  if (!opening) {
    throw new Error(
      "Original-experience contract failed: lead blog article opening missing"
    );
  }
  const repairedLeadCards = articleLinks
    .map(link => `${opening}${link}</article>`)
    .join("");
  const repairedGrid = replaceRange(
    grid.html,
    firstArticle,
    repairedLeadCards
  );

  const articleOpenings = repairedGrid.match(
    /<article\b(?=[^>]*\bclass=(?:"[^"]*\bblog-card\b[^"]*"|'[^']*\bblog-card\b[^']*'))/gi
  )?.length ?? 0;
  const articleClosings = repairedGrid.match(/<\/article>/gi)?.length ?? 0;
  const cardLinks = repairedGrid.match(
    /<a\b(?=[^>]*\bclass=(?:"[^"]*\bblog-card__link\b[^"]*"|'[^']*\bblog-card__link\b[^']*'))/gi
  )?.length ?? 0;
  if (
    articleOpenings !== 18 ||
    articleClosings !== 18 ||
    cardLinks !== 18
  ) {
    throw new Error(
      `Original-experience contract failed: blog grid is not 18 direct card contracts (${articleOpenings}/${articleClosings}/${cardLinks})`
    );
  }

  return replaceRange(source, grid, repairedGrid);
}

function streamlineApplyFlow(source) {
  const cardRange = tagRange(source, "div", "apply-card");
  let card = cardRange.html;
  const compactCallout = tagRange(card, "div", "logan-sidebar");
  card = replaceRange(card, compactCallout, "");

  const detailedCallout = tagRange(card, "div", "talk-to-logan");
  const detailedHtml = detailedCallout.html;
  card = replaceRange(card, detailedCallout, "");

  const form = tagRange(card, "form", "apply-form");
  card = `${card.slice(0, form.end)}${detailedHtml}${card.slice(form.end)}`;

  const titleIndex = card.indexOf("apply-card__title");
  const formIndex = card.indexOf('class="apply-form"');
  const calloutIndex = card.indexOf('class="talk-to-logan"');
  if (
    titleIndex < 0 ||
    formIndex <= titleIndex ||
    calloutIndex <= formIndex ||
    card.includes('class="logan-sidebar"')
  ) {
    throw new Error(
      "Original-experience contract failed: apply form-first flow was not created"
    );
  }

  return replaceRange(source, cardRange, card);
}

function addContextualRouteLinks(source, relativeFile) {
  if (relativeFile === "products.html") {
    const constructionNeedle =
      "we understand the construction process and offer flexible draw schedules.</p><h3>Key Features</h3>";
    const constructionLinks =
      'we understand the construction process and offer flexible draw schedules.</p><p class="product-guide-links" data-route-links="construction"><strong>California project guides:</strong> <a href="/construction-loans-los-angeles">Los Angeles construction loans</a> <span aria-hidden="true">·</span> <a href="/construction-loans-san-diego">San Diego construction loans</a></p><h3>Key Features</h3>';
    const secondPositionNeedle =
      "Perfect when you have favorable first mortgage terms you want to keep.</p><h3>Key Features</h3>";
    const secondPositionLink =
      'Perfect when you have favorable first mortgage terms you want to keep.</p><p class="product-guide-links" data-route-links="second-position"><strong>Local guide:</strong> <a href="/second-position-loans-scottsdale">Scottsdale 2nd position loans</a></p><h3>Key Features</h3>';

    if (!source.includes('data-route-links="construction"')) {
      if (!source.includes(constructionNeedle)) {
        throw new Error(
          "Original-experience contract failed: construction guide placement missing"
        );
      }
      source = source.replace(constructionNeedle, constructionLinks);
    }
    if (!source.includes('data-route-links="second-position"')) {
      if (!source.includes(secondPositionNeedle)) {
        throw new Error(
          "Original-experience contract failed: second-position guide placement missing"
        );
      }
      source = source.replace(secondPositionNeedle, secondPositionLink);
    }
  }

  if (
    relativeFile === "blog.html" &&
    !source.includes('class="blog-resource-note"')
  ) {
    const faqNeedle = '<section class="section" id="hard-money-faq">';
    if (!source.includes(faqNeedle)) {
      throw new Error(
        "Original-experience contract failed: press resource placement missing"
      );
    }
    source = source.replace(
      faqNeedle,
      '<aside class="blog-resource-note" aria-label="Company news and media"><div class="container"><p>Looking for company news or media resources? <a href="/press">Visit the Grand Funding press room</a>.</p></div></aside>' +
        faqNeedle
    );
  }

  return source;
}

function injectAssets(html) {
  if (!html.includes("/original-refinement.css")) {
    html = html.replace(
      "</head>",
      `<link rel="stylesheet" href="/original-refinement.css?v=${VERSION}">\n</head>`
    );
  }
  if (!html.includes("/original-refinement.js")) {
    html = html.replace(
      "</body>",
      `<script defer src="/original-refinement.js?v=${VERSION}"></script>\n</body>`
    );
  }
  return html;
}

function useNativeFaqButtons(html) {
  return html.replace(
    /<div\b([^>]*\bclass=(?:"[^"]*\bfaq-question\b[^"]*"|'[^']*\bfaq-question\b[^']*')[^>]*)>([\s\S]*?)<\/div>(?=<div\b[^>]*\bclass=(?:"[^"]*\bfaq-answer\b[^"]*"|'[^']*\bfaq-answer\b[^']*'))/gi,
    (_, attributes, content) => {
      const normalizedAttributes = attributes
        .replace(/\srole=(?:"button"|'button')/i, "")
        .replace(/\stabindex=(?:"0"|'0')/i, "");
      const normalizedContent = content
        .replace(/<h3\b[^>]*>/i, '<span class="faq-question-title" role="heading" aria-level="3">')
        .replace(/<\/h3>/i, "</span>");
      return `<button type="button"${normalizedAttributes}>${normalizedContent}</button>`;
    }
  );
}

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

export async function refineOriginalExperience({ dist }) {
  const htmlFiles = (await walk(dist)).filter(file => file.endsWith(".html"));
  for (const file of htmlFiles) {
    const relative = path.relative(dist, file).split(path.sep).join("/");
    let html = await fs.readFile(file, "utf8");
    if (relative === "index.html") html = sharpenHomepage(html);
    if (relative === "products.html") {
      html = moveProductsHeroFirst(html);
      html = removeRedundantProductsCta(html);
    }
    if (relative === "blog.html") html = repairBlogCardStructure(html);
    if (relative === "apply.html") html = streamlineApplyFlow(html);
    html = addContextualRouteLinks(html, relative);
    html = useNativeFaqButtons(html);
    html = injectAssets(html);
    await fs.writeFile(file, html);
  }
}
