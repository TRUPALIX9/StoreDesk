/**
 * Discover Verifone Commander web endpoints from ConfigClient HTML/JS.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const HOST = process.env.COMMANDER_HOST || 'https://192.168.31.11';
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  httpsAgent: agent,
  timeout: 15000,
  validateStatus: () => true,
  maxRedirects: 5,
  headers: { 'User-Agent': 'Mozilla/5.0 CommanderProbe' },
});

const URLS = [
  `${HOST}/`,
  `${HOST}/ConfigClient.html`,
  `${HOST}/configclient.html`,
  `${HOST}/ConfigClient/`,
  `${HOST}/ReportNavigator.html`,
  `${HOST}/TransactionManager.html`,
  `${HOST}/CommanderConsole.html`,
];

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function extract(body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    len: text.length,
    actions: unique([...text.matchAll(/action=["']([^"']+)["']/gi)].map((m) => m[1])),
    hrefs: unique([...text.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1])).slice(0, 40),
    scripts: unique([...text.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1])).slice(0, 50),
    loginish: unique(
      [...text.matchAll(/[/\w.-]*(login|auth|security|session|signin|ConfigClient)[/\w.-]*/gi)].map(
        (m) => m[0]
      )
    ).slice(0, 50),
    snippet: text.slice(0, 2000),
  };
}

async function main() {
  const report = [];
  for (const url of URLS) {
    try {
      const res = await client.get(url, { responseType: 'text' });
      const info = extract(res.data);
      const entry = {
        url,
        status: res.status,
        contentType: res.headers['content-type'],
        setCookie: res.headers['set-cookie'] || null,
        ...info,
      };
      report.push(entry);
      console.log(`\n=== ${url} ===`);
      console.log(`status=${res.status} ct=${entry.contentType} len=${info.len}`);
      if (entry.setCookie) console.log('set-cookie:', entry.setCookie);
      if (info.actions.length) console.log('actions:', info.actions);
      if (info.hrefs.length) console.log('hrefs:', info.hrefs.slice(0, 20));
      if (info.scripts.length) console.log('scripts:', info.scripts.slice(0, 25));
      if (info.loginish.length) console.log('loginish:', info.loginish.slice(0, 25));
      console.log('snippet:\n', info.snippet);
    } catch (err) {
      console.log(`\n=== ${url} ===`);
      console.log('ERR', err.code || err.message);
      report.push({ url, error: err.code || err.message });
    }
  }

  const out = path.join(__dirname, 'commander-probe.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nSaved ${out}`);
}

main().catch((err) => {
  console.error('[FATAL]', err.message || err);
  process.exit(1);
});
