import fs from 'node:fs/promises';
import path from 'node:path';

export async function hardenAnalytics({ dist }) {
  const walk = async directory => {
    const files = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(file));
      else if (file.endsWith('.html')) files.push(file);
    }
    return files;
  };
  let loadersRemoved = 0;
  for (const file of await walk(dist)) {
    let html = await fs.readFile(file, 'utf8');
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, block => {
      if (/googletagmanager\.com\/(?:gtm\.js|gtag\/js)/.test(block) || /\bgtag\s*\(/.test(block)) {
        loadersRemoved++;
        return '';
      }
      return block;
    });
    html = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, block => /googletagmanager\.com/.test(block) ? '' : block);
    const canonicalTag = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i.exec(html)?.[0] || '';
    const canonical = /\bhref=["']([^"']+)["']/i.exec(canonicalTag)?.[1];
    if (canonical?.startsWith('https://www.grandfundingllc.com/')) {
      const route = new URL(canonical).pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
      if (!/^\/[a-z0-9/_-]*$/.test(route)) throw new Error('Unexpected analytics route: ' + route);
      html = html.replace('</head>', '<meta name="gf-analytics-path" content="' + route + '"></head>');
    }
    html = html.replace('We use cookies to improve your experience and measure marketing performance. Essential cookies are always on. You can accept all cookies or continue with essential only.', 'Optional usage analytics stays off until you choose Allow analytics. Advertising tracking is off. Change your choice at any time through Analytics settings in the footer.');
    html = html.replace(/(data-consent="all">)Accept all(<\/button>)/g, '$1Allow analytics$2');
    html = html.replace(/(data-consent="essential">)Essential only(<\/button>)/g, '$1Keep analytics off$2');
    await fs.writeFile(file, html);
  }
  if (!loadersRemoved) throw new Error('Expected legacy analytics loaders were not found');
  return { loadersRemoved };
}
