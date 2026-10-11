import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const dist = new URL("../work/client/", import.meta.url);
const html = await readFile(new URL("index.html", dist), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  url: "https://pace.example",
  pretendToBeVisual: true,
});
const document = dom.window.document;
assert.equal(document.querySelectorAll("main").length, 1);
assert.equal(document.querySelectorAll("h1").length, 1);
assert.ok(document.querySelector("#root").textContent.includes("7,400"));
assert.ok(document.querySelector("#root").textContent.includes("160"));
assert.equal(document.documentElement.lang, "en");
assert.equal(
  document
    .querySelector('meta[http-equiv="Content-Security-Policy"]')
    ?.content.includes("script-src 'self'"),
  true,
);
assert.equal(document.querySelectorAll("script:not([src])").length, 0);
dom.window.eval(axe.source);
const result = await dom.window.axe.run(document, {
  rules: { "color-contrast": { enabled: false } },
});
if (result.violations.length)
  console.error(
    JSON.stringify(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.html),
      })),
      null,
      2,
    ),
  );
assert.equal(
  result.violations.length,
  0,
  "Static DOM accessibility violations",
);
const assets = await readdir(new URL("assets/", dist));
let total = 0;
for (const file of assets.filter((f) => /\.(js|css)$/.test(f))) {
  const contents = await readFile(new URL(`assets/${file}`, dist));
  const gzip = gzipSync(contents).length;
  const brotli = brotliCompressSync(contents, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
  total += brotli;
  assert.ok(
    gzip < (file.endsWith(".css") ? 13_000 : 80_000),
    `${file} exceeds compressed asset budget`,
  );
  console.log(
    `${file}: ${(brotli / 1000).toFixed(1)} kB Brotli, ${(gzip / 1000).toFixed(1)} kB gzip`,
  );
}
assert.ok(
  total < 90_000,
  "Total JS and CSS exceeds 90 kB Brotli (the production transfer encoding)",
);
console.log(
  `Total production transfer: ${(total / 1000).toFixed(1)} kB Brotli.`,
);
console.log(
  `Prerendered dashboard verified; ${result.passes.length} static accessibility rules passed. Layout-dependent contrast and Web Vitals require a real browser.`,
);
dom.window.close();
