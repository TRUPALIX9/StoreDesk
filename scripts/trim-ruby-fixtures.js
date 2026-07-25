const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "commander-downloads");

function totalsOnly(srcPath, outName, closeTag) {
  const xml = fs.readFileSync(path.join(dir, srcPath), "utf8");
  const totals = (xml.match(/<totals>[\s\S]*?<\/totals>/) || [])[0];
  if (!totals) throw new Error(`no totals in ${srcPath}`);
  const head = xml.slice(0, xml.indexOf("<totals>"));
  const fixture = `${head}${totals}${closeTag}`;
  const out = path.join(dir, outName);
  fs.writeFileSync(out, fixture, "utf8");
  console.log(out, Buffer.byteLength(fixture));
}

totalsOnly("ruby-tax-2026-07-23.318.xml", "ruby-tax-318-totals-only.xml", "</pd:taxPd>");
totalsOnly(
  "ruby-summary-2026-07-23.318.xml",
  "ruby-summary-318-totals-only.xml",
  "</pd:summaryPd>"
);
