/**
 * Dig into JournalBrowser + ConfigClient GWT/SmartClient endpoints.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const HOST = process.env.COMMANDER_HOST || 'https://192.168.31.11';
const USER = process.env.COMMANDER_USER || 'manager';
const PASS = process.env.COMMANDER_PASSWORD;
if (!PASS) {
  console.error('COMMANDER_PASSWORD is required.');
  process.exit(1);
}
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  httpsAgent: agent,
  timeout: 20000,
  validateStatus: () => true,
  maxRedirects: 5,
  headers: { 'User-Agent': 'Mozilla/5.0 CommanderProbe' },
});

async function get(url, opts = {}) {
  const res = await client.get(url, { responseType: 'text', ...opts });
  const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  console.log(`\n=== GET ${url} ===`);
  console.log(`status=${res.status} ct=${res.headers['content-type']} len=${body.length}`);
  if (res.headers['set-cookie']) console.log('set-cookie:', res.headers['set-cookie']);
  return { res, body };
}

function findUrls(text) {
  const pats = [
    /["'](\/[A-Za-z0-9_./?-]+)["']/g,
    /https?:\/\/[^"'\s]+/g,
  ];
  const out = new Set();
  for (const p of pats) {
    for (const m of text.matchAll(p)) {
      const v = m[1] || m[0];
      if (/login|auth|security|session|servlet|rpc|service|journal|report|data|user|password/i.test(v)) {
        out.add(v);
      }
    }
  }
  return [...out].slice(0, 80);
}

async function main() {
  // JournalBrowser root redirect target
  const jb = await get(`${HOST}/JournalBrowser`);
  fs.writeFileSync(path.join(__dirname, 'commander-journalbrowser.html'), jb.body);
  console.log('interesting:', findUrls(jb.body).slice(0, 40));
  console.log('snippet:', jb.body.slice(0, 2500));

  // common journal paths
  for (const u of [
    `${HOST}/JournalBrowser/`,
    `${HOST}/JournalBrowser/index.html`,
    `${HOST}/JournalBrowser.html`,
    `${HOST}/JournalBrowser/login`,
    `${HOST}/JournalBrowser/Login`,
  ]) {
    try {
      const r = await get(u);
      if (r.res.status < 400) {
        console.log('interesting:', findUrls(r.body).slice(0, 30));
        console.log('snippet:', r.body.slice(0, 1500));
      }
    } catch (e) {
      console.log(u, e.message);
    }
  }

  // ConfigClient GWT bootstrap
  const nocache = await get(`${HOST}/ConfigClient/ConfigClient.nocache.js`);
  fs.writeFileSync(path.join(__dirname, 'commander-nocache.js'), nocache.body);
  console.log('nocache interesting:', findUrls(nocache.body).slice(0, 50));

  // Look for permutation / cache.js references
  const cacheRefs = [...nocache.body.matchAll(/([A-F0-9]{32}|[A-Za-z0-9_.-]+\.cache\.js)/g)].map((m) => m[1]);
  console.log('cache refs sample:', [...new Set(cacheRefs)].slice(0, 20));

  // Probe likely auth/service endpoints used by Verifone GWT apps
  const candidates = [
    `${HOST}/ConfigClient/rpc`,
    `${HOST}/ConfigClient/ConfigClient/rpc`,
    `${HOST}/ConfigClient/greet`,
    `${HOST}/ConfigClient/service`,
    `${HOST}/UserService`,
    `${HOST}/LoginService`,
    `${HOST}/AuthenticationService`,
    `${HOST}/servlet/LoginServlet`,
    `${HOST}/cgi-bin/login`,
    `${HOST}/axis2/services`,
    `${HOST}/soap`,
  ];

  for (const u of candidates) {
    const r = await get(u);
    if (r.res.status !== 404) {
      console.log('NON-404 candidate body snippet:', r.body.slice(0, 500));
    }
  }

  // Try a few login POSTs that SmartClient / custom apps sometimes use
  const postTries = [
    {
      url: `${HOST}/JournalBrowser/login`,
      data: new URLSearchParams({ username: USER, password: PASS }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    {
      url: `${HOST}/JournalBrowser/j_security_check`,
      data: new URLSearchParams({ j_username: USER, j_password: PASS }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    {
      url: `${HOST}/ConfigClient/j_security_check`,
      data: new URLSearchParams({ j_username: USER, j_password: PASS }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  ];

  for (const t of postTries) {
    const res = await client.post(t.url, t.data, {
      headers: t.headers,
      maxRedirects: 0,
      responseType: 'text',
    });
    const cookie = res.headers['set-cookie'];
    console.log(`\n=== POST ${t.url} ===`);
    console.log(`status=${res.status} cookies=${cookie || '(none)'}`);
    console.log(String(res.data).slice(0, 400));
  }
}

main().catch((err) => {
  console.error('[FATAL]', err.message || err);
  process.exit(1);
});
