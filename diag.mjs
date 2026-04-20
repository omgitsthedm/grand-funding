import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const pages = [
  ['home', '/'],
  ['products', '/products.html'],
  ['phoenix', '/phoenix-hard-money-lender.html'],
  ['contact', '/contact.html'],
  ['apply', '/apply.html'],
];
for (const [bp, cfg] of [['mobile', devices['iPhone 14 Pro']], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
  const ctx = await b.newContext(cfg);
  const p = await ctx.newPage();
  for (const [name, url] of pages) {
    try {
      await p.goto('https://www.grandfundingllc.com' + url + '?diag=' + Date.now(), { waitUntil: 'networkidle', timeout: 20000 });
      await p.waitForTimeout(1500);
      try { await p.click("button:has-text('Essential')", { timeout: 800 }); } catch (e) {}
      await p.waitForTimeout(300);
      await p.screenshot({ path: `/tmp/gf-diag/${name}-${bp}.png`, fullPage: true });
      const s = await p.evaluate(() => {
        const hscroll = document.documentElement.scrollWidth - window.innerWidth;
        const docH = document.documentElement.scrollHeight;
        const body = document.body;
        const font = getComputedStyle(body).fontFamily.split(',')[0].replace(/["']/g, '');
        const bg = getComputedStyle(body).backgroundColor;
        const icons = Array.from(document.querySelectorAll('.feature-icon,.service-icon,.product-icon,.reason-icon'));
        const iconSizes = icons.slice(0, 4).map(i => {
          const r = i.getBoundingClientRect();
          return `${Math.round(r.width)}x${Math.round(r.height)}`;
        });
        const footer = document.querySelector('.footer .footer-main,.footer-grid');
        const footerCols = footer ? getComputedStyle(footer).gridTemplateColumns : '?';
        // Check if premium-system is inlined
        const hasPremium = Array.from(document.querySelectorAll('style')).some(s => s.textContent.includes('GRAND FUNDING PREMIUM SYSTEM'));
        return { hscroll, docH, font, bg, iconSizes, footerCols, hasPremium };
      });
      console.log(`${name}-${bp}: docH=${s.docH}, hscroll=${s.hscroll}, font=${s.font}, bg=${s.bg}, premiumInline=${s.hasPremium}`);
      console.log(`  icons: ${JSON.stringify(s.iconSizes)}`);
      console.log(`  footer cols: ${s.footerCols}`);
    } catch (e) {
      console.log(`${name}-${bp}: ERROR ${e.message.slice(0, 80)}`);
    }
  }
  await ctx.close();
}
await b.close();
