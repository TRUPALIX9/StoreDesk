# WO-20260727-cloud-backend-deploy

- **Status:** ~~ready~~ **superseded**
- **Superseded by:** `WO-20260812-hub-e2micro-migration` (migration from Cloud Run to GCP e2-micro VM)
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** deployment-expert / backend-server
- **Reviewers:** tech-lead, qa-verifier
- **Modules:** store-desk-cloud-backend | docs | store-desk-worker

## Goal

~~Take Epic 1 Cloud Hub (`store-desk-cloud-backend` on `production`) from “Docker stub” to a live **Cloud Run** deployment with Atlas auth, then point a Worker agent at `wss://…/ws` for outbound join — without breaking LAN `:4310`.~~

> **NOTE:** Cloud Run deployment is superseded. The Hub now deploys to a **GCP e2-micro VM** with PM2 + Cloudflare Tunnel. See `WO-20260812-hub-e2micro-migration` and the rewritten `docs/cloud-backend-deploy.md`.

Full step-by-step: **`docs/cloud-backend-deploy.md`**.

## Acceptance criteria

- [ ] `npm run ci` green on submodule `production`
- [ ] Container builds from repo `Dockerfile`
- [ ] Cloud Run service deployed with **session affinity** and **`--max-instances 1`**
- [ ] `MONGODB_URI` set via Secret Manager (not demo memory auth)
- [ ] `GET https://…/health` returns `ok: true` and `atlas: true`
- [ ] Valid `hello` → `welcome`; bad key → close `4401`
- [ ] Worker with `HUB_WS_URL` / `STORE_ID` / `AGENT_KEY` joins room (logs `welcome`)
- [ ] Deploy guide linked from submodule README

## Out of scope

- Vercel / serverless host for Hub
- Redis / multi-instance scale-out
- Electron dual-mode Hub client (D3) and Mobile Hub path
- Live deploy from this agent session without operator GCP credentials

## Touch list (expected)

- `docs/cloud-backend-deploy.md` (guide)
- `docs/work-orders/WO-20260727-cloud-backend-deploy.md` (this WO)
- `store-desk-cloud-backend/README.md` (pointer)
- Ops: GCP project, Artifact Registry, Cloud Run, Atlas URI
- Store PC: `store-desk-worker` Hub env

## Dependencies / blockers

- GCP project + `gcloud` + Artifact Registry / Cloud Run APIs
- Atlas URI shared with StoreDesk Web license `Store` documents (`storeId`, `agentKey`, `status`)
- Docker **or** Cloud Build for image build
- Electron/Mobile Hub clients still unfinished — Hub useful first for Worker agent + WS smoke

## Notes

**Recommended path:** Docker image → Cloud Run (only platform the repo clearly targets).

**Not supported by repo configs:** Vercel, Railway, Fly, Render (no platform files). Raw Node is fine for local smoke.

**Security:** never leave prod Hub without `MONGODB_URI` (demo key `sk_dev_demo_key` would be public). Always use WSS in production.

## Handoff log

- 2026-07-27 — deployment-expert: inspected `production` HEAD (`751afb6`); wrote `docs/cloud-backend-deploy.md`; did **not** deploy (no gcloud/Docker on this workstation).
- 2026-07-27 — backend-server: Cloud Run revision `…-00003-cgp` failed “listen on PORT=8080”. **Root cause:** `createServer()` awaited `mongoose.connect` before `server.listen`; bad/slow `MONGODB_URI` crashed or hung the process so Cloud Run never saw the port. **Fix:** bind `0.0.0.0` + `PORT` first, then `initAuth()` with 5s Atlas timeout + fail-open (no throw). Health reports real `atlas` ready flag. Push to `production` (and `main` if Cloud Build tracks default branch / commit `98ac6d8`).
- 2026-07-27 — deployment-expert: added `.github/workflows/deploy-cloud-run.yml` (push `production` / workflow_dispatch → AR + Cloud Run; GitHub `GCP_SA_KEY` + optional `MONGODB_URI` → Secret Manager + `--set-secrets`). Documented in `docs/cloud-backend-deploy.md`. Operator must add secrets in GitHub UI once, then push/redeploy.
