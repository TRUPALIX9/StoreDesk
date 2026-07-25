/**
 * Fetch one Commander daily vtransset by filename.
 * Loads store-desk-electron/.env for COMMANDER_* vars.
 * Usage: node fetch-daily-transset.js 2026-07-23.318
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const axios = require("axios");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(path.join(__dirname, "../store-desk-electron/.env"));
loadEnv(path.join(__dirname, ".env"));

const filename = process.argv[2] || "2026-07-23.318";
const period = process.argv[3] || "2";
const host = (process.env.COMMANDER_HOST || "https://192.168.31.11").replace(/\/$/, "");
const username = process.env.COMMANDER_USER || "MANAGER";
const password = process.env.COMMANDER_PASSWORD;
const outDir = path.join(__dirname, "commander-downloads");

if (!password) {
  console.error("COMMANDER_PASSWORD is required");
  process.exit(1);
}

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 120_000,
  responseType: "text",
  validateStatus: () => true,
  headers: {
    Accept: "application/xml,text/xml,*/*",
    "User-Agent": "StoreDesk Commander Export"
  }
});

function extractCookie(xml) {
  return (String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
}
function extractError(xml) {
  return (String(xml).match(/<(?:e:)?message>([^<]+)<\/(?:e:)?message>/i) || [])[1];
}

async function cgi(params) {
  const url = `${host}/cgi-bin/CGILink?${new URLSearchParams(params)}`;
  const response = await client.get(url);
  if (response.status >= 400) throw new Error(`HTTP ${response.status} for cmd=${params.cmd}`);
  const error = extractError(response.data);
  if (error) throw new Error(`${params.cmd}: ${error}`);
  return String(response.data);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let cookie;
  try {
    const credential = await cgi({ cmd: "validate", user: username, passwd: password });
    cookie = extractCookie(credential);
    if (!cookie) throw new Error("No cookie");
    console.log("[AUTH] OK");
    const xml = await cgi({
      cmd: "vtransset",
      filename,
      period,
      cookie
    });
    const file = path.join(outDir, `daily-${filename}.xml`);
    fs.writeFileSync(file, xml, "utf8");
    console.log(`[SAVE] ${file} (${Buffer.byteLength(xml)} bytes)`);
    console.log("shortId", (xml.match(/shortId="([^"]+)"/) || [])[1]);
    console.log("longId", (xml.match(/longId="([^"]+)"/) || [])[1]);
  } finally {
    if (cookie) {
      try {
        await cgi({ cmd: "releaseCredential", cookie });
      } catch (_) {
        /* ignore */
      }
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
