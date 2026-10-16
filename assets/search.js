// The search page (/search/): finds books (by title or scholar) and lessons
// (by title or chapter) in /assets/search.json, which build.mjs writes. Arabic is
// compared without its marks and with letter forms joined (أ إ آ ا, ى ي,
// ة ه …), and every word typed must appear. The words stay in the address
// (?q=…) so a search can be shared or reopened.
(function () {
  var input = document.getElementById('q'), status = document.getElementById('search-status');
  var booksBox = document.getElementById('book-results'), lessonsBox = document.getElementById('lesson-results');
  var MAX = 200, data = null, timer;

  function norm(s) {
    return s
      .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x660; })
      .toLowerCase();
  }
  var count = function (n) { return n.toLocaleString('ar-EG'); };

  function icon(name) {
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), use = document.createElementNS(ns, 'use');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function row(title, meta, href, iconName) {
    var li = el('li', 'row'), ic = el('span', 'row-ic'), body = el('div', 'row-body'), t = el('div', 'row-title'), a = el('a', '', title);
    ic.appendChild(icon(iconName));
    a.href = href;
    t.appendChild(a);
    body.appendChild(t);
    if (meta) { var m = el('div', 'row-meta'); m.appendChild(el('span', '', meta)); body.appendChild(m); }
    var go = el('a', 'round-btn');
    go.href = href;
    go.tabIndex = -1;
    go.setAttribute('aria-hidden', 'true');
    go.appendChild(icon('chevron'));
    li.append(ic, body, go);
    return li;
  }
  function group(box, title, items) {
    box.replaceChildren();
    box.hidden = !items.length;
    if (!items.length) return;
    box.appendChild(el('h3', 'results-head', title + ' (' + count(items.length) + ')'));
    var ul = el('ul', 'rows');
    items.slice(0, MAX).forEach(function (li) { ul.appendChild(li); });
    box.appendChild(ul);
    if (items.length > MAX) box.appendChild(el('p', 'results-more', 'تظهر أول ' + count(MAX) + ' نتيجة، أضف كلمة لتضييق البحث.'));
  }

  function search() {
    var q = input.value.trim();
    history.replaceState(null, '', q ? '?q=' + encodeURIComponent(q) : location.pathname);
    var words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length || !data) {
      status.textContent = data || !q ? '' : 'جارٍ التحميل…';
      group(booksBox, '', []); group(lessonsBox, '', []);
      return;
    }
    var has = function (text) { return words.every(function (w) { return text.indexOf(w) > -1; }); };
    var books = data.pages.filter(function (p) { return p.book && has(p.n); });
    var lessons = data.lessons.filter(function (l) { return has(l.n); });
    group(booksBox, 'الكتب', books.map(function (p) { return row(p.t, p.s, p.p, 'scroll'); }));
    group(lessonsBox, 'الدروس', lessons.map(function (l) {
      var p = data.pages[l.p];
      return row(l.t, l.c ? p.t + ' — ' + l.c : p.t, p.p + '#l-' + l.i, 'mic');
    }));
    status.textContent = books.length || lessons.length ? '' : 'لا توجد نتائج.';
  }

  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(search, 150); });
  document.getElementById('search-form').addEventListener('submit', function (e) { e.preventDefault(); search(); });
  input.value = new URLSearchParams(location.search).get('q') || '';

  // pages: [title, path, subtitle, is a book]; lessons: [title, page, row
  // number, chapter]; chapters: titles.
  fetch('/assets/search.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      data = {
        pages: d.pages.map(function (p) { return { t: p[0], p: p[1], s: p[2], book: p[3], n: norm(p[0] + ' ' + p[2]) }; }),
        lessons: d.lessons.map(function (l) {
          var c = l[3] > -1 ? d.chapters[l[3]] : '';
          return { t: l[0], p: l[1], i: l[2], c: c, n: norm(l[0] + ' ' + c) };
        }),
      };
      search();
    })
    .catch(function () { status.textContent = 'تعذر تحميل البحث، حاول مرة أخرى.'; });
  search();
})();
