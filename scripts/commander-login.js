/**
 * Verifone Commander / Sapphire Journal Browser auth + sales period pull.
 * Auth is CGILink (not ConfigClient form POST).
 *
 * Usage (POS LAN 192.168.31.x):
 *   set COMMANDER_PASSWORD=...
 *   node scripts/commander-login.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const HOST = (process.env.COMMANDER_HOST || 'https://192.168.31.11').replace(/\/$/, '');
const USERNAME = process.env.COMMANDER_USER || 'MANAGER';
const PASSWORD = process.env.COMMANDER_PASSWORD;
if (!PASSWORD) {
  console.error('COMMANDER_PASSWORD is required.');
  process.exit(1);
}
const TIMEOUT_MS = 20000;
const OUT_DIR = __dirname;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  httpsAgent,
  timeout: TIMEOUT_MS,
  responseType: 'text',
  validateStatus: () => true,
  headers: {
    'User-Agent': 'Mozilla/5.0 CommanderProbe',
    Accept: 'application/xml,text/xml,*/*',
  },
});

function save(name, data) {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, typeof data === 'string' ? data : String(data), 'utf8');
  console.log(`[SAVE] ${file} (${String(data).length} bytes)`);
  return file;
}

function extractCookie(xml) {
  const m = String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i);
  return m ? m[1].trim() : null;
}

function isErrorXml(xml) {
  return /<error\b/i.test(xml) || /isError["']?\s*[:=]\s*true/i.test(xml);
}

async function cgi(params) {
  const qs = new URLSearchParams(params).toString();
  const url = `${HOST}/cgi-bin/CGILink?${qs}`;
  console.log(`[CGI] ${url.replace(/passwd=[^&]+/i, 'passwd=***').replace(/cookie=[^&]+/i, 'cookie=***')}`);
  const res = await client.get(url);
  console.log(`[CGI] status=${res.status} len=${String(res.data).length}`);
  if (res.status >= 400) {
    throw new Error(`CGILink HTTP ${res.status}`);
  }
  return String(res.data);
}

async function main() {
  console.log(`[START] host=${HOST} user=${USERNAME}`);

  // Reachability
  try {
    const probe = await client.get(`${HOST}/JournalBrowser/`);
    console.log(`[PROBE] JournalBrowser -> HTTP ${probe.status}`);
  } catch (err) {
    console.error(`[TIMEOUT/UNREACHABLE] ${HOST}: ${err.code || err.message}`);
    console.error('Must be on POS LAN (192.168.31.x).');
    process.exit(1);
  }

  // 1) Login via Sapphire CGI validate
  let authXml;
  try {
    authXml = await cgi({
      cmd: 'validate',
      user: USERNAME,
      passwd: PASSWORD,
    });
  } catch (err) {
    console.error('[LOGIN FAIL]', err.code || err.message);
    process.exit(1);
  }

  save('commander-auth.xml', authXml);

  if (isErrorXml(authXml) && !extractCookie(authXml)) {
    console.error('[LOGIN FAIL] Server returned error XML (no cookie).');
    console.error(authXml.slice(0, 1000));
    process.exit(1);
  }

  const cookie = extractCookie(authXml);
  if (!cookie) {
    console.error('[LOGIN FAIL] No <cookie> in validate response.');
    console.error(authXml.slice(0, 1000));
    process.exit(1);
  }
  console.log(`[AUTH] cookie captured (${cookie.length} chars)`);

  // 2) Period list (sales journal periods)
  let periodXml;
  try {
    periodXml = await cgi({ cmd: 'vtlogpdlist', cookie });
  } catch (err) {
    console.error('[PERIOD LIST FAIL]', err.code || err.message);
    process.exit(1);
  }
  save('commander-periods.xml', periodXml);
  console.log(periodXml.slice(0, 2000));

  // 3) If we can find a filename+period, pull first transaction set
  const fileMatch = periodXml.match(/filename=["']?([^"'\s>]+)/i) || periodXml.match(/<filename[^>]*>([^<]+)</i);
  const periodMatch =
    periodXml.match(/period=["']?([^"'\s>]+)/i) || periodXml.match(/<period[^>]*>([^<]+)</i);

  // Also try common attribute patterns in Sapphire period lists
  const periodNodes = [...periodXml.matchAll(/<(?:period|Period|pd)[^>]*>/gi)];
  console.log(`[INFO] period-like nodes found: ${periodNodes.length}`);

  // Prefer vtransset; fall back to vtranssetz (permission-dependent)
  const cmdTypes = ['vtransset', 'vtranssetz'];
  let pulled = false;

  if (fileMatch && periodMatch) {
    const filename = fileMatch[1];
    const period = periodMatch[1];
    for (const cmdType of cmdTypes) {
      try {
        const tlogXml = await cgi({
          cmd: cmdType,
          filename,
          period,
          cookie,
        });
        save(`commander-tlog-${cmdType}.xml`, tlogXml);
        console.log(tlogXml.slice(0, 2000));
        pulled = true;
        break;
      } catch (err) {
        console.warn(`[TLOG ${cmdType}]`, err.code || err.message);
      }
    }
  } else {
    console.warn('[WARN] Could not parse filename/period from period list.');
    console.warn('Saved commander-periods.xml — inspect and we can pull a specific period next.');
  }

  // 4) Release credential (best effort)
  try {
    const releaseXml = await cgi({ cmd: 'releaseCredential', cookie });
    save('commander-release.xml', releaseXml);
  } catch (err) {
    console.warn('[RELEASE WARN]', err.code || err.message);
  }

  console.log(`\n[DONE] auth=ok periods=ok tlog=${pulled ? 'ok' : 'skipped'}`);
}

main().catch((err) => {
  console.error('[FATAL]', err.message || err);
  process.exit(1);
});
