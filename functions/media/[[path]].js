// Serves the audio bucket al-barnamaj-al-hadi-media at /media/<key> (URL-encoded): copies made by
// ~/dev/tool-r2-mirror (src/<host>/<path>) and the files put there by hand (<book>/<file>).
// Supports byte ranges so audio and video can seek and large PDFs can stream.
const TYPES = {
  mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", wav: "audio/wav",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
  pdf: "application/pdf",
};

export async function onRequest({ request, env, waitUntil }) {
  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response("Method not allowed.", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  let path;
  try {
    path = decodeURIComponent(new URL(request.url).pathname.replace(/^\/media\//, ""));
  } catch {
    return new Response("Not found.", { status: 404 });
  }
  if (!path || path.split("/").includes("..") || !env.MEDIA) return new Response("Not found.", { status: 404 });

  // Whole-file responses are kept in the edge cache; the cache also answers range requests from a stored whole file.
  const cache = caches.default;
  if (request.method === "GET") {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  const rangeHeader = request.headers.get("Range");
  const range = rangeHeader ? parseRange(rangeHeader) : undefined;
  let object;
  try {
    object = request.method === "HEAD" ? await env.MEDIA.head(path) : await env.MEDIA.get(path, range ? { range } : undefined);
  } catch {
    // R2 rejects ranges that start beyond the end of the object.
    return new Response("Range not satisfiable.", { status: 416 });
  }
  if (!object) return new Response("Not found.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers); // Cache-Control set at upload (type and disposition are chosen below)
  headers.set("Accept-Ranges", "bytes");
  headers.set("X-Content-Type-Options", "nosniff");
  // The type comes from the file extension, never from what was stored with the object.
  const stored = (headers.get("Content-Disposition") ?? "").replace(/^\s*(inline|attachment)\s*;?\s*/i, "");
  const disposition = (kind) => (stored ? `${kind}; ${stored}` : kind); // keeps the stored file name
  // Addresses without an extension (mimham.net's audcha-…) keep the audio type they were stored with.
  const storedType = headers.get("Content-Type") ?? "";
  const type = TYPES[path.split(".").pop().toLowerCase()] ?? (storedType.startsWith("audio/") ? storedType : undefined);
  // Everything is sandboxed except PDFs: Chrome's built-in PDF viewer does not load inside a CSP sandbox.
  if (type !== "application/pdf") headers.set("Content-Security-Policy", "sandbox");
  if (type) {
    headers.set("Content-Type", type);
    headers.set("Content-Disposition", disposition("inline"));
  } else {
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Disposition", disposition("attachment"));
  }
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);

  // ?download forces a save dialog instead of opening in the browser.
  if (new URL(request.url).searchParams.has("download")) {
    headers.set("Content-Disposition", disposition("attachment"));
  }

  let status = 200;
  let length = object.size;
  if (range && object.range) {
    const offset = object.range.offset ?? object.size - object.range.suffix;
    length = object.range.length ?? object.size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    status = 206;
  }
  headers.set("Content-Length", String(length));

  const response = new Response(request.method === "HEAD" ? null : object.body, { status, headers });
  if (request.method === "GET" && status === 200) waitUntil(cache.put(request, response.clone()));
  return response;
}

function parseRange(value) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return undefined;
  if (!match[1]) return { suffix: Number(match[2]) };
  const offset = Number(match[1]);
  if (!match[2]) return { offset };
  const end = Number(match[2]);
  return end >= offset ? { offset, length: end - offset + 1 } : undefined;
}
