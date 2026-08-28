import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const CLOUDFLARED_URL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe";
const WINSW_URL = "https://github.com/winsw/winsw/releases/download/v2.12.0/WinSW-x64.exe";
const TARGET_DIR = path.join(__dirname, "../resources/bin");
const CLOUDFLARED_FILE = path.join(TARGET_DIR, "cloudflared.exe");
const WORKER_SERVICE_EXE = path.join(TARGET_DIR, "StoreDeskWorkerService.exe");
const WORKER_SERVICE_XML = path.join(TARGET_DIR, "StoreDeskWorkerService.xml");

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (!response.headers.location) {
          return reject(new Error("Redirect location is missing"));
        }
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
      file.on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function fetchBinary(url: string, dest: string, name: string) {
  if (fs.existsSync(dest)) {
    console.log(`${name} already exists at ${dest}, skipping download.`);
    return;
  }
  console.log(`Downloading ${name} from: ${url}`);
  try {
    await downloadFile(url, dest);
    console.log(`Successfully downloaded ${name}!`);
  } catch (error) {
    console.error(`Failed to download ${name}:`, error);
    process.exit(1);
  }
}

function writeWinSwConfig() {
  const xmlContent = `<service>
  <id>StoreDeskWorker</id>
  <name>StoreDesk Worker Service</name>
  <description>Background daemon for StoreDesk local network and POS integrations.</description>
  <executable>%BASE%\\worker.exe</executable>
  <log mode="roll"></log>
  <onfailure action="restart" delay="10 sec"/>
</service>`;
  fs.writeFileSync(WORKER_SERVICE_XML, xmlContent);
  console.log("Successfully wrote StoreDeskWorkerService.xml!");
}

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  await fetchBinary(CLOUDFLARED_URL, CLOUDFLARED_FILE, "cloudflared.exe");
  await fetchBinary(WINSW_URL, WORKER_SERVICE_EXE, "StoreDeskWorkerService.exe");
  writeWinSwConfig();
}

main();
