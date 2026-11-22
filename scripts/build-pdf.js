// Erzeugt guide.pdf: EIN zweisprachiges PDF (Deckblatt mit QR-Codes, dann Deutsch, dann Englisch).
// Aufruf: node scripts/build-pdf.js   (benötigt Playwright und pdfunite aus poppler-utils)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-'));
const pages = f => parseInt(execFileSync('pdfinfo', [f]).toString().match(/Pages:\s+(\d+)/)[1], 10);

async function render(browser, html, lang, out, opts) {
  const page = await browser.newPage();
  await page.addInitScript(l => { try { localStorage.setItem('guide-lang', l); } catch (e) {} }, lang);
  await page.goto('file://' + path.join(root, html));
  await page.evaluate(async o => {
    if (o.noCover) document.querySelector('.cover').remove();
    if (o.enPage) document.querySelector('.toc-en').textContent = o.enPage;
    const imgs = [...document.images];
    imgs.forEach(i => (i.loading = 'eager'));
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
  }, opts);
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  const de = path.join(tmp, 'de.pdf'), en = path.join(tmp, 'en.pdf');
  await render(browser, 'index.html', 'de', de, {});
  const enStart = pages(de) + 1;                       // Seitenzahl für das Inhaltsverzeichnis auf dem Deckblatt
  await render(browser, 'index.html', 'de', de, { enPage: String(enStart) });
  await render(browser, 'en.html', 'en', en, { noCover: true });
  await browser.close();
  execFileSync('pdfunite', [de, en, path.join(root, 'guide.pdf')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('guide.pdf erstellt (' + pages(path.join(root, 'guide.pdf')) + ' Seiten, English ab Seite ' + enStart + ')');
})();
