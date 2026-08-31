#!/usr/bin/env node
/**
 * StoreDesk Pages Registry Verification Script
 *
 * Checks that every page key registered in shared/pages-registry.ts
 * has a corresponding file in the correct app repo.
 *
 * Usage:
 *   node scripts/verify-pages-registry.js
 *
 * Run this after adding a new page to catch missing files early.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ─── Load registry dynamically ────────────────────────────────────────────────
// We parse the TS file manually to avoid requiring a full TS compiler.
// We just need the filePath + key pairs.

function extractPages(tsSource, arrayName) {
  const results = [];
  // Match key: "..." and filePath: "..." within each object block
  const blockRe = /\{[^}]*key:\s*["']([^"']+)["'][^}]*filePath:\s*["']([^"']+)["'][^}]*\}/gs;
  let m;
  while ((m = blockRe.exec(tsSource)) !== null) {
    results.push({ key: m[1], filePath: m[2] });
  }
  return results;
}

const registryPath = path.join(ROOT, "shared", "pages-registry.ts");
const registrySource = fs.readFileSync(registryPath, "utf8");

const electronPages = [];
const mobilePages = [];

// Simple extraction — split at the mobile section comment
const electronSection = registrySource.split("MOBILE SCREENS")[0];
const mobileSection   = registrySource.split("MOBILE SCREENS")[1] || "";

// Extract from ELECTRON_PAGES array
extractPages(electronSection, "ELECTRON_PAGES").forEach(p => electronPages.push(p));
// Extract from MOBILE_PAGES array
extractPages(mobileSection, "MOBILE_PAGES").forEach(p => mobilePages.push(p));

const electronRoot = path.join(ROOT, "store-desk-electron");
const mobileRoot   = path.join(ROOT, "store-desk-mobile");

let pass = true;
const issues = [];

console.log("\n📋 StoreDesk Pages Registry Verification\n");

// ─── Check Electron pages ─────────────────────────────────────────────────────
console.log(`🖥  Electron pages (${electronPages.length})`);
for (const { key, filePath } of electronPages) {
  const abs = path.join(electronRoot, filePath);
  const exists = fs.existsSync(abs);
  const symbol = exists ? "✅" : "❌";
  console.log(`  ${symbol} ${key.padEnd(20)} ${filePath}`);
  if (!exists) {
    issues.push(`MISSING: store-desk-electron/${filePath}  (key: ${key})`);
    pass = false;
  }
}

// ─── Check Mobile screens ─────────────────────────────────────────────────────
console.log(`\n📱 Mobile screens (${mobilePages.length})`);
for (const { key, filePath } of mobilePages) {
  const abs = path.join(mobileRoot, filePath);
  const exists = fs.existsSync(abs);
  const symbol = exists ? "✅" : "❌";
  console.log(`  ${symbol} ${key.padEnd(24)} ${filePath}`);
  if (!exists) {
    issues.push(`MISSING: store-desk-mobile/${filePath}  (key: ${key})`);
    pass = false;
  }
}

// ─── Check mirror files exist ─────────────────────────────────────────────────
const mirrors = [
  { label: "Electron config/pages.ts",        path: path.join(electronRoot, "src/config/pages.ts") },
  { label: "Mobile core/constants/pages.dart", path: path.join(mobileRoot, "lib/core/constants/pages.dart") },
  { label: "Web admin src/config/pages.ts",    path: path.join(ROOT, "store-desk-web/src/config/pages.ts") },
];
console.log("\n🗂  Mirror files");
for (const m of mirrors) {
  const exists = fs.existsSync(m.path);
  const symbol = exists ? "✅" : "❌";
  console.log(`  ${symbol} ${m.label}`);
  if (!exists) { issues.push(`MISSING mirror: ${m.path}`); pass = false; }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("");
if (pass) {
  console.log("✅ All pages verified — registry is in sync.\n");
  process.exit(0);
} else {
  console.log("❌ Issues found:\n");
  for (const issue of issues) console.log("  •", issue);
  console.log("");
  process.exit(1);
}
