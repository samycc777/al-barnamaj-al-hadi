// Tells Bing (and the other IndexNow engines) about every page in the live sitemap, so new books
// show in their search quickly. Run after a deploy: `npm run indexnow`. Google doesn't use
// IndexNow; it reads the sitemap through Search Console.
import { INDEXNOW_KEY } from '../src/indexnow-key.mjs';
import { site } from '../src/content.mjs';

const host = new URL(site.url).host;
const xml = await (await fetch(`${site.url}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${site.url}/${INDEXNOW_KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} pages sent, answer ${res.status} ${await res.text()}`);
if (!res.ok) process.exit(1);
