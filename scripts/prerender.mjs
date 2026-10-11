import { readFile, writeFile } from "node:fs/promises";
import { render } from "../work/ssr/prerender.js";
const path = new URL("../dist/index.html", import.meta.url);
const shell = await readFile(path, "utf8");
await writeFile(
  path,
  shell.replace('<div id="root"></div>', `<div id="root">${render()}</div>`),
);
console.log("Prerendered the complete dashboard for first paint.");
