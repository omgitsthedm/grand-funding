#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const HOME_ORDER = [
  "hero",
  "trust-strip",
  "meet-logan",
  "loan-calc",
  "products-overview-section",
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

function contentHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

async function assetVersions(dist) {
  const versions = new Map();
  for (const entry of await fs.readdir(dist, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(?:css|js)$/i.test(entry.name)) continue;
    versions.set(
      entry.name,
      contentHash(await fs.readFile(path.join(dist, entry.name)))
    );
  }
  return versions;
}

function versionLocalAssets(html, versions) {
  for (const [name, version] of versions) {
    const asset = escapeRegExp(name);
    html = html.replace(
      new RegExp(`([\"'])/${asset}(?:\\?v=[^\"']*)?\\1`, "gi"),
      (_, quote) => `${quote}/${name}?v=${version}${quote}`
    );
  }
  return html;
}

function stripMarkup(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
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
      '<div aria-hidden="true" class="hero-media"><video',
      '<div aria-hidden="true" class="hero-media"><img class="hero-fallback" src="/images/arizona-hero-poster.webp" alt="" width="1920" height="1080" decoding="async" fetchpriority="high" aria-hidden="true"><video'
    )
    .replace(
      "40+ Years of Excellence",
      "Arizona + California Deal Desk"
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
      "Explore the financing scenarios behind the numbers."
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
    /<article\s+aria-label="[^"]+"\s+(class="loan-card")>([\s\S]*?)<\/article>/gi,
    '<a $1 href="/funded-deals" data-cta-intent="funded-proof" data-cta-location="hero-funded-panel">$2</a>'
  );

  const required = [
    "Arizona + California Deal Desk",
    "Tell Us About Your Deal",
    "Under Contract? Call Logan",
    "Real Deals. Real Timelines.",
    "hero-deadline-note",
    "hero-fallback",
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
  const calculator = sections.get("loan-calc")?.includes("data-project-calc");
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

  const refinedHero = hero.html
    .replace(
      "Comprehensive Lending Solutions",
      "Start With the Deal. Then Choose the Structure.",
    )
    .replace(
      "Flexible financing options designed for real estate investors and builders",
      "Compare common real estate financing scenarios. Final structure, requirements, and terms follow direct transaction review.",
    );
  const refinedQuiz = quiz.html
    .replace("Loan Finder · 60 Seconds", "Scenario Desk · 60 Seconds")
    .replace(
      "Not sure which product fits?",
      "What does the property need next?",
    )
    .replace(
      "Three quick questions and we'll point you to the right loan. Logan can confirm in a 5-minute call.",
      "Use three transaction questions to narrow the starting point. Grand Funding confirms the appropriate structure only after reviewing the specific deal.",
    );

  main = `${main.slice(0, quiz.start)}${refinedHero}${refinedQuiz}${main.slice(
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

function simplifyBlogToolbar(source) {
  const toolbar = tagRange(source, "div", "blog-toolbar");
  const redundantCta =
    /<a\b(?=[^>]*\bclass=(?:"[^"]*\bghost-btn\b[^"]*"|'[^']*\bghost-btn\b[^']*'))[^>]*href=(?:"\/apply(?:\.html)?"|'\/apply(?:\.html)?')[^>]*>[\s\S]*?<\/a>/i;
  if (!redundantCta.test(toolbar.html)) {
    throw new Error(
      "Original-experience contract failed: blog toolbar CTA missing"
    );
  }
  const refinedToolbar = toolbar.html.replace(redundantCta, "");
  return replaceRange(source, toolbar, refinedToolbar);
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
      "Construction and rehabilitation draw structure, milestones, inspections, and timing are determined for the specific project and are disclosed in writing.</p><h3>Key Features</h3>";
    const constructionLinks =
      'Construction and rehabilitation draw structure, milestones, inspections, and timing are determined for the specific project and are disclosed in writing.</p><p class="product-guide-links" data-route-links="construction"><strong>California project guides:</strong> <a href="/construction-loans-los-angeles">Los Angeles construction loans</a> <span aria-hidden="true">·</span> <a href="/construction-loans-san-diego">San Diego construction loans</a></p><h3>Key Features</h3>';
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

function enhanceLeadForms(html) {
  return html.replace(
    /<form\b[^>]*>[\s\S]*?<\/form>/gi,
    form => {
      const opening = form.match(/^<form\b[^>]*>/i)?.[0] || "";
      const name =
        /\bname=(?:"([^"]+)"|'([^']+)')/i.exec(opening)?.slice(1).find(Boolean) ||
        "";
      if (!["pre-approval", "contact"].includes(name)) return form;

      const kind = name === "contact" ? "contact" : "application";
      const label = kind === "contact" ? "Send Message" : "Send Deal Details";
      let refined = form.replace(
        opening,
        opening.replace(
          />$/,
          ` data-gf-lead-form data-form-kind="${kind}">`
        )
      );

      const submitPattern =
        /<button\b([^>]*\btype=(?:"submit"|'submit')[^>]*)>[\s\S]*?<\/button>/i;
      if (!submitPattern.test(refined)) {
        throw new Error(
          `Original-experience contract failed: ${name} submit button missing`
        );
      }
      refined = refined.replace(
        submitPattern,
        (_, attributes) => {
          const normalized = attributes.replace(
            /\sdata-submit-label=(?:"[^"]*"|'[^']*')/i,
            ""
          );
          return `<button${normalized} data-submit-label="${label}">${label}</button>`;
        }
      );

      if (!refined.includes("data-form-status")) {
        refined = refined.replace(
          "</form>",
          '<p class="form-status" data-form-status role="status" aria-live="polite" aria-atomic="true"></p></form>'
        );
      }
      return refined;
    }
  );
}

function removeUnconfirmedLeadTracking(html, relativeFile) {
  if (!/^thanks(?:-contact)?\.html$/.test(relativeFile)) return html;

  html = html.replace(
    /gtag\((?:"event"|'event'),(?:"generate_lead"|'generate_lead'),\{[^}]*\}\);?/gi,
    ""
  );
  html = html.replace(
    /<script>\s*window\.addEventListener\((?:"load"|'load'),function\(\)\{if\(typeof gfLeadConversion===["']function["']\)\{gfLeadConversion\(\);\}\}\);\s*<\/script>/gi,
    ""
  );

  let seenTagManagerFallback = false;
  html = html.replace(
    /<noscript\b[^>]*>[\s\S]*?googletagmanager\.com\/ns\.html\?id=GTM-M36VM2VG[\s\S]*?<\/noscript>/gi,
    block => {
      if (seenTagManagerFallback) return "";
      seenTagManagerFallback = true;
      return block;
    }
  );

  if (/generate_lead|gfLeadConversion\(\)/i.test(html)) {
    throw new Error(
      `Original-experience contract failed: unconfirmed lead tracking remains in ${relativeFile}`
    );
  }
  return html;
}

function improveAccessibleTables(html, relativeFile) {
  const documentTitle = stripMarkup(
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ||
      "Grand Funding lending information"
  );
  let tableIndex = 0;

  html = html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, table => {
    tableIndex += 1;
    let refined = table;
    if (!/<caption\b/i.test(refined)) {
      const opening = refined.match(/^<table\b[^>]*>/i)?.[0];
      if (!opening) return refined;
      const label =
        relativeFile === "disclosures.html"
          ? "Grand Funding loan program terms and lending disclosures"
          : `${documentTitle} comparison table ${tableIndex}`;
      refined = refined.replace(
        opening,
        `${opening}<caption class="visually-hidden">${label}</caption>`
      );
    }

    refined = refined.replace(
      /<thead\b[^>]*>[\s\S]*?<\/thead>/gi,
      head =>
        head.replace(/<th\b([^>]*)>([\s\S]*?)<\/th>/gi, (_, attributes, content) => {
          let normalized = attributes;
          if (!/\bscope=/i.test(normalized)) normalized += ' scope="col"';
          if (!stripMarkup(content) && !/\baria-label=/i.test(normalized)) {
            normalized += ' aria-label="Comparison factor"';
          }
          return `<th${normalized}>${content}</th>`;
        })
    );
    return refined;
  });

  if (relativeFile.startsWith("compare-")) {
    html = html.replace(
      /<h3\b([^>]*)>(Not sure which fits your deal\?)<\/h3>/i,
      "<h2$1>$2</h2>"
    );
  }
  return html;
}

function injectAssets(html, versions) {
  const stylesheetVersion = versions.get("original-refinement.css");
  const scriptVersion = versions.get("original-refinement.js");
  if (!stylesheetVersion || !scriptVersion) {
    throw new Error("Original-experience contract failed: refinement asset hash missing");
  }
  if (!html.includes("/original-refinement.css")) {
    html = html.replace(
      "</head>",
      `<link rel="stylesheet" href="/original-refinement.css?v=${stylesheetVersion}">\n</head>`
    );
  }
  if (!/rel=["']alternate["'][^>]*type=["']application\/rss\+xml["']/i.test(html)) {
    html = html.replace(
      "</head>",
      '<link rel="alternate" type="application/rss+xml" title="Grand Funding Investor Guides" href="https://www.grandfundingllc.com/feed.xml">\n</head>'
    );
  }
  if (!html.includes("/original-refinement.js")) {
    html = html.replace(
      "</body>",
      `<script defer src="/original-refinement.js?v=${scriptVersion}"></script>\n</body>`
    );
  }
  return versionLocalAssets(html, versions);
}

function useNativeFaqButtons(html) {
  let index = 0;
  const nativeButtons = html.replace(
    /<div\b([^>]*\bclass=(?:"[^"]*\bfaq-question\b[^"]*"|'[^']*\bfaq-question\b[^']*')[^>]*)>([\s\S]*?)<\/div>(?=<div\b[^>]*\bclass=(?:"[^"]*\bfaq-answer\b[^"]*"|'[^']*\bfaq-answer\b[^']*'))/gi,
    (_, attributes, content) => {
      const normalizedAttributes = attributes
        .replace(/\srole=(?:"button"|'button')/i, "")
        .replace(/\stabindex=(?:"0"|'0')/i, "")
        .replace(/\saria-expanded=(?:"[^"]*"|'[^']*')/i, "")
        .replace(/\saria-controls=(?:"[^"]*"|'[^']*')/i, "")
        .replace(/\sid=(?:"[^"]*"|'[^']*')/i, "");
      const normalizedContent = content
        .replace(/<h3\b[^>]*>/i, '<span class="faq-question-title" role="heading" aria-level="3">')
        .replace(/<\/h3>/i, "</span>");
      index += 1;
      return `<button type="button"${normalizedAttributes} id="faq-question-${index}" aria-expanded="false" aria-controls="faq-answer-${index}">${normalizedContent}</button>`;
    }
  );

  let answerIndex = 0;
  const linkedDisclosures = nativeButtons.replace(
    /(<button\b[^>]*\bclass=(?:"[^"]*\bfaq-question\b[^"]*"|'[^']*\bfaq-question\b[^']*')[^>]*\bid=(?:"faq-question-(\d+)"|'faq-question-(\d+)')[^>]*>[\s\S]*?<\/button>)(\s*)<div\b([^>]*\bclass=(?:"[^"]*\bfaq-answer\b[^"]*"|'[^']*\bfaq-answer\b[^']*')[^>]*)>/gi,
    (_, button, doubleQuotedIndex, singleQuotedIndex, whitespace, attributes) => {
      const questionIndex = Number(doubleQuotedIndex || singleQuotedIndex);
      answerIndex += 1;
      if (questionIndex !== answerIndex) {
        throw new Error(
          "Original-experience contract failed: FAQ question/answer order drifted"
        );
      }
      const normalizedAttributes = attributes
        .replace(/\sid=(?:"[^"]*"|'[^']*')/i, "")
        .replace(/\srole=(?:"[^"]*"|'[^']*')/i, "")
        .replace(/\saria-labelledby=(?:"[^"]*"|'[^']*')/i, "")
        .replace(/\shidden(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/i, "");
      return `${button}${whitespace}<div${normalizedAttributes} id="faq-answer-${questionIndex}" role="region" aria-labelledby="faq-question-${questionIndex}" hidden>`;
    }
  );

  if (index !== answerIndex) {
    throw new Error(
      `Original-experience contract failed: FAQ disclosure mismatch (${index}/${answerIndex})`
    );
  }
  return linkedDisclosures;
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
  const versions = await assetVersions(dist);
  for (const file of htmlFiles) {
    const relative = path.relative(dist, file).split(path.sep).join("/");
    let html = await fs.readFile(file, "utf8");
    if (relative === "index.html") html = sharpenHomepage(html);
    if (relative === "products.html") {
      html = moveProductsHeroFirst(html);
      html = removeRedundantProductsCta(html);
    }
    if (relative === "blog.html") {
      html = repairBlogCardStructure(html);
      html = simplifyBlogToolbar(html);
    }
    if (relative === "apply.html") html = streamlineApplyFlow(html);
    html = addContextualRouteLinks(html, relative);
    html = useNativeFaqButtons(html);
    html = enhanceLeadForms(html);
    html = removeUnconfirmedLeadTracking(html, relative);
    html = improveAccessibleTables(html, relative);
    html = injectAssets(html, versions);
    await fs.writeFile(file, html);
  }
}
