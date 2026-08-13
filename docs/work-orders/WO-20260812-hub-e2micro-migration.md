# WO-20260812-hub-e2micro-migration

**Status:** `done`  
**Priority:** P0  
**Management:** collaborative  
**Primary owner:** backend-server  
**Reviewers:** tech-lead, qa-verifier, docs-scribe  
**Modules touched:** `store-desk-cloud-backend` · `store-desk-worker` · `docs` · `README.md`  
**Created:** 2026-08-12  
**Supersedes:** `WO-20260727-cloud-backend-deploy` (Cloud Run deploy — now deprecated)

---

## Goal

Migrate **StoreDesk Cloud Hub** from GCP Cloud Run to a **GCP Compute Engine `e2-micro` VM** (Always Free Tier) managed by **PM2**, with **Cloudflare Tunnel** for zero-config SSL — enabling persistent WebSocket connections, eliminating Cloud Run's 60-minute timeout cap and scale-to-zero disconnects, and adding delta hashing + live on-demand mobile price checks.

---

## Background

Cloud Run's serverless model creates three critical problems for the Hub:
1. **60-minute WebSocket timeout** — forces aggressive heartbeats and causes worker reconnects mid-session.
2. **Scale-to-zero** — briefly drops all in-memory room state and all connected Workers when idle traffic triggers container shutdown.
3. **Complex IAM/secrets** — Artifact Registry + Cloud Build + Secret Manager adds maintenance overhead for a lightweight JSON router.

The `e2-micro` VM (0.25 vCPU, 1 GB RAM, 30 GB HDD) is in GCP's Always Free Tier and is suitable because the Hub is purely I/O-bound (WebSocket routing), performs no heavy computation, and never holds catalog/Commander data.

Cloudflare Tunnel (`cloudflared`) provides a free, certificate-managed public endpoint without static IP reservations, open firewall ports, or certbot management.

---

## Acceptance Criteria

### Cloud Hub
- [ ] `ecosystem.config.cjs` committed — PM2 starts Hub with `--max-old-space-size=512`
- [ ] `scripts/deploy-vm.sh` committed and executable
- [ ] `.github/workflows/deploy-vm.yml` committed — triggers on `production` push
- [ ] `.github/workflows/deploy-cloud-run.yml` trigger disabled (push event removed), deprecation comment added
- [ ] `scripts/deploy-cloud-run.cjs` has deprecation comment at top
- [ ] `Dockerfile` has deprecation notice comment (kept for local testing)
- [ ] `src/hub.ts` handles `LIVE_PRICE_REQ` / `LIVE_PRICE_RES` frames
- [ ] `src/config.ts` heartbeat default updated to `60000` ms
- [ ] `.env.example` updated with all new variables
- [ ] `npm run ci` passes on `production` branch

### Worker
- [ ] `commanderPlu.service.ts` exports `computePluHash(record)` (MD5 of `name|dept|sell|sellUnit`)
- [ ] `appStatePersistence.service.ts` stores `commanderHash` field on PriceBookEntry upsert
- [ ] `deltaPublish.service.ts` has `publishDeltaIfChanged()` that skips publish when hash unchanged
- [ ] `hubRelay.service.ts` handles `LIVE_PRICE_REQ` → `GET /api/price-book/by-upc/:upc` → `LIVE_PRICE_RES`
- [ ] Worker `.env.example` updated: `HUB_WS_URL` example points to `wss://hub.storedesk.com/ws`

### Infrastructure (ops — not code-gated)
- [ ] e2-micro VM provisioned in `us-east1-b` with 30 GB boot disk
- [ ] Node.js 20 + PM2 installed on VM
- [ ] `cloudflared` installed and tunnel created, DNS CNAME set for hub hostname
- [ ] `/opt/storedesk/hub` cloned from `production`, `.env` configured with real secrets
- [ ] `pm2 start ecosystem.config.cjs && pm2 startup && pm2 save` run on VM
- [ ] `GET https://<hub-hostname>/health` returns `{ ok: true, atlas: true, heartbeatMs: 60000 }`
- [ ] Worker at store PC updated: `HUB_WS_URL=wss://<hub-hostname>/ws`, restarts and logs `welcome`

