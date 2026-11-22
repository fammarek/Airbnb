// Erzeugt gaestehandbuch.pdf aus index.html (Druckansicht, A4).
// Aufruf: node scripts/build-pdf.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'networkidle' });
  // Lazy-Loading-Bilder sofort laden
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(i => (i.loading = 'eager')));
  await page.waitForLoadState('networkidle');
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({ path: path.join(root, 'gaestehandbuch.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('gaestehandbuch.pdf erstellt');
})();
