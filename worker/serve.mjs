export const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/** Assets are an exact, build-generated allowlist, never a filesystem path. */
export function createWorker(assets) {
  return {
    async fetch(request) {
      const headers = new Headers(SECURITY_HEADERS);
      headers.set("Cache-Control", "no-store");
      if (!["GET", "HEAD"].includes(request.method)) {
        headers.set("Allow", "GET, HEAD");
        return new Response("Method not allowed", { status: 405, headers });
      }
      const pathname = new URL(request.url).pathname;
      const asset = assets[pathname === "/" ? "/index.html" : pathname];
      if (
        !Object.hasOwn(assets, pathname === "/" ? "/index.html" : pathname) ||
        !asset
      ) {
        headers.set("Content-Type", "text/plain; charset=utf-8");
        return new Response(request.method === "HEAD" ? null : "Not found", {
          status: 404,
          headers,
        });
      }
      headers.set("Content-Type", asset.type);
      headers.set("Vary", "Accept-Encoding");
      const accepted = new Map(
        (request.headers.get("Accept-Encoding") ?? "")
          .split(",")
          .map((value) => {
            const [name, quality] = value.trim().split(/\s*;\s*q=/);
            return [name, quality === undefined ? 1 : Number(quality)];
          }),
      );
      const encoding = ["br", "gzip"]
        .filter((name) => asset[name] && (accepted.get(name) ?? 0) > 0)
        .sort((a, b) => accepted.get(b) - accepted.get(a))[0];
      const etag = encoding
        ? asset.etag.slice(0, -1) + "-" + encoding + '-manual"'
        : asset.etag;
      if (encoding) headers.set("Content-Encoding", encoding);
      headers.set(
        "Cache-Control",
        pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      );
      headers.set("ETag", etag);
      if (request.headers.get("If-None-Match") === etag)
        return new Response(null, { status: 304, headers });
      const body =
        request.method === "HEAD"
          ? null
          : encoding
            ? Uint8Array.from(atob(asset[encoding]), (character) =>
                character.charCodeAt(0),
              )
            : asset.body;
      return new Response(body, {
        headers,
        // Cloudflare must pass through these build-compressed bytes unchanged.
        encodeBody: "manual",
      });
    },
  };
}
