// Checks every external audio/download address in src/lessons/*.json and
// src/content.mjs, so lessons whose file has gone are found.
//
//   npm run links              all books
//   npm run links -- <slug>    one book
//   npm run links -- --alert   also send one Telegram message if links are broken
import { readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { categories, itemsOf } from '../src/content.mjs';

const args = process.argv.slice(2);
const alert = args.includes('--alert');
const only = args.find((a) => !a.startsWith('--'));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const PER_HOST = 8;
const TOTAL = 40;
const TIMEOUT = 20000;
const RETRIES = 2;
const PAUSE = 180000;

// url → { audio: bool, uses: [{ slug, label }] }
const urls = new Map();
function add(url, slug, label, isAudio) {
  if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) return;
  if (!urls.has(url)) urls.set(url, { audio: false, uses: [] });
  const e = urls.get(url);
  if (isAudio) e.audio = true;
  e.uses.push({ slug, label });
}

const lessonsDir = new URL('../src/lessons/', import.meta.url);
for (const f of readdirSync(lessonsDir).filter((f) => f.endsWith('.json'))) {
  const slug = f.replace(/\.json$/, '');
  if (only && slug !== only) continue;
  const data = JSON.parse(readFileSync(new URL(f, lessonsDir), 'utf8'));
  let n = 0;
  for (const ch of data.chapters || []) {
    for (const l of ch.lessons || []) {
      n++;
      const label = `${n}. ${l.title || ''}`.trim();
      add(l.audio, slug, label, true);
      add(l.download, slug, label, false);
    }
  }
}
for (const c of categories) {
  for (const it of itemsOf(c)) {
    const slug = it.slug || `${c.slug}/${it.title}`;
    if (only && it.slug !== only) continue;
    add(it.audio, slug, it.title, true);
    add(it.download, slug, it.title, false);
    add(it.url, slug, it.title, it.type === 'audio');
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One request; returns { status, type } or { error }.
async function once(url, method) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const headers = { 'User-Agent': UA };
    if (method === 'GET') headers.Range = 'bytes=0-0';
    const res = await fetch(url, { method, headers, redirect: 'follow', signal: ctrl.signal });
    if (method === 'GET') res.body?.cancel().catch(() => {});
    return { status: res.status, type: res.headers.get('content-type') || '' };
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) };
  } finally {
    clearTimeout(timer);
  }
}

const retryable = (r) => r.error || r.status >= 500 || r.status === 429;

async function check(url) {
  let r;
  for (let i = 0; i <= RETRIES; i++) {
    r = await once(url, 'HEAD');
    if (r.error || [403, 405, 501].includes(r.status)) r = await once(url, 'GET');
    if (!retryable(r)) break;
    if (i < RETRIES) await sleep(2000 * 2 ** i);
  }
  return r;
}

// Run jobs with a limit per host and overall.
// Hosts take turns in the queue, so all of them are busy at once.
const hostLists = new Map();
for (const u of urls.keys()) {
  const h = new URL(u).host;
  if (!hostLists.has(h)) hostLists.set(h, []);
  hostLists.get(h).push(u);
}
const queue = [];
for (let i = 0; queue.length < urls.size; i++) {
  for (const l of hostLists.values()) if (i < l.length) queue.push(l[i]);
}
const active = new Map();
let done = 0;
const broken = new Map(); // url → status text
const warnings = [];

async function worker() {
  while (true) {
    // pick the next url whose host has room
    let pick = -1;
    for (let i = 0; i < queue.length; i++) {
      const h = new URL(queue[i]).host;
      if ((active.get(h) || 0) < PER_HOST) { pick = i; break; }
    }
    if (pick === -1) {
      if (!queue.length) return;
      await sleep(50);
      continue;
    }
    const [url] = queue.splice(pick, 1);
    const host = new URL(url).host;
    active.set(host, (active.get(host) || 0) + 1);
    const r = await check(url);
    active.set(host, active.get(host) - 1);
    if (r.error) broken.set(url, r.error);
    else if (r.status < 200 || r.status >= 300) broken.set(url, String(r.status));
    else if (urls.get(url).audio && /^text\/|json|xml/i.test(r.type)) warnings.push(`${url} (${r.type})`);
    if (++done % 500 === 0) console.log(`${done}/${urls.size} checked, ${broken.size} broken`);
  }
}

async function sendAlert(text) {
  const dir = `${homedir()}/.config/brother-alerts/`;
  const token = readFileSync(dir + 'telegram-token', 'utf8').trim();
  const chat = readFileSync(dir + 'telegram-chat-id', 'utf8').trim();
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text }),
  });
  if (!res.ok) console.error(`Telegram answered ${res.status}`);
}

async function main() {
  const started = Date.now();
  console.log(`Checking ${urls.size} addresses...`);
  await Promise.all(Array.from({ length: TOTAL }, worker));

  // Second pass: re-check each failure after a pause, one at a time per host,
  // so rate limits do not give false alarms.
  if (broken.size) {
    console.log(`${broken.size} failed; re-checking them in ${PAUSE / 1000}s...`);
    await sleep(PAUSE);
    const first = new Map(broken);
    broken.clear();
    const byHost = new Map();
    for (const u of first.keys()) {
      const h = new URL(u).host;
      if (!byHost.has(h)) byHost.set(h, []);
      byHost.get(h).push(u);
    }
    const recovered = [];
    await Promise.all([...byHost.values()].map(async (list) => {
      for (const url of list) {
        const r = await check(url);
        if (r.error) broken.set(url, r.error);
        else if (r.status < 200 || r.status >= 300) broken.set(url, String(r.status));
        else recovered.push(`${url} (was ${first.get(url)})`);
      }
    }));
    if (recovered.length) console.log(`\nRecovered on the re-check (${recovered.length}):\n  ${recovered.join('\n  ')}`);
  }

  const byBook = new Map();
  for (const [url, status] of broken) {
    for (const u of urls.get(url).uses) {
      if (!byBook.has(u.slug)) byBook.set(u.slug, []);
      byBook.get(u.slug).push(`  ${status}  ${u.label}\n        ${url}`);
    }
  }
  for (const [slug, lines] of [...byBook].sort()) console.log(`\n${slug}\n${lines.join('\n')}`);
  if (warnings.length) console.log(`\nWarning: audio answered with a non-audio type:\n  ${warnings.join('\n  ')}`);
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(`\n${urls.size} checked, ${broken.size} broken in ${byBook.size} books, ${warnings.length} warnings (${secs}s)`);

  if (alert && broken.size) {
    const books = [...byBook.keys()].sort();
    const shown = books.slice(0, 15).join(', ') + (books.length > 15 ? `, and ${books.length - 15} more` : '');
    await sendAlert(`Tasil ilm: ${broken.size} lesson links are broken (books: ${shown}). Ask Claude to fix the broken links.`);
  }
  process.exit(broken.size ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  if (alert) {
    try { await sendAlert(`Tasil ilm: the link check crashed (${e.message}). Ask Claude to look at it.`); } catch {}
  }
  process.exit(2);
});
