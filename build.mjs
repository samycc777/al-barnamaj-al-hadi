// Builds the static site into dist/ from src/content.mjs. No dependencies.
import { mkdirSync, rmSync, writeFileSync, cpSync, readFileSync } from 'node:fs';
import { site, categories, itemsOf } from './src/content.mjs';

const OUT = 'dist';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Show every number in the page text as an Arabic-Indic digit (١٢٣). Only
// text between tags changes: links, attributes, scripts and styles keep 0-9.
const toArabicDigits = (html) =>
  html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((part, i) =>
    i % 2 ? part : part.replace(/>[^<]*</g, (t) => t.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])),
  ).join('');
const write = (file, html) => writeFileSync(file, toArabicDigits(html));

// Line icons (24×24). Objects and shapes only.
const ICONS = {
  star: '<path d="M12 2.5l2.8 2.8h4v4L21.5 12l-2.7 2.8v4h-4L12 21.5l-2.8-2.7h-4v-4L2.5 12l2.7-2.7v-4h4z"/><circle cx="12" cy="12" r="3.2"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10"/><path d="M7 4a2 2 0 0 0-2 2v11"/><path d="M8.5 9h4.5M8.5 12h4.5M8.5 15h3"/>',
  chain: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0z"/>',
  columns: '<path d="M3 9l9-5 9 5M4 20h16M5 17h14"/><path d="M6 10v7M10 10v7M14 10v7M18 10v7"/>',
  book: '<path d="M12 6c-2-1.5-5-2-8-1.5V18c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"/><path d="M12 6v13.5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5M18.5 4.5L21 7"/>',
  route: '<circle cx="6" cy="19" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H15"/><path d="M18 2.5c-1.7 0-3 1.3-3 3 0 2.2 3 5 3 5s3-2.8 3-5c0-1.7-1.3-3-3-3z"/>',
  lamp: '<path d="M12 3c-1.5 2-2 3.2-2 4.3a2 2 0 0 0 4 0C14 6.2 13.5 5 12 3z"/><path d="M5 12h12a3 3 0 0 0 3-3"/><path d="M5 12c0 3 2.5 5 7 5s7-2 7-5"/><path d="M9 20h6M12 17v3"/>',
  pen: '<path d="M4 20l3.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11z"/><path d="M14 6.5l3 3M4 20l3-3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  sunrise: '<path d="M3 17h18M8 20.5h8M7 17a5 5 0 0 1 10 0"/><path d="M12 6.5v2.5M5.6 10.6l1.6 1.6M18.4 10.6l-1.6 1.6M2.5 13.5h2M19.5 13.5h2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  chevron: '<path d="M15 5l-7 7 7 7"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/>',
  clip: '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7"/>',
  send: '<path d="M20.5 3.5L3.5 10.5l7 3 3 7z"/><path d="M20.5 3.5l-10 10"/>',
};
const icon = (name, cls = 'ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const TYPE = {
  audio: { icon: 'mic', label: 'استماع', action: 'play' },
  video: { icon: 'video', label: 'مشاهدة', action: 'play' },
  pdf: { icon: 'file', label: 'تحميل', action: 'download' },
  article: { icon: 'file', label: 'قراءة', action: 'play' },
  link: { icon: 'link', label: 'فتح', action: 'play' },
};

// A book's lessons, copied from the Shaykh's site by `npm run import`.
const lessonsOf = (it) => JSON.parse(readFileSync(`src/lessons/${it.slug}.json`, 'utf8'));
const lessonCount = (book) => book.chapters.reduce((n, c) => n + c.lessons.length, 0);

function itemRow(it, c) {
  const t = TYPE[it.type] || TYPE.link;
  const book = it.slug && lessonsOf(it);
  const meta = [
    book && `<span>عدد الدروس: ${lessonCount(book)}</span>`,
    it.date && `<span>${esc(it.date)}</span>`,
    it.note && `<span>${esc(it.note)}</span>`,
  ].filter(Boolean).join('<i class="dot"></i>');
  const btn = book
    ? `<a class="round-btn" href="/${c.slug}/${it.slug}/" title="الدروس" aria-label="الدروس">${icon('chevron')}</a>`
    : it.audio
    ? `<a class="round-btn dl" href="${esc(it.download || it.audio)}" title="تحميل" aria-label="تحميل">${icon('download')}</a>
      <button class="round-btn play" type="button" title="استماع" aria-label="استماع">${icon('play', 'ic i-play')}${icon('pause', 'ic i-pause')}</button>`
    : it.url
    ? `<a class="round-btn" href="${esc(it.url)}" target="_blank" rel="noopener" title="${t.label}" aria-label="${t.label}">${icon(t.action)}</a>`
    : '';
  return `<li class="row${it.audio ? ' lesson' : ''}"${it.audio ? ` data-src="${esc(it.audio)}"` : ''}>
      <span class="row-ic">${icon(t.icon)}</span>
      <div class="row-body"><div class="row-title">${book ? `<a href="/${c.slug}/${it.slug}/">${esc(it.title)}</a>` : esc(it.title)}</div>${meta ? `<div class="row-meta">${meta}</div>` : ''}</div>
      ${btn}
    </li>`;
}

