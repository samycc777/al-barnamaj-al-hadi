// Every page: the menu button on phones, the night-mode button and the
// web-app service worker. On the home page, the card that goes back to the
// last lesson played (saved by assets/player.js).
(function () {
  var root = document.documentElement;
  function store(fn) { try { return fn(localStorage); } catch (e) {} }

  var menu = document.querySelector('.menu-btn');
  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    menu.setAttribute('aria-expanded', open);
  }
  menu.addEventListener('click', function () { setMenu(!document.body.classList.contains('nav-open')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); menu.focus(); }
  });

  // The button's name stays "night mode"; aria-pressed says whether it is on.
  var tb = document.querySelector('.theme-btn');
  function mark() {
    var dark = root.getAttribute('data-theme') === 'dark';
    tb.setAttribute('aria-pressed', dark);
    tb.title = dark ? 'الوضع النهاري' : 'الوضع الليلي';
  }
  mark();
  tb.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    store(function (s) { s.setItem('theme', t); });
    mark();
  });

  // Only shown when the lesson's page still exists (the build lists them all).
  var card = document.querySelector('.continue');
  if (card) {
    var last = store(function (s) { return JSON.parse(s.getItem('last')); });
    if (last && JSON.parse(card.dataset.paths).indexOf(last.path) > -1) {
      card.querySelector('.row-title').textContent = last.title;
      card.querySelector('.row-meta span').textContent = last.book;
      var go = card.querySelector('.round-btn');
      go.href = last.path + '#play=' + encodeURIComponent(last.src);
      go.setAttribute('aria-label', 'متابعة: ' + last.title);
      card.hidden = false;
    }
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
