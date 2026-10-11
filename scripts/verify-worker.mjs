import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
const root = new URL("../", import.meta.url);
const { default: worker } = await import("../dist/server/index.js");
const html = await readFile(new URL("work/client/index.html", root), "utf8");
const response = await worker.fetch(new Request("https://pace.example/"));
assert.equal(response.status, 200);
assert.equal(
  await response.text(),
  html,
  "The worker serves the exact prerendered client build",
);
for (const encoding of ["br", "gzip"]) {
  const encoded = await worker.fetch(
    new Request("https://pace.example/", {
      headers: { "Accept-Encoding": encoding },
    }),
  );
  assert.equal(encoded.headers.get("Content-Encoding"), encoding);
  const bytes = Buffer.from(await encoded.arrayBuffer());
  assert.equal(
    (encoding === "br"
      ? brotliDecompressSync(bytes)
      : gunzipSync(bytes)
    ).toString(),
    html,
  );
}
const declined = await worker.fetch(
  new Request("https://pace.example/", {
    headers: { "Accept-Encoding": "br;q=0, gzip;q=1" },
  }),
);
assert.equal(declined.headers.get("Content-Encoding"), "gzip");
for (const file of await readdir(new URL("work/client/assets/", root))) {
  const result = await worker.fetch(
    new Request(`https://pace.example/assets/${file}`),
  );
  assert.equal(result.status, 200, `${file} is available`);
  assert.match(result.headers.get("cache-control"), /immutable/);
  assert.equal(
    await result.text(),
    await readFile(new URL(`work/client/assets/${file}`, root), "utf8"),
  );
}
assert.ok(
  (await readFile(new URL("dist/server/index.js", root))).length < 1_000_000,
  "Worker source stays below 1 MB",
);
console.log(
  "Production HTTP worker verified: exact HTML and assets, correct MIME types, cache policy and security headers.",
);