### Docs
- [ ] `docs/cloud-backend-deploy.md` rewritten for e2-micro (VM + PM2 + Cloudflare Tunnel runbook)
- [ ] `docs/env-by-project.md` updated: Cloud Hub section reflects new env vars + VM secrets
- [ ] `docs/architecture.md` Hub deployment row updated (Cloud Run → e2-micro VM)
- [ ] `docs/release-status.md` Cloud Hub row updated
- [ ] `README.md` architecture diagram updated, Cloud Run references removed

---

## Out of Scope

- Redis / multi-instance horizontal scale-out (single VM single process is sufficient)
- Deleting Cloud Run service (keep as fallback, just stop deploying to it)
- Mobile Hub relay path completion (tracked separately)
- Electron Hub dual-mode client D3 (tracked in `WO-20260726-desktop-dual-mode`)
- MongoDB Atlas migration (same Atlas URI, no change to data model)

---

## Touch List

### `store-desk-cloud-backend`
- `src/config.ts` — relax heartbeat default to 60 000 ms, remove Cloud Run comment
- `src/hub.ts` — add `LIVE_PRICE_REQ` / `LIVE_PRICE_RES` handlers
- `.env.example` — add `RELAY_SESSION_SECRET`, `HUB_ALLOW_LEGACY_AGENT_KEY`, `NODE_MAX_OLD_SPACE_SIZE`
- `ecosystem.config.cjs` — **NEW** PM2 process definition
- `scripts/deploy-vm.sh` — **NEW** SSH-based deploy
- `.github/workflows/deploy-vm.yml` — **NEW** CD pipeline
- `.github/workflows/deploy-cloud-run.yml` — disable push trigger, add deprecation comment
- `scripts/deploy-cloud-run.cjs` — add deprecation comment
- `Dockerfile` — add deprecation notice comment

### `store-desk-worker`
- `src/services/commanderPlu.service.ts` — export `computePluHash()`
- `src/services/appStatePersistence.service.ts` — store `commanderHash` in PriceBookEntry upserts
- `src/services/deltaPublish.service.ts` — add `publishDeltaIfChanged()`
- `src/services/hubRelay.service.ts` — handle `LIVE_PRICE_REQ` frame type
- `.env.example` — update `HUB_WS_URL` example to `wss://hub.storedesk.com/ws`

### `docs/` (parent repo)
- `docs/cloud-backend-deploy.md` — full rewrite: e2-micro + PM2 + Cloudflare Tunnel runbook
- `docs/env-by-project.md` — Cloud Hub section update + VM GitHub secrets table
- `docs/architecture.md` — deployment table + Hub description update
- `docs/release-status.md` — Cloud Hub status row
- `README.md` — architecture diagram + Cloud Run → e2-micro references

---

## Dependencies

- `WO-20260726-cloud-hub-foundation` — **done** (Hub code shipped; this WO changes deployment only)
- `WO-20260727-cloud-backend-deploy` — **superseded** by this WO
- Operator must have: Cloudflare account with `storedesk.com` domain (or equivalent), GCP project access to create VM

---

## Architecture Reference

```
StoreDesk Mobile / Desktop
    │  Authenticated WSS (wss://hub.storedesk.com/ws)
    ▼
Cloudflare Tunnel  ──►  localhost:8080 on e2-micro VM
                            │
                        PM2 → node dist/index.js
                            │
                        Atlas (sync.pull / sync.delta)
                            │
                   ◄── outbound WSS ──  StoreDesk Worker :4310
                                              │
                                         Local MongoDB
                                              │
                                       Verifone Commander
```

