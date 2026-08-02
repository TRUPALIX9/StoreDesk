# StoreDesk — Environment variables by project

Compact reference for local `.env`, GitHub Actions secrets, Vercel, and Cloud Run / Secret Manager.

**Rules**

- Never commit real `.env`, `.env.local`, GCP JSON keys, or Atlas credentials.
- Placeholders only below — copy from each submodule’s `.env.example`.
- Naming: local Worker/Electron use **`MONGO_URI`**; Atlas (Web + Cloud Hub) use **`MONGODB_URI`**.
- There is **no** `store-desk-server` submodule — use **`store-desk-worker`**.
- Target secret handling is **setup contract v1 (`setup-v1`)**: production store secrets are sealed configuration, not environment variables. Existing `.env` names below document current/development compatibility and migration inputs.
- Every secret is redacted by exact-value registration plus key-name/pattern filtering. Logs and diagnostics show credential IDs, status, expiry, and last four characters only when useful—never hashes, ciphertext, nonces/tags, or plaintext.

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

## Setup v1 credential ownership and storage

| Credential / secret | Plaintext may exist in | At-rest rule | Must never exist in |
|---------------------|------------------------|--------------|---------------------|
| Emailed one-time setup key | Bound site contact email; Electron form only until protected IPC handoff; Worker activation process memory | Web stores key ID + Argon2id secret hash + exact organization/store/worker-installation/contact-email binding, TTL, attempts, consumed/revoked metadata | Admin/list API responses, `.env`, command arguments/history, logs, diagnostics, Electron persisted/main state, Mobile storage |
| Store-scoped Worker credential | StoreDesk Worker process memory and Worker-readable sealed config only | Atlas stores credential ID + Argon2id hash; local AES-256-GCM envelope | Service-manager IPC/results, StoreDesk, StoreDesk Mobile, email, QR, Hub client hello, Vite/Flutter defines, logs |
| AppUser enrollment credential | Intended AppUser email and Electron/Mobile enrollment memory | Control plane stores credential ID + approved hash, AppUser/email binding, TTL, consumed/revoked metadata | Web admin session, Worker credential/setup-key slots, URLs, logs, other users |
| App-user refresh credential | Electron/Mobile OS secure storage after app login | Control plane stores session/credential ID + approved hash, user/assignment/device/status metadata | Worker credential slot, other clients, logs, URLs |
| Hub client session | One Electron/Mobile process memory/secure cache for its short TTL | Signed claims; assignment/audience/role/device/session IDs, expiry/revocation audit | URLs, logs, diagnostics, Mongo catalog, other assignments |
| Relay session token | One process memory/secure cache for its short TTL | Signed short-lived claims; no plaintext persistence required | URLs, logs, diagnostics, Mongo catalog |
| Installation key | Service manager and OS machine keystore; fallback protected key file | Unique 256-bit key, machine/SYSTEM/root protected | Encrypted config file, app `.env`, backups without OS wrapping, UI |
| Commander/Mongo/SMTP secrets | StoreDesk Worker after config decrypt | AES-256-GCM sealed config + OS ACLs | Electron renderer/embedded server target state, Mobile, Web, Hub |

Hash values are not authentication credentials and are never returned by APIs. Setup-key and Worker/refresh credential hashes use approved Argon2id parameters recorded with the hash and upgrade-on-verify. Random local client token lookup uses keyed HMAC-SHA-256; rotation changes plaintext and digest. Do not substitute reversible encryption for control-plane credential hashes.

Email delivery transports only the short-lived setup key and safe Organization → Store/site → Worker display context. Contact email is routing metadata, never a login identity. It never transports Worker, client, relay, Commander, Mongo, or installation-key secrets. Provider logs/events must suppress message bodies and setup-key query parameters; delivery webhooks are signature-verified and retain only provider message ID, status, timestamps, and safe failure codes. An undelivered key is revoked/reissued, never retrieved.

### Encrypted local config envelope

Production secret config is a versioned AES-256-GCM envelope with a fresh 96-bit nonce per atomic write, authentication tag, schema version, key ID, and `installationId` as associated data. The installation key is generated during install, never derived from a password, and stored separately. Files use SYSTEM/Administrators or root-only access; StoreDesk and StoreDesk Mobile receive only scoped API responses. Corruption/tag failure or key loss enters recovery—there is no plaintext fallback.

### Cross-platform service names and paths

The service-manager package is owned by the Worker submodule at `store-desk-worker/packages/service-manager/`. Its release output includes the `storedesk-service` CLI/helper, WinSW/launchd/systemd templates, schemas, and adapter tests. StoreDesk Electron bundles/launches only a signed compatible artifact and typed IPC client; no second source copy or Electron-held secret configuration is permitted.

