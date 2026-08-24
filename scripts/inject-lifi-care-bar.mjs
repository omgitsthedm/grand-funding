import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Little Fight NYC credit mark.
 * One compact animated tugboat line at the bottom of every footer, filled into
 * the `data-lfc` slot the page ships with. Replaces the old full-width care bar
 * and carries no webfonts of its own.
 * Canonical source: agency-ops/templates/lifi-credit/
 */
const CARE_STYLESHEET = '<link rel="stylesheet" href="/lifi-care.css">';
const CREDIT = `<a class="lfc" href="https://littlefightnyc.com" target="_blank" rel="noopener noreferrer"><span class="lfc-boat" aria-hidden="true"><span class="lfc-hull"><svg class="lfc-mark" viewBox="0 0 838.016418 562.406218" xmlns="http://www.w3.org/2000/svg" focusable="false"><g transform="translate(-297.159815,611.589160) scale(0.1,-0.1)"><path d="M6050 6114 c-317 -39 -527 -140 -620 -299 -42 -70 -38 -357 6 -506 17 -57 20 -58 111 -24 189 70 312 107 448 136 128 27 475 30 623 5 51 -8 99 -13 107 -9 18 6 20 85 5 195 -5 40 -14 105 -19 145 -30 230 -198 349 -506 358 -66 2 -136 1 -155 -1z"/><path d="M8860 5354 c-152 -16 -582 -54 -908 -79 -326 -25 -534 -168 -639 -439 -32 -82 -44 -234 -41 -541 4 -311 -2 -337 -84 -409 -50 -43 -86 -59 -165 -72 -39 -6 -43 -4 -61 26 -11 17 -22 48 -26 68 -20 126 -56 422 -61 507 -4 55 -13 143 -20 195 -7 52 -16 129 -20 170 -9 103 -32 235 -45 259 -42 80 -614 120 -811 57 -24 -8 -91 -29 -149 -47 -134 -41 -282 -112 -315 -150 -29 -35 -33 -95 -14 -208 5 -35 16 -132 24 -215 17 -180 51 -493 65 -591 16 -115 13 -189 -8 -208 -27 -24 -99 -35 -281 -42 -343 -12 -525 -91 -693 -297 -135 -166 -174 -337 -158 -685 9 -192 11 -198 52 -212 67 -24 1232 -9 1543 19 61 5 184 14 275 20 150 10 459 46 585 69 28 5 79 12 115 16 65 6 161 23 295 52 39 8 90 19 115 24 97 20 147 56 337 243 222 219 296 271 461 331 72 26 224 60 312 69 30 4 87 13 125 21 146 30 243 47 330 61 50 7 144 25 210 39 66 14 149 30 185 36 36 5 117 21 180 36 63 14 150 34 192 43 42 9 84 22 92 30 20 16 21 104 2 260 -8 63 -17 178 -21 255 -3 77 -10 176 -15 220 -5 44 -14 145 -20 225 -16 204 -41 324 -90 422 -97 193 -244 318 -461 394 -73 25 -281 40 -389 28z m420 -582 c59 -26 108 -75 136 -137 26 -58 59 -299 70 -510 10 -189 2 -200 -141 -215 -44 -4 -125 -13 -180 -19 -55 -6 -149 -15 -210 -21 -60 -5 -155 -15 -210 -21 -154 -16 -212 -3 -275 63 -41 45 -59 109 -71 267 -17 213 -9 347 23 396 83 127 183 168 478 195 69 6 152 15 185 20 80 11 140 6 195 -18z"/><path d="M10910 3414 c-30 -7 -118 -25 -195 -39 -77 -14 -174 -32 -215 -40 -173 -34 -250 -48 -340 -60 -52 -8 -149 -25 -215 -40 -66 -14 -149 -30 -185 -36 -36 -5 -94 -16 -130 -24 -177 -40 -249 -55 -290 -60 -25 -3 -74 -12 -110 -20 -116 -25 -223 -46 -310 -60 -47 -7 -107 -18 -135 -24 -105 -22 -213 -42 -300 -56 -219 -34 -315 -90 -490 -286 -107 -119 -155 -162 -249 -223 -74 -49 -231 -113 -316 -131 -206 -42 -369 -72 -450 -80 -30 -3 -100 -12 -155 -20 -153 -22 -452 -53 -625 -65 -85 -6 -202 -15 -259 -20 -506 -45 -1428 -36 -2266 22 -479 33 -451 32 -522 13 -190 -52 -231 -306 -122 -761 16 -66 36 -138 44 -160 9 -21 22 -52 28 -69 53 -134 166 -309 251 -389 158 -147 285 -213 506 -262 122 -27 888 -35 3235 -31 2488 3 2311 -1 2575 61 176 41 267 74 427 155 376 187 669 473 900 876 78 137 179 375 198 465 4 19 22 87 40 150 103 364 149 896 92 1058 -27 76 -65 126 -117 152 -47 24 -210 27 -300 4z m-515 -678 c32 -14 72 -46 107 -85 51 -57 58 -69 69 -132 26 -144 -23 -264 -136 -333 -47 -29 -55 -31 -155 -31 -100 0 -108 2 -155 31 -209 128 -187 444 38 549 71 33 163 34 232 1z"/></g></svg><span class="lfc-beacon"></span></span><span class="lfc-sea"><svg class="lfc-wave lfc-wave--back" viewBox="0 0 48 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path vector-effect="non-scaling-stroke" d="M-20 5.6q4-1.8 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0"/></svg><svg class="lfc-wave" viewBox="0 0 48 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><path vector-effect="non-scaling-stroke" d="M-16 4q4-2.5 8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0t8 0"/></svg></span></span><span class="lfc-text">Made by <span class="lfc-name">Little Fight NYC</span></span></a>`;

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

