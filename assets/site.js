// Every page: the menu button on phones, the night-mode button and the
// web-app service worker. On the home page, the card that goes back to the
// last lesson played and the books started; on a category page, how much of
// each book was heard (all saved by assets/player.js).
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

  var ar = function (n) { return n.toLocaleString('ar-EG'); };
  function bookOf(path) { return store(function (s) { return JSON.parse(s.getItem('book:' + path)); }); }
  function heardText(b) { return 'استمعت: ' + ar(b.h) + ' من ' + ar(b.n); }

  // Category page: each book's share heard, once its page saved it.
  [].forEach.call(document.querySelectorAll('.mine'), function (el) {
    var b = bookOf(el.dataset.book);
    if (!b || !b.h) return;
    el.textContent = heardText(b);
    el.classList.toggle('done', b.h >= b.n);
    el.hidden = false;
  });

  // Only shown when the lesson's page still exists (the build lists them all).
  var card = document.querySelector('.continue');
  if (card) {
    var paths = JSON.parse(card.dataset.paths);
    var last = store(function (s) { return JSON.parse(s.getItem('last')); });
    var lastRow = card.querySelector('.rows .row');
    if (last && paths.indexOf(last.path) > -1) {
      lastRow.querySelector('.row-title').textContent = last.title;
      lastRow.querySelector('.row-meta span').textContent = last.book;
      var go = lastRow.querySelector('.round-btn');
      go.href = last.path + '#play=' + encodeURIComponent(last.src);
      go.setAttribute('aria-label', 'متابعة: ' + last.title);
    } else {
      lastRow.parentNode.remove();
      last = null;
    }
    // Books started and not finished, last listened first (five at most).
    var books = paths.map(function (p) { var b = bookOf(p); if (b) b.path = p; return b; })
      .filter(function (b) { return b && b.n && b.h < b.n; })
      .sort(function (a, b) { return b.at - a.at; }).slice(0, 5);
    var list = card.querySelector('.my-books');
    books.forEach(function (b) {
      var li = document.createElement('li');
      li.className = 'row';
      li.innerHTML = '<div class="row-body"><div class="row-title"><a></a></div><div class="row-meta"><span class="mine"></span></div><i class="bar"></i></div>'
        + '<a class="round-btn"><svg class="ic" aria-hidden="true"><use href="#i-chevron"/></svg></a>';
      li.querySelector('.row-title a').textContent = b.t;
      li.querySelector('.mine').textContent = heardText(b);
      li.querySelector('.bar').style.setProperty('--done', Math.round(b.h / b.n * 100) + '%');
      [].forEach.call(li.querySelectorAll('a'), function (a) { a.href = b.path; });
      li.querySelector('.round-btn').setAttribute('aria-label', b.t);
      list.appendChild(li);
    });
    if (!books.length) list.remove();
    card.hidden = !last && !books.length;
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
