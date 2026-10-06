// /api/inbox/status: marks a message as added to the site ("done") or back to
// waiting ("new"), with a short reply the brother sees under his message.
// Body: {"id": "...", "status": "done", "reply": "Added to the Sudan page."}
import { hasInboxKey, isMessageId, json } from "../../_lib/inbox.js";

export async function onRequestPost({ request, env }) {
  if (!(await hasInboxKey(request, env))) return json({ error: "Wrong or missing inbox key." }, 403);

  const { id, status, reply } = await request.json().catch(() => ({}));
  if (!isMessageId(id) || !["new", "done"].includes(status)) {
    return json({ error: "Send an id and a status of new or done." }, 400);
  }

  const key = `messages/${id}.json`;
  const stored = await env.INBOX.get(key);
  if (!stored) return json({ error: "Unknown message." }, 404);

  const message = await stored.json();
  message.status = status;
  message.reply = String(reply ?? message.reply ?? "").trim();
  message.doneAt = status === "done" ? new Date().toISOString() : "";
  await env.INBOX.put(key, JSON.stringify(message), {
    httpMetadata: { contentType: "application/json" },
  });
  return json({ message });
}
