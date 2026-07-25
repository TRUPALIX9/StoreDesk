/**
 * Fetch Ruby department/network/tax for current + closed daily from vreportpdlist.
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
    "User-Agent": "StoreDesk Ruby Dept/Network Fetch"
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

async function cgiRaw(params) {
  const url = `${host}/cgi-bin/CGILink?${new URLSearchParams(params)}`;
  const response = await client.get(url);
  const body = String(response.data);
  return { status: response.status, body, fault: extractFault(body) };
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

function safeFileStem(filename) {
  return String(filename).replace(/[^\w.-]+/g, "_");
}

function printResult(label, result, savedPath) {
  const bytes = Buffer.byteLength(result.body, "utf8");
  const ok = !result.fault && result.status < 400 && bytes > 0;
  console.log(`\n=== ${label} ===`);
  console.log(`success: ${ok}`);
  console.log(`fault: ${result.fault || "(none)"}`);
  console.log(`http: ${result.status}`);
  console.log(`bytes: ${bytes}`);
  if (savedPath) console.log(`saved: ${savedPath}`);
  console.log(`body_head_500:\n${result.body.slice(0, 500)}`);
}

function snippetDept(xml) {
  const m = String(xml).match(/<deptInfo[\s\S]{0,800}?<\/deptInfo>/i);
  return m ? m[0].slice(0, 600) : "(no deptInfo found)";
}

function snippetNetwork(xml) {
  for (const tag of ["networkInfo", "networkTotals", "netInfo", "fuelNetwork"]) {
    const m = String(xml).match(new RegExp(`<${tag}[\\s\\S]{0,800}?<\\/${tag}>`, "i"));
    if (m) return m[0].slice(0, 600);
  }
  const keys = [...String(xml).matchAll(/<([a-zA-Z][\w:-]*Info)\b/g)].slice(0, 8).map((x) => x[1]);
  return keys.length ? `key tags sample: ${keys.join(", ")}` : "(no obvious network tags)";
}

async function fetchReport(cookie, reptname, periodRow, outName) {
  const params = {
    cmd: "vrubyrept",
    reptname,
    filename: periodRow.filename,
    period: periodRow.period || periodRow.sysid || "2",
    cookie
  };
  const result = await cgiRaw(params);
  let savedPath = null;
  if (!result.fault && result.status < 400) {
    fs.mkdirSync(outDir, { recursive: true });
    savedPath = path.join(outDir, outName);
    fs.writeFileSync(savedPath, result.body, "utf8");
  }
  return { result, savedPath, params };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let cookie;
  const savedFiles = [];

  try {
    const auth = await cgiRaw({ cmd: "validate", user: username, passwd: password });
    cookie = extractCookie(auth.body);
    console.log("[VALIDATE]", auth.fault ? `FAULT: ${auth.fault}` : "OK", `cookie=${cookie ? "yes" : "no"}`);
    if (!cookie) {
      printResult("validate", auth, null);
      process.exit(1);
    }

    const periodXmlRes = await cgiRaw({ cmd: "vreportpdlist", cookie });
    fs.writeFileSync(path.join(outDir, "probe-vreportpdlist.xml"), periodXmlRes.body, "utf8");
    const periods = parseReportPeriods(periodXmlRes.body);

    const currentDaily = periods.find(
      (p) => p.filename === "current" && String(p.period) === "2"
    );
    const currentDailyLoose = periods.find(
      (p) =>
        p.filename === "current" &&
        (p.periodName === "DAILY" || /daily/i.test(p.desc) || p.sysid === "2")
    );

    const closed318 =
      periods.find((p) => p.filename === "2026-07-23.318") ||
      periods.find((p) => /\.318$/.test(String(p.filename))) ||
      periods.find((p) => p.periodSeqNum === "318");

    const closedDailyBest =
      closed318 ||
      periods
        .filter(
          (p) =>
            p.filename &&
            p.filename !== "current" &&
            (p.periodName === "DAILY" || /daily/i.test(p.desc) || p.sysid === "2")
        )
        .sort((a, b) => String(b.filename).localeCompare(String(a.filename)))[0];

    console.log("\n[CURRENT DAILY in vreportpdlist]");
    console.log(`strict (filename=current, period=2): ${currentDaily ? "YES" : "NO"}`);
    if (currentDaily) {
      console.log(JSON.stringify({
        filename: currentDaily.filename,
        period: currentDaily.period,
        periodSeqNum: currentDaily.periodSeqNum,
        desc: currentDaily.desc
      }));
    } else if (currentDailyLoose) {
      console.log(`loose match (filename=current): YES period=${currentDailyLoose.period}`);
    }

    console.log("\n[CLOSED DAILY target]");
    const closed = closedDailyBest;
    if (closed) {
      console.log(JSON.stringify({
        filename: closed.filename,
        period: closed.period,
        periodSeqNum: closed.periodSeqNum,
        desc: closed.desc
      }));
    } else {
      console.log("NONE found");
    }

    const currentRow = currentDaily || currentDailyLoose;
    let currentWorks = false;

    const jobs = [];
    if (closed) {
      jobs.push({ row: closed, rept: "department", out: `ruby-department-${safeFileStem(closed.filename)}.xml` });
      jobs.push({ row: closed, rept: "network", out: `ruby-network-${safeFileStem(closed.filename)}.xml` });
    }
    if (currentRow) {
      jobs.push({ row: currentRow, rept: "department", out: `ruby-department-${safeFileStem(currentRow.filename)}.xml` });
      jobs.push({ row: currentRow, rept: "network", out: `ruby-network-${safeFileStem(currentRow.filename)}.xml` });
      jobs.push({ row: currentRow, rept: "tax", out: "ruby-tax-current.xml" });
    }

    for (const job of jobs) {
      const { result, savedPath } = await fetchReport(cookie, job.rept, job.row, job.out);
      printResult(
        `${job.rept} filename=${job.row.filename} period=${job.row.period}`,
        result,
        savedPath
      );
      if (savedPath) savedFiles.push(savedPath);
      if (job.row.filename === "current" && !result.fault && Buffer.byteLength(result.body) > 200) {
        currentWorks = true;
      }
    }

    const deptFile = savedFiles.find((f) => /ruby-department-/.test(f) && !/current/.test(f)) || savedFiles.find((f) => /ruby-department/.test(f));
    const netFile = savedFiles.find((f) => /ruby-network-/.test(f) && !/current/.test(f)) || savedFiles.find((f) => /ruby-network/.test(f));

    console.log("\n=== SUMMARY ===");
    console.log(`current_works (any successful current fetch): ${currentWorks}`);
    console.log(`files_saved: ${savedFiles.length}`);
    for (const f of savedFiles) console.log(`  ${f}`);

    if (deptFile && fs.existsSync(deptFile)) {
      console.log("\n--- department deptInfo snippet ---");
      console.log(snippetDept(fs.readFileSync(deptFile, "utf8")));
    }
    if (netFile && fs.existsSync(netFile)) {
      console.log("\n--- network key snippet ---");
      console.log(snippetNetwork(fs.readFileSync(netFile, "utf8")));
    }
  } finally {
    if (cookie) {
      try {
        await cgiRaw({ cmd: "releaseCredential", cookie });
      } catch (_) {}
    }
  }
}

main().catch((err) => {
  console.error("[FATAL]", err.message || err);
  process.exit(1);
});
