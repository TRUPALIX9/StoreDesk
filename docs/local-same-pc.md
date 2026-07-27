# Same-PC local stack (development)

**Development** runs the whole StoreDesk stack on **one Windows PC** via make scripts.

**Deployment is unchanged** — Cloud Hub still deploys with Docker/Cloud Run; Worker still runs on the store backoffice PC. Make scripts do **not** deploy anything.

| Mode | What you use |
|------|----------------|
| **Dev (same PC)** | `make setup` → `make stack` → Hub `:8080` + Worker `:4310` + Desktop |
| **Deploy (production)** | Hub: Docker → Cloud Run (session affinity, max 1). Worker: install on store PC with real `HUB_WS_URL` / Atlas keys. Mobile/Desktop point at deployed Hub when cloud mode ships. |

## Quick start (dev only)

```powershell
cd "C:\HOP IN 4630\StoreDesk"
make setup      # writes Worker / Hub / Desktop .env with demo Hub credentials
make stack      # Hub :8080 + Worker :4310 + Desktop
# or: make hub && make worker && make electron
make status
```

Demo Hub credentials (local Hub memory mode — **not** for production):

```txt
storeId:  SD-DEMO01
agentKey: sk_dev_demo_key
Hub WS:   ws://127.0.0.1:8080/ws
Worker:   http://127.0.0.1:4310
```

## Paths on one machine (dev)

```txt
Desktop  →  http://127.0.0.1:4310  →  Worker
Mobile LAN pair  →  http://127.0.0.1:4310  (or 10.0.2.2 from Android emulator)
Mobile Hub mode  →  ws://127.0.0.1:8080/ws  →  local Hub  →  Worker agent  →  :4310
```

## Mobile (dev)

1. Start `make stack` (Hub + Worker online; `hub.connected` should be true in `make status`).
2. Desktop → Link phone → choose **Same PC** or **Android emulator**, scan/pair (gets device token).
3. Mobile → Settings → **Fill same-PC Hub defaults** → mode **Hub** → **Test relay**.
4. Lookups then go Mobile → Hub → Worker (same JSON as LAN).

Physical phone on Wi‑Fi: use **Wi‑Fi phone** host (LAN IP), still same Worker.

## Stop

```powershell
make stop
```

## Deploy (unchanged)

Cloud Hub (`store-desk-cloud-backend`):

```bash
cd store-desk-cloud-backend
docker build -t storedesk-hub .
# Cloud Run: --session-affinity, max instances = 1, set MONGODB_URI for real stores
```

Worker on the store PC: install Node, set `HUB_WS_URL` to the **deployed** `wss://…/ws`, plus real `STORE_ID` / `AGENT_KEY` from Atlas — not the local demo key.

Make never builds or pushes Cloud Run images; it only runs local processes for development.
