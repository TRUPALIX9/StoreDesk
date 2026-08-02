# StoreDesk — Environment variables by project

Compact reference for local `.env`, GitHub Actions secrets, Vercel, and Cloud Run / Secret Manager.

**Rules**

- Never commit real `.env`, `.env.local`, GCP JSON keys, or Atlas credentials.
- Placeholders only below — copy from each submodule’s `.env.example`.
- Naming: local Worker/Electron use **`MONGO_URI`**; Atlas (Web + Cloud Hub) use **`MONGODB_URI`**.
- There is **no** `store-desk-server` submodule — use **`store-desk-worker`**.

**Where to put secrets**

| Bucket | Use for |
|--------|---------|
| Local `.env` / `.env.local` | Store PC Worker, Electron (incl. embedded API), local Hub, Web admin |
| GitHub Actions secrets | Parent submodule checkout PAT; Cloud Hub deploy credentials + optional Atlas sync |
| GitHub Actions variables | Non-secret GCP project / region / service names |
| GCP Secret Manager → Cloud Run | Runtime Atlas URI for Hub |
| Vercel project env | StoreDesk Web production |
| Vite `VITE_*` | **Client-bundled** — visible in renderer / built JS. Never put passwords, SMTP, Mongo, or agent keys in `VITE_*`. |

---

## 0. Parent `StoreDesk` (GitHub Actions — private submodules)

Parent CI (`.github/workflows/ci.yml`) checks out all five submodules recursively. The default `GITHUB_TOKEN` only covers `TRUPALIX9/StoreDesk` itself, so private sibling clones fail with “Repository not found.”

| Name | Type | Required | Purpose |
|------|------|----------|---------|
| `SUBMODULES_PAT` | Secret | **Yes** (parent CI) | Token used by `actions/checkout@v4` (`token:` + `submodules: recursive`) to clone private submodule remotes |

**Create the secret** on `TRUPALIX9/StoreDesk` → Settings → Secrets and variables → Actions → New repository secret. Name must be exactly `SUBMODULES_PAT`.

**Token options (pick one):**

1. **Fine-grained PAT** (preferred): Resource owner `TRUPALIX9`; grant **Contents: Read-only** on private repos `store-desk-electron`, `store-desk-worker`, `store-desk-mobile`, `store-desk-cloud-backend`. If `storedesk-dev/StoreDesk-web` is private for the runner, also grant that org/repo Contents read (or keep Web public so no extra grant is needed).
2. **Classic PAT**: scope `repo` (full private-repo read). Broader than needed; rotate if leaked.

Do not commit the token. Do not put it in workflow YAML, `.env`, or docs examples. Rotate and update the secret if the PAT expires or is revoked.

After the secret is set, re-run parent CI on `develop` / `production`; the verify-layout step expects each submodule directory to contain its package manifest.

---

## 1. `store-desk-electron` (desktop + optional embedded API)

Copy `store-desk-electron/.env.example` → `.env`.

Sources: `.env.example`, README, `docs/storedesk-gemini-project-brief.md`, embedded `src/server`.

### Vite / renderer (`VITE_*` — client-visible)

| Variable | Local | Prod / packaged | Purpose | Example |
|----------|-------|-----------------|---------|---------|
| `VITE_API_URL` | Optional | Optional | Default Worker API base for the UI | `http://127.0.0.1:4310/api` |
| `VITE_AUTH_DISABLED` | Optional | Avoid | Client auth bypass flag (pair with server `AUTH_DISABLED`) | `false` |
| `VITE_DEV_SERVER_URL` | Dev only | No | Electron main loads Vite URL in development | *(set by Vite/Electron tooling)* |

### Embedded / Node server (same `.env` when using `src/server`)

