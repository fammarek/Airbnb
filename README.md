# Gästehandbuch – Appartement Fellbach

Online-Gästeleitfaden in 9 Sprachen mit zweisprachiger PDF-Version (DE/EN) zum Ausdrucken.

- **Website:** https://fammarek.github.io/Airbnb/ (GitHub Pages, Branch `main`, Ordner `/`)
- Sprachen: `index.html` (Deutsch), `en.html`, `fr.html`, `it.html`, `cs.html`, `sk.html`, `pl.html`, `hr.html`, `zh.html` – Sprachauswahl beim ersten Aufruf, wird im Browser gespeichert (`assets/app.js`)
- `guide.pdf` – zweisprachige Druckversion (Deckblatt mit QR-Codes für WLAN + Online-Version, dann Deutsch, dann Englisch)
- `assets/` – Bilder, QR-Codes, `style.css`, `app.js`

## Inhalte ändern

Texte in **allen** Sprachdateien anpassen (gleiche Struktur, gleiche Abschnitts-IDs).

## PDFs neu erzeugen

```bash
node scripts/build-pdf.js
```

## Veranstaltungen

Der Block zwischen `<!-- EVENTS:START -->` und `<!-- EVENTS:END -->` wird monatlich automatisch in allen
9 Sprachdateien aktualisiert (vergangene Termine raus, neue Termine für die nächsten ~3 Monate rein,
PDFs neu erzeugen, Push auf `main`).
