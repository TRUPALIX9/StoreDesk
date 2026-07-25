/**
 * Fetch Ruby Summary + Tax reports for a closed daily period.
 * Period params come from vreportpdlist (not vtlogpdlist).
 *
 * Usage: node scripts/fetch-ruby-report.js [seqHint]
 * Example: node scripts/fetch-ruby-report.js 318
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

const seqHint = process.argv[2] || "318";
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
    "User-Agent": "StoreDesk Ruby Fetch"
  }
});

function extractCookie(xml) {
  return (String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
}
function extractFault(xml) {
  return (String(xml).match(/<(?:e:)?message>([^<]+)<\/(?:e:)?message>/i) || [])[1];
}
function pickAttr(block, attr) {
  return (String(block).match(new RegExp(`\\b${attr}="([^"]*)"`, "i")) || [])[1] ?? "";
}
function pickTag(block, tag) {
  return (String(block).match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i")) || [])[1]?.trim() ?? "";
}
function pickParam(block, name) {
  return (
    (String(block).match(
      new RegExp(`<reportParameter\\s+name="${name}">([^<]*)</reportParameter>`, "i")
    ) || [])[1]?.trim() ?? ""
  );
}

async function cgi(params) {
  const url = `${host}/cgi-bin/CGILink?${new URLSearchParams(params)}`;
  const response = await client.get(url);
  if (response.status >= 400) throw new Error(`HTTP ${response.status} for cmd=${params.cmd}`);
  const fault = extractFault(response.data);
  if (fault) throw new Error(`${params.cmd}: ${fault}`);
  return String(response.data);
}

function parseReportPeriods(xml) {
  const rows = [];
  for (const match of String(xml).matchAll(/<periodInfo>([\s\S]*?)<\/periodInfo>/g)) {
    const block = match[1];
    const periodTag = (block.match(/<vs:period\b([^>]*)\/?>/i) || [])[1] ?? "";
    rows.push({
      sysid: pickAttr(periodTag, "sysid"),
      periodSeqNum: pickAttr(periodTag, "periodSeqNum"),
      periodBeginDate: pickAttr(periodTag, "periodBeginDate"),
      periodType: pickAttr(periodTag, "periodType"),
      periodName: pickAttr(periodTag, "name") || pickTag(block, "name"),
      desc: pickTag(block, "desc"),
      name: pickTag(block, "name"),
      period: pickParam(block, "period"),
      filename: pickParam(block, "filename"),
      raw: block
    });
  }
  return rows;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let cookie;
  try {
    const auth = await cgi({ cmd: "validate", user: username, passwd: password });
    cookie = extractCookie(auth);
    if (!cookie) throw new Error("No cookie");
    console.log("[AUTH] OK");

    const periodXml = await cgi({ cmd: "vreportpdlist", cookie });
    fs.writeFileSync(path.join(outDir, "probe-vreportpdlist.xml"), periodXml, "utf8");
    const periods = parseReportPeriods(periodXml);
    console.log(`[PERIODS] ${periods.length} from vreportpdlist`);

    const daily = periods.filter(
      (p) =>
        (p.periodName === "DAILY" || /daily/i.test(p.desc) || p.sysid === "2") &&
        p.filename &&
        p.filename !== "current"
    );
    console.log(`[PERIODS] daily-ish closed: ${daily.length}`);
    const hit =
      daily.find((p) => p.periodSeqNum === seqHint || p.filename.endsWith(`.${seqHint}`)) ||
      periods.find((p) => p.periodSeqNum === seqHint || String(p.filename).includes(seqHint));

    if (!hit) {
      console.log("Sample periods:");
      for (const p of periods.slice(0, 8)) {
        console.log(
          `  sysid=${p.sysid} seq=${p.periodSeqNum} name=${p.periodName} file=${p.filename} period=${p.period} desc=${p.desc}`
        );
      }
      throw new Error(`No period matching ${seqHint}`);
    }

    console.log("[HIT]", {
      sysid: hit.sysid,
      periodSeqNum: hit.periodSeqNum,
      periodName: hit.periodName,
      filename: hit.filename,
      period: hit.period,
      desc: hit.desc,
      begin: hit.periodBeginDate
    });

    const attempts = [
      { label: "tax+file+period", params: { cmd: "vrubyrept", reptname: "tax", filename: hit.filename, period: hit.period, cookie } },
      { label: "summary+file+period", params: { cmd: "vrubyrept", reptname: "summary", filename: hit.filename, period: hit.period, cookie } },
      { label: "tax+sysid+seq", params: { cmd: "vrubyrept", reptname: "tax", period: hit.sysid || "2", filename: hit.filename, cookie } },
      {
        label: "tax+periodSeqNum",
        params: {
          cmd: "vrubyrept",
          reptname: "tax",
          period: hit.period || hit.sysid || "2",
          filename: hit.filename,
          periodSeqNum: hit.periodSeqNum,
          cookie
        }
      }
    ];

    for (const attempt of attempts) {
      try {
        const xml = await cgi(attempt.params);
        const file = path.join(
          outDir,
          `ruby-${attempt.params.reptname}-${hit.filename.replace(/[^\w.-]+/g, "_")}.xml`
        );
        fs.writeFileSync(file, xml, "utf8");
        console.log(`[OK] ${attempt.label} -> ${file} (${Buffer.byteLength(xml)} bytes)`);
        console.log("  head:", xml.slice(0, 300).replace(/\s+/g, " "));
        const moneyHits = [...xml.matchAll(/959\.66|842\.15|67\.19|25\.30|HIGH\s*TAX|LOW\s*TAX/gi)].slice(0, 20);
        console.log("  money/tax hits:", moneyHits.map((m) => m[0]));
      } catch (err) {
        console.log(`[FAIL] ${attempt.label}: ${err.message}`);
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
