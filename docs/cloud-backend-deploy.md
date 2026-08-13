# StoreDesk Cloud Hub — Deploy Guide

**Deployment target:** GCP Compute Engine `e2-micro` VM (Always Free Tier)  
**Source:** `store-desk-cloud-backend` submodule  
**WO:** `WO-20260812-hub-e2micro-migration`

> **DEPRECATED PATH:** Cloud Run (`WO-20260727-cloud-backend-deploy`) is superseded. The Dockerfile is kept for local testing only.

---

## What this service is

| Item | Detail |
|------|--------|
| Role | Persistent WebSocket hub: store rooms, agent/client presence, relay |
| HTTP | `GET /health`, `GET /` (text hint) |
| WebSocket | Path `/ws` — JSON protocol v0/v1 (`hello` → `welcome`, `ping/pong`, `relay`, `sync.pull`, `sync.delta`, `LIVE_PRICE_REQ/RES`) |
| Rooms | In-memory `store_{storeId}__{workerInstallationId}` — **no Redis** |
| Auth | Legacy: Atlas `Store` collection (`storeId` + `agentKey`). v1: HMAC-SHA256 relay session token (`RELAY_SESSION_SECRET`) |
| Default port | **8080** (Cloudflare Tunnel proxies public → `localhost:8080`) |
| Process manager | **PM2** — `ecosystem.config.cjs` |
| SSL / public URL | **Cloudflare Tunnel** (`cloudflared`) — no static IP, no certbot |

```
StoreDesk Mobile / Desktop
    │  wss://hub.storedesk.com/ws
    ▼
Cloudflare Tunnel ──► localhost:8080 (e2-micro VM)
                            │
                     PM2 node dist/index.js  (--max-old-space-size=512)
                            │
                     Atlas (sync.pull / sync.delta)
                            │
                 ◄── outbound WSS ── StoreDesk Worker :4310
                                           │
                                      Local MongoDB
                                           │
                                    Verifone Commander
```

---

## Environment Variables

### `store-desk-cloud-backend/.env` (on VM — OS-protected, not committed)

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `PORT` | No | `8080` | Cloudflare Tunnel proxies to this; keep 8080 |
| `MONGODB_URI` | **Yes (prod)** | — | Atlas URI (same as StoreDesk Web). Without this → demo memory auth only |
| `HEARTBEAT_MS` | No | `60000` | Relaxed from Cloud Run's 30s — no timeout pressure on VM |
| `RELAY_SESSION_SECRET` | **Yes (prod)** | — | HMAC-SHA256 secret for session tokens |
| `HUB_ALLOW_LEGACY_AGENT_KEY` | No | `1` | Set to `0` to disable legacy `agentKey` hello after full v1 migration |
| `NODE_MAX_OLD_SPACE_SIZE` | No | `512` | Set via PM2 `node_args` — guards 1 GB RAM on e2-micro |

> **Never leave prod Hub without `MONGODB_URI`** — unset → public demo key `sk_dev_demo_key` accepted by anyone.

---

## Part 1: One-Time VM Provisioning

### 1.1 Create the VM (GCP Console or gcloud)

```bash
gcloud compute instances create storedesk-hub \
  --machine-type=e2-micro \
  --zone=us-east1-b \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server
```

> Firewall rules for tags `http-server` / `https-server` allow ports 80 and 443 inbound — used only by `cloudflared` outbound tunnel, not directly by Node.js.

### 1.2 Install Node.js 20 + PM2

SSH into the VM then:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

# Log directory
sudo mkdir -p /var/log/storedesk
sudo chown $USER /var/log/storedesk
```

### 1.3 Install Cloudflare Tunnel (`cloudflared`)

```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

# Authenticate (opens browser)
cloudflared tunnel login

# Create tunnel — note the UUID printed
cloudflared tunnel create storedesk-hub

# Route DNS CNAME  hub.storedesk.com → <TUNNEL_UUID>.cfargotunnel.com
cloudflared tunnel route dns storedesk-hub hub.storedesk.com
```

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /root/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: hub.storedesk.com
    service: http://localhost:8080
  - service: http_status:404
```

Install as system service (auto-starts on reboot):

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

### 1.4 Deploy the Hub App

```bash
# Clone the hub repo
git clone https://github.com/TRUPALIX9/store-desk-cloud-backend.git /opt/storedesk/hub
cd /opt/storedesk/hub
git checkout production

# Install and build
npm ci --omit=dev
npm run build

# Configure secrets
cp .env.example .env
nano .env   # Set MONGODB_URI, RELAY_SESSION_SECRET, PORT=8080, HEARTBEAT_MS=60000

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 startup          # prints a sudo command — run it to register pm2 as systemd service
# (run the printed sudo command)
pm2 save
```

### 1.5 Verify

```bash
# Health check through Cloudflare Tunnel
curl -sf https://hub.storedesk.com/health | python3 -m json.tool
# Expect: { "ok": true, "atlas": true, "heartbeatMs": 60000 }

# WebSocket smoke (requires wscat: npm install -g wscat)
wscat -c wss://hub.storedesk.com/ws
# Send: {"type":"hello","role":"agent","storeId":"SD-HERO01","agentKey":"sk_live_harshil_hero_key"}
# Expect: {"type":"welcome","room":"store_SD-HERO01",...}
```

---

## Part 2: CD — Automatic Deploy on `production` Push

### GitHub Actions: `.github/workflows/deploy-vm.yml`

Triggers on push to `production` branch. SSH into VM, pulls latest code, rebuilds, and hot-reloads PM2.

**Required GitHub configuration** (in `store-desk-cloud-backend` repo → Settings → Secrets/Variables):

