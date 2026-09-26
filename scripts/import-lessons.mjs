// Copies the lesson list of every book that has a `source` (a lessons page on
// al-abbaad.com) into src/lessons/<slug>.json: chapters, lesson titles, dates
// and the address of each audio file and of its download link. The audio itself stays on the Shaykh's
// site; our pages play it from there.
//
//   npm run import            all books
//   npm run import -- <slug>  one book
import { mkdirSync, writeFileSync } from 'node:fs';
import { categories } from '../src/content.mjs';

const ORIGIN = 'https://al-abbaad.com';
const only = process.argv[2];

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const clean = (s) => decode(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function get(path) {
  const res = await fetch(new URL(path, ORIGIN));
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return res.text();
}

// "05باب الوليمة   11-08-1434" → { n: 5, title: 'باب الوليمة', date: '1434/08/11' }
function parseTitle(raw) {
  let t = clean(raw);
  let date = '';
  const d = t.match(/\s*(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s*(?:هـ|ه)?\s*$/);
  if (d) {
    date = `${d[3]}/${d[2].padStart(2, '0')}/${d[1].padStart(2, '0')}`;
    t = t.slice(0, d.index);
  }
  let n = null;
  const m = t.match(/^\s*(\d+)\s*[-_.]?\s*/);
  if (m) {
    n = Number(m[1]);
    t = t.slice(m[0].length);
  }
  return { n, title: t.trim() || clean(raw), date };
}

// A page listing audio files → its lessons, in order.
function lessonsOf(html) {
  const out = [];
  const re = /class="judulsingle".*?<a href="[^"]*ids=(\d+)">([\s\S]*?)<\/a>[\s\S]*?href="([^"]+\.mp3)"[\s\S]*?class="besarfile">([^<]*)</g;
  for (const [, id, raw, mp3, size] of html.matchAll(re)) {
    out.push({ ...parseTitle(raw), audio: new URL(mp3, ORIGIN).href, download: `${ORIGIN}/download/?type=audio&ids=${id}`, size: /\d/.test(size) ? clean(size).replace(/\s+/, ' ') : '' });
  }
  return out.sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
}

// A page listing chapters → [{ title, path }], in order.
function chaptersOf(html) {
  const out = [];
  for (const [, path, raw] of html.matchAll(/<a[^>]+href="(\/lecture\/[^"]*\?type=(?:files|dir)&(?:amp;)?parent=[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const { n, title } = parseTitle(raw);
    if (!out.some((c) => c.path === path)) out.push({ n, title, path: decode(path) });
  }
  return out.sort((a, b) => (a.n ?? 0) - (b.n ?? 0));
}

async function importBook(item) {
  const html = await get(item.source);
  let chapters;
  if (item.source.includes('type=dir')) {
    chapters = [];
    for (const c of chaptersOf(html)) {
      const lessons = lessonsOf(await get(c.path));
      if (lessons.length) chapters.push({ title: c.title, lessons });
    }
  } else {
    chapters = [{ title: '', lessons: lessonsOf(html) }];
  }
  const count = chapters.reduce((s, c) => s + c.lessons.length, 0);
  if (!count) throw new Error(`no lessons found on ${item.source}`);
  writeFileSync(`src/lessons/${item.slug}.json`, JSON.stringify({ source: new URL(item.source, ORIGIN).href, chapters }, null, 2) + '\n');
  console.log(`${item.slug}: ${chapters.length} chapter(s), ${count} lessons`);
}

mkdirSync('src/lessons', { recursive: true });
const books = categories.flatMap((c) => c.items).filter((it) => it.source && (!only || it.slug === only));
if (!books.length) throw new Error(only ? `no book with slug "${only}" and a source` : 'no book has a source');
for (const b of books) await importBook(b);
