import test from "node:test";
import assert from "node:assert/strict";
import { createWorker } from "../worker/serve.mjs";
const worker = createWorker({
  "/index.html": {
    body: "<h1>PACE</h1>",
    type: "text/html; charset=utf-8",
    etag: '"html"',
  },
  "/assets/app-abc123.js": {
    body: "export{}",
    type: "text/javascript; charset=utf-8",
    etag: '"js"',
  },
});
test("HTTP responses enforce security headers and cache versioned assets", async () => {
  const page = await worker.fetch(new Request("https://pace.example/"));
  assert.equal(page.status, 200);
  assert.match(
    page.headers.get("Content-Security-Policy"),
    /frame-ancestors 'self'/,
  );
  assert.equal(page.headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(page.headers.get("Cache-Control"), /must-revalidate/);
  assert.equal(await page.text(), "<h1>PACE</h1>");
  const asset = await worker.fetch(
    new Request("https://pace.example/assets/app-abc123.js"),
  );
  assert.match(asset.headers.get("Cache-Control"), /immutable/);
  assert.equal(
    asset.headers.get("Content-Type"),
    "text/javascript; charset=utf-8",
  );
  const cached = await worker.fetch(
    new Request("https://pace.example/", {
      headers: { "If-None-Match": '"html"' },
    }),
  );
  assert.equal(cached.status, 304);
  const head = await worker.fetch(
    new Request("https://pace.example/", { method: "HEAD" }),
  );
  assert.equal(await head.text(), "");
});
test("unexpected methods and non-asset paths cannot reach application files", async () => {
  for (const path of [
    "/__proto__",
    "/constructor",
    "/.env",
    "/%2e%2e/package.json",
    "/missing.js",
  ]) {
    assert.equal(
      (await worker.fetch(new Request("https://pace.example" + path))).status,
      404,
    );
  }
  assert.equal(
    (
      await worker.fetch(
        new Request("https://pace.example/", { method: "POST" }),
      )
    ).status,
    405,
  );
});