function panel(title, iconName, body) {
  return `<section class="panel">
    <header class="panel-head"><span class="badge">${icon(iconName)}</span><h2>${esc(title)}</h2></header>
    <div class="panel-body">${body}</div>
  </section>`;
}

function layout({ title, active, main, extra = '' }) {
  const pageTitle = title ? `${title} — ${site.name}` : site.name;
  const nav = [
    `<li><a href="/"${active === 'home' ? ' class="active" aria-current="page"' : ''}>الرئيسية</a></li>`,
    ...categories.map(
      (c) => `<li><a href="/${c.slug}/"${active === c.slug ? ' class="active" aria-current="page"' : ''}>${esc(c.name)}</a></li>`,
    ),
  ].join('');
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta property="og:title" content="${esc(pageTitle)}">
<meta name="description" content="${esc(site.description)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:locale" content="ar_AR">
<meta name="theme-color" content="#6a3c18">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<script>
  // Pick light or dark before the page shows, so it doesn't flash.
  (function () {
    var t; try { t = localStorage.getItem('theme'); } catch (e) {}
    if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
</head>
<body>
<header class="site-head">
  <div class="brand-wrap">
    <a class="brand" href="/">
      <span class="brand-name">${esc(site.name)}</span>
    </a>
    <p class="brand-desc">${esc(site.description)}</p>
  </div>
  <nav class="site-nav" aria-label="الأقسام">
    <div class="nav-inner">
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-list">${icon('menu')}<span>الأقسام</span></button>
      <button class="theme-btn" type="button" title="الوضع الليلي" aria-label="الوضع الليلي" aria-pressed="false">${icon('moon', 'ic i-moon')}${icon('sun', 'ic i-sun')}</button>
      <ul id="nav-list">${nav}</ul>
    </div>
  </nav>
</header>
<main class="container">
${main}
</main>
<footer class="site-foot">
  <div class="container foot-inner">
    <span class="foot-name">${esc(site.name)}</span>
  </div>
</footer>
<script>
  var b = document.querySelector('.menu-btn');
  b.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    b.setAttribute('aria-expanded', open);
  });
  var root = document.documentElement, tb = document.querySelector('.theme-btn');
  function mark() {
    var dark = root.getAttribute('data-theme') === 'dark';
    tb.setAttribute('aria-pressed', dark);
    tb.title = dark ? 'الوضع النهاري' : 'الوضع الليلي';
    tb.setAttribute('aria-label', tb.title);
  }
  mark();
  tb.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    mark();
  });
</script>
${extra}
</body>
</html>
`;
}

function homePage() {
  const cards = categories
    .map(
      (c) => `<a class="cat-card" href="/${c.slug}/">
        <span class="cat-ic">${icon(c.icon)}</span>
        <span class="cat-name">${esc(c.name)}</span>
      </a>`,
    )
    .join('');

  return layout({ active: 'home', main: `<section class="panel"><div class="panel-body"><div class="cat-grid">${cards}</div></div></section>` });
}

// One audio player bar per page: a lesson's play button loads it here. The
// audio streams from the Shaykh's site (or miraath.net).
const PLAYER = `<div class="player" hidden>
  <div class="player-title"></div>
  <audio controls preload="none"></audio>
