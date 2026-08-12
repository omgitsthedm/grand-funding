import fs from 'node:fs/promises';
import path from 'node:path';

const CARE_STYLESHEET = '<link rel="stylesheet" href="/lifi-care.css">';
const CARE_BAR = `
<aside class="lf-care-bar" aria-label="Little Fight NYC design and care credit">
  <div class="lf-care-bar__inner">
    <a class="lf-care-bar__link" href="https://littlefightnyc.com/" rel="author">
      <span class="lf-tug-stage" aria-hidden="true">
        <img src="/images/lifi/mark-orange.svg" width="72" height="48" alt="">
      </span>
      <span class="lf-care-bar__credit">
        <span class="lf-care-bar__service">Designed, Built and Cared For By</span>
        <span class="lf-care-bar__brand" translate="no">LittleFightNYC.com</span>
      </span>
    </a>
  </div>
</aside>`;

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

export function injectCareBar(html, file) {
  if (!/<footer\b/i.test(html)) return null;
  if ((html.match(/class=["'][^"']*\blf-care-bar\b/i) || []).length) {
    throw new Error(`${file}: duplicate Little Fight care bar`);
  }
  if (!/<\/footer>/i.test(html)) throw new Error(`${file}: unclosed client footer`);

  let output = html;
  const landmarkSignature = [
    (output.match(/<main\b/gi) || []).length,
    (output.match(/<\/main>/gi) || []).length,
    (output.match(/<footer\b/gi) || []).length,
    (output.match(/<\/footer>/gi) || []).length
  ].join('/');

  output = output.replace(
    /<p\b[^>]*\bclass=["'][^"']*\bfooter-credit\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi,
    ''
  );
  output = output.replace(
    /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?LittleFightNYC\.com(?:(?!<\/p>)[\s\S])*?<\/p>/gi,
    ''
  );
  const finalLandmarkSignature = [
    (output.match(/<main\b/gi) || []).length,
    (output.match(/<\/main>/gi) || []).length,
    (output.match(/<footer\b/gi) || []).length,
    (output.match(/<\/footer>/gi) || []).length
  ].join('/');
  if (finalLandmarkSignature !== landmarkSignature) {
    throw new Error(`${file}: care-bar injection must preserve main/footer landmarks`);
  }
  if (!output.includes('/lifi-care.css')) {
    output = output.replace(/<\/head>/i, `${CARE_STYLESHEET}\n</head>`);
  }
  output = output.replace(/<\/footer>/i, `</footer>${CARE_BAR}`);

  for (const marker of [
    'Designed, Built and Cared For By',
    'https://littlefightnyc.com/',
    '/images/lifi/mark-orange.svg',
    'lf-care-bar'
  ]) {
    if (!output.includes(marker)) throw new Error(`${file}: missing care-bar marker ${marker}`);
  }
  if (/LittleFightNYC\.com<\/a>/i.test(output) || /target=["']_blank["'][^>]*>LittleFightNYC/i.test(output)) {
    throw new Error(`${file}: legacy Little Fight credit remains`);
  }
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
  if (pages < 1) throw new Error('Little Fight care bar was not installed on any public page');
  return { pages };
}