const signature = html => [
  (html.match(/<main\b/gi) || []).length,
  (html.match(/<\/main>/gi) || []).length,
  (html.match(/<footer\b/gi) || []).length,
  (html.match(/<\/footer>/gi) || []).length
].join('/');

export function injectCareBar(html, file) {
  if (!/<footer\b/i.test(html)) return null;
  if ((html.match(/class=["'][^"']*\blfc\b/i) || []).length) {
    throw new Error(`${file}: duplicate Little Fight credit mark`);
  }
  if (!/<\/footer>/i.test(html)) throw new Error(`${file}: unclosed client footer`);
  if (!/<div class="footer-credit" data-lfc><\/div>/.test(html)) {
    throw new Error(`${file}: Little Fight credit slot is missing`);
  }

  const before = signature(html);
  let output = html;

  // Strip every legacy credit shape before writing the current one.
  output = output.replace(/<aside class="lf-care-bar"[\s\S]*?<\/aside>/gi, '');
  output = output.replace(
    /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?LittleFightNYC\.com(?:(?!<\/p>)[\s\S])*?<\/p>/gi,
    ''
  );
  output = output.replace(
    '<div class="footer-credit" data-lfc></div>',
    `<div class="footer-credit">${CREDIT}</div>`
  );

  if (signature(output) !== before) {
    throw new Error(`${file}: credit injection must preserve main/footer landmarks`);
  }
  if (!output.includes('/lifi-care.css')) {
    output = output.replace(/<\/head>/i, `${CARE_STYLESHEET}\n</head>`);
  }

  for (const marker of ['class="lfc"', 'lfc-beacon', 'Made by', 'Little Fight NYC', 'https://littlefightnyc.com']) {
    if (!output.includes(marker)) throw new Error(`${file}: missing credit marker ${marker}`);
  }
  if (/Designed,\s*(?:Hosted|Built)\s*and\s*Cared\s*For\s*[Bb]y/i.test(output)) {
    throw new Error(`${file}: legacy Little Fight credit remains`);
  }
  if (output.includes('data-lfc')) throw new Error(`${file}: unfilled Little Fight credit slot`);
  return output;
}

export async function injectLifiCareBar({ dist }) {
  const htmlFiles = (await walk(dist)).filter(file => file.endsWith('.html')).sort();
  let pages = 0;
  for (const file of htmlFiles) {
    const source = await fs.readFile(file, 'utf8');
    const output = injectCareBar(source, path.relative(dist, file));
    if (output === null) continue;
    await fs.writeFile(file, output);
    pages += 1;
  }
  if (pages < 1) throw new Error('Little Fight credit mark was not installed on any public page');
  return { pages };
}
