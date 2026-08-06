import https from "node:https";
import os from "node:os";

const COMMON_USERNAMES = ["system", "manager", "admin", "csr"];

function getLocalSubnets() {
  const interfaces = os.networkInterfaces();
  const subnets = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        const parts = net.address.split(".");
        subnets.push(parts.slice(0, 3).join("."));
      }
    }
  }
  // Common default POS subnets
  const defaults = ["192.168.31", "192.168.1", "192.168.0", "10.96.10"];
  for (const def of defaults) {
    if (!subnets.includes(def)) subnets.push(def);
  }
  return subnets;
}

function httpsGet(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: `${parsed.pathname}${parsed.search}`,
          method: "GET",
          rejectUnauthorized: false,
          timeout: timeoutMs
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
            if (body.length > 2000) req.destroy();
          });
          res.on("end", () => resolve({ ok: true, status: res.statusCode, body }));
        }
      );
      req.on("error", () => resolve({ ok: false }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false, timeout: true });
      });
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
}

async function probeCommanderIp(ip, password = "") {
  const host = `https://${ip}`;
  const url = `${host}/cgi-bin/CGILink?cmd=validate`;
  const probe = await httpsGet(url, 2000);
  if (!probe.ok && probe.status !== 200 && probe.status !== 400 && probe.status !== 401) {
    return null;
  }
  // Found a candidate POS Commander host
  if (!password) {
    return { host, ip, detected: true, authenticated: false };
  }

  // Test credentials against detected host
  for (const username of COMMON_USERNAMES) {
    const loginUrl = `${host}/cgi-bin/CGILink?cmd=validate&user=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}`;
    const loginRes = await httpsGet(loginUrl, 4000);
    if (loginRes.ok && /<cookie[^>]*>([^<]+)<\/cookie>/i.test(loginRes.body)) {
      const cookie = (loginRes.body.match(/<cookie[^>]*>([^<]+)<\/cookie>/i) || [])[1];
      // Release credential session
      await httpsGet(`${host}/cgi-bin/CGILink?cmd=releaseCredential&cookie=${encodeURIComponent(cookie)}`, 2000);
      return { host, ip, username, password, detected: true, authenticated: true };
    }
  }

  return { host, ip, detected: true, authenticated: false, reason: "Invalid password or user" };
}

export async function discoverCommander(password = process.env.COMMANDER_PASSWORD || "") {
  const subnets = getLocalSubnets();
  console.log(`[Commander Discovery] Scanning local subnets: ${subnets.join(", ")}...`);
  
  // Specific known Commander IPs to test first
  const knownIps = ["192.168.31.11", "192.168.1.100", "192.168.1.10", "192.168.0.100"];
  for (const ip of knownIps) {
    const res = await probeCommanderIp(ip, password);
    if (res?.authenticated) {
      console.log(`[Commander Discovery] ✅ Verified POS Commander at ${res.host} (User: ${res.username})`);
      return res;
    }
    if (res?.detected) {
      console.log(`[Commander Discovery] Found Commander at ${res.host} (Authentication pending)`);
    }
  }

  // Scan subnets concurrently in batches of 25 IPs
  for (const subnet of subnets) {
    const tasks = [];
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}.${i}`;
      if (!knownIps.includes(ip)) {
        tasks.push(probeCommanderIp(ip, password));
      }
    }

    const results = await Promise.all(tasks);
    for (const res of results) {
      if (res?.authenticated) {
        console.log(`[Commander Discovery] ✅ Verified POS Commander at ${res.host} (User: ${res.username})`);
        return res;
      }
      if (res?.detected) {
        console.log(`[Commander Discovery] Candidate POS Commander detected at ${res.host}`);
        return res;
      }
    }
  }

  console.log("[Commander Discovery] No POS Commander host found on local subnets.");
  return null;
}

if (process.argv[1]?.endsWith("commander-probe.mjs")) {
  const pass = process.argv[2] || process.env.COMMANDER_PASSWORD || "";
  discoverCommander(pass).then((res) => {
    console.log("\nDiscovery Result:", JSON.stringify(res, null, 2));
  });
}