| Platform | Service names | Config / installation key | Data / releases | Logs / diagnostics |
|----------|---------------|---------------------------|-----------------|--------------------|
| Windows (WinSW) | `StoreDeskServiceManager`, `StoreDeskWorker` | `%ProgramData%\StoreDesk\config\worker.enc.json`; key protected with machine DPAPI, fallback `%ProgramData%\StoreDesk\keys\installation.key` with SYSTEM/Admin ACL | `%ProgramData%\StoreDesk\data`; `%ProgramFiles%\StoreDesk\releases` | `%ProgramData%\StoreDesk\logs`; `%ProgramData%\StoreDesk\diagnostics` |
| macOS (launchd) | `dev.storedesk.service-manager`, `dev.storedesk.worker` | `/Library/Application Support/StoreDesk/config/worker.enc.json`; System Keychain, fallback `/Library/Application Support/StoreDesk/keys/installation.key` root-only | `/Library/Application Support/StoreDesk/data`; `/Library/Application Support/StoreDesk/releases` | `/Library/Logs/StoreDesk`; `/Library/Application Support/StoreDesk/diagnostics` |
| Linux (systemd) | `storedesk-service-manager.service`, `storedesk-worker.service` | `/etc/storedesk/worker.enc.json`; system credential store where available, fallback `/etc/storedesk/installation.key` mode `0600` root | `/var/lib/storedesk`; `/opt/storedesk/releases` | `/var/log/storedesk`; `/var/lib/storedesk/diagnostics` |

Directories must not be user-writable when loaded by a privileged service. Updates stage beside the active release, retain one last known-good compatible release, and never place store data inside a versioned binary directory. Uninstall preserves data by default; purge requires explicit elevated confirmation. See `architecture.md` and `api-contract.md` for recovery/CLI behavior.

---

## 1. `store-desk-electron` (desktop client; embedded API is legacy)

Copy `store-desk-electron/.env.example` → `.env`.

Sources: `.env.example`, README, `docs/storedesk-gemini-project-brief.md`, embedded `src/server`.

### Vite / renderer (`VITE_*` — client-visible)

| Variable | Local | Prod / packaged | Purpose | Example |
|----------|-------|-----------------|---------|---------|
| `VITE_API_URL` | Optional | Optional | Default Worker API base for the UI | `http://127.0.0.1:4310/api` |
| `VITE_AUTH_DISABLED` | Optional | Avoid | Client auth bypass flag (pair with server `AUTH_DISABLED`) | `false` |
| `VITE_DEV_SERVER_URL` | Dev only | No | Electron main loads Vite URL in development | *(set by Vite/Electron tooling)* |

### Embedded / Node server (legacy development compatibility only)

