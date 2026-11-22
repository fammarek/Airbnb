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
