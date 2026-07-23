/**
 * Download the latest completed Commander DAILY transaction sets and PLUs.
 *
 * Usage:
 *   $env:COMMANDER_PASSWORD = '...'
 *   node commander-download.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const host = (process.env.COMMANDER_HOST || 'https://192.168.31.11').replace(/\/$/, '');
const username = process.env.COMMANDER_USER || 'MANAGER';
const password = process.env.COMMANDER_PASSWORD;
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
  headers: {
    Accept: 'application/xml,text/xml,*/*',
    'User-Agent': 'StoreDesk Commander Export',
  },
});

function extractCookie(xml) {
  return (String(xml).match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
}

function extractError(xml) {
  return (String(xml).match(/<(?:e:)?message>([^<]+)<\/(?:e:)?message>/i) || [])[1];
}

function extractDailyPeriods(xml) {
  return [...String(xml).matchAll(/<periodInfo>([\s\S]*?)<\/periodInfo>/g)]
    .map((match) => match[1])
    .map((entry) => ({
      sysid: (entry.match(/<vs:period sysid="(\d+)"/) || [])[1],
      name: (entry.match(/<name>([^<]+)<\/name>/) || [])[1],
      description: (entry.match(/<desc>([^<]+)<\/desc>/) || [])[1],
      period: (entry.match(/name="period">([^<]+)/) || [])[1],
      filename: (entry.match(/name="filename">([^<]+)/) || [])[1],
    }))
    .filter(
      (entry) =>
        entry.sysid === '2' &&
        entry.period === '2' &&
        entry.filename &&
        entry.filename !== 'current' &&
        /^\d{4}-\d{2}-\d{2}\.\d+$/.test(entry.filename)
    )
    .slice(0, 3);
}

async function cgi(params) {
  const url = `${host}/cgi-bin/CGILink?${new URLSearchParams(params)}`;
  const response = await client.get(url);
  if (response.status >= 400) {
    throw new Error(`HTTP ${response.status} for cmd=${params.cmd}`);
  }

  const error = extractError(response.data);
  if (error) {
    throw new Error(`${params.cmd}: ${error}`);
  }

  return String(response.data);
}

async function main() {
  fs.mkdirSync(outputDirectory, { recursive: true });

  let cookie;
  try {
    const credential = await cgi({
      cmd: 'validate',
      user: username,
      passwd: password,
    });
    cookie = extractCookie(credential);
    if (!cookie) throw new Error('Commander returned no credential cookie.');
    console.log('[AUTH] OK');

    const periodList = await cgi({ cmd: 'vtlogpdlist', cookie });
    const dailyPeriods = extractDailyPeriods(periodList);
    if (dailyPeriods.length !== 3) {
      throw new Error(`Expected 3 completed DAILY periods; found ${dailyPeriods.length}.`);
    }

    console.log('[DAILY]', dailyPeriods.map((entry) => entry.filename).join(', '));

    for (const entry of dailyPeriods) {
      const xml = await cgi({
        cmd: 'vtransset',
        filename: entry.filename,
        period: entry.period,
        cookie,
      });
      const file = path.join(outputDirectory, `daily-${entry.filename}.xml`);
      fs.writeFileSync(file, xml, 'utf8');
      console.log(`[SAVE] ${path.basename(file)} (${Buffer.byteLength(xml)} bytes)`);
    }

    const pluXml = await cgi({ cmd: 'vPLUs', cookie });
    const pluFile = path.join(outputDirectory, 'plus.xml');
    fs.writeFileSync(pluFile, pluXml, 'utf8');
    console.log(`[SAVE] ${path.basename(pluFile)} (${Buffer.byteLength(pluXml)} bytes)`);
  } finally {
    if (cookie) {
      try {
        await cgi({ cmd: 'releaseCredential', cookie });
        console.log('[AUTH] Released');
      } catch (error) {
        console.warn(`[AUTH] Release warning: ${error.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exit(1);
});
