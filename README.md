# Gästehandbuch – Appartement Fellbach

Online-Gästeleitfaden (Deutsch/Englisch) mit PDF-Version zum Ausdrucken.

- **Website:** https://fammarek.github.io/airbnb/ (GitHub Pages, Branch `main`, Ordner `/`)
- `index.html` – Deutsch · `en.html` – Englisch (Sprachauswahl beim ersten Aufruf)
- `gaestehandbuch.pdf` / `guest-guide.pdf` – Druckversionen
- `assets/` – Bilder, `style.css`, `app.js`

## Inhalte ändern

Texte direkt in `index.html` **und** `en.html` anpassen. Gelb markierte Stellen (`class="gap"`) sind noch offene Angaben.

## PDFs neu erzeugen

```bash
node scripts/build-pdf.js
```

## Veranstaltungen

Der Block zwischen `<!-- EVENTS:START -->` und `<!-- EVENTS:END -->` wird monatlich automatisch aktualisiert
(vergangene Termine raus, neue Termine für die nächsten ~3 Monate rein, PDFs neu erzeugen, Push auf `main`).
