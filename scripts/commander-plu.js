/**
 * Verifone Commander PLU access (ConfigClient NAXML protocol).
 *
 * Decoded from ConfigClient GWT:
 *   POST https://<host>/cgi-bin/NAXML?
 *   body: cmd=vPLUs&cookie=<cookie>\n\n<PLUSelect XML>
 *
 * Usage:
 *   $env:COMMANDER_PASSWORD='...'
 *   node commander-plu.js query 8037 0
 *   node commander-plu.js list 200        (first N PLUs)
 *
 * Update is intentionally gated behind an explicit CONFIRM_WRITE env var and
 * is NOT exercised here. Do not run writes without a backup.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const host = (process.env.COMMANDER_HOST || 'https://192.168.31.11').replace(/\/$/, '');
const username = process.env.COMMANDER_USER || 'MANAGER';
const password = process.env.COMMANDER_PASSWORD;
const domainNs = 'urn:vfi-sapphire:np.domain.2001-07-01';
const outputDirectory = path.join(__dirname, 'commander-downloads');

if (!password) {
  console.error('COMMANDER_PASSWORD is required.');
  process.exit(1);
}

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 60_000,
  responseType: 'text',
  validateStatus: () => true,
});

function extractCookie(xml) {
  return (String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
}

function extractFault(xml) {
  return (String(xml).match(/<(?:e:)?message>([^<]+)<\/(?:e:)?message>/i) || [])[1];
}

async function validate() {
  const url = `${host}/cgi-bin/CGILink?cmd=validate&user=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}`;
  const response = await client.get(url);
  const cookie = extractCookie(response.data);
  if (!cookie) {
    throw new Error(`Login failed: ${extractFault(response.data) || 'no cookie'}`);
  }
  return cookie;
}

async function release(cookie) {
  await client.get(`${host}/cgi-bin/CGILink?cmd=releaseCredential&cookie=${encodeURIComponent(cookie)}`);
}

function buildPluSelect({ upc, modifier, pageSize, page }) {
  const wheres = [];
  if (upc != null && upc !== '') {
    const normalized = String(upc).replace(/^0+/, '') || '0';
    wheres.push(`<where kind="PLUNumber">${normalized}</where>`);
  }
  if (modifier != null && modifier !== '') {
    wheres.push(`<where kind="PLUModifier">${modifier}</where>`);
  }
  return (
    `<domain:PLUSelect xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:domain="${domainNs}">` +
    wheres.join('') +
    `<pageSize>${pageSize}</pageSize>` +
    `<page>${page}</page>` +
    `</domain:PLUSelect>`
  );
}

async function sendPluCommand(cmd, cookie, xmlBody) {
  const url = `${host}/cgi-bin/NAXML?`;
  const body = `cmd=${cmd}&cookie=${cookie}\n\n${xmlBody}`;
  const response = await client.post(url, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/xml, application/xml, */*',
    },
  });
  return response;
}

async function main() {
  const [mode = 'query', arg1, arg2] = process.argv.slice(2);
  fs.mkdirSync(outputDirectory, { recursive: true });

  const cookie = await validate();
  console.log('[AUTH] OK');

  try {
    if (mode === 'query') {
      const upc = arg1 || '8037';
      const modifier = arg2 || '0';
      const xml = buildPluSelect({ upc, modifier, pageSize: 1, page: 1 });
      console.log(`[QUERY] upc=${upc} modifier=${modifier}`);
      const response = await sendPluCommand('vPLUs', cookie, xml);
      console.log(`[HTTP] ${response.status}, ${String(response.data).length} bytes`);
      console.log(String(response.data).slice(0, 2500));
      const file = path.join(outputDirectory, `plu-${upc}-${modifier}.xml`);
      fs.writeFileSync(file, response.data, 'utf8');
      console.log(`[SAVE] ${path.basename(file)}`);
    } else if (mode === 'list') {
      const pageSize = Number(arg1 || '200');
      const xml = buildPluSelect({ pageSize, page: 1 });
      console.log(`[LIST] pageSize=${pageSize} page=1`);
      const response = await sendPluCommand('vPLUs', cookie, xml);
      console.log(`[HTTP] ${response.status}, ${String(response.data).length} bytes`);
      const count = (String(response.data).match(/<domain:PLU>/g) || []).length;
      const ofPages = (String(response.data).match(/ofPages="(\d+)"/) || [])[1];
      console.log(`[PARSE] PLU nodes on page: ${count}, total pages: ${ofPages || '?'}`);
      console.log(String(response.data).slice(0, 2000));
      const file = path.join(outputDirectory, `plus-page1-${pageSize}.xml`);
      fs.writeFileSync(file, response.data, 'utf8');
      console.log(`[SAVE] ${path.basename(file)}`);
    } else {
      console.error(`Unknown mode: ${mode}`);
    }
  } finally {
    await release(cookie);
    console.log('[AUTH] Released');
  }
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exit(1);
});
