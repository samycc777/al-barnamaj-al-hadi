// Shared helpers for the brother's inbox (the /inbox/ page and /api/inbox).
// Each message is one JSON file in the private INBOX bucket:
//   messages/<id>.json  the text, the list of attached files and its status
//   files/<id>/<name>   each attached file
// Only someone with the inbox key (the INBOX_KEY secret) may read or write.

const encoder = new TextEncoder();

// The page and scripts send the key in this header.
export const KEY_HEADER = "X-Inbox-Key";

export async function hasInboxKey(request, env) {
  if (!env.INBOX_KEY) return false;
  const sent = request.headers.get(KEY_HEADER) || "";
  // Compare hashes so the check takes the same time whatever was sent.
  const [sentHash, keyHash] = await Promise.all([hash(sent), hash(env.INBOX_KEY)]);
  return sentHash === keyHash;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

// Sortable by time, plus a few random letters so two messages sent in the
// same second never share an id: 2026-10-07T14-03-22-k3f9.
export function newMessageId(now = new Date()) {
  const time = now.toISOString().slice(0, 19).replaceAll(":", "-");
  const random = Math.random().toString(36).slice(2, 6).padEnd(4, "0");
  return `${time}-${random}`;
}

export function isMessageId(id) {
  return /^\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d-[a-z0-9]{4}$/.test(String(id));
}

// Keeps a file name readable (Arabic letters included) but safe as part of a
// storage path: no folders, no control characters, not too long.
export function cleanFileName(name) {
  const cleaned = String(name)
    .split(/[\\/]/)
    .pop()
    .split("")
    .filter((character) => character.charCodeAt(0) > 31 && character !== "\u007f")
    .join("")
    .replace(/["<>|?*:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "");
  if (!cleaned) return "file";
  if (cleaned.length <= 120) return cleaned;
  // Keep the extension when shortening a long name.
  const dot = cleaned.lastIndexOf(".");
  const extension = dot > 0 && cleaned.length - dot <= 10 ? cleaned.slice(dot) : "";
  return cleaned.slice(0, 120 - extension.length) + extension;
}

// Two attachments with the same name get "(2)", "(3)"… so neither is lost.
export function uniqueName(name, taken) {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : "";
  let number = 2;
  while (taken.has(`${base} (${number})${extension}`)) number++;
  return `${base} (${number})${extension}`;
}

async function hash(text) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
