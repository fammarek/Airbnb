// Erzeugt guide.pdf: EIN zweisprachiges PDF
//   Seite 1: Deckblatt (QR-Codes WLAN + Online-Version)
//   danach Deutsch, dann Englisch – jede Seite mit Header und Fußzeile.
// Aufruf: node scripts/build-pdf.js   (benötigt Playwright und pdfunite aus poppler-utils)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-'));
const pages = f => parseInt(execFileSync('pdfinfo', [f]).toString().match(/Pages:\s+(\d+)/)[1], 10);

const header = (title, flag) => `
  <div style="width:100%;margin:0 13mm;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:8.5px;color:#6b5f58;
              display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1.5px solid #8c2f39;padding-bottom:4px;">
    <span><b style="color:#8c2f39;font-size:10px;">${flag} ${title}</b></span>
    <span>Anita &amp; Johannes · Bruckstraße 22/1 · 70734 Fellbach</span>
  </div>`;
const footer = label => `
  <div style="width:100%;margin:0 13mm;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:8px;color:#6b5f58;
              display:flex;justify-content:space-between;">
    <span>${label}: fammarek.github.io/Airbnb</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

async function render(browser, html, lang, out, opts) {
  const page = await browser.newPage();
  await page.addInitScript(l => { try { localStorage.setItem('guide-lang', l); } catch (e) {} }, lang);
  await page.goto('file://' + path.join(root, html));
  await page.evaluate(async o => {
    if (o.coverOnly) document.querySelectorAll('body > *:not(.cover)').forEach(e => e.remove());
    else document.querySelector('.cover').remove();
    if (o.enPage) document.querySelector('.toc-en').textContent = o.enPage;
    const imgs = [...document.images];
    imgs.forEach(i => (i.loading = 'eager'));
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
  }, opts);
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  const pdfOpts = { path: out, format: 'A4', printBackground: true, preferCSSPageSize: true };
  if (opts.header) Object.assign(pdfOpts, { displayHeaderFooter: true, headerTemplate: opts.header, footerTemplate: opts.footer });
  await page.pdf(pdfOpts);
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  const cover = path.join(tmp, 'cover.pdf'), de = path.join(tmp, 'de.pdf'), en = path.join(tmp, 'en.pdf');
  await render(browser, 'index.html', 'de', de, { header: header('Gästehandbuch', '🇩🇪'), footer: footer('Online in 9 Sprachen') });
  await render(browser, 'en.html', 'en', en, { header: header('Guest Guide', '🇬🇧'), footer: footer('Online in 9 languages') });
  const enStart = 1 + pages(de) + 1;
  await render(browser, 'index.html', 'de', cover, { coverOnly: true, enPage: String(enStart) });
  await browser.close();
  execFileSync('pdfunite', [cover, de, en, path.join(root, 'guide.pdf')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('guide.pdf erstellt (' + pages(path.join(root, 'guide.pdf')) + ' Seiten, English ab Seite ' + enStart + ')');
})();
