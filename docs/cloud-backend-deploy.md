# StoreDesk Cloud Hub — Deploy Guide

Durable ops guide for **`store-desk-cloud-backend`** (Epic 1 WSS hub). Source of truth for deploy steps; keep in sync with the submodule README and `Dockerfile`.

**Branch:** deploy from submodule `production` (CI runs on `production` / `develop`).

**Repo:** `https://github.com/TRUPALIX9/store-desk-cloud-backend`

---

## What this service is

| Item | Detail |
|------|--------|
| Role | Outbound-friendly **WebSocket hub**: store rooms, agent/client presence, `AGENT_KEY` auth |
| HTTP | `GET /health`, `GET /` (text hint) |
| WebSocket | Path `/ws` — JSON protocol v0 (`hello` → `welcome`, `ping`/`pong`, `relay`) |
| Rooms | In-memory `store_{STORE_ID}` — **no Redis** in Epic 1 |
| Auth | Atlas `Store` collection (`storeId` + `agentKey` + `status`); if `MONGODB_URI` unset → memory demo only |
| Default port | **8080** (`PORT`) |
| Bind | `0.0.0.0` |

```txt
StoreDesk Worker (store PC)  --outbound WSS-->  Cloud Hub  <--WSS--  clients (Desktop/Mobile later)
        keeps :4310 LAN                                              role: agent | client
Admin browser  -->  StoreDesk Web (Vercel)  -->  Atlas (licenses / STORE_ID / AGENT_KEY only)
```

Catalog, Commander, and invoices stay on the store PC. Hub only relays opaque room messages.

---

## Environment variables

From `.env.example`:

| Variable | Required (prod) | Notes |
|----------|-----------------|-------|
| `PORT` | No (default `8080`) | Cloud Run sets `PORT`; container exposes 8080 |
| `MONGODB_URI` | **Yes for production** | Same Atlas URI as StoreDesk Web license DB |
| `HEARTBEAT_MS` | No (default `30000`) | Hub → client `ping` interval |

Without `MONGODB_URI` the hub seeds:

```txt
storeId: SD-DEMO01
agentKey: sk_dev_demo_key
```

**Never ship production without Atlas** — demo keys would be accepted by anyone who can open `/ws`.

---

## How apps connect

### StoreDesk Worker (agent) — implemented

Optional env on the store PC (`store-desk-worker/.env.example`):

```txt
HUB_WS_URL=wss://YOUR_HUB_HOST/ws
STORE_ID=SD-…
AGENT_KEY=sk_…
```

Worker keeps **HTTP `:4310`** and, when Hub env is set, opens outbound WSS as `role: "agent"`, then proxies `relay` payloads to loopback `/api/*`.

Local smoke (Hub on same PC):

```txt
HUB_WS_URL=ws://127.0.0.1:8080/ws
STORE_ID=SD-DEMO01
AGENT_KEY=sk_dev_demo_key
```

### Electron / Mobile (clients)

- **Today:** Desktop and Mobile talk to Worker on LAN (`localhost` / `LAN_IP:4310`).
- **Hub client path:** Desktop dual-mode D3 still open (`WO-20260726-desktop-dual-mode`). Planned: `hello` with `role: "client"` + same `storeId` / `agentKey`, then `relay`.
- Do **not** point phones at Hub until that path ships and is tested.

### StoreDesk Web

Creates/manages store license rows in Atlas. Hub reads the same `Store` shape (`storeId`, `agentKey`, `status`, …). Web itself does **not** connect to Hub WSS.

---

## Deploy options (what the repo actually supports)

| Path | In repo? | Verdict |
|------|----------|---------|
| **Docker → Google Cloud Run** | `Dockerfile` + README “Cloud Run” | **Best-supported / intended** |
| **GitHub Actions → Cloud Run** | `.github/workflows/deploy-cloud-run.yml` | **CD on `production` push** — secrets in GitHub, not `.env` |
| Raw Node (`npm run build` → `npm start`) | `package.json` scripts | Fine for local / same-PC Hub |
| GitHub Actions CI | `.github/workflows/ci.yml` | `npm ci` + `npm run ci` (no deploy) |
| Vercel | None | **Not suitable** — long-lived WSS + in-memory rooms ≠ serverless functions |
| Railway / Fly / Render | No config files | Possible via same Docker image; not documented or tested here |

---

## Recommended path: Cloud Run (checklist)

Prereqs on your machine: **Docker** (or Cloud Build), **gcloud**, a GCP project, Atlas `MONGODB_URI`, and rights to push images / deploy Run.

### 0. Preflight

```bash
cd store-desk-cloud-backend
git checkout production
git pull
npm ci
npm run ci
```

Confirm Dockerfile builds locally (if Docker installed):

```bash
docker build -t storedesk-hub .
docker run --rm -p 8080:8080 -e MONGODB_URI="your-atlas-uri" storedesk-hub
# curl http://127.0.0.1:8080/health
```

### 1. GCP one-time setup

