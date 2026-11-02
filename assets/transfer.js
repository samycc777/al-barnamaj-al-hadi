// The /transfer/ page: moves this visitor's listening to another device.
// What is kept (by assets/player.js): heard:<audio>, pos:<audio>, book:<path>,
// rate and last. It goes into a link, /transfer/#c=<code>, made of that data as
// JSON, compressed ("z") where the browser can, else as it is ("j"), in
// base64url. The part after # never leaves the phone. Opening the link on the
// other device (or pasting it) adds it to what that device already has:
// lessons heard are added, places and books are taken only where that device
// has none or has heard less.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ar = function (n) { return n.toLocaleString('ar-EG'); };
  function store(fn) { try { return fn(localStorage); } catch (e) {} }
  var Z = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

  function b64(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64(t) {
    var s = atob(t.replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function pipe(bytes, stream) {
    return new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }

  function collect() {
    var d = { v: 1, h: [], p: {}, b: {} };
    store(function (s) {
      for (var i = 0; i < s.length; i++) {
        var k = s.key(i), val = s.getItem(k);
        if (k.indexOf('heard:') === 0 && val === '1') d.h.push(k.slice(6));
        else if (k.indexOf('pos:') === 0) d.p[k.slice(4)] = val;
        else if (k.indexOf('book:') === 0) d.b[k.slice(5)] = JSON.parse(val);
      }
      if (s.getItem('rate')) d.r = s.getItem('rate');
      if (s.getItem('last')) d.l = JSON.parse(s.getItem('last'));
    });
    return d;
  }
  function encode(d) {
    var bytes = new TextEncoder().encode(JSON.stringify(d));
    return Z ? pipe(bytes, new CompressionStream('deflate-raw')).then(function (z) { return 'z' + b64(z); })
      : Promise.resolve('j' + b64(bytes));
  }
  function decode(code) {
    var m = /#c=([zj][A-Za-z0-9_-]+)/.exec(code) || /^\s*([zj][A-Za-z0-9_-]{8,})\s*$/.exec(code);
    if (!m) return Promise.reject();
    var bytes = unb64(m[1].slice(1));
    var go = m[1][0] === 'z' ? (Z ? pipe(bytes, new DecompressionStream('deflate-raw')) : Promise.reject()) : Promise.resolve(bytes);
    return go.then(function (b) {
      var d = JSON.parse(new TextDecoder().decode(b));
      if (d.v !== 1 || !Array.isArray(d.h)) throw 0;
      return d;
    });
  }

  function merge(d) {
    var added = 0;
    store(function (s) {
      d.h.forEach(function (src) {
        if (s.getItem('heard:' + src) !== '1') { s.setItem('heard:' + src, '1'); s.removeItem('pos:' + src); added++; }
      });
      Object.keys(d.p || {}).forEach(function (src) {
        if (s.getItem('heard:' + src) !== '1' && !s.getItem('pos:' + src)) s.setItem('pos:' + src, d.p[src]);
      });
      Object.keys(d.b || {}).forEach(function (path) {
        var mine = null;
        try { mine = JSON.parse(s.getItem('book:' + path)); } catch (e) {}
        if (!mine || mine.h < d.b[path].h) s.setItem('book:' + path, JSON.stringify(d.b[path]));
      });
      if (d.r && !s.getItem('rate')) s.setItem('rate', d.r);
      if (d.l && !s.getItem('last')) s.setItem('last', JSON.stringify(d.l));
    });
    return added;
  }

  // Counts written after a colon, so the noun never has to agree with the number.
  function counts(d) {
    return 'الدروس المسموعة: ' + ar(d.h.length) + '، والدروس التي لم تكتمل: ' + ar(Object.keys(d.p || {}).length);
  }

  // From this device.
  var mine = collect(), link = '';
  if (!mine.h.length && !Object.keys(mine.p).length) {
    $('out-status').textContent = 'لا يوجد تقدّم محفوظ على هذا الجهاز بعد.';
  } else {
    $('out-status').textContent = 'على هذا الجهاز: ' + counts(mine) + '. أرسل الرابط إلى نفسك وافتحه على الجهاز الآخر.';
    encode(mine).then(function (c) {
      link = location.origin + '/transfer/#c=' + c;
      $('out-actions').hidden = false;
      if (!navigator.share) $('share').hidden = true;
    });
  }
  $('share').addEventListener('click', function () {
    navigator.share({ title: 'نقل التقدّم', url: link }).catch(function () {});
  });
  $('copy').addEventListener('click', function () {
    var btn = $('copy'), label = btn.textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () {
      btn.textContent = 'نُسخ الرابط';
      setTimeout(function () { btn.textContent = label; }, 2000);
    }, function () { prompt('الرابط:', link); });
  });

  // To this device: from the link it was opened with, or a pasted one.
  var found = null;
  function show(d) {
    found = d;
    $('in-found').textContent = 'في الرابط: ' + counts(d) + '.';
    $('in-found').hidden = false;
  }
  if (location.hash.indexOf('#c=') === 0) {
    $('code').value = location.href;
    decode(location.hash).then(show, function () { $('in-status').textContent = 'الرابط غير صالح أو ناقص.'; });
  }
  $('import').addEventListener('click', function () {
    (found && $('code').value === location.href ? Promise.resolve(found) : decode($('code').value)).then(function (d) {
      var n = merge(d);
      $('in-status').textContent = 'تم الاستيراد. الدروس المسموعة المضافة إلى هذا الجهاز: ' + ar(n) + '.';
      history.replaceState(null, '', '/transfer/');
      found = null;
    }, function () { $('in-status').textContent = 'الرابط غير صالح أو ناقص.'; });
  });
})();
