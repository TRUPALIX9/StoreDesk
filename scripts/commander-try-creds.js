/**
 * Retry Sapphire validate with credential variants.
 */
const https = require('https');
const axios = require('axios');

const HOST = 'https://192.168.31.11';
const PASS = process.env.COMMANDER_PASSWORD;
if (!PASS) {
  console.error('COMMANDER_PASSWORD is required.');
  process.exit(1);
}
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  httpsAgent: agent,
  timeout: 15000,
  responseType: 'text',
  validateStatus: () => true,
});

const users = ['manager', 'Manager', 'MANAGER', 'admin', 'Admin', 'csr', 'CSR'];

async function tryValidate(user, passwd, mode) {
  let url;
  if (mode === 'qs') {
    url = `${HOST}/cgi-bin/CGILink?cmd=validate&user=${encodeURIComponent(user)}&passwd=${encodeURIComponent(passwd)}`;
  } else if (mode === 'raw') {
    url = `${HOST}/cgi-bin/CGILink?cmd=validate&user=${user}&passwd=${passwd}`;
  } else {
    // POST form style just in case
    const res = await client.post(
      `${HOST}/cgi-bin/CGILink`,
      new URLSearchParams({ cmd: 'validate', user, passwd }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return { mode, user, status: res.status, body: String(res.data).slice(0, 400) };
  }
  const res = await client.get(url);
  return { mode, user, status: res.status, body: String(res.data).slice(0, 400) };
}

(async () => {
  for (const user of users) {
    for (const mode of ['qs', 'raw']) {
      const r = await tryValidate(user, PASS, mode);
      const ok = /<cookie/i.test(r.body);
      const msg = (r.body.match(/<e:message>([^<]+)/) || [])[1] || r.body.slice(0, 120);
      console.log(`${ok ? 'OK' : 'FAIL'} user=${user} mode=${mode} -> ${msg}`);
      if (ok) {
        console.log(r.body);
        process.exit(0);
      }
    }
  }

  // Also try POST for manager
  const post = await tryValidate('manager', PASS, 'post');
  console.log(`POST manager -> ${post.body.slice(0, 300)}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
