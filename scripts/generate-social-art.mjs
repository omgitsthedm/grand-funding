#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'images', 'social');

const readDataUri = async (relativePath, mime) => {
  const data = await fs.readFile(path.join(ROOT, relativePath));
  return `data:${mime};base64,${data.toString('base64')}`;
};

const font = await readDataUri('fonts/dm-sans-var.woff2', 'font/woff2');
const desert = await readDataUri('images/social/desert-deal-route-v1.webp', 'image/webp');
const property = await readDataUri('images/ScottsdaleFundedcopy.webp', 'image/webp');
const logan = await readDataUri('images/logan/logan-portrait-720.webp', 'image/webp');

const cards = [
  {
    file: 'og-home-desert-deal-room-20260724.jpg',
    variant: 'home',
    image: desert,
    eyebrow: 'ARIZONA + CALIFORNIA',
    title: 'Private lending.<br>Direct decisions.',
    copy: 'Hard money loans for real estate investors.',
    footer: '$70K-$5M  /  24-hour decisions  /  3-5 day funding'
  },
  {
    file: 'og-funded-deals-20260724.jpg',
    variant: 'funded',
    image: property,
    eyebrow: 'FUNDED DEALS',
    title: 'Proof lives<br>in the close.',
    copy: 'Real properties. Real terms. Real closing timelines.',
    footer: 'ARIZONA + CALIFORNIA  /  VIEW THE DEAL FILES'
  },
  {
    file: 'og-logan-direct-lender-20260724.jpg',
    variant: 'logan',
    image: logan,
    eyebrow: 'THE DIRECT DESK',
    title: 'Talk to the person<br>who decides.',
    copy: 'Logan Sullivan  /  Founder & Direct Lender',
    footer: 'NMLS #2466872  /  AZ MLO #1048901'
  },
  {
    file: 'og-deal-desk-brief-20260724.jpg',
    variant: 'brief',
    image: desert,
    eyebrow: 'DEAL DESK BRIEF',
    title: 'Answers for the deal<br>in front of you.',
    copy: 'Practical guidance for Arizona and California investors.',
    footer: 'GRAND FUNDING LLC  /  DIRECT PRIVATE LENDER'
  }
];

const mark = `
  <svg viewBox="0 0 240 240" aria-hidden="true">
    <path fill="currentColor" fill-rule="evenodd" d="M32 32H208V184Q208 208 184 208H56Q32 208 32 184V32ZM56 56V184H184V152H120V128H184V56H56Z"/>
  </svg>`;

const htmlFor = card => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
@font-face{font-family:GrandSans;src:url("${font}") format("woff2");font-weight:100 1000;font-display:block}
*{box-sizing:border-box}
html,body{width:1200px;height:630px;margin:0;overflow:hidden;background:#06070b}
body{font-family:GrandSans,Arial,sans-serif;color:#f7f4ed}
.card{position:relative;width:1200px;height:630px;isolation:isolate;background:#080a0e;overflow:hidden}
.photo{position:absolute;inset:0;background-image:url("${card.image}");background-size:cover;background-position:center}
.wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,10,.97) 0%,rgba(5,7,10,.9) 48%,rgba(5,7,10,.25) 78%,rgba(5,7,10,.08) 100%)}
.grid{position:absolute;inset:0;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(90deg,#000,transparent 68%)}
.frame{position:absolute;inset:28px;border:1px solid rgba(244,247,255,.28)}
.ticks{position:absolute;left:28px;top:166px;width:8px;height:224px;border-top:1px solid #4fe3d2;border-bottom:1px solid #4fe3d2}
.ticks::before,.ticks::after{content:"";position:absolute;left:0;width:20px;height:1px;background:#4fe3d2}.ticks::before{top:72px}.ticks::after{bottom:72px}
.brand{position:absolute;left:70px;top:62px;display:flex;align-items:center;gap:15px;font-size:23px;font-weight:820;letter-spacing:-.02em}
.brand svg{width:42px;height:42px;color:#f7f4ed}
.brand small{font-size:12px;font-weight:700;letter-spacing:.17em;color:#aeb7c5}
.content{position:absolute;left:70px;top:164px;width:740px}
.eyebrow{font-size:16px;line-height:1;letter-spacing:.22em;font-weight:820;color:#4fe3d2;margin-bottom:24px}
h1{font-size:64px;line-height:.96;letter-spacing:-.048em;margin:0 0 25px;font-weight:760;text-wrap:balance}
.copy{font-size:23px;line-height:1.35;color:#dce2e8;max-width:620px}
.footer{position:absolute;left:70px;right:70px;bottom:60px;border-top:1px solid rgba(244,247,255,.3);padding-top:19px;font-size:14px;font-weight:760;letter-spacing:.13em;color:#e6b874}
.stamp{position:absolute;right:74px;top:70px;width:150px;height:150px;border:1px solid rgba(79,227,210,.48);border-radius:50%;display:grid;place-items:center;transform:rotate(7deg);color:#79eadf;font-weight:850;letter-spacing:.12em;text-align:center;font-size:13px;background:rgba(5,9,11,.52);backdrop-filter:blur(8px)}
.stamp::before{content:"";position:absolute;inset:8px;border:1px dashed rgba(79,227,210,.54);border-radius:50%}
.stamp span{position:relative}
.card.home .photo,.card.brief .photo{filter:saturate(.86) contrast(1.04)}
.card.home .wash,.card.brief .wash{background:linear-gradient(90deg,rgba(5,7,10,.94),rgba(5,7,10,.74) 56%,rgba(5,7,10,.28))}
.card.funded .photo{left:500px;background-position:center}
.card.funded .wash{background:linear-gradient(90deg,#06080b 0%,#06080b 45%,rgba(6,8,11,.83) 58%,rgba(6,8,11,.08) 100%)}
.card.funded .content{width:650px}
.card.logan .photo{left:690px;background-size:510px auto;background-position:center 17%;background-repeat:no-repeat;filter:grayscale(.08) contrast(1.03)}
.card.logan .wash{background:linear-gradient(90deg,#07090d 0%,#07090d 53%,rgba(7,9,13,.88) 66%,rgba(7,9,13,.12) 100%)}
.card.logan .content{width:720px}
.card.logan h1{font-size:59px}
.card.logan .stamp{right:34px;top:46px;width:124px;height:124px;font-size:11px}
.card.brief .content{width:790px}
.card.brief h1{font-size:60px}
</style>
</head>
<body>
<main class="card ${card.variant}">
  <div class="photo"></div><div class="wash"></div><div class="grid"></div><div class="frame"></div><div class="ticks"></div>
  <div class="brand">${mark}<span>Grand Funding <small>LLC</small></span></div>
  <div class="stamp"><span>DIRECT<br>LENDER<br>AZ + CA</span></div>
  <section class="content">
    <div class="eyebrow">${card.eyebrow}</div>
    <h1>${card.title}</h1>
    <div class="copy">${card.copy}</div>
  </section>
  <div class="footer">${card.footer}</div>
</main>
</body>
</html>`;

await fs.mkdir(OUTPUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1
});

try {
  for (const card of cards) {
    await page.setContent(htmlFor(card), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(OUTPUT, card.file),
      type: 'jpeg',
      quality: 92,
      fullPage: false
    });
    console.log(`Generated images/social/${card.file}`);
  }
} finally {
  await browser.close();
}
