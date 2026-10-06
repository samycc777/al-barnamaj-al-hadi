// /api/inbox/file?id=<message id>&name=<file name>: downloads one attached
// file. Used by scripts/inbox.mjs, never shown on a page.
import { hasInboxKey, isMessageId, json } from "../../_lib/inbox.js";

export async function onRequestGet({ request, env }) {
  if (!(await hasInboxKey(request, env))) return json({ error: "Wrong or missing inbox key." }, 403);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const name = url.searchParams.get("name") || "";
  if (!isMessageId(id) || !name || name.includes("/")) return json({ error: "Unknown file." }, 404);

  const file = await env.INBOX.get(`files/${id}/${name}`);
  if (!file) return json({ error: "Unknown file." }, 404);

  // Always a download, never opened as a page on this site.
  return new Response(file.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}