```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

gcloud artifacts repositories create storedesk \
  --repository-format=docker \
  --location=us-central1 \
  --description="StoreDesk images"
```

Store Atlas URI as a secret (prefer Secret Manager over plain env):

```bash
echo -n "mongodb+srv://..." | gcloud secrets create MONGODB_URI --data-file=-
# grant Cloud Run runtime SA access to the secret (console or IAM)
```

### 2. Build & push image

```bash
# from store-desk-cloud-backend/
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/storedesk/cloud-hub:latest
```

### 3. Deploy (critical Run flags)

Epic 1 rooms are **in-memory**. You must keep peers on one instance:

```bash
gcloud run deploy storedesk-cloud-hub \
  --image us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/storedesk/cloud-hub:latest \
  --region us-central1 \
  --platform managed \
  --port 8080 \
  --session-affinity \
  --max-instances 1 \
  --min-instances 0 \
  --cpu 1 \
  --memory 512Mi \
  --allow-unauthenticated \
  --set-secrets=MONGODB_URI=MONGODB_URI:latest \
  --set-env-vars=HEARTBEAT_MS=30000
```

Notes:

- **`--session-affinity` + `--max-instances 1`** — required until a Redis/scale-out epic.
- **`--allow-unauthenticated`** — edge is open; real auth is `AGENT_KEY` on `hello`. Tighten with Cloud Armor / IAM later if needed.
- Cloud Run gives **HTTPS**; clients use **`wss://SERVICE_URL/ws`** (not `ws://`).

Capture the service URL from the deploy output.

### 4. Verify

```bash
curl -sS "https://YOUR_RUN_HOST/health"
# expect: {"ok":true,"service":"storedesk-cloud-hub","atlas":true,...}
```

WebSocket smoke (Node one-liner / `wscat`): send

```json
{"type":"hello","role":"agent","storeId":"SD-…","agentKey":"sk_…"}
```

Expect `welcome` with `room: "store_SD-…"`. Bad key → close **4401**.

### 5. Point a Worker at Hub

On the store PC Worker `.env`:

```txt
HUB_WS_URL=wss://YOUR_RUN_HOST/ws
STORE_ID=SD-…
AGENT_KEY=sk_…   # must match Atlas Store.agentKey
```

Restart Worker; confirm health / logs show Hub `welcome`. Catalog still on `:4310`.

### 6. Rollback

```bash
gcloud run services update-traffic storedesk-cloud-hub \
  --region us-central1 \
  --to-revisions PREVIOUS_REVISION=100
```

Or redeploy a known-good image tag.

---

## GitHub secrets → Cloud Run (automatic deploy)

**Yes — store env/secrets in GitHub Actions, not in git.** Never commit `.env`. The workflow reads GitHub secrets / variables and deploys to Cloud Run.

| Store secrets in… | Use for… |
|-------------------|----------|
| **GitHub Actions secrets** | Deploy credentials (`GCP_SA_KEY` or WIF) + optional `MONGODB_URI` sync |
| **GCP Secret Manager** | Runtime `MONGODB_URI` bound with `--set-secrets` (preferred for the app) |
| **GitHub Actions variables** (non-secret) | Project / region / service / Artifact Registry names |

**Alternative (often better for GCP-only ops):** skip putting `MONGODB_URI` in GitHub; create the secret once in Secret Manager, and let the workflow only build/push/deploy while referencing `MONGODB_URI=MONGODB_URI:latest`. Auth can also be Cloud Build + WIF instead of a JSON key in GitHub.

### Workflow

- Path: `store-desk-cloud-backend/.github/workflows/deploy-cloud-run.yml`
- Triggers: **push to `production`**, or Actions → **Deploy Cloud Run** → **Run workflow**
- What it does: auth → build/push image to Artifact Registry → optional Secret Manager sync → `gcloud run deploy` with session affinity + `--max-instances 1` + `--set-secrets=MONGODB_URI=MONGODB_URI:latest`

### Required GitHub configuration

In the **`store-desk-cloud-backend`** repo (not the parent):

**Settings → Secrets and variables → Actions → Secrets**

| Secret | Required | Purpose |
|--------|----------|---------|
| `GCP_SA_KEY` | **Yes** (v1) | JSON key for a deployer service account (see IAM below) |
| `MONGODB_URI` | Recommended | If set, workflow writes/updates GCP Secret Manager `MONGODB_URI` before deploy. If unset, deploy still uses the existing GCP secret. |

**Settings → Secrets and variables → Actions → Variables** (optional; defaults match current ops)

| Variable | Default if unset | Purpose |
|----------|------------------|---------|
| `GCP_PROJECT_ID` | `store-desk-499322` | GCP project |
| `GCP_REGION` | `us-central1` | Region |
| `CLOUD_RUN_SERVICE` | `storedesk-cloud-backend` | Cloud Run service name |
| `GCP_AR_REPOSITORY` | `storedesk` | Artifact Registry Docker repo |

### How to add secrets in the GitHub UI

