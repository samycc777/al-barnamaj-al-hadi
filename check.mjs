// Checks the built site: every page exists and every internal link points to a real page.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { categories } from './src/content.mjs';

const pages = ['dist/index.html', 'dist/404.html', ...categories.map((c) => `dist/${c.slug}/index.html`)];
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
for (const c of categories) for (const it of c.items) if (!it.title) fail(`an item in ${c.name} has no title`);

if (errors) process.exit(1);
console.log(`✓ ${pages.length} pages OK`);
