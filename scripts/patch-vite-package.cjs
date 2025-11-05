#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const vitePackagePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "vite",
  "package.json",
);
const targetRuntimePath = "./dist/client/client.mjs";

function log(message) {
  console.log(`[patch-vite-package] ${message}`);
}

if (!fs.existsSync(vitePackagePath)) {
  log("vite is not installed; skipping patch.");
  process.exit(0);
}

let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(vitePackagePath, "utf8"));
} catch (error) {
  log(`failed to read ${vitePackagePath}: ${error.message}`);
  process.exit(0);
}

const clientExport = packageJson?.exports?.["./client"];
if (
  !clientExport ||
  typeof clientExport !== "object" ||
  Array.isArray(clientExport)
) {
  log("vite package.json does not expose ./client as an export; nothing to patch.");
  process.exit(0);
}

if (!fs.existsSync(path.join(path.dirname(vitePackagePath), targetRuntimePath))) {
  log(`runtime file ${targetRuntimePath} is missing; skipping patch.`);
  process.exit(0);
}

let changed = false;
if (clientExport.import !== targetRuntimePath) {
  clientExport.import = targetRuntimePath;
  changed = true;
}
if (clientExport.default !== targetRuntimePath) {
  clientExport.default = targetRuntimePath;
  changed = true;
}

if (!changed) {
  log("vite package.json already contains the required runtime export.");
  process.exit(0);
}

packageJson.exports["./client"] = clientExport;

fs.writeFileSync(vitePackagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

log("patched vite package.json to restore compatibility with Node 22.12 runtime checks.");