1. Open https://github.com/TRUPALIX9/store-desk-cloud-backend/settings/secrets/actions  
2. **New repository secret** → name `GCP_SA_KEY` → paste the full service-account JSON → Save.  
3. (Optional) **New repository secret** → name `MONGODB_URI` → paste `mongodb+srv://…` → Save.  
4. (Optional) **Variables** tab → set `GCP_PROJECT_ID` / `GCP_REGION` / etc. if you are not using the defaults.

### One-time GCP IAM for the deployer SA

Create a service account used only by GitHub (example name `github-cloud-hub-deployer`), grant:

- `roles/run.admin` (deploy Cloud Run)
- `roles/artifactregistry.writer` (push images)
- `roles/iam.serviceAccountUser` on the Cloud Run runtime SA
- `roles/secretmanager.admin` **or** `secretmanager.secretAccessor` + `secretmanager.secretVersionAdder` (if syncing `MONGODB_URI` from GitHub)

Create a JSON key → paste into GitHub secret `GCP_SA_KEY`. Prefer rotating / moving to WIF later (below).

Ensure the **Cloud Run runtime** service account can read Secret Manager secret `MONGODB_URI` (`roles/secretmanager.secretAccessor`).

### Redeploy trigger

- **Automatic:** `git push origin production` (after merge/commit on `production`).  
- **Manual:** GitHub → **Actions** → **Deploy Cloud Run** → **Run workflow**.  
- Watch the job log for `Deployed: https://…` then `curl https://…/health` (expect `atlas: true`).

### Preferred later: Workload Identity Federation (no JSON key)

Long-lived `GCP_SA_KEY` works but is less ideal. Upgrade path:

1. Create a Workload Identity Pool + Provider for GitHub (`token.actions.githubusercontent.com`), bound to this repo.  
2. Allow the pool principal to impersonate the deployer SA.  
3. Add GitHub secrets `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT`.  
4. In `deploy-cloud-run.yml`, comment out the `credentials_json` auth step and uncomment the WIF auth block.  
5. Delete `GCP_SA_KEY` from GitHub and disable the JSON key in GCP.

### What not to do

- Do **not** commit `.env` or put Atlas URIs in the repo.  
- Do **not** put all app env only in GitHub and skip Secret Manager unless you accept plain `--set-env-vars` (visible to anyone with Cloud Run view). Prefer `--set-secrets`.  
- Do **not** use Vercel env for this service (Hub is not a Vercel app).

---

## Alternate: local / same-PC Node (no cloud)

```bash
cd store-desk-cloud-backend
cp .env.example .env
# optional: set MONGODB_URI
npm install
npm run dev          # or: npm run build && npm start
```

- Health: `http://localhost:8080/health`
- WS: `ws://localhost:8080/ws`

Useful for Worker outbound smoke before Cloud Run.

---

## Security notes

1. **Secrets** — never commit `.env`; only `MONGODB_URI` (+ optional heartbeat) in Cloud Run. Mark Secret Manager secrets write-restricted.
2. **Always set `MONGODB_URI` in prod** — unset → public demo `sk_dev_demo_key`.
3. **Transport** — production clients must use **WSS**; `agentKey` travels in the first JSON message.
4. **Auth surface** — validation is equality on `Store.agentKey` + reject `suspended`. No JWT on Hub yet; close codes `4400` / `4401`.
5. **CORS** — HTTP surface is health/root only; no CORS middleware. Do not expose broad HTTP APIs on this process without an allowlist.
6. **Scale** — do not raise `max-instances` above 1 without a shared room store (Redis etc.).
7. **Atlas** — Hub and Web share license data only (~M0); never put catalog/Commander data in Atlas.
8. **Worker keys** — treat `AGENT_KEY` like a device secret on the store PC; rotate via Web/Atlas if compromised.

---

## Production blockers / gaps

| Gap | Impact |
|-----|--------|
| Cloud Run deploy never done (ops follow-up on WO foundation) | No public Hub URL yet |
| `MONGODB_URI` + live Atlas `Store` rows must exist | Without them, only demo auth or “unknown store” |
| CD needs GitHub `GCP_SA_KEY` (+ optional `MONGODB_URI`) configured once | Until then: manual `gcloud builds submit` + `run deploy` |
| Electron Hub client (D3) unfinished | Desktop cannot use Hub relay yet |
| Mobile Hub path later | Phones stay on LAN `:4310` |
| `gcloud` / Docker may be missing on operator PC | Install before first deploy |
| No Fly/Railway/Vercel configs | Do not assume platform auto-detect beyond Docker |
| In-memory rooms | Multi-instance / multi-region break presence & relay |

---

## Related docs

- Submodule: `store-desk-cloud-backend/README.md`, `AGENTS.md`, `Dockerfile`
- Env inventory (all projects): `docs/env-by-project.md`
- WOs: `docs/work-orders/WO-20260726-cloud-hub-foundation.md`, `WO-20260727-cloud-backend-deploy.md`
- Worker outbound: `docs/work-orders/WO-20260726-edge-agent-outbound-wss.md`
- Architecture: `docs/architecture.md`, `docs/how-storedesk-works.md`
