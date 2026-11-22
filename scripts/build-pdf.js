// Erzeugt die PDF-Versionen (A4, mit Deckblatt und QR-Codes) auf Deutsch und Englisch.
// Aufruf: node scripts/build-pdf.js
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const jobs = [
  { html: 'index.html', pdf: 'guide-de.pdf', lang: 'de' },
  { html: 'en.html', pdf: 'guide-en.pdf', lang: 'en' },
];

(async () => {
  const browser = await chromium.launch();
  for (const job of jobs) {
    const page = await browser.newPage();
    // Sprache vorbelegen, damit keine Weiterleitung/Sprachauswahl greift
    await page.addInitScript(l => { try { localStorage.setItem('guide-lang', l); } catch (e) {} }, job.lang);
    await page.goto('file://' + path.join(root, job.html));
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
