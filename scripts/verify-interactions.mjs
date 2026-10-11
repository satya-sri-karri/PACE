import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";

const html = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const dom = new JSDOM(html, {
  url: "https://pace.example",
  pretendToBeVisual: true,
  runScripts: "outside-only",
});
const { default: axe } = await import("axe-core");
dom.window.eval(axe.source);
await mkdir(new URL("../work/accessibility/", import.meta.url), {
  recursive: true,
});
async function inspect(name) {
  await writeFile(
    new URL(`../work/accessibility/${name}.html`, import.meta.url),
    dom.serialize(),
  );
  const result = await dom.window.axe.run(dom.window.document, {
    rules: { "color-contrast": { enabled: false } },
  });
  if (result.violations.length)
    console.error(
      JSON.stringify(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.html),
        })),
      ),
    );
  assert.equal(
    result.violations.length,
    0,
    `${name} has static accessibility violations`,
  );
}
const { window } = dom;
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "FormData",
  "localStorage",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === "window" ? window : window[key],
  });
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia = () => ({ matches: false });
window.scrollTo = () => {};
// JSDOM has no native dialog UI; only its open/close state is tested here.
window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const { Home } = await import("../work/ssr/prerender.js");
const { hydrateRoot } = await import("react-dom/client");
const errors = [];
let root;
await act(async () => {
  root = hydrateRoot(
    window.document.getElementById("root"),
    createElement(Home),
    { onRecoverableError: (error) => errors.push(error) },
  );
});
const text = (selector) =>
  window.document.querySelector(selector)?.textContent ?? "";
const button = (label, scope = window.document) =>
  [...scope.querySelectorAll("button")].find((b) =>
    b.textContent.includes(label),
  );
async function click(element) {
  assert.ok(element, "Expected control exists");
  await act(async () => {
    element.click();
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
}
async function nav(label) {
  await click(button(label, window.document.querySelector(".sidebar nav")));
}
assert.equal(
  errors.length,
  0,
  "Hydration must preserve the rendered dashboard",
);
assert.ok(text(".wallet-number").includes("7,400"));
await inspect("overview");
await nav("What-if lab");
const savedBeforePreview = window.localStorage.getItem("pace-budget-v1");
await click(button("₹1,800 purchase"));
await inspect("lab");
assert.ok(text(".impact-results").includes("70.00"));
assert.ok(
  text(".impact-results").includes("−₹900") ||
    text(".impact-results").includes("-₹900"),
);
assert.equal(
  window.localStorage.getItem("pace-budget-v1"),
  savedBeforePreview,
  "Preview leaves persisted ledger untouched",
);
await click(button("Apply to my plan"));
assert.ok(window.document.querySelector("dialog[open]"));
await inspect("confirmation");
await click(button("Record anyway"));
assert.ok(
  JSON.parse(
    window.localStorage.getItem("pace-budget-v1"),
  ).budget.transactions.some((t) => t.title === "Weekend shopping"),
);
await nav("Overview");
assert.ok(text(".wallet-number").includes("5,600"));
await click(window.document.querySelector('[aria-label="Undo last action"]'));
assert.ok(text(".wallet-number").includes("7,400"));
const bill = [...window.document.querySelectorAll(".commitment-row")].find(
  (row) => row.textContent.includes("Room & utilities"),
);
await click(button("Mark paid", bill));
assert.ok(text(".wallet-number").includes("6,300"));
assert.ok(text(".allowance-number").includes("160"));
await click(window.document.querySelector('[aria-label="Undo last action"]'));
await click(button("Add savings"));
await click(button("Record transfer"));
assert.ok(text(".wallet-number").includes("5,900"));
assert.ok(text(".allowance-number").includes("160"));
assert.ok(text(".goal-meta").includes("100%"));
await nav("Your plan");
await inspect("plan");
await click(
  window.document.querySelector('[aria-label="Day 14, payment due"]'),
);
assert.ok(text("dialog").includes("Room & utilities"));
await inspect("day-dialog");
await click(window.document.querySelector('[aria-label="Close dialog"]'));
await nav("Activity");
await inspect("activity");
assert.ok(text(".activity-list").includes("A little safety net"));
assert.equal(errors.length, 0);
await act(async () => root.unmount());
window.close();
console.log(
  "Hydration, navigation, preview/apply/undo, bill payment, savings transfer, calendar, and persistence passed in the DOM test environment.",
);
