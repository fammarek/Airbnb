// Erzeugt die PDF-Versionen (A4, Druckansicht) aus index.html und en.html.
// Aufruf: node scripts/build-pdf.js
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const jobs = [
  { html: 'index.html', pdf: 'gaestehandbuch.pdf' },
  { html: 'en.html', pdf: 'guest-guide.pdf' },
];

(async () => {
  const browser = await chromium.launch();
  for (const job of jobs) {
    const page = await browser.newPage();
    await page.goto('file://' + path.join(root, job.html));
    // Lazy-Bilder sofort laden und warten, bis alle fertig sind
    await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach(i => (i.loading = 'eager'));
      await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    });
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.pdf({ path: path.join(root, job.pdf), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(job.pdf + ' erstellt');
  }
  await browser.close();
})();
