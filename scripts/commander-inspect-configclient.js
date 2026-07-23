const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '16F80D1A39C4F3AA9670D96075BD84D1.cache.js');
const source = fs.readFileSync(file, 'utf8');

// Print specific interned string constants used by the connection + PLU code.
const wanted = [779, 811, 813, 851, 852, 853, 854, 855, 856, 857, 858, 891, 892, 893, 894, 895, 896];
for (const index of wanted) {
  const match = source.match(new RegExp('\\$intern_' + index + " = '((?:\\\\.|[^'])*)'"));
  console.log('$intern_' + index + ' = ' + (match ? match[1] : '(not found)'));
}

// Show the getQueryString builder body so we know exact parameter ordering.
const anchor = 'function com_verifone_isd_psc_config_client_pres_connection_HTTPConnectionHelper_getQueryString__';
const at = source.indexOf(anchor);
if (at !== -1) {
  console.log('\n----- getQueryString -----');
  console.log(source.slice(at, at + 1600));
}
