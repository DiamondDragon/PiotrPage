(function () {
  var dlg = document.getElementById('lightbox');
  if (!dlg) return;

  var img = dlg.querySelector('.lb__img');
  var tytulEl = dlg.querySelector('.lb__tytul');
  var licznik = dlg.querySelector('.lb__licznik');
  var podpis = dlg.querySelector('.lb__podpis');
  var wstecz = dlg.querySelector('.lb__nav--wstecz');
  var dalej = dlg.querySelector('.lb__nav--dalej');
  var zamknij = dlg.querySelector('.lb__zamknij');

  var zdjecia = [];
  var i = 0;
  var tytul = '';

  function pokaz() {
    var z = zdjecia[i];
    img.src = z.src;
    img.alt = z.podpis || tytul;
    podpis.textContent = z.podpis || '';
    licznik.textContent = zdjecia.length > 1 ? (i + 1) + ' / ' + zdjecia.length : '';
    wstecz.hidden = dalej.hidden = zdjecia.length < 2;
    // wczytaj sąsiednie zdjęcia z wyprzedzeniem
    [i - 1, i + 1].forEach(function (k) {
      var s = zdjecia[(k + zdjecia.length) % zdjecia.length];
      if (s) new Image().src = s.src;
    });
  }

  function idz(krok) {
    if (zdjecia.length < 2) return;
    i = (i + krok + zdjecia.length) % zdjecia.length;
    pokaz();
  }

  function otworz(galeria, start) {
    try {
      zdjecia = JSON.parse(galeria.querySelector('.galeria__dane').textContent);
    } catch (e) { return; }
    if (!zdjecia.length) return;
    tytul = galeria.querySelector('h3').textContent.trim();
    tytulEl.textContent = tytul;
    i = Math.min(Math.max(start || 0, 0), zdjecia.length - 1);
    pokaz();
    if (!dlg.open) dlg.showModal();
    history.replaceState(null, '', '#' + galeria.id);
  }

  document.querySelectorAll('.galeria').forEach(function (g) {
    g.querySelector('.galeria__okladka').addEventListener('click', function () {
      otworz(g, parseInt(g.dataset.start, 10) || 0);
    });
  });

  wstecz.addEventListener('click', function () { idz(-1); });
  dalej.addEventListener('click', function () { idz(1); });
  zamknij.addEventListener('click', function () { dlg.close(); });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); }
  });

  // kliknięcie w ciemne tło (poza zdjęciem i przyciskami) zamyka galerię
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.classList.contains('lb__scena')) dlg.close();
  });

  dlg.addEventListener('close', function () {
    img.removeAttribute('src');
    history.replaceState(null, '', location.pathname + location.search);
  });

  // przesuwanie palcem na telefonie
  var x0 = null;
  dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) idz(dx < 0 ? 1 : -1);
    x0 = null;
  });

  // filtry kategorii
  var przyciski = document.querySelectorAll('.filtry button');
  przyciski.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filtr;
      przyciski.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.galeria').forEach(function (g) {
        g.hidden = !(f === 'wszystkie' || g.dataset.kategoria === f);
      });
    });
  });

  // link prowadzący prosto do galerii, np. strona.pl/#lazienka-bałuty
  if (location.hash.length > 1) {
    var cel = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (cel && cel.classList.contains('galeria')) {
      cel.scrollIntoView();
      otworz(cel, parseInt(cel.dataset.start, 10) || 0);
    }
  }
})();