| Variable | Local | Store “prod” | Purpose | Example |
|----------|-------|--------------|---------|---------|
| `PORT` | Optional | Optional | Embedded API listen port | `4310` |
| `NODE_ENV` | Optional | Prefer `production` | Runtime mode | `development` |
| `MONGO_URI` | Recommended | Recommended | Local Mongo for catalog | `mongodb://127.0.0.1:27017/storedesk` |
| `UPLOAD_DIR` | Optional | Optional | Invoice / upload files | `uploads` |
| `CORS_ORIGIN` | Optional | Optional | Allowed browser origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |
| `APP_SECRET` | Yes if auth on | **Required** if `NODE_ENV=production` | JWT / pairing / cron secret | `change-me-in-development` |
| `JWT_EXPIRES_IN` | Optional | Optional | JWT lifetime | `7d` |
| `APP_URL` | Optional | Optional | Base URL in auth emails | `http://127.0.0.1:5173` |
| `AUTH_DISABLED` | Optional | **No** (leave unset/`false`) | Skip JWT on server | `true` (tests/dev only) |
| `SKIP_EMAIL_VERIFICATION` | Optional | No | Skip email verify in auth | `true` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Optional | If email on | SMTP transport | `smtp.gmail.com` / `587` / `false` |
| `SMTP_USER` / `SMTP_PASS` | Optional | If email on | SMTP credentials | `you@gmail.com` / `your-app-password` |
| `SMTP_FROM_NAME` / `SMTP_FROM_EMAIL` | Optional | Optional | From header | `StoreDesk Developer` / `you@gmail.com` |
| `GCP_PROJECT_ID` | Optional | Optional | Google Sheets project id | `your-gcp-project-id` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Optional | Path to service-account JSON (gitignored) | `./secrets/gcp-service-account.json` |
| `COMMANDER_HOST` | For Price Book / POS | Store LAN | Verifone Commander base URL | `https://192.168.x.x` |
| `COMMANDER_USER` | Optional | Optional | Commander login (default `MANAGER`) | `MANAGER` |
| `COMMANDER_PASSWORD` | For Commander features | **Yes** for live PLU/reports | Commander password | *(store-local secret)* |

**Belongs in:** local `.env` on the backoffice PC only (Commander + SMTP + `APP_SECRET`). Not Cloud Run. Not `VITE_*`. Prefer talking to standalone **Worker** for new API work; embedded server mirrors many of the same vars.

---

## 2. `store-desk-worker` (edge API on store PC)

Copy `store-desk-worker/.env.example` → `.env`. Listens **`0.0.0.0:4310`**.

| Variable | Local | Store prod | Purpose | Example |
|----------|-------|------------|---------|---------|
| `PORT` | Optional | Optional | HTTP port | `4310` |
| `NODE_ENV` | Optional | Prefer `production` | Runtime mode | `development` |
| `MONGO_URI` | Recommended | Recommended | Local Mongo (memory fallback if unset) | `mongodb://127.0.0.1:27017/storedesk` |
| `UPLOAD_DIR` | Optional | Optional | Upload directory | `uploads` |
| `CORS_ORIGIN` | Optional | Optional | Allowed origins | `http://localhost:5173,http://localhost:3000` |
| `APP_SECRET` | Yes if auth on | **Required** in production | JWT / pairing / cron | `change-me-in-development` |
| `JWT_EXPIRES_IN` | Optional | Optional | JWT lifetime | `7d` |
| `APP_URL` | Optional | Optional | Links in emails | `http://127.0.0.1:5173` |
| `AUTH_DISABLED` | Optional | **No** | Bypass JWT (tests) | `true` |
| `SKIP_EMAIL_VERIFICATION` | Optional | No | Skip email verify | `true` |
| `SMTP_*` | Optional | If email on | Same family as Electron | see `.env.example` |
| `GCP_PROJECT_ID` | Optional | Optional | Sheets project | `your-gcp-project-id` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Optional | SA JSON path | `./secrets/gcp-service-account.json` |
| `HUB_WS_URL` | Optional | Optional (Hub path) | Outbound Cloud Hub WebSocket | `wss://YOUR_RUN_HOST/ws` or `ws://127.0.0.1:8080/ws` |
| `STORE_ID` | With Hub | With Hub | Store id matching Atlas `Store` | `SD-DEMO01` |
| `AGENT_KEY` | With Hub | With Hub | Must match Atlas `agentKey` | `sk_…` |

**Belongs in:** store PC local `.env` only. `AGENT_KEY` is a device secret — rotate via StoreDesk Web / Atlas if leaked. Not GitHub, not Vercel, not Vite.

---

## 3. `store-desk-mobile` (Flutter)

**No app `.env.example`.** Runtime config is **QR / manual pairing** → secure storage (`serverUrl`, token). Phone never uses Mongo or Hub secrets directly.

| Variable | Where | Required? | Purpose | Example |
|----------|-------|-----------|---------|---------|
| *(none for app runtime)* | — | — | Server URL + pairing from QR | `http://192.168.1.25:4310` |
| `FLUTTER_ROOT` / `FLUTTER_BIN` | Dev machine / CI | For builds | Locate Flutter SDK | path to Flutter |
| `STOREDESK_FLUTTER_WORKSPACE` | Windows CI helper | Optional | Junction root for path-length workarounds | `C:\StoreDeskBuild` |

**Belongs in:** secure storage on device; tooling env on builder only. Do not bake Worker URLs into client-visible compile defines unless you accept that they ship in the APK.

---

## 4. `store-desk-web` (Next.js + Vercel + Atlas licenses)

Copy `.env.example` → **`.env.local`** (local). Production: **Vercel project environment**.

