// Sprachauswahl (9 Sprachen), WLAN-Kopieren und Zielgruppen-Tabs
(function () {
  var LANGS = [
    ['de', 'index.html', '🇩🇪', 'Deutsch'],
    ['en', 'en.html', '🇬🇧', 'English'],
    ['fr', 'fr.html', '🇫🇷', 'Français'],
    ['it', 'it.html', '🇮🇹', 'Italiano'],
    ['cs', 'cs.html', '🇨🇿', 'Čeština'],
    ['sk', 'sk.html', '🇸🇰', 'Slovenčina'],
    ['pl', 'pl.html', '🇵🇱', 'Polski'],
    ['hr', 'hr.html', '🇭🇷', 'Hrvatski'],
    ['zh', 'zh.html', '🇨🇳', '中文']
  ];
  var files = {};
  LANGS.forEach(function (l) { files[l[0]] = l[1]; });
  var page = (document.documentElement.lang || 'de').slice(0, 2);
  var stored = null;
  try { stored = localStorage.getItem('guide-lang'); } catch (e) {}

  // Gespeicherte Sprache → passende Seite
  if (stored && stored !== page && files[stored]) { location.replace(files[stored] + location.hash); return; }

  // Auswahlfenster aufbauen
  var picker = document.getElementById('langpick');
  var list = picker && picker.querySelector('.langlist');
  if (list) {
    LANGS.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l[1];
      a.lang = l[0];
      a.textContent = l[2] + ' ' + l[3];
      if (l[0] === page) a.className = 'current';
      a.addEventListener('click', function (ev) {
        try { localStorage.setItem('guide-lang', l[0]); } catch (e) {}
        if (l[0] === page) { ev.preventDefault(); picker.classList.remove('show'); }
      });
      list.appendChild(a);
    });
    if (!stored) picker.classList.add('show');
    picker.addEventListener('click', function (ev) { if (ev.target === picker && stored) picker.classList.remove('show'); });
  }
  document.querySelectorAll('[data-openlang]').forEach(function (a) {
    a.addEventListener('click', function (ev) { ev.preventDefault(); if (picker) picker.classList.add('show'); });
  });

  // Check-in-Assistent: führt Schritt für Schritt (Bild + Text) durch den Check-in
  var WZ = {
    de: ['Schritt', 'von', '← Zurück', 'Weiter →', 'Fertig ✓', 'Schließen'],
    en: ['Step', 'of', '← Back', 'Next →', 'Done ✓', 'Close'],
    fr: ['Étape', 'sur', '← Retour', 'Suivant →', 'Terminé ✓', 'Fermer'],
    it: ['Passo', 'di', '← Indietro', 'Avanti →', 'Fatto ✓', 'Chiudi'],
    cs: ['Krok', 'z', '← Zpět', 'Další →', 'Hotovo ✓', 'Zavřít'],
    sk: ['Krok', 'z', '← Späť', 'Ďalej →', 'Hotovo ✓', 'Zavrieť'],
    pl: ['Krok', 'z', '← Wstecz', 'Dalej →', 'Gotowe ✓', 'Zamknij'],
    hr: ['Korak', 'od', '← Natrag', 'Dalje →', 'Gotovo ✓', 'Zatvori'],
    zh: ['第', '步，共', '← 上一步', '下一步 →', '完成 ✓', '关闭']
  }[page] || ['Step', 'of', '← Back', 'Next →', 'Done ✓', 'Close'];
  var wzBtn = document.querySelector('[data-wizard]');
  if (wzBtn) {
    var slides = [];
    document.querySelectorAll('#ankommen .steps > li').forEach(function (li) {
      var text = li.querySelector('.step-text');
      slides.push({
        imgs: Array.prototype.map.call(li.querySelectorAll('.step-pics img'), function (i) { return i.getAttribute('src'); }),
        html: text ? text.innerHTML : li.innerHTML
      });
    });
    var note = document.querySelector('#ankommen .note');
    if (note) slides.push({ imgs: [], html: note.innerHTML });

    var wz = document.createElement('div');
    wz.className = 'wizard';
    wz.setAttribute('role', 'dialog');
    wz.setAttribute('aria-modal', 'true');
    wz.innerHTML = '<div class="wz-head"><span class="wz-count"></span><button class="wz-close" type="button" aria-label="' + WZ[5] + '">×</button></div>' +
      '<div class="wz-bar"><span></span></div>' +
      '<div class="wz-body"><div class="wz-pics"></div><div class="wz-text"></div></div>' +
      '<div class="wz-foot"><button class="wz-prev" type="button">' + WZ[2] + '</button><button class="wz-next" type="button"></button></div>';
    document.body.appendChild(wz);
    var cur = 0;
    var q = function (s) { return wz.querySelector(s); };
    function render() {
      var s = slides[cur];
      q('.wz-count').textContent = page === 'zh' ? WZ[0] + ' ' + (cur + 1) + ' ' + WZ[1] + ' ' + slides.length + ' 步' : WZ[0] + ' ' + (cur + 1) + ' ' + WZ[1] + ' ' + slides.length;
      q('.wz-bar span').style.width = ((cur + 1) / slides.length * 100) + '%';
      var pics = q('.wz-pics');
      pics.innerHTML = '';
      pics.className = 'wz-pics' + (s.imgs.length === 1 ? ' single' : '');
      pics.style.display = s.imgs.length ? '' : 'none';
      s.imgs.forEach(function (src) { var im = document.createElement('img'); im.src = src; im.alt = ''; pics.appendChild(im); });
      q('.wz-text').innerHTML = s.html;
      q('.wz-prev').disabled = cur === 0;
      q('.wz-next').textContent = cur === slides.length - 1 ? WZ[4] : WZ[3];
      q('.wz-body').scrollTop = 0;
    }
    function go(d) {
      if (cur + d >= slides.length) return close();
      cur = Math.max(0, cur + d);
      render();
    }
    function open() { cur = 0; render(); wz.classList.add('show'); document.body.classList.add('wz-open'); q('.wz-next').focus(); }
    function close() { wz.classList.remove('show'); document.body.classList.remove('wz-open'); wzBtn.focus(); }
    wzBtn.addEventListener('click', open);
    q('.wz-close').addEventListener('click', close);
    q('.wz-prev').addEventListener('click', function () { go(-1); });
    q('.wz-next').addEventListener('click', function () { go(1); });
    document.addEventListener('keydown', function (e) {
      if (!wz.classList.contains('show')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    // Wischen auf dem Handy
    var x0 = null;
    q('.wz-body').addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    q('.wz-body').addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  // WLAN-Passwort kopieren
  var copy = document.getElementById('copy-wifi');
  if (copy) {
    var label = copy.textContent;
    copy.addEventListener('click', function () {
      var pass = document.getElementById('wifi-pass').textContent.trim();
      var done = function () { copy.textContent = copy.getAttribute('data-done'); setTimeout(function () { copy.textContent = label; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(pass).then(done, function () { prompt('', pass); });
      else prompt('', pass);
    });
  }

  // Tabs (Maus, Touch und Pfeiltasten)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    try { localStorage.setItem('tipps-tab', tab.id); } catch (e) {}
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  try { var saved = document.getElementById(localStorage.getItem('tipps-tab')); if (saved) select(saved); } catch (e) {}
})();
