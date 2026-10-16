// Local preview: builds the site, serves dist/ on http://localhost:4321, and
// rebuilds + reloads the open page whenever a source file changes. No dependencies.
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 4321;
const OUT = 'dist';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
// Added to HTML only while previewing; the built files in dist/ stay untouched.
// A file, not an inline script, so the site's Content-Security-Policy allows it.
const RELOAD = '<script src="/__reload.js"></script>';

const clients = new Set();

// The headers Cloudflare adds from dist/_headers (written by build.mjs), so the
// preview runs under the same rules (the Content-Security-Policy above all).
async function headersFor(url) {
  let text = '';
  try { text = await readFile(join(OUT, '_headers'), 'utf8'); } catch { return {}; }
  const out = {};
  let match = false;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) {
      const rule = line.trim();
      match = rule.endsWith('*') ? url.startsWith(rule.slice(0, -1)) : url === rule;
    } else if (match) {
      const i = line.indexOf(':');
      out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
  }
  return out;
}

function build() {
  const t = Date.now();
  const r = spawnSync(process.execPath, ['build.mjs'], { stdio: 'inherit' });
  if (r.status !== 0) { console.log('Build failed; the page keeps the last good version.'); return false; }
  console.log(`Rebuilt in ${Date.now() - t} ms`);
  return true;
}

async function file(path) {
  try { if ((await stat(path)).isFile()) return path; } catch {}
  return null;
}

const server = createServer(async (req, res) => {
  // A malformed address (a stray %) would otherwise crash the preview.
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400).end('Bad address'); return; }
  if (url === '/__reload.js') {
    res.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' });
    res.end('new EventSource("/__reload").onmessage = () => location.reload();');
    return;
  }
  if (url === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const base = join(OUT, normalize(url).replace(/^(\.\.[/\\])+/, ''));
  let path = (await file(base)) || (await file(join(base, 'index.html'))) || (await file(base + '.html'));
  let status = 200;
  if (!path) { path = join(OUT, '404.html'); status = 404; }
  try {
    let body = await readFile(path);
    const type = TYPES[extname(path)] || 'application/octet-stream';
    if (type.startsWith('text/html')) body = body.toString().replace('</body>', RELOAD + '</body>');
    res.writeHead(status, { ...(await headersFor(url)), 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`The preview is already running at http://localhost:${PORT}/ (in another window).`);
    process.exit(0);
  }
  throw e;
});

build();
server.listen(PORT, () => console.log(`Preview: http://localhost:${PORT}/  (rebuilds on every change; Ctrl+C to stop)`));

// Folders are watched rather than single files, because git replaces files on merge.
let timer;
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(() => { if (build()) for (const c of clients) c.write('data: reload\n\n'); }, 200);
};
for (const dir of ['src', 'assets']) watch(dir, { recursive: true }, changed);
watch('.', (_, name) => { if (name === 'build.mjs') changed(); });