| Key | Type | Value |
|-----|------|-------|
| `VM_SSH_PRIVATE_KEY` | **Secret** | Ed25519 private key matching VM's `~/.ssh/authorized_keys` |
| `VM_HOST` | Variable | `hub.storedesk.com` (or VM IP during setup) |
| `VM_USER` | Variable | OS user on VM (e.g. `storedesk`) |

> **Remove `GCP_SA_KEY`** from GitHub secrets after migration — it is no longer needed for Hub deploys.

### One-time SSH key setup on VM

```bash
# On your LOCAL machine — generate a deploy key
ssh-keygen -t ed25519 -C "github-deploy-storedesk-hub" -f ~/.ssh/storedesk_hub_deploy

# Copy public key to the VM
ssh-copy-id -i ~/.ssh/storedesk_hub_deploy.pub <VM_USER>@<VM_IP>

# Add the private key content to GitHub secret VM_SSH_PRIVATE_KEY
cat ~/.ssh/storedesk_hub_deploy
```

### Manual deploy (without CD)

```bash
./scripts/deploy-vm.sh hub.storedesk.com storedesk
# Or SSH directly:
ssh storedesk@hub.storedesk.com "cd /opt/storedesk/hub && git pull && npm ci --omit=dev && npm run build && pm2 reload ecosystem.config.cjs --update-env && pm2 save"
```

---

## Part 3: PM2 Management Commands

```bash
# Status
pm2 status
pm2 logs storedesk-hub --lines 50

# Reload (zero-downtime restart)
pm2 reload ecosystem.config.cjs --update-env

# Hard restart
pm2 restart storedesk-hub

# Stop
pm2 stop storedesk-hub

# View memory usage (important on 1 GB VM)
pm2 monit
```

---

## Part 4: Rollback

```bash
# Rollback to previous Git commit on VM
ssh storedesk@hub.storedesk.com << 'EOF'
  cd /opt/storedesk/hub
  git log --oneline -5     # find the good commit
  git checkout <COMMIT_SHA>
  npm run build
  pm2 reload ecosystem.config.cjs
EOF
```

---

## Part 5: Point a Worker at the Hub

On the **store PC** `store-desk-worker/.env`:

```env
# Update to new VM hostname
HUB_WS_URL=wss://hub.storedesk.com/ws
STORE_ID=SD-HERO01
AGENT_KEY=sk_live_harshil_hero_key   # must match Atlas Store.agentKey
```

Restart Worker (`npm run dev` or service restart). Confirm logs show:
```
[hub] connecting wss://hub.storedesk.com/ws as SD-HERO01
[hub] welcome room=store_SD-HERO01
[hub] Connected. Initiating two-way pull sync...
```

---

## Part 6: How Apps Connect

### StoreDesk Worker (agent)

Opens outbound WSS as `role: "agent"`. On `welcome` it flushes offline deltas and issues `sync.pull` for all entity types. Relay requests from mobile/desktop are forwarded to `http://127.0.0.1:4310/api/*` and the response is sent back over WSS.

### StoreDesk Mobile / Desktop (clients)

Authenticate with `hello` using a JWT `sessionToken` (`role: "app_user"`). Send `relay.request` frames. Hub routes to the store's agent peer. Live price checks use the new `LIVE_PRICE_REQ { storeId, upc, requestId }` frame type.

---

## Part 7: Security Notes

1. **Never commit `.env`** — set secrets on the VM only via SSH.
2. **Always set `MONGODB_URI` in prod** — without it, demo key `sk_dev_demo_key` is public.
3. **Transport** — Cloudflare Tunnel provides HTTPS/WSS termination. Node.js binds `localhost:8080` only (not public).
4. **Auth surface** — legacy `agentKey` equality check + `RELAY_SESSION_SECRET` HMAC-SHA256 JWT. Set `HUB_ALLOW_LEGACY_AGENT_KEY=0` after full v1 migration.
5. **Memory ceiling** — `--max-old-space-size=512` in PM2 prevents OOM on 1 GB VM. Hub is I/O-bound; 512 MB is generous.
6. **Scale** — Do not run multiple instances without Redis. Single PM2 `fork` instance is correct for in-memory rooms.
7. **Atlas** — Hub and Web share license data only (~M0). Never put catalog/Commander/invoice data in Atlas.
8. **Cloudflare** — Tunnel credentials file (`<UUID>.json`) is root-only on VM. Rotate via `cloudflared tunnel rotate-secret` if compromised.

---

## Part 8: Gap Backlog

| Gap | Impact | Priority |
|-----|--------|----------|
| Delta hashing not yet committed | All 17,500 PLUs synced to Atlas on every restart (~15 MB instead of ~KB) | P1 |
| `LIVE_PRICE_REQ` not yet in hub.ts | Mobile live price check route incomplete | P1 |
| Mobile Hub path not wired in Flutter | Phones still use LAN :4310 | P1 |
| Electron Hub client (D3) unfinished | Desktop cannot use Hub relay | P2 |
| `HUB_ALLOW_LEGACY_AGENT_KEY` still `1` | Legacy `agentKey` accepted (migration compatibility) | P2 after v1 |

---

## Related Docs

- `docs/work-orders/WO-20260812-hub-e2micro-migration.md` — active WO
- `docs/work-orders/WO-20260727-cloud-backend-deploy.md` — superseded Cloud Run WO
- `docs/env-by-project.md` — all env vars by project
- `docs/architecture.md` — component trust boundaries
- `store-desk-cloud-backend/ecosystem.config.cjs` — PM2 config
- `store-desk-cloud-backend/scripts/deploy-vm.sh` — manual deploy script
