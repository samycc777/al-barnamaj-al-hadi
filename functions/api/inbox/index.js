// /api/inbox: GET lists the newest messages in the brother's inbox (newest
// first); POST adds a new one (a form with "text" and any number of "files",
// together at most MAX_BYTES, the same limit as assets/inbox.js).
import { cleanFileName, hasInboxKey, json, newMessageId, uniqueName } from "../../_lib/inbox.js";
import { notifyNewMessage } from "../../_lib/notify.js";

const MAX_BYTES = 95 * 1024 * 1024;
const MAX_MESSAGES = 300;
const BATCH = 25;

export async function onRequestGet({ request, env }) {
  if (!(await hasInboxKey(request, env))) return json({ error: "Wrong or missing inbox key." }, 403);

  const keys = [];
  let cursor;
  do {
    const page = await env.INBOX.list({ prefix: "messages/", cursor });
    keys.push(...page.objects.map((object) => object.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  // Ids sort by time: read only the newest ones, a few at a time.
  const newest = keys.sort().reverse().slice(0, MAX_MESSAGES);
  const messages = [];
  for (let i = 0; i < newest.length; i += BATCH) {
    messages.push(...(await Promise.all(
      newest.slice(i, i + BATCH).map(async (key) => (await env.INBOX.get(key))?.json()),
    )));
  }
  const newestFirst = messages.filter(Boolean).sort((a, b) => b.id.localeCompare(a.id));
  return json({ messages: newestFirst });
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!(await hasInboxKey(request, env))) return json({ error: "Wrong or missing inbox key." }, 403);

  const form = await request.formData();
  const text = String(form.get("text") || "").trim();
  const uploads = form.getAll("files").filter((file) => typeof file === "object" && file.size > 0);
  if (!text && uploads.length === 0) return json({ error: "The message is empty." }, 400);
  if (uploads.reduce((total, file) => total + file.size, 0) > MAX_BYTES) {
    return json({ error: "The files are too big (over 95 MB)." }, 413);
  }

  const id = newMessageId();
  const taken = new Set();
  const files = [];

  for (const upload of uploads) {
    const name = uniqueName(cleanFileName(upload.name), taken);
    taken.add(name);
    const type = upload.type || "application/octet-stream";
    await env.INBOX.put(`files/${id}/${name}`, upload.stream(), {
      httpMetadata: { contentType: type },
    });
    files.push({ name, size: upload.size, type });
  }

  // Saved last, so a message only appears once all its files are stored.
  const message = { id, sentAt: new Date().toISOString(), text, files, status: "new", reply: "" };
  await env.INBOX.put(`messages/${id}.json`, JSON.stringify(message), {
    httpMetadata: { contentType: "application/json" },
  });
  // The alert goes out after the reply, so he never waits for it.
  waitUntil(notifyNewMessage(env, message));
  return json({ message }, 201);
}