| Variable | Local | Store “prod” | Purpose | Example |
|----------|-------|--------------|---------|---------|
| `PORT` | Optional | Optional | Embedded API listen port | `4310` |
| `NODE_ENV` | Optional | Prefer `production` | Runtime mode | `development` |
| `MONGO_URI` | Recommended | Recommended | Local Mongo for catalog | `mongodb://127.0.0.1:27017/storedesk` |
| `UPLOAD_DIR` | Optional | Optional | Invoice / upload files | `uploads` |
| `CORS_ORIGIN` | Optional | Optional | Allowed browser origins (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |
| `APP_SECRET` | Yes if auth on | **Required** if `NODE_ENV=production` | Legacy JWT / cron secret; pairing use is retired target behavior | `change-me-in-development` |
| `JWT_EXPIRES_IN` | Optional | Optional | JWT lifetime | `7d` |
| `APP_URL` | Optional | Optional | Base URL in auth emails | `http://127.0.0.1:5173` |
| `AUTH_DISABLED` | Optional | **No** (leave unset/`false`) | Skip JWT on server | `true` (tests/dev only) |
| `SKIP_EMAIL_VERIFICATION` | Optional | No | Skip email verify in auth | `true` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Optional | If email on | SMTP transport | `smtp.gmail.com` / `587` / `false` |
| `SMTP_USER` / `SMTP_PASS` | Optional | If email on | SMTP credentials | `you@gmail.com` / `your-app-password` |
| `SMTP_FROM_NAME` / `SMTP_FROM_EMAIL` | Optional | Optional | From header | `StoreDesk Developer` / `you@gmail.com` |
| `GCP_PROJECT_ID` | Optional | Optional | Google Sheets project id | `your-gcp-project-id` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Optional | Path to service-account JSON (gitignored) | `./secrets/gcp-service-account.json` |
| `COMMANDER_HOST` | Legacy embedded only | **Migrate out** | Verifone Commander base URL | `https://192.168.x.x` |
| `COMMANDER_USER` | Legacy embedded only | **Migrate out** | Commander login | `MANAGER` |
| `COMMANDER_PASSWORD` | Legacy embedded only | **Forbidden target state** | Migration input to Worker sealed config | *(store-local secret)* |

**Belongs in:** renderer-safe URL/feature configuration only. Existing embedded Node secrets are migration inputs and must move to StoreDesk Worker sealed config. New Commander/API work belongs in Worker; never expose these values through `VITE_*`.

Electron has no customer Web-admin login configuration. If no activated local Worker exists it opens setup-key onboarding directly. Once activated, store users authenticate with centrally provisioned AppUser credentials and receive only assignment-scoped client sessions. Do not add organization-member portals, customer Web sessions, manual Worker/LAN selectors, setup-key persistence, or permanent Worker credentials to Electron configuration.

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
| `APP_SECRET` | Yes if auth on | **Required** in production | Legacy JWT / cron; not AppUser/Hub session signing material | `change-me-in-development` |
| `JWT_EXPIRES_IN` | Optional | Optional | JWT lifetime | `7d` |
| `APP_URL` | Optional | Optional | Links in emails | `http://127.0.0.1:5173` |
| `AUTH_DISABLED` | Optional | **No** | Bypass JWT (tests) | `true` |
| `SKIP_EMAIL_VERIFICATION` | Optional | No | Skip email verify | `true` |
| `SMTP_*` | Optional | If email on | Same family as Electron | see `.env.example` |
| `GCP_PROJECT_ID` | Optional | Optional | Sheets project | `your-gcp-project-id` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Optional | SA JSON path | `./secrets/gcp-service-account.json` |
| `COMMANDER_HOST` / `COMMANDER_USER` / `COMMANDER_PASSWORD` | Dev migration | Sealed config | Canonical Commander adapter settings | *(no production example secret)* |
| `HUB_WS_URL` | Optional | Optional (Hub path) | Outbound Cloud Hub WebSocket | `wss://YOUR_RUN_HOST/ws` or `ws://127.0.0.1:8080/ws` |
| `ORGANIZATION_ID` | Dev migration only | Sealed config | Canonical organization identity from setup redemption | `org_placeholder` |
| `STORE_ID` | With Hub | With Hub | Store id matching Atlas `Store` | `SD-DEMO01` |
| `WORKER_INSTALLATION_ID` | Dev migration only | Sealed config | Immutable Worker installation identity | `winst_placeholder` |
| `AGENT_KEY` | Legacy Hub v0 only | **Forbidden after setup-v1 migration** | Temporary compatibility name for old shared Hub auth | *(do not add new values)* |
| `STOREDESK_CONFIG_PATH` | Optional override | Optional | Encrypted config path; platform default above is preferred | *(platform path above)* |

**Belongs in:** non-secret process configuration may remain environment-based. Production Mongo, Commander, SMTP, Worker credential, token pepper/material, and Hub refresh state belong in AES-256-GCM sealed config. During migration, import legacy `AGENT_KEY` once, seal it, remove it from `.env`, then rotate to a v1 Worker credential. It is never a desktop/mobile credential.

---

## 3. `store-desk-mobile` (Flutter)

**No app `.env.example`.** Runtime identity is centrally provisioned AppUser login followed by assignment-scoped short-lived Hub client sessions and a revocable refresh credential in OS secure storage. Phone never uses a setup key, QR/6-digit pairing, manual LAN/Worker selection, Mongo, Atlas, Commander, installation key, or Worker credential directly.

| Variable | Where | Required? | Purpose | Example |
|----------|-------|-----------|---------|---------|
| *(none for app runtime)* | — | — | App auth/Hub endpoints are signed release configuration or trusted discovery, not user-entered Worker URLs | — |
| `FLUTTER_ROOT` / `FLUTTER_BIN` | Dev machine / CI | For builds | Locate Flutter SDK | path to Flutter |
| `STOREDESK_FLUTTER_WORKSPACE` | Windows CI helper | Optional | Junction root for path-length workarounds | `C:\StoreDeskBuild` |

**Belongs in:** secure storage on device; tooling env on builder only. Do not bake Worker URLs into client-visible compile defines unless you accept that they ship in the APK.

One granted assignment auto-connects; multiple assignments show only the authorized Organization → Store → Worker selector. Logout clears local session material. Disabled/revoked users, assignments, devices, refresh credentials, and sessions must fail closed with explicit online/offline messaging.

---

## 4. `store-desk-web` (Next.js + Vercel + Atlas licenses)

Copy `.env.example` → **`.env.local`** (local). Production: **Vercel project environment**.

| Variable | Local | Production (Vercel) | Purpose | Example |
|----------|-------|---------------------|---------|---------|
| `MONGODB_URI` | Recommended | **Yes** for live licenses | Atlas license / store registry | `mongodb+srv://USER:PASSWORD@HOST/storedesk?...` |
| `ADMIN_PASSWORD` | Optional | Recommended override | `/admin` gate; else password parsed from URI | `your-admin-password` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Optional | Canonical site URL (metadata) | `https://storedesk.dev` |
| `SETUP_EMAIL_PROVIDER` | Optional locally | **Yes** for setup-key delivery | Provider adapter selector | `resend` |
| `SETUP_EMAIL_API_KEY` | Optional locally | **Yes** for provider | Server-only email API credential | *(secret; no example value)* |
| `SETUP_EMAIL_FROM` | Optional locally | **Yes** in production | Verified setup-key sender | `StoreDesk Setup <setup@example.invalid>` |
| `SETUP_KEY_TTL_MINUTES` | Optional | Optional | Bounded one-time key TTL; server enforces policy range | `30` |
| `EULA_CURRENT_VERSION` | Optional locally | **Yes** in production | Published EULA version selector | `2026-07` |
| `EULA_DOCUMENT_SHA256` | Optional locally | **Yes** in production | Canonical document integrity binding | `<64-hex-placeholder>` |
| `NODE_ENV` | Set by Next | Set by Vercel | Cookie `secure` in prod | `production` |

Notes:

- README may mention `ADMIN_TOKEN`; code/`.env.example` use **`ADMIN_PASSWORD`**.
- `NEXT_PUBLIC_*` is **client-visible** — never put Atlas URI or admin password there.
- `SETUP_EMAIL_API_KEY`, EULA policy, and setup-key generation/delivery are server-only. Never put the key, recipient, or provider payload in `NEXT_PUBLIC_*`, URLs, analytics, or error reporting.
- Same Atlas control-plane DB as Cloud Hub. Under setup-v1, Organization/Subscription/Store/WorkerInstallation and AppUser/UserAssignment records are hierarchy-scoped. Each installation persists immutable `organizationId`, `storeId`, and `workerInstallationId` plus support display snapshots (Worker name, store number/address, contact email). Setup/Worker/client records reference credential IDs and approved hashes. Plaintext credentials never appear in Atlas documents or admin responses.
- Web authentication is for central `InternalAdmin` support/admin operators only. `AppUser` credentials work only in Electron/Mobile auth endpoints and grant only explicit `UserAssignment` records; they cannot access Web admin, customer self-service, invitations, or Web password-reset portals.

**Belongs in:** `.env.local` locally; Vercel env for production. Not Cloud Run Hub secrets (separate app).

---

## 5. `store-desk-cloud-backend` (Cloud Hub WSS)

Copy `.env.example` → `.env` for local. Production: **Cloud Run** + **Secret Manager**. Deploy CD: submodule GitHub Actions (see `docs/cloud-backend-deploy.md`).

### Runtime (app)

| Variable | Local | Cloud Run | Purpose | Example |
|----------|-------|-----------|---------|---------|
| `PORT` | Optional | Injected by Run | Listen port | `8080` |
| `MONGODB_URI` | Optional (local tests) | **Required** | Atlas control-plane identity, entitlement, approval, and credential hashes | `mongodb+srv://…` |
| `HEARTBEAT_MS` | Optional | Optional | Hub→client ping interval | `30000` |

Without `MONGODB_URI`, test-only memory fixtures may be used locally. Setup-v1 forbids a built-in shared demo credential on any public URL.

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
| `APP_SECRET` / JWT | Legacy embedded | Yes (migration) | — | — | — |
| Commander | Legacy migration only | **Sealed config owner** | — | — | — |
| Worker credential | Never | **Sealed config only** | Never | Hash/control plane | Verify hash/session issue |
| AppUser refresh credential | OS secure storage | — | OS secure storage | Hash/session/assignment authority | Verify/revoke session |
| Hub client session | Process memory | Verify assignment claims | Process memory | Issue after assignment checks | Enforce assignment/role/audience |
| Organization/store/installation IDs | Assignment/session claims | **Sealed canonical IDs** | Assignment/session claims | Hierarchy authority | Presence/relay isolation |
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
