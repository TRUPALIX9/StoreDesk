const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const host = 'https://192.168.31.11';
const files = [
  '16F80D1A39C4F3AA9670D96075BD84D1.cache.js',
  '96B9A087903488B70993D488BE2AA0E8.cache.js',
];

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 60_000,
  responseType: 'arraybuffer',
  validateStatus: () => true,
});

(async () => {
  for (const file of files) {
    const response = await client.get(`${host}/ConfigClient/${file}`);
    console.log(`${file}: HTTP ${response.status}, ${response.data.length} bytes`);
    if (response.status === 200) {
      fs.writeFileSync(path.join(__dirname, file), response.data);
    }
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