| Variable | Local | Production (Vercel) | Purpose | Example |
|----------|-------|---------------------|---------|---------|
| `MONGODB_URI` | Recommended | **Yes** for live licenses | Atlas license / store registry | `mongodb+srv://USER:PASSWORD@HOST/storedesk?...` |
| `ADMIN_PASSWORD` | Optional | Recommended override | `/admin` gate; else password parsed from URI | `your-admin-password` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Optional | Canonical site URL (metadata) | `https://storedesk.dev` |
| `NODE_ENV` | Set by Next | Set by Vercel | Cookie `secure` in prod | `production` |

Notes:

- README may mention `ADMIN_TOKEN`; code/`.env.example` use **`ADMIN_PASSWORD`**.
- `NEXT_PUBLIC_*` is **client-visible** — never put Atlas URI or admin password there.
- Same Atlas DB / `Store` shape as Cloud Hub (`storeId`, `agentKey`, `status`).

**Belongs in:** `.env.local` locally; Vercel env for production. Not Cloud Run Hub secrets (separate app).

---

## 5. `store-desk-cloud-backend` (Cloud Hub WSS)

Copy `.env.example` → `.env` for local. Production: **Cloud Run** + **Secret Manager**. Deploy CD: submodule GitHub Actions (see `docs/cloud-backend-deploy.md`).

### Runtime (app)

| Variable | Local | Cloud Run | Purpose | Example |
|----------|-------|-----------|---------|---------|
| `PORT` | Optional | Injected by Run | Listen port | `8080` |
| `MONGODB_URI` | Optional (demo auth) | **Required** | Atlas `Store` auth | `mongodb+srv://…` |
| `HEARTBEAT_MS` | Optional | Optional | Hub→client ping interval | `30000` |

Without `MONGODB_URI`, memory demo (`SD-DEMO01` / `sk_dev_demo_key`) — **never on a public URL**.

### GitHub Actions (`store-desk-cloud-backend` repo)

| Name | Type | Required | Purpose |
|------|------|----------|---------|
| `GCP_SA_KEY` | Secret | Yes (v1 JSON key) | Deployer service-account JSON |
| `MONGODB_URI` | Secret | Recommended | Sync into GCP Secret Manager before deploy |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Secret | Alt to SA key | WIF (preferred later) |
| `GCP_SERVICE_ACCOUNT` | Secret | With WIF | Deployer SA email |
| `GCP_PROJECT_ID` | Variable | Optional | Default `store-desk-499322` |
| `GCP_REGION` | Variable | Optional | Default `us-central1` |
| `CLOUD_RUN_SERVICE` | Variable | Optional | Default `storedesk-cloud-backend` |
| `GCP_AR_REPOSITORY` | Variable | Optional | Default `storedesk` |

### GCP / Cloud Run binding

| Name | Where | Purpose |
|------|-------|---------|
| `MONGODB_URI` | Secret Manager → `--set-secrets` | Runtime Atlas URI |
| `HEARTBEAT_MS` | Cloud Run env (plain OK) | Heartbeat |
| `PORT` | Platform | Do not override unless necessary |

**Belongs in:** local `.env` for smoke; **Secret Manager** for prod Atlas; **GitHub secrets** for deploy auth (+ optional URI sync). Not Vercel. Not Vite.

---

## Quick matrix (who needs what)

| Concern | Electron | Worker | Mobile | Web | Cloud Hub |
|---------|----------|--------|--------|-----|-----------|
| Local Mongo `MONGO_URI` | Embedded API | Yes | — | — | — |
| Atlas `MONGODB_URI` | — | — | — | Yes (prod) | Yes (prod) |
| `APP_SECRET` / JWT | Embedded | Yes (prod) | — | — | — |
| Commander | Electron env | — | — | — | — |
| Hub join `HUB_WS_*` / `STORE_ID` / `AGENT_KEY` | Planned client later | Agent outbound | Later | — | Serves WSS |
| `VITE_*` | Yes (API URL only) | — | — | — | — |
| `NEXT_PUBLIC_*` | — | — | — | Site URL only | — |
| GitHub deploy secrets | — | — | — | (Vercel separate) | `GCP_SA_KEY` (+ URI) |
| Parent CI submodule PAT | `SUBMODULES_PAT` on `TRUPALIX9/StoreDesk` (not per-app) | | | | |
| Cloud Run / Secret Manager | — | — | — | — | `MONGODB_URI` |

---

## Related docs

- `docs/cloud-backend-deploy.md` — Hub Cloud Run + GitHub secrets
- `docs/storedesk-gemini-project-brief.md` — env placeholders (Commander + Electron)
- Submodule `.env.example` files (canonical lists)
- Submodule READMEs: Worker Hub section; Web env table; Cloud Hub Cloud Run section
