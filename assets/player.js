// The page's one audio player (book pages, and category pages with single
// lectures): a lesson's play button loads it into the bar at the bottom.
// - Each lesson remembers where it was stopped ("pos:<audio>" = seconds/length)
//   and whether it was heard to the end ("heard:<audio>"); rows show both.
// - On a book's page the next lesson plays when one ends.
// - The bar has 15-second back/forward and speed buttons (the speed is kept).
// - The phone's lock screen shows the lesson and book and has the same buttons.
// - The last lesson played is kept ("last") for the home page's card.
// - A link ending in #l-12 (search) or #play=<audio> (the home page's card)
//   opens that lesson.
(function () {
  var bar = document.querySelector('.player'), au = bar.querySelector('audio'), cur = null, saved = 0;
  var titleBox = bar.querySelector('.player-title'), rateBtn = bar.querySelector('.rate');
  var bookPage = !!document.querySelector('.book-head');
  var RATES = [1, 1.25, 1.5, 1.75, 2];
  var rows = function () { return [].slice.call(document.querySelectorAll('.lesson')); };
  var titleOf = function (r) { return r.querySelector('.row-title').textContent; };
  function store(fn) { try { return fn(localStorage); } catch (e) {} }
  function get(k) { return store(function (s) { return s.getItem(k); }); }
  function set(k, v) { store(function (s) { s.setItem(k, v); }); }
  function del(k) { store(function (s) { s.removeItem(k); }); }
  // A failed load shows its message from the 'error' event below.
  function play() { var p = au.play(); if (p) p.catch(function () {}); }

  // Heard rows get a check mark; started ones a thin bar under the title.
  function mark(r) {
    var src = r.dataset.src, heard = get('heard:' + src) === '1';
    var pos = (get('pos:' + src) || '').split('/');
    var p = !heard && +pos[1] > 0 ? Math.min(100, Math.round(pos[0] / pos[1] * 100)) : 0;
    r.classList.toggle('heard', heard);
    r.classList.toggle('started', p > 0);
    if (p > 0) r.style.setProperty('--heard', p + '%');
  }
  rows().forEach(mark);

  function sync() {
    rows().forEach(function (r) {
      var on = r === cur && !au.paused;
      r.classList.toggle('playing', on);
      r.querySelector('.play').setAttribute('aria-label', (on ? 'إيقاف: ' : 'استماع: ') + titleOf(r));
    });
  }

  var rate = +get('rate');
  if (RATES.indexOf(rate) < 0) rate = 1;
  function showRate() { rateBtn.textContent = rate.toLocaleString('ar-EG') + '×'; }
  showRate();
  rateBtn.addEventListener('click', function () {
    rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    au.defaultPlaybackRate = au.playbackRate = rate;
    set('rate', rate);
    showRate();
  });

  function seek(by) {
    if (!cur) return;
    au.currentTime = Math.max(0, Math.min((au.duration || Infinity) - 1, au.currentTime + by));
  }
  bar.querySelector('.back').addEventListener('click', function () { seek(-15); });
  bar.querySelector('.fwd').addEventListener('click', function () { seek(15); });

  function load(r) {
    cur = r;
    saved = 0;
    au.src = r.dataset.src;
    au.defaultPlaybackRate = au.playbackRate = rate;
    var title = titleOf(r);
    titleBox.textContent = title;
    bar.classList.remove('failed');
    bar.hidden = false;
    document.body.classList.add('has-player');
    var d = r.closest('details'); if (d) d.open = true;
    var who = document.querySelector('.book-note') || r.querySelector('.row-meta span:last-child');
    var book = bookPage ? document.querySelector('.panel-head h2').textContent : '';
    set('last', JSON.stringify({ src: r.dataset.src, title: title, book: book || (who ? who.textContent : ''), path: location.pathname }));
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: who ? who.textContent : '',
        album: book,
        artwork: [{ src: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      });
    }
    play();
  }
  function step(by) {
    if (!cur) return false;
    var all = rows(), r = all[all.indexOf(cur) + by];
    if (r) { load(r); r.scrollIntoView({ block: 'nearest' }); }
    return !!r;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.play'); if (!b) return;
    var r = b.closest('.lesson');
    if (r === cur) { au.paused ? play() : au.pause(); return; }
    load(r);
  });
  au.addEventListener('loadedmetadata', function () {
    var t = +(get('pos:' + cur.dataset.src) || '').split('/')[0] || 0;
    if (t > 15 && t < au.duration - 15) au.currentTime = t - 3;
  });
  au.addEventListener('timeupdate', function () {
    if (!cur || Math.abs(au.currentTime - saved) < 5) return;
    saved = au.currentTime;
    var src = cur.dataset.src;
    // Stopping in the last few percent (the closing words) counts as heard.
    if (au.duration && saved >= au.duration * 0.97) { set('heard:' + src, '1'); del('pos:' + src); }
    else set('pos:' + src, Math.floor(saved) + '/' + Math.floor(au.duration || 0));
    mark(cur);
  });
  au.addEventListener('ended', function () {
    set('heard:' + cur.dataset.src, '1');
    del('pos:' + cur.dataset.src);
    mark(cur);
    if (!bookPage || !step(1)) del('last');
  });
  au.addEventListener('error', function () {
    if (!au.getAttribute('src')) return;
    bar.classList.add('failed');
    titleBox.textContent = 'تعذر تشغيل هذا الدرس، حاول مرة أخرى';
    cur = null; sync();
  });
  ['play', 'pause', 'ended'].forEach(function (ev) { au.addEventListener(ev, sync); });

  if ('mediaSession' in navigator) {
    var on = function (action, fn) { try { navigator.mediaSession.setActionHandler(action, fn); } catch (e) {} };
    on('seekbackward', function () { seek(-15); });
    on('seekforward', function () { seek(15); });
    if (bookPage) {
      on('nexttrack', function () { step(1); });
      on('previoustrack', function () { step(-1); });
    }
  }

  // Phones may refuse to start the sound before a tap; the bar then waits on
  // that lesson, ready to play.
  function openFromLink() {
    var h = '', r = null;
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    if (/^l-\d+$/.test(h)) r = document.getElementById(h);
    else if (h.indexOf('play=') === 0) r = rows().filter(function (x) { return x.dataset.src === h.slice(5); })[0];
    if (!r || !r.classList.contains('lesson')) return;
    var d = r.closest('details'); if (d) d.open = true;
    rows().forEach(function (x) { x.classList.toggle('target', x === r); });
    r.scrollIntoView({ block: 'center' });
    if (r !== cur) load(r);
  }
  openFromLink();
  window.addEventListener('hashchange', openFromLink);
})();
