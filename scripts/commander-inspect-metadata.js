const fs = require('fs');
const path = require('path');

const directory = __dirname;
const periodsXml = fs.readFileSync(path.join(directory, 'commander-periods.xml'), 'utf8');
const authXml = fs.readFileSync(path.join(directory, 'commander-auth.xml'), 'utf8');

const periods = [...periodsXml.matchAll(/<periodInfo>([\s\S]*?)<\/periodInfo>/g)]
  .map((match) => match[1])
  .map((xml) => ({
    sysid: (xml.match(/<vs:period sysid="(\d+)"/) || [])[1],
    name: (xml.match(/<name>([^<]+)<\/name>/) || [])[1],
    description: (xml.match(/<desc>([^<]+)<\/desc>/) || [])[1],
    period: (xml.match(/name="period">([^<]+)/) || [])[1],
    filename: (xml.match(/name="filename">([^<]+)/) || [])[1],
  }));

const functions = [...authXml.matchAll(/<Function>([\s\S]*?)<\/Function>/g)]
  .map((match) => match[1])
  .map((xml) => ({
    display: (xml.match(/<FunctionDisplay>([^<]*)/) || [])[1],
    command: (xml.match(/<FunctionCmd>([^<]*)/) || [])[1],
    detail: (xml.match(/<FunctionDetail>([^<]*)/) || [])[1],
    otpRequired: (xml.match(/<OTPRequired>([^<]*)/) || [])[1],
  }));

console.log('DAILY PERIODS');
console.log(
  JSON.stringify(
    periods.filter((entry) => entry.sysid === '2' || /DAILY/i.test(entry.description || '')).slice(0, 10),
    null,
    2
  )
);

console.log('\nPLU / ITEM / PRICE FUNCTIONS');
console.log(
  JSON.stringify(
    functions.filter((entry) =>
      /plu|item|price|product|department|category/i.test(Object.values(entry).join(' '))
    ),
    null,
    2
  )
);
