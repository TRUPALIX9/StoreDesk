/**
 * Probe Verifone Commander Ruby Reports (vrubyrept) param shapes.
 * Loads store-desk-electron/.env for COMMANDER_* vars.
 *
 * Usage: node scripts/probe-ruby-report.js [filename] [period]
 * Example: node scripts/probe-ruby-report.js 2026-07-23.318 2
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
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnv(path.join(__dirname, "../store-desk-electron/.env"));
loadEnv(path.join(__dirname, ".env"));

const filenameArg = process.argv[2] || "2026-07-23.318";
const periodArg = process.argv[3] || "2";
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
    "User-Agent": "StoreDesk Ruby Probe"
  }
});

function extractCookie(xml) {
  return (String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
}
function extractFault(xml) {
  return (String(xml).match(/<(?:e:)?message>([^<]+)<\/(?:e:)?message>/i) || [])[1];
}
function head(xml, n = 280) {
  return String(xml).slice(0, n).replace(/\s+/g, " ");
}

async function cgi(params) {
  const url = `${host}/cgi-bin/CGILink?${new URLSearchParams(params)}`;
  const response = await client.get(url);
  return { status: response.status, body: String(response.data) };
}

function save(name, body) {
  const file = path.join(outDir, name);
  fs.writeFileSync(file, body, "utf8");
  return file;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let cookie;
  try {
    const auth = await cgi({ cmd: "validate", user: username, passwd: password });
    cookie = extractCookie(auth.body);
    if (!cookie) {
      console.error("AUTH FAIL", head(auth.body, 500));
      process.exit(1);
    }
    console.log("[AUTH] OK");
    console.log("[AUTH] has vrubyrept:", /FunctionCmd>vrubyrept</i.test(auth.body));
    console.log("[AUTH] has vruybrept:", /FunctionCmd>vruybrept</i.test(auth.body));

    const shortId = (filenameArg.match(/\.(\d+)$/) || [])[1] || filenameArg;
    const longId = (filenameArg.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || "";

    for (const cmd of ["vperiodlist", "vreportpdlist", "vreportlist", "vreportcfg", "vtlogpdlist"]) {
      const r = await cgi({ cmd, cookie });
      const fault = extractFault(r.body);
      const file = save(`probe-${cmd}.xml`, r.body);
      console.log(`[LIST] ${cmd} status=${r.status} len=${r.body.length} fault=${fault || "-"} -> ${path.basename(file)}`);
      console.log("  ", head(r.body));
    }

    const combos = [
      { cmd: "vrubyrept", cookie },
      { cmd: "vrubyrept", period: periodArg, cookie },
      { cmd: "vrubyrept", periodID: periodArg, cookie },
      { cmd: "vrubyrept", filename: filenameArg, period: periodArg, cookie },
      { cmd: "vrubyrept", filename: filenameArg, periodID: periodArg, cookie },
      { cmd: "vrubyrept", shortId, periodID: periodArg, cookie },
      { cmd: "vrubyrept", longId, periodID: periodArg, cookie },
      { cmd: "vrubyrept", shortId, longId, periodID: periodArg, cookie },
      { cmd: "vrubyrept", period: periodArg, shortId, cookie },
      { cmd: "vrubyrept", period: periodArg, filename: shortId, cookie },
      { cmd: "vrubyrept", periodname: "DAILY", shortId, cookie },
      { cmd: "vrubyrept", periodName: "DAILY", periodSeq: shortId, cookie },
      { cmd: "vrubyrept", period: periodArg, periodSeq: shortId, cookie },
      { cmd: "vrubyrept", report: "1", period: periodArg, filename: filenameArg, cookie },
      { cmd: "vrubyrept", reportType: "sales", period: periodArg, filename: filenameArg, cookie },
      { cmd: "vruybrept", cookie },
      { cmd: "vruybrept", filename: filenameArg, period: periodArg, cookie },
      // Cousin reports for param-shape clues
      { cmd: "vcashierrept", filename: filenameArg, period: periodArg, cookie },
      { cmd: "vfueltotals", filename: filenameArg, period: periodArg, cookie },
      { cmd: "vpayrollrept", filename: filenameArg, period: periodArg, cookie },
      { cmd: "vviperrept", filename: filenameArg, period: periodArg, cookie }
    ];

    let i = 0;
    for (const params of combos) {
      i += 1;
      const r = await cgi(params);
      const fault = extractFault(r.body);
      const label = Object.entries(params)
        .filter(([k]) => k !== "cookie")
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      const file = save(`probe-ruby-${String(i).padStart(2, "0")}.xml`, r.body);
      const looksUseful =
        /HIGH\s*TAX|LOW\s*TAX|taxable|Ruby|report/i.test(r.body) && !fault && r.body.length > 200;
      console.log(
        `[TRY ${i}] ${label || "(cookie only)"} status=${r.status} len=${r.body.length} fault=${fault || "-"} useful=${looksUseful} -> ${path.basename(file)}`
      );
      console.log("  ", head(r.body));
      if (looksUseful || (/959\.66|842\.15|67\.19|25\.30/.test(r.body) && !fault)) {
        const keep = save(`ruby-${filenameArg.replace(/[^\w.-]+/g, "_")}.xml`, r.body);
        console.log(`[HIT] saved ${keep}`);
      }
    }
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
  console.error("[FATAL]", err.message || err);
  process.exit(1);
});
