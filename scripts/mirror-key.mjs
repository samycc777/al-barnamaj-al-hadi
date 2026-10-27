// Copied from ~/dev/tool-r2-mirror/scripts/key.mjs (keep the two the same).
// The R2 key a source address is stored under: src/<host>/<path>, plus the query when there is one.
// Sites use the same rule to turn their original addresses into R2 ones.
export function mirrorKey(address) {
  const u = new URL(address);
  const host = u.host.replace(/^www\./, "");
  const query = u.search ? "/" + u.search.slice(1).replace(/[^A-Za-z0-9=&._-]/g, "_") : "";
  return `src/${host}${decodeURIComponent(u.pathname)}${query}`;
}
