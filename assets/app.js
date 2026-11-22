// Sprachauswahl, WLAN-Kopieren und Zielgruppen-Tabs
(function () {
  var page = document.documentElement.lang === 'en' ? 'en' : 'de';
  var target = { de: 'index.html', en: 'en.html' };
  var stored = null;
  try { stored = localStorage.getItem('guide-lang'); } catch (e) {}

  // Gespeicherte Sprache → passende Seite; sonst beim ersten Aufruf auswählen lassen
  if (stored && stored !== page && target[stored]) { location.replace(target[stored] + location.hash); return; }
  var picker = document.getElementById('langpick');
  if (!stored && picker) picker.classList.add('show');
  document.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var lang = a.getAttribute('data-setlang');
      try { localStorage.setItem('guide-lang', lang); } catch (e) {}
      if (lang === page) { ev.preventDefault(); if (picker) picker.classList.remove('show'); }
    });
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
