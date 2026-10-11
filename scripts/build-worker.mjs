import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { extname } from "node:path";
const root = new URL("../", import.meta.url);
const assets = {};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};
async function collect(folder, prefix = "") {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = prefix + "/" + entry.name;
    if (entry.isDirectory())
      await collect(new URL(entry.name + "/", folder), path);
    else if (types[extname(entry.name)]) {
      const body = await readFile(new URL(entry.name, folder), "utf8");
      assets[path] = {
        body,
        br: brotliCompressSync(Buffer.from(body), {
          params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
        }).toString("base64"),
        gzip: gzipSync(body, { level: 9 }).toString("base64"),
        type: types[extname(entry.name)],
        etag: '"' + createHash("sha256").update(body).digest("hex") + '"',
      };
    }
  }
}
await collect(new URL("work/client/", root));
const source = await readFile(new URL("worker/serve.mjs", root), "utf8");
await rm(new URL("dist/", root), { recursive: true, force: true });
await mkdir(new URL("dist/server/", root), { recursive: true });
await mkdir(new URL("dist/.openai/", root), { recursive: true });
await writeFile(
  new URL("dist/server/index.js", root),
  `${source}\nconst assets = ${JSON.stringify(assets)};\nexport default createWorker(assets);\n`,
);
await writeFile(
  new URL("dist/.openai/hosting.json", root),
  await readFile(new URL(".openai/hosting.json", root)),
);
console.log(
  `Built a dependency-free HTTP serving layer for ${Object.keys(assets).length} assets.`,
);
