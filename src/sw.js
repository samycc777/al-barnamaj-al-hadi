// Lets the site install as a web app and open pages already visited when
// offline. Pages and assets come from the network first (so new lessons show
// at once) and from the cache only when the network fails. A page never
// visited shows the home page when offline. Audio, the inbox and other sites
// are left alone. The cache keeps the most recent MAX files.
const CACHE = 'site-v2';
const MAX = 300;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()),
));

// Oldest first in the cache's list: drop from the front.
async function keep(req, res) {
  const cache = await caches.open(CACHE);
  await cache.delete(req);
  await cache.put(req, res);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX)).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/inbox/') || req.headers.has('range')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) e.waitUntil(keep(req, res.clone()));
        return res;
      })
      .catch(async () => (await caches.match(req, { ignoreSearch: true }))
        || (req.mode === 'navigate' && (await caches.match('/')))
        || Response.error()),
  );
});
