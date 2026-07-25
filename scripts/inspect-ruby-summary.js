const fs = require("fs");
const path = require("path");
const sum = fs.readFileSync(
  path.join(__dirname, "commander-downloads/ruby-summary-2026-07-23.318.xml"),
  "utf8"
);
const tags = new Set();
for (const m of sum.matchAll(/<\/?([A-Za-z0-9:_-]+)/g)) tags.add(m[1]);
console.log([...tags].sort().join(", "));
const totals = (sum.match(/<totals>([\s\S]*?)<\/totals>/) || [])[1] || "";
console.log("TOTALS LEN", totals.length);
console.log(totals.slice(0, 4000));
const mopIdx = sum.search(/mop|CREDIT|DEBIT|financialInfo|payInfo/i);
console.log("search idx", mopIdx);
console.log(sum.slice(Math.max(0, mopIdx - 40), mopIdx + 500));
