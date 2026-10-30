// Builds the static site into dist/ from src/content.mjs. No dependencies.
import { mkdirSync, rmSync, writeFileSync, cpSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { site, categories, itemsOf, removed } from './src/content.mjs';
import { mirrorKey } from './scripts/mirror-key.mjs';

// `npm run check` builds into its own folder so it never races the preview,
// which rebuilds dist/ whenever a file changes.
const OUT = process.env.OUT || 'dist';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Page text: a bracketed part that doesn't fit at the end of a line moves to the
// next line whole instead of being split (.paren in style.css).
const txt = (s = '') => esc(s).replace(/\([^()]*(\)|$)/g, (m) => `<span class="paren">${m}</span>`);

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
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
  back: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 3.5v4h4"/>',
  fwd: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 3.5v4h-4"/>',
};
// Each icon is drawn once per page (a hidden sprite at the top of the body,
// made by layout()) and used by reference, so long lesson lists stay light.
const usedIcons = new Set();
const icon = (name, cls = 'ic') => {
  usedIcons.add(name);
  return `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
};
const sprite = () => `<svg class="sprite" aria-hidden="true">${[...usedIcons]
  .map((n) => `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</symbol>`)
  .join('')}</svg>`;

// The search page's index (/assets/search.json), filled while the pages are
// built so each lesson's row number matches its page: pages are
// [title, path, subtitle, is a book], lessons [title, page, row number,
// chapter (-1: none)], chapters their titles.
const search = { pages: [], chapters: [], lessons: [] };
let page = { index: -1, rows: 0, chapter: -1 };
function startPage(entry) {
  page = { index: search.pages.push(entry) - 1, rows: 0, chapter: -1 };
}
// Lessons found by their chapter's name too (كتاب الطهارة…).
function startChapter(title) {
  page.chapter = title ? search.chapters.push(title) - 1 : -1;
}
// Gives a playable row its id (l-1, l-2…, used by search links) and lists it.
function nextRow(title) {
  page.rows++;
  search.lessons.push([title, page.index, page.rows, page.chapter]);
  return `l-${page.rows}`;
}

const TYPE = {
  audio: { icon: 'mic', label: 'استماع', action: 'play' },
  video: { icon: 'video', label: 'مشاهدة', action: 'play' },
  pdf: { icon: 'file', label: 'تحميل', action: 'download' },
  article: { icon: 'file', label: 'قراءة', action: 'play' },
  link: { icon: 'link', label: 'فتح', action: 'play' },
};

// Audio copied into our R2 bucket plays from there (/media/, functions/media/):
// files listed in src/mirrored.json (copied by ~/dev/tool-r2-mirror) and the
// bucket's own files on its r2.dev address. Anything else plays from its host.
// The original address stays the lesson's id (data-src), so listeners keep
// their saved place; data-file is what actually plays.
const R2_PUBLIC = 'https://pub-04b2ff031f654021aecd7529acd87d9c.r2.dev/';
const mirrored = new Set(JSON.parse(readFileSync('src/mirrored.json', 'utf8')));
const encodeKey = (key) => '/media/' + key.split('/').map(encodeURIComponent).join('/');
const fileOf = (url) => {
  if (!url) return url;
  if (url.startsWith(R2_PUBLIC)) return encodeKey(decodeURIComponent(url.slice(R2_PUBLIC.length)));
  const key = mirrorKey(url);
  return mirrored.has(key) ? encodeKey(key) : url;
};
const downloadOf = (x) => (fileOf(x.audio) !== x.audio ? fileOf(x.audio) + '?download' : x.download || x.audio);
// `skip: [[from, to], …]` (seconds): silent stretches in a raw tape (the
// side change) that the player jumps over.
const audioAttrs = (x) => ` data-src="${esc(x.audio)}"${fileOf(x.audio) !== x.audio ? ` data-file="${esc(fileOf(x.audio))}"` : ''}${x.skip ? ` data-skip="${x.skip.map((r) => r.join('-')).join(',')}"` : ''}`;

// A book's lessons, copied from the Shaykh's site by `npm run import`.
const lessonsOf = (it) => JSON.parse(readFileSync(`src/lessons/${it.slug}.json`, 'utf8'));
const lessonCount = (book) => book.chapters.reduce((n, c) => n + c.lessons.length, 0);
// Shown after each commentator's name wherever the commentaries are listed (Zaid).
const countNote = (x) => `<span class="v-count">عدد الدروس: ${lessonCount(lessonsOf(x))}</span>`;

// Another shaykh's commentary on the same book is its own item, right after
// the first, with `variantOf: '<first one's slug>'`. The category lists the
// book once; each commentary's page lets the visitor switch between them.
const listed = (items) => items.filter((it) => !it.variantOf);
const commentaries = (c, it) => {
  const first = it.variantOf || it.slug;
  return itemsOf(c).filter((x) => x.slug && (x.slug === first || x.variantOf === first));
};

function itemRow(it, c) {
  const t = TYPE[it.type] || TYPE.link;
  const book = it.slug && lessonsOf(it);
  const all = book ? commentaries(c, it) : [];
  const meta = (all.length > 1 ? [
    `<span>عدد الشروح: ${all.length}</span>`,
    `<span class="notes">${all.map((x) => `<span>${txt(x.note)} ${countNote(x)}</span>`).join(' ')}</span>`,
  ] : [
    book && `<span>عدد الدروس: ${lessonCount(book)}</span>`,
    it.date && `<span>${esc(it.date)}</span>`,
    it.note && `<span>${txt(it.note)}</span>`,
  ]).filter(Boolean).join('<i class="dot"></i>');
  const btn = book
    ? `<a class="round-btn" href="/${c.slug}/${it.slug}/" title="الدروس" aria-label="الدروس">${icon('chevron')}</a>`
    : it.audio
    ? `<a class="round-btn dl" href="${esc(downloadOf(it))}" title="تحميل" aria-label="تحميل: ${esc(it.title)}">${icon('download')}</a>
      <button class="round-btn play" type="button" title="استماع" aria-label="استماع: ${esc(it.title)}">${icon('play', 'ic i-play')}${icon('pause', 'ic i-pause')}</button>`
    : it.url
    ? `<a class="round-btn" href="${esc(it.url)}" target="_blank" rel="noopener" title="${t.label}" aria-label="${t.label}">${icon(t.action)}</a>`
    : '';
  const id = !book && it.audio ? ` id="${nextRow(it.title)}"` : '';
  return `<li class="row${it.audio ? ' lesson' : ''}"${id}${it.audio ? audioAttrs(it) : ''}>
      <span class="row-ic">${icon(t.icon)}</span>
      <div class="row-body"><div class="row-title">${book ? `<a href="/${c.slug}/${it.slug}/">${txt(it.title)}</a>` : txt(it.title)}</div>${meta ? `<div class="row-meta">${meta}</div>` : ''}</div>
      ${btn}
    </li>`;
}

function panel(title, iconName, body) {
  return `<section class="panel">
    <header class="panel-head"><span class="badge">${icon(iconName)}</span><h2>${txt(title)}</h2></header>
    <div class="panel-body">${body}</div>
  </section>`;
}

// Light unless the visitor chose dark with the button. Runs inline before the
// page shows, so it doesn't flash; _headers allows it by its hash.
const THEME = `
  (function () {
    var t; try { t = localStorage.getItem('theme'); } catch (e) {}
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  })();
`;
const THEME_HASH = createHash('sha256').update(THEME).digest('base64');

// Fonts the top of every page shows at once: fetched before the stylesheet asks.
const PRELOAD = ['tajawal-400-arabic', 'aref-ruqaa-700-arabic']
  .map((f) => `<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n');

function layout({ title, active, main, extra = '', path = '/', app = true, description = site.description }) {
  const pageTitle = title ? `${title} — ${site.name}` : site.name;
  // The icons the template itself uses, so the sprite holds them too.
  ['menu', 'moon', 'sun', 'search'].forEach((n) => usedIcons.add(n));
  const icons = sprite();
  usedIcons.clear();
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
<meta name="description" content="${esc(description)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="ar_SA">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:url" content="${site.url}${path}">
<meta property="og:image" content="${site.url}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${site.url}${path}">
<meta name="theme-color" content="#6a3c18">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
${app ? '<link rel="manifest" href="/assets/manifest.webmanifest">\n' : ''}<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="البرنامج الهادي">
${PRELOAD}
<link rel="stylesheet" href="/assets/style.css">
<script>${THEME}</script>
<script src="/assets/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">تخطي إلى المحتوى</a>
${icons}
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
      <a class="search-btn${active === 'search' ? ' active' : ''}" href="/search/" title="بحث" aria-label="بحث"${active === 'search' ? ' aria-current="page"' : ''}>${icon('search')}</a>
      <button class="theme-btn" type="button" title="الوضع الليلي" aria-label="الوضع الليلي" aria-pressed="false">${icon('moon', 'ic i-moon')}${icon('sun', 'ic i-sun')}</button>
      <ul id="nav-list">${nav}</ul>
    </div>
  </nav>
</header>
<main class="container" id="main" tabindex="-1">
${main}
</main>
<footer class="site-foot">
  <div class="container foot-inner">
    <span class="foot-name">${esc(site.name)}</span>
  </div>
</footer>
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

  // The last lesson played, filled in by assets/site.js. It lists the pages
  // that can play lessons, so a removed book's lesson is never offered.
  const paths = categories.flatMap((c) => [`/${c.slug}/`, ...itemsOf(c).filter((it) => it.slug).map((it) => `/${c.slug}/${it.slug}/`)]);
  const last = `<section class="panel continue" hidden data-paths="${esc(JSON.stringify(paths))}">
    <header class="panel-head"><span class="badge">${icon('clock')}</span><h2>متابعة الاستماع</h2></header>
    <div class="panel-body"><ul class="rows"><li class="row">
      <span class="row-ic">${icon('mic')}</span>
      <div class="row-body"><div class="row-title"></div><div class="row-meta"><span></span></div></div>
      <a class="round-btn" href="/" title="متابعة">${icon('play')}</a>
    </li></ul></div>
  </section>`;
  return layout({ active: 'home', main: `${last}<section class="panel"><div class="panel-body"><div class="cat-grid">${cards}</div></div></section>` });
}

// One audio player bar per page: a lesson's play button loads it here. The
// audio streams from our R2 copy (/media/), or from its host if not copied yet.
const PLAYER = () => `<div class="player" hidden>
  <div class="player-title" role="status"></div>
  <div class="player-controls" dir="ltr">
    <button class="pbtn back" type="button" title="رجوع ١٥ ثانية" aria-label="رجوع 15 ثانية">${icon('back')}<span>15</span></button>
    <audio controls preload="none"></audio>
    <button class="pbtn fwd" type="button" title="تقديم ١٥ ثانية" aria-label="تقديم 15 ثانية"><span>15</span>${icon('fwd')}</button>
    <button class="pbtn rate" type="button" title="سرعة التشغيل" aria-label="سرعة التشغيل">1×</button>
  </div>
</div>
<script src="/assets/player.js" defer></script>`

// A category's lessons, then each of its sections (a scholar's works, a
// branch like النحو) as a foldable group, closed until tapped.
function categoryPage(c) {
  startPage([c.name, `/${c.slug}/`, '', 0]);
  const rows = (items) => `<ul class="rows">${listed(items).map((it) => itemRow(it, c)).join('')}</ul>`;
  const body = (c.items.length ? rows(c.items) : '') + (c.sections || []).map((s) => (startChapter(s.title), `<details class="chapter">
        <summary><h3>${txt(s.title)}</h3><span class="count">${listed(s.items).length}</span></summary>
        ${rows(s.items)}
      </details>`)).join('');
  return layout({ title: c.name, active: c.slug, path: `/${c.slug}/`, main: panel(c.name, c.icon, body), extra: itemsOf(c).some((it) => it.audio) ? PLAYER() : '' });
}

// Numbered across the whole book, like the row ids (#l-<n>) that search links use.
function lessonRow(l) {
  const id = nextRow(/^\d+_[\d-]+$/.test(l.title) ? '' : l.title);
  const n = page.rows;
  // Some lessons on the Shaykh's site are titled with their file name only.
  const title = /^\d+_[\d-]+$/.test(l.title) ? `الدرس ${n}` : l.title;
  const meta = [l.date && `<span>${esc(l.date)}</span>`, l.size && `<span dir="ltr">${esc(l.size)}</span>`]
    .filter(Boolean).join('<i class="dot"></i>');
  return `<li class="row lesson" id="${id}"${audioAttrs(l)}>
      <span class="num">${n}</span>
      <div class="row-body"><div class="row-title">${txt(title)}</div>${meta ? `<div class="row-meta">${meta}</div>` : ''}</div>
      <a class="round-btn dl" href="${esc(downloadOf(l))}" title="تحميل" aria-label="تحميل: ${esc(title)}">${icon('download')}</a>
      <button class="round-btn play" type="button" title="استماع" aria-label="استماع: ${esc(title)}">${icon('play', 'ic i-play')}${icon('pause', 'ic i-pause')}</button>
    </li>`;
}

// The commentaries of this page's book, this one marked: tapping another
// opens its page.
// `label` names a commentary on another sharh beside its scholar, since the
// same scholar can appear twice.
const variantName = (x) => txt(x.label ? `${x.note} «${x.label}»` : x.note);

function choice(c, it) {
  const all = commentaries(c, it);
  if (all.length < 2) return '';
  return `<nav class="variants" aria-label="الشروح"><span class="variants-label">الشروح:</span><ul>${all.map((x) => x === it
    ? `<li><span class="variant active" aria-current="page">${variantName(x)}</span> ${countNote(x)}</li>`
    : `<li><a class="variant" href="/${c.slug}/${x.slug}/">${variantName(x)}</a> ${countNote(x)}</li>`).join('')}</ul></nav>`;
}

// One page per book: its chapters and lessons, each playable here. The audio
// streams from the Shaykh's site.
function bookPage(c, it) {
  startPage([it.title, `/${c.slug}/${it.slug}/`, it.note || c.name, 1]);
  const book = lessonsOf(it);
  const list = (ls) => `<ul class="rows">${ls.map((l) => lessonRow(l)).join('')}</ul>`;
  const body = book.chapters.length === 1
    ? list(book.chapters[0].lessons)
    : book.chapters.map((ch, i) => (startChapter(ch.title), `<details class="chapter"${i === 0 ? ' open' : ''}>
        <summary><h3>${txt(ch.title)}</h3><span class="count">${ch.lessons.length}</span></summary>
        ${list(ch.lessons)}
      </details>`)).join('');
  const head = `<div class="book-head">
      <a class="crumb" href="/${c.slug}/">${esc(c.name)}</a>
      ${it.note ? `<div class="book-note">${txt(it.note)}</div>` : ''}
    </div>${choice(c, it)}${it.warning ? `<p class="book-warning"><b>تنبيه:</b> ${txt(it.warning)}</p>` : ''}`;

  return layout({ title: it.title, active: c.slug, path: `/${c.slug}/${it.slug}/`, main: panel(it.title, c.icon, head + body), extra: PLAYER(), description: [it.title, it.note].filter(Boolean).join(' — ') });
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
    // His key is in the link: no manifest, so adding this page to his home
    // screen keeps the link as it is instead of opening the home page.
    app: false,
  });
}

// Search across every book and lesson (assets/search.js with search.json).
function searchPage() {
  ['scroll', 'mic', 'chevron'].forEach((n) => usedIcons.add(n));
  const body = `<form id="search-form" class="search-form" role="search">
      <label for="q" class="visually-hidden">ابحث في الكتب والدروس</label>
      <input id="q" type="search" dir="auto" autocomplete="off" placeholder="ابحث في الكتب والدروس">
    </form>
    <p id="search-status" class="search-status" role="status" aria-live="polite"></p>
    <div id="book-results" class="results" hidden></div>
    <div id="lesson-results" class="results" hidden></div>`;
  return layout({ title: 'البحث', active: 'search', path: '/search/', main: panel('البحث', 'search', body), extra: '<script src="/assets/search.js" defer></script>' });
}

function notFound() {
  const main = panel('الصفحة غير موجودة', 'info', `<p class="center"><a class="btn" href="/">الرئيسية</a></p>`);
  return layout({ title: 'الصفحة غير موجودة', active: '', main });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync('assets', `${OUT}/assets`, { recursive: true });
cpSync('src/sw.js', `${OUT}/sw.js`); // at the root, so it covers every page
write(`${OUT}/index.html`, homePage());
write(`${OUT}/404.html`, notFound());
mkdirSync(`${OUT}/inbox`, { recursive: true });
write(`${OUT}/inbox/index.html`, inboxPage());
mkdirSync(`${OUT}/search`, { recursive: true });
write(`${OUT}/search/index.html`, searchPage());
for (const c of categories) {
  mkdirSync(`${OUT}/${c.slug}`, { recursive: true });
  write(`${OUT}/${c.slug}/index.html`, categoryPage(c));
}
const books = categories.flatMap((c) => itemsOf(c).filter((it) => it.slug).map((it) => [c, it]));
for (const [c, it] of books) {
  mkdirSync(`${OUT}/${c.slug}/${it.slug}`, { recursive: true });
  write(`${OUT}/${c.slug}/${it.slug}/index.html`, bookPage(c, it));
}
// For search engines: every page worth finding (not the inbox or the 404).
const pagePaths = ['/', '/search/', ...categories.map((c) => `/${c.slug}/`), ...books.map(([c, it]) => `/${c.slug}/${it.slug}/`)];
writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagePaths.map((p) => `<url><loc>${site.url}${p}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
// Lessons titled with a file name only ("الدرس ٣" on the page) aren't worth finding.
writeFileSync(`${OUT}/assets/search.json`, JSON.stringify({ pages: search.pages, chapters: search.chapters, lessons: search.lessons.filter((l) => l[0]) }));

// Cloudflare Pages headers. Scripts, styles, fonts and pictures come only from
// this site (the theme snippet above by its hash); audio plays from /media/ or,
// if not copied there yet, from its host, so any https address. No other site may
// show these pages in a frame. The inbox stays out of search engines.
const CSP = [
  "default-src 'self'", `script-src 'self' 'sha256-${THEME_HASH}'`, "style-src 'self'", "img-src 'self' data:",
  "font-src 'self'", "media-src 'self' https:", "connect-src 'self'", "worker-src 'self'", "manifest-src 'self'",
  "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ');
// Fonts never change under the same name; the rest is kept an hour (not
// search.json, which changes with the lessons, and not the fonts folder).
const assetFiles = readdirSync('assets', { withFileTypes: true }).filter((e) => e.isFile() && e.name !== 'search.json').map((e) => e.name);
writeFileSync(`${OUT}/_headers`, `/*
  Content-Security-Policy: ${CSP}
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
${assetFiles.map((f) => `/assets/${f}\n  Cache-Control: public, max-age=3600`).join('\n')}
/inbox/*
  X-Robots-Tag: noindex, nofollow
  Referrer-Policy: no-referrer
/inbox
  X-Robots-Tag: noindex, nofollow
  Referrer-Policy: no-referrer
`);
writeFileSync(`${OUT}/_redirects`, removed.map(([from, to]) => `${from} ${to} 301\n${from.slice(0, -1)} ${to} 301`).join('\n') + '\n');
console.log(`Built ${categories.length + books.length + 4} pages into ${OUT}/`);
