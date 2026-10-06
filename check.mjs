// Checks the built site: every page exists and every internal link points to a real page.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { categories, itemsOf } from './src/content.mjs';

const books = categories.flatMap((c) => itemsOf(c).filter((it) => it.slug).map((it) => ({ c, it })));
const pages = [
  'dist/index.html', 'dist/404.html', 'dist/inbox/index.html',
  ...categories.map((c) => `dist/${c.slug}/index.html`),
  ...books.map(({ c, it }) => `dist/${c.slug}/${it.slug}/index.html`),
];
let errors = 0;
const fail = (m) => { console.error('✗', m); errors++; };

for (const p of pages) {
  if (!existsSync(p)) { fail(`missing ${p}`); continue; }
  const html = readFileSync(p, 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = join('dist', href.endsWith('/') ? `${href}index.html` : href);
    if (!existsSync(target)) fail(`${p} links to ${href}, which does not exist`);
  }
  for (const c of categories) if (!html.includes(`href="/${c.slug}/"`)) fail(`${p} has no link to ${c.name}`);
}
const slugs = categories.map((c) => c.slug);
if (new Set(slugs).size !== slugs.length) fail('two categories share the same slug');
for (const c of categories) for (const it of itemsOf(c)) if (!it.title) fail(`an item in ${c.name} has no title`);

for (const { it } of books) {
  const f = `src/lessons/${it.slug}.json`;
  if (!existsSync(f)) { fail(`${it.title} has no lesson list: run npm run import -- ${it.slug}`); continue; }
  const { chapters } = JSON.parse(readFileSync(f, 'utf8'));
  if (!chapters.length || chapters.some((ch) => !ch.lessons.length)) fail(`${f}: a chapter has no lessons`);
  for (const ch of chapters) for (const l of ch.lessons) {
    // mimham.net serves its mp3s at addresses like /audcha-165-1, with no .mp3 ending.
    if (!l.title || !/^https:\/\/(.+\.mp3|www\.mimham\.net\/aud[a-z]+-[\d-]+)$/i.test(l.audio)) fail(`${f}: a lesson has no title or audio address`);
  }
}
const bookSlugs = books.map(({ c, it }) => `${c.slug}/${it.slug}`);
if (new Set(bookSlugs).size !== bookSlugs.length) fail('two books share the same slug');

if (errors) process.exit(1);
console.log(`✓ ${pages.length} pages OK`);
