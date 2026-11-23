// Build: copy the site to dist/, validate the data, generate the downloadable files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "../src/data.js";
import { validate } from "./validate.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "src"), dist = path.join(root, "dist");

const errors = validate(data);
if (errors.length) { console.error("Өгөгдлийн алдаа:\n - " + errors.join("\n - ")); process.exit(1); }

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(src, dist, { recursive: true });
const dl = path.join(dist, "downloads");
fs.mkdirSync(dl, { recursive: true });
fs.writeFileSync(path.join(dl, "sarnai-data.json"), JSON.stringify(data, null, 2));

const skipFiles = process.argv.includes("--site-only");
if (!skipFiles) {
  const { buildDocx } = await import("./docx.mjs");
  const { buildPptx } = await import("./pptx.mjs");
  await buildDocx(data, path.join(dl, "sarnai-tailan.docx"));
  await buildPptx(data, path.join(dl, "sarnai-ilteh.pptx"));
  // Drop folder entries from the ZIP containers: Office has refused such files when opened through cloud services.
  const { default: JSZip } = await import("jszip");
  for (const f of ["sarnai-tailan.docx", "sarnai-ilteh.pptx"]) {
    const file = path.join(dl, f);
    const zip = await JSZip.loadAsync(fs.readFileSync(file));
    for (const k of Object.keys(zip.files)) if (zip.files[k].dir) delete zip.files[k];
    fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  }
}
console.log("✓ dist/ бэлэн" + (skipFiles ? " (файлгүй)" : " — docx, pptx, json"));