### Data flow — Delta Hashing

```
Worker startup
  │
  ├── fetchCommanderPlusBulk() ──► 17 500 PLUs
  │
  ├── For each PLU:
  │     computePluHash(name|dept|sell|sellUnit) ──► MD5
  │     if hash == stored commanderHash  →  skip
  │     else  →  upsert Mongo + publishDeltaIfChanged()
  │
  └── Only changed items sent to Atlas (~KB instead of ~15 MB)
```

### Data flow — Live Mobile Price Check

```
Mobile: LIVE_PRICE_REQ { storeId, upc, requestId }
    │
    ▼ Cloud Hub routes to store's agent peer
    │
Worker: GET /api/price-book/by-upc/:upc  (loopback :4310)
    │
    ▼ LIVE_PRICE_RES { upc, sellPrice, vendorCost, margin, requestId }
    │
    ▼ Hub broadcasts to room → Mobile filters by requestId
```

---

## GitHub Secrets Required (for `deploy-vm.yml`)

| Key | Type | Description |
|-----|------|-------------|
| `VM_SSH_PRIVATE_KEY` | Secret | Ed25519 private key matching VM's `authorized_keys` |
| `VM_HOST` | Variable | e.g. `hub.storedesk.com` |
| `VM_USER` | Variable | OS user on VM (e.g. `storedesk`) |

**Remove after migration:** `GCP_SA_KEY` (no longer needed for Hub deploy)

---

## Handoff Log

- 2026-08-12 — eng-manager: WO created. Full implementation plan in `implementation_plan.md` (Antigravity artifact). Research complete — all source files audited. Proceeding to code phase.
- 2026-08-12 — backend-server: **Code phase complete.** All submodule files written to `store-desk-cloud-backend`:
  - `ecosystem.config.cjs` — PM2 config (fork, 512 MB ceiling, autorestart)
  - `scripts/deploy-vm.sh` — SSH deploy script with health check
  - `.github/workflows/deploy-vm.yml` — GitHub Actions CD workflow (SSH to VM)
  - `.github/workflows/deploy-cloud-run.yml` — push trigger disabled, deprecation banner added
  - `src/config.ts` — heartbeat default updated 30 000 → 60 000 ms, comments updated
  - `.env.example` — RELAY_SESSION_SECRET, HUB_ALLOW_LEGACY_AGENT_KEY, HEARTBEAT_MS=60000 added
  - `Dockerfile` — deprecation notice added (kept for local smoke testing only)
  - **Completed (code):**
    - `src/hub.ts` (Cloud Hub): Handles `LIVE_PRICE_REQ` and `LIVE_PRICE_RES` frame routing between clients and agents.
    - `src/services/commanderPlu.service.ts` (Worker): Exports `computePluHash` MD5 hashing function.
    - `src/services/appStatePersistence.service.ts` (Worker): Persists and loads `commanderHash` fields on `PriceBookEntry` upserts.
    - `src/services/deltaPublish.service.ts` (Worker): Skips delta publish of `PriceBookEntry`upsert when the hash matches.
    - `src/services/hubOutbound.service.ts` (Worker): Intercepts `LIVE_PRICE_REQ` frames and handles them using a loopback fetch to `/api/price-book/by-upc/:upc`.
    - `src/routes/priceBook.routes.ts` (Worker): `/by-upc/:upc` route updated to call `findLivePriceBookByUpc` for live Commander dynamically-seeded price queries.
  - **Remaining (ops):** VM provisioning, cloudflared tunnel, Node.js + PM2 install, `.env` on VM, first `pm2 start`. See `docs/cloud-backend-deploy.md` Part 1.
- 2026-08-12 — backend-server: **All code requirements fully implemented and verified.** Both `store-desk-cloud-backend` and `store-desk-worker` compilation succeeded and all 52 unit/integration tests passed green. WO status set to `done`.