</div>
<script>
  // One player for the page: a lesson's play button loads it here.
  var bar = document.querySelector('.player'), au = bar.querySelector('audio'), cur = null;
  function sync() {
    document.querySelectorAll('.lesson').forEach(function (r) {
      var on = r === cur && !au.paused;
      r.classList.toggle('playing', on);
      r.querySelector('.play').setAttribute('aria-label', on ? 'إيقاف' : 'استماع');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.play'); if (!b) return;
    var r = b.closest('.lesson');
    if (r === cur) { au.paused ? au.play() : au.pause(); return; }
    cur = r;
    au.src = r.dataset.src;
    bar.querySelector('.player-title').textContent = r.querySelector('.row-title').textContent;
    bar.hidden = false;
    document.body.classList.add('has-player');
    au.play();
  });
  ['play', 'pause', 'ended'].forEach(function (ev) { au.addEventListener(ev, sync); });
</script>`;

// A category's lessons, then each of its sections (a scholar's works, a
// branch like النحو) as a foldable group, closed until tapped.
function categoryPage(c) {
  const rows = (items) => `<ul class="rows">${items.map((it) => itemRow(it, c)).join('')}</ul>`;
  const body = (c.items.length ? rows(c.items) : '') + (c.sections || []).map((s) => `<details class="chapter">
        <summary><span>${esc(s.title)}</span><span class="count">${s.items.length}</span></summary>
        ${rows(s.items)}
      </details>`).join('');
  return layout({ title: c.name, active: c.slug, main: panel(c.name, c.icon, body), extra: itemsOf(c).some((it) => it.audio) ? PLAYER : '' });
}

function lessonRow(l, i) {
  const meta = [l.date && `<span>${esc(l.date)}</span>`, l.size && `<span dir="ltr">${esc(l.size)}</span>`]
    .filter(Boolean).join('<i class="dot"></i>');
  return `<li class="row lesson" data-src="${esc(l.audio)}">
      <span class="num">${i + 1}</span>
      <div class="row-body"><div class="row-title">${esc(l.title)}</div>${meta ? `<div class="row-meta">${meta}</div>` : ''}</div>
      <a class="round-btn dl" href="${esc(l.download || l.audio)}" title="تحميل" aria-label="تحميل">${icon('download')}</a>
      <button class="round-btn play" type="button" title="استماع" aria-label="استماع">${icon('play', 'ic i-play')}${icon('pause', 'ic i-pause')}</button>
    </li>`;
}

// One page per book: its chapters and lessons, each playable here. The audio
// streams from the Shaykh's site.
function bookPage(c, it) {
  const book = lessonsOf(it);
  const list = (ls) => `<ul class="rows">${ls.map(lessonRow).join('')}</ul>`;
  const body = book.chapters.length === 1
    ? list(book.chapters[0].lessons)
    : book.chapters.map((ch, i) => `<details class="chapter"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(ch.title)}</span><span class="count">${ch.lessons.length}</span></summary>
        ${list(ch.lessons)}
      </details>`).join('');
  const head = `<div class="book-head">
      <a class="crumb" href="/${c.slug}/">${esc(c.name)}</a>
      ${it.note ? `<div class="book-note">${esc(it.note)}</div>` : ''}
    </div>`;

  return layout({ title: it.title, active: c.slug, main: panel(it.title, c.icon, head + body), extra: PLAYER });
}

// The brother's inbox: where he sends new additions (text and files). Not
// linked from any page; his link carries the key (/inbox/#key=...). The
// sending and listing is done by assets/inbox.js with functions/api/inbox/:
// his messages waiting to be added, then the ones added to the site with the
// user's reply and a link to where they were added.
function inboxPage() {
  const form = `<p class="inbox-error" id="no-key" hidden>هذا الرابط ينقصه المفتاح. افتح الرابط كاملًا كما أُرسل إليك.</p>
    <form id="send-form" class="inbox-form">
      <label for="text">الرسالة</label>
      <textarea id="text" name="text" rows="6" dir="auto"></textarea>
      <input id="files" type="file" multiple class="inbox-file-input">
      <label for="files" class="inbox-drop" id="drop">
        ${icon('clip')}
        <span><strong>إرفاق ملفات</strong><small>اضغط للاختيار أو اسحب الملفات إلى هنا</small></span>
      </label>
      <ul id="chosen" class="inbox-chosen"></ul>
      <div class="inbox-send">
        <button type="submit" class="btn">${icon('send')}<span>إرسال</span></button>
        <progress id="progress" max="100" value="0" hidden></progress>
      </div>
      <p id="send-status" class="inbox-status" role="status" aria-live="polite"></p>
    </form>`;
  const list = (id, empty) => `<p class="inbox-status" data-status="${id}" role="status" aria-live="polite"></p>
    <p class="inbox-empty" data-empty="${id}" hidden>${empty}</p>
    <ol id="${id}" class="inbox-messages"></ol>`;
  const counted = (title, iconName, id, body) => panel(title, iconName, body)
    .replace('<section class="panel">', `<section class="panel inbox-panel" id="panel-${id}">`)
    .replace('</h2>', `</h2><span class="inbox-count" data-count="${id}"></span>`);
  return layout({
    title: 'إرسال إضافات',
    active: '',
    main: panel('إرسال إضافات', 'pen', form)
      + counted('بانتظار الإضافة', 'clock', 'waiting', list('waiting', 'لا توجد رسائل بانتظار الإضافة.'))
      + counted('أُضيفت إلى الموقع', 'check', 'added', list('added', 'لم يُضف شيء بعد.')),
    extra: '<script src="/assets/inbox.js" defer></script>',
  });
}

function notFound() {
  const main = panel('الصفحة غير موجودة', 'info', `<p style="text-align:center"><a class="btn" href="/">الرئيسية</a></p>`);
  return layout({ title: 'الصفحة غير موجودة', active: '', main });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync('assets', `${OUT}/assets`, { recursive: true });
write(`${OUT}/index.html`, homePage());
write(`${OUT}/404.html`, notFound());
mkdirSync(`${OUT}/inbox`, { recursive: true });
write(`${OUT}/inbox/index.html`, inboxPage());
for (const c of categories) {
  mkdirSync(`${OUT}/${c.slug}`, { recursive: true });
  write(`${OUT}/${c.slug}/index.html`, categoryPage(c));
}
const books = categories.flatMap((c) => itemsOf(c).filter((it) => it.slug).map((it) => [c, it]));
for (const [c, it] of books) {
  mkdirSync(`${OUT}/${c.slug}/${it.slug}`, { recursive: true });
  write(`${OUT}/${c.slug}/${it.slug}/index.html`, bookPage(c, it));
}
console.log(`Built ${categories.length + books.length + 2} pages into ${OUT}/`);
