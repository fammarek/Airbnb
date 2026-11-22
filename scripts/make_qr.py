"""Erzeugt für jede Orts-Karte (.place) einen QR-Code zur Google-Maps-Adresse
und fügt ihn in alle Sprachdateien ein (nur im Druck/PDF sichtbar).
Aufruf: python3 scripts/make_qr.py   (benötigt: pip install segno)"""
import html, os, re, hashlib, segno

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['index.html', 'en.html', 'fr.html', 'it.html', 'cs.html', 'sk.html', 'pl.html', 'hr.html', 'zh.html']
os.makedirs(os.path.join(ROOT, 'assets', 'qr'), exist_ok=True)

card_re = re.compile(r'(<a class="map" href="([^"]+)"[^>]*>[^<]*</a>)(<img class="qr"[^>]*>)?')
for f in FILES:
    path = os.path.join(ROOT, f)
    t = open(path, encoding='utf-8').read()
    def repl(m):
        url = html.unescape(m.group(2))
        name = hashlib.sha1(url.encode()).hexdigest()[:10] + '.svg'
        out = os.path.join(ROOT, 'assets', 'qr', name)
        if not os.path.exists(out):
            segno.make(url, error='m').save(out, scale=1, border=2, dark='#2a2421', xmldecl=False, nl=False)
        return m.group(1) + '<img class="qr" src="assets/qr/' + name + '" alt="">'
    t = card_re.sub(repl, t)
    open(path, 'w', encoding='utf-8').write(t)
print('QR-Codes aktualisiert:', len(os.listdir(os.path.join(ROOT, 'assets', 'qr'))))
