#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const socialDir = join(projectRoot, "images", "social");
const sourceDir = join(projectRoot, "design-assets", "social");
const fontSource = join(projectRoot, "fonts", "dm-sans-var.woff2");
const brandMark = join(
  projectRoot,
  "images",
  "brand",
  "grand-funding-mark-teal.svg",
);
const loganPortrait = join(
  projectRoot,
  "images",
  "logan",
  "logan-portrait-720.jpg",
);

const assets = {
  fundedDealsSource: join(sourceDir, "funded-deals-background.png"),
  investorGuidesSource: join(sourceDir, "investor-guides-background.png"),
  fundedDeals: join(socialDir, "funded-deals-20260724.jpg"),
  loganDirect: join(socialDir, "logan-direct-lender-20260727.jpg"),
  investorGuides: join(socialDir, "investor-guides-20260724.jpg"),
  loanPrograms: join(socialDir, "loan-programs-20260725.jpg"),
  marketLending: join(
    socialDir,
    "arizona-california-lending-20260725.jpg",
  ),
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} failed (${result.status}):\n${details}`);
  }

  return result.stdout.trim();
}

function assertInputs() {
  const required = [
    fontSource,
    brandMark,
    loganPortrait,
    assets.fundedDealsSource,
    assets.investorGuidesSource,
  ];

  const missing = required.filter((file) => !existsSync(file));
  if (missing.length) {
    throw new Error(`Missing required source assets:\n${missing.join("\n")}`);
  }
}

function addBrandAndType(args, font, mark, titleLines, subtitle) {
  args.push(
    "-gravity",
    "NorthWest",
    "(",
    mark,
    "-resize",
    "54x54",
    ")",
    "-geometry",
    "+68+58",
    "-compose",
    "over",
    "-composite",
    "-font",
    font,
    "-gravity",
    "NorthWest",
    "-fill",
    "#F4F7FF",
    "-weight",
    "650",
    "-pointsize",
    "21",
    "-kerning",
    "3.4",
    "-annotate",
    "+138+69",
    "GRAND FUNDING",
    "-stroke",
    "#4FE3D2",
    "-strokewidth",
    "4",
    "-draw",
    `line 70,${titleLines.length === 1 ? 226 : 208} 70,${
      titleLines.length === 1 ? 392 : 407
    }`,
    "-stroke",
    "none",
  );

  const titleSize = titleLines.length === 1 ? "82" : "68";
  const titleStartY = titleLines.length === 1 ? 225 : 205;
  const titleStep = titleLines.length === 1 ? 0 : 77;

  titleLines.forEach((line, index) => {
    args.push(
      "-fill",
      "#F4F7FF",
      "-weight",
      "750",
      "-pointsize",
      titleSize,
      "-kerning",
      "-1.1",
      "-annotate",
      `+94+${titleStartY + titleStep * index}`,
      line,
    );
  });

  args.push(
    "-fill",
    "#F0B26B",
    "-weight",
    "520",
    "-pointsize",
    "26",
    "-kerning",
    "0",
    "-annotate",
    `+96+${titleLines.length === 1 ? 347 : 384}`,
    subtitle,
    "-fill",
    "#4FE3D2",
    "-draw",
    "roundrectangle 68,555 155,559 2,2",
    "-fill",
    "#F0B26B",
    "-draw",
    "roundrectangle 164,555 194,559 2,2",
  );
}

function generateScenicPoster({
  source,
  output,
  titleLines,
  subtitle,
  focalPoint = "center",
}) {
  const args = [
    source,
    "-resize",
    "1200x630^",
    "-gravity",
    focalPoint,
    "-extent",
    "1200x630",
    "-colorspace",
    "sRGB",
    "-modulate",
    "96,92,100",
    "(",
    "-size",
    "630x1200",
    "gradient:#07080bFA-#07080b0D",
    "-rotate",
    "-90",
    ")",
    "-compose",
    "over",
    "-composite",
    "(",
    "-size",
    "1200x630",
    "gradient:#07080b00-#07080b99",
    ")",
    "-compose",
    "over",
    "-composite",
  ];

  addBrandAndType(args, temporaryFont, temporaryMark, titleLines, subtitle);

  args.push(
    "-sampling-factor",
    "4:2:0",
    "-strip",
    "-interlace",
    "Plane",
    "-quality",
    "91",
    output,
  );

  run("magick", args);
}

function generateLoganPoster(output) {
  const portraitCrop = join(temporaryDir, "logan-crop.jpg");

  run("magick", [
    loganPortrait,
    "-resize",
    "700x1050!",
    "-gravity",
    "North",
    "-crop",
    "700x630+0+70",
    "+repage",
    "-modulate",
    "96,90,100",
    portraitCrop,
  ]);

  const args = [
    "-size",
    "1200x630",
    "xc:#07080B",
    portraitCrop,
    "-geometry",
    "+500+0",
    "-compose",
    "over",
    "-composite",
    "(",
    "-size",
    "630x1200",
    "gradient:#07080bFF-#07080b12",
    "-rotate",
    "-90",
    ")",
    "-compose",
    "over",
    "-composite",
    "(",
    "-size",
    "1200x630",
    "gradient:#07080b00-#07080b8A",
    ")",
    "-compose",
    "over",
    "-composite",
  ];

  addBrandAndType(
    args,
    temporaryFont,
    temporaryMark,
    ["Talk Directly", "to the Lender"],
    "Logan Sullivan · Founder",
  );

  args.push(
    "-sampling-factor",
    "4:2:0",
    "-strip",
    "-interlace",
    "Plane",
    "-quality",
    "91",
    output,
  );

  run("magick", args);
}

assertInputs();
mkdirSync(socialDir, { recursive: true });

const temporaryDir = mkdtempSync(join(tmpdir(), "grand-social-art-"));
const temporaryWoff = join(temporaryDir, "dm-sans-var.woff2");
const temporaryFont = join(temporaryDir, "dm-sans-var.ttf");
const temporaryMark = join(temporaryDir, "grand-funding-mark.png");

try {
  copyFileSync(fontSource, temporaryWoff);
  run("woff2_decompress", [temporaryWoff]);
  run("magick", [
    "-background",
    "none",
    brandMark,
    "-resize",
    "108x108",
    temporaryMark,
  ]);

  generateScenicPoster({
    source: assets.fundedDealsSource,
    output: assets.fundedDeals,
    titleLines: ["Funded Deals"],
    subtitle: "Direct private lending · Arizona + California",
  });

  generateLoganPoster(assets.loganDirect);

  generateScenicPoster({
    source: assets.investorGuidesSource,
    output: assets.investorGuides,
    titleLines: ["Investor Guides"],
    subtitle: "Clear answers before the deadline.",
  });

  generateScenicPoster({
    source: assets.investorGuidesSource,
    output: assets.loanPrograms,
    titleLines: ["Loan Programs"],
    subtitle: "Explore financing by property and project.",
  });

  generateScenicPoster({
    source: assets.fundedDealsSource,
    output: assets.marketLending,
    titleLines: ["Arizona +", "California"],
    subtitle: "Business-purpose real estate lending.",
  });

  for (const output of [
    assets.fundedDeals,
    assets.loganDirect,
    assets.investorGuides,
    assets.loanPrograms,
    assets.marketLending,
  ]) {
    const dimensions = run("magick", [
      "identify",
      "-format",
      "%m %wx%h",
      output,
    ]);
    if (dimensions !== "JPEG 1200x630") {
      throw new Error(`Unexpected output for ${output}: ${dimensions}`);
    }
    console.log(`${output}: ${dimensions}`);
  }
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
}
