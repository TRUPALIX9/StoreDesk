const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const HOST = 'https://192.168.31.11';
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  httpsAgent: agent,
  timeout: 20000,
  validateStatus: () => true,
  responseType: 'text',
});

const files = [
  '/JournalBrowser/javascript/Native/credential.js',
  '/JournalBrowser/javascript/Native/tviewerSession.js',
  '/JournalBrowser/javascript/Native/searchObj.js',
  '/JournalBrowser/javascript/Native/Response.js',
  '/JournalBrowser/javascript/Native/Utilities.js',
  '/JournalBrowser/javascript/Common/lib.js',
  '/JournalBrowser/index.html',
];

(async () => {
  for (const f of files) {
    const res = await client.get(HOST + f);
    const out = path.join(__dirname, `jb-${path.basename(f)}`);
    fs.writeFileSync(out, res.data);
    console.log(f, res.status, String(res.data).length, '->', out);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
