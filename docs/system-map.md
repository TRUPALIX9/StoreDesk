# StoreDesk system map & gap fill plan

Team review for `WO-20260713-system-flow-gap-redesign`.
Owners: eng-manager (coord), tech-lead, frontend-electron, backend-server, mobile-buddy, ui-ux-designer, docs-scribe.

Target setup/service contract: **`setup-v1`**, proposed for review in [`WO-20260728-store-setup-lifecycle`](./work-orders/WO-20260728-store-setup-lifecycle.md). Sections labeled “current” describe shipped behavior; sections labeled “target” are gates, not claims of implementation.

## Product IA (locked)

Desktop sidebar (current Electron nav):

1. Point of Sale (`/pos`)  
2. POS Reports (`/pos/reports`) — Ruby `vrubyrept`  
3. Transactions (`/pos/transactions`) — T-Log `vtransset`  
4. Price Book (`/price-book`) — live Commander PLUs  
5. Cost Analysis (`/cost-analysis`) — sell vs vendor costs  
6. Settings  

Commander E2E: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md), [`verifone-commander-reports.md`](./verifone-commander-reports.md). LLM brief: [`storedesk-gemini-project-brief.md`](./storedesk-gemini-project-brief.md).

## Setup-v1 target map

```txt
StoreDesk Web (organizations, accounts, users/memberships, subscriptions, stores/installations)
  ├─ emails one-time setup key to authorized organization user
  ├─ audited OS/privacy acknowledgements + version/hash-bound EULA acceptance
  ├─ setup key ──Electron protected IPC──TLS──► StoreDesk Worker/service manager
  ├─ stores hashes + tenant/audit metadata; returns permanent Worker credential only to Worker
  └─ exchanges approved client/Worker credentials for short-lived relay sessions

StoreDesk service manager (`store-desk-worker/packages/service-manager/`; privileged local IPC/CLI)
  ├─ WinSW | launchd | systemd
  ├─ AES-256-GCM config + installation key + OS ACLs
  └─ install/start/stop/update/rollback/diagnostics/recovery

StoreDesk / StoreDesk Mobile ── separate client tokens ──► Worker :4310
            └─ optional approved relay session ──► Cloud Hub
Worker ── Worker-only credential/session, outbound WSS ──► Cloud Hub
Worker ──► local Mongo + Commander
```

Lifecycle:

```txt
not_installed → installed → awaiting_activation → active
active ↔ degraded
active → suspended → active
active|degraded → updating → active
updating → rollback → active|degraded
```

The Worker credential exists only in Worker sealed configuration. StoreDesk and StoreDesk Mobile use independently revocable desktop/mobile credentials; Hub v1 receives short-lived audience/role-bound sessions. Atlas stores organizations, accounts, global users, tenant/store memberships, subscriptions, store/install identity, setup-key/credential hashes, EULA acceptances, approvals, entitlement, and audit metadata only—not local catalog, Commander, invoice, or vendor-price data.

Tenant relationship contract:

```txt
User ──< OrganizationMembership >── Organization ──1 Account
                                              ├──< Subscription
                                              └──< Store ──< WorkerInstallation
Subscription ──entitles/bounds──────────────────────────────┘
```

A user may belong to multiple organizations with different roles. Every authorization resolves an active membership and optional store assignment; every linked record must share `organizationId`. One organization may add multiple Worker installations only within subscription limits.

Conditional setup/readiness:

```txt
Electron login
  ├─ selected installation active + first bootstrap complete ─► normal StoreDesk
  └─ no ready Worker ─► resumable onboarding
       OS/privacy acknowledgements ─► EULA audit ─► install Worker
       ─► redeem emailed setup key ─► Worker seals credential
       ─► Hub/entitlement verify ─► first metadata bootstrap ─► Electron ready
       ─► only then enable Mobile pairing/approval
```

The first bootstrap synchronizes control metadata only (identity, entitlement/grace, protocol, time, credential status, Hub reachability). It never uploads local catalog, Commander, invoice, or vendor-price data.

## Dual Express — why it exists (and why it’s a problem)

There are **not two products**. There is one API on port **4310**, but historically **two copies of the code**:

| Copy | Where | When it runs |
|------|--------|----------------|
| **StoreDesk Worker** (canonical) | `store-desk-worker/` | `npm run dev` in that repo — what StoreDesk Mobile + default Electron use |
| **Embedded Electron server** | `store-desk-electron/src/server/` | Only if you run `npm run dev:embedded` / `dev:server` inside Electron |

**Why it was added:** Early on, Electron could start its own API so desktop alone worked without the sibling server repo. That helped solo desktop demos.

**What you should use today:** one server — **`store-desk-worker`** on `4310`. Electron’s default `npm run dev` is `dev:external` and expects that.

**Why keep calling it a gap:** the embedded copy is a fork. Features (Price Book, Mongo blob persist) can land on one and not the other. Two processes fighting over `4310` also fails. Target: keep **only** `store-desk-worker`; treat Electron `src/server` as a migration source until removed.

## How the system connects

```txt
StoreDesk (Electron React)
  └─ HTTP desktop token  →  StoreDesk Worker :4310  (0.0.0.0)
                      ├─ memory arrays (+ optional Mongo AppState blob)
                      ├─ target canonical Commander adapters
                      └─ files / downloads

StoreDesk Mobile (Flutter)
  └─ Wi‑Fi LAN  →  same Worker /api/mobile/*  (separate device Bearer token)

Optional target remote path:
Desktop / Mobile ─ short-lived client relay session ─► Cloud Hub
Worker ─ short-lived agent relay session/outbound WSS ─► Cloud Hub
```

| Client | Talks to | Must not |
|--------|----------|----------|
| Electron | `localhost:4310` or Vite `/api` proxy | Mongo directly |
| StoreDesk Mobile | `http://LAN_IP:4310` | `localhost` on phone; Mongo; Worker credential |

Default Electron `npm run dev` expects **external** `store-desk-worker`. Embedded `src/server` still exists and can drift (Price Book / persistence).

### Credential compatibility warning

Current Hub v0 accepts the same Atlas `agentKey` in both `agent` and planned `client` hello messages. That is not acceptable for setup-v1. Migration must:

1. Keep v0 LAN operation while Web/Hub/Worker gain v1 credentials and session exchange.
2. Rotate each activated installation to a Worker-only credential.
3. Issue distinct approved desktop/mobile credentials.
4. Switch Hub to short-lived role/audience/store-bound relay sessions.
5. Remove shared `AGENT_KEY` client examples and reject Worker credentials in client role.

Worker credential rotation is a two-party flow: Web owner/admin authorizes an audited short-lived challenge, then the currently authenticated Worker proves installation possession and receives/seals the replacement. The initiating Web user, Electron, Mobile, email, and admin APIs never receive the permanent credential.

## Core journeys

1. **Price Book (Commander)** — Live `vPLUs` list/search + local vendor overlays; Refresh (not Sync-first). Cost Analysis compares sell vs vendor costs. Details: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md)  
2. **Invoice truth** — Upload → extract (stub) → Review → Confirm → VendorPrice history  
3. **POS ops** — Sheets sync → daily table/analytics → Georgia sale tax. Live Commander: **POS Reports** (Ruby) + **Transactions** (`vtransset`) — see [`verifone-commander-reports.md`](./verifone-commander-reports.md).  
4. **StoreDesk Mobile pair** — Desktop Mobile Access QR → Mobile `/link` → then POS/Price Book shell today

## Identity note (tech-lead)

Excel POS catalog seed is **removed**. Remaining product surfaces:

| Model | Surfaces | Role |
|-------|----------|------|
| Product / Variant / VendorPrice | Invoice match, vendor prices, demo seed | AGENTS MVP cost history |
| Price Book entry | Desktop Price Book | Live Commander PLUs + manual rows |

Decide later: merge Price Book into Variant+VendorPrice, or keep both with clear UX labels.

## Gap backlog (ranked)

| Pri | Gap | Owner | Fill |
|-----|-----|-------|------|
| P0 | Dual Express servers drift | tech-lead | One server; thin or delete Electron embed |
| P0 | Setup/activation/service lifecycle absent | eng-manager + tech-lead | Deliver `WO-20260728-store-setup-lifecycle` in phases |
| P0 | Hub v0 shares `agentKey` across roles | tech-lead + backend-server | Worker-only credential + approved client credentials + short-lived v1 relay sessions |
| P0 | No bundled native service/update recovery | tech-lead + QA | Service manager, WinSW/launchd/systemd, sealed config, signed update/rollback |
| P0 | Control plane lacks multi-organization/EULA/email setup-key model | tech-lead + web + QA | Tenant-scoped entities/memberships, immutable EULA audit, provider-secured one-time key delivery |
| P0 | Commander remains in Electron embed | backend-server + frontend-electron | Move Price Book/PLU/reports/transactions and secrets into Worker |
| P0 | Invoice extraction is sample-only | backend-server | Real PDF/OCR path |
| P0 | Mobile Home removed; inventory naming | mobile-buddy + ui-ux | Restore helper home; rename Products |
| P1 | Spec API aliases (`confirm-prices`, DELETE, mobile product/variant) | tech-lead + backend | Aliases + missing routes |
| P1 | Orphan Electron pages (Products CRUD, Variants, Price Comparison) | frontend-electron | Wire or delete |
| P1 | Mongo models unused (blob only) | tech-lead | Decide blob vs collections |
| P2 | Settings still holds Sheets/GTC | frontend-electron | Move under POS |
| P2 | Docs drift (`mobile-flow`, README) | docs-scribe | Update to real routes |
| P3 | Mobile permissions / token hash / devices auth | backend-server | Harden pairing |

## Commander migration target

The migration unit is behavior, not a copy of the Electron server:

1. Inventory current embedded Price Book, Commander PLU/status/lookup, Ruby POS Reports, T-Log Transactions, overlays/storage, auth, and tests.
2. Port protocol clients and business services to StoreDesk Worker; inject `COMMANDER_HOST`, user, and password from sealed Worker config.
3. Publish the same `/api/price-book*`, reports, and transactions behavior from Worker with explicit relay scopes and no Commander write-back.
4. Point StoreDesk at Worker, run parity/read-only fixtures and live opt-in Commander smoke, then remove `dev:embedded` production dependence.
5. Redact Commander URL credentials, auth headers, raw sensitive transaction fields, and passwords from logs/diagnostics.

StoreDesk Mobile and StoreDesk never connect to Commander directly.

## Service, paths, logs, and recovery target

Location decision: implement the private service-manager package at `store-desk-worker/packages/service-manager/`, versioned and released with Worker. Electron consumes the signed artifact and typed local IPC client only. This keeps privileged lifecycle/config logic beside its sole managed runtime, avoids a sixth submodule/repository and source duplication, and permits Worker/service-manager compatibility testing in one CI/release graph.

| Platform | Manager / Worker service | Config and data | Logs / recovery |
|----------|--------------------------|-----------------|-----------------|
| Windows | `StoreDeskServiceManager` / `StoreDeskWorker` via WinSW | `%ProgramData%\StoreDesk` data/config; versioned binaries under `%ProgramFiles%\StoreDesk\releases` | `%ProgramData%\StoreDesk\logs|diagnostics`; machine DPAPI or SYSTEM-only key file |
| macOS | `dev.storedesk.service-manager` / `dev.storedesk.worker` via launchd | `/Library/Application Support/StoreDesk`; releases kept separately | `/Library/Logs/StoreDesk`; System Keychain or root-only key file |
| Linux | `storedesk-service-manager.service` / `storedesk-worker.service` via systemd | `/etc/storedesk` config, `/var/lib/storedesk` data, `/opt/storedesk/releases` | `/var/log/storedesk`, `/var/lib/storedesk/diagnostics`; root-only key |

Recovery rules:

- Atomic AES-256-GCM config writes retain a previous authenticated envelope; invalid tags stop secret use and enter recovery.
- Update stages a signed artifact, drains Worker, snapshots compatible config metadata, starts the candidate, and gates on service/DB/API/optional dependency health.
- Failed gates enter `rollback`, restore the last known-good binaries/config schema, and preserve Mongo/upload data.
- Installation-key loss requires local elevated recovery, reactivation, and secret re-entry; it never falls back to plaintext.
- Diagnostics are bounded and redacted before export; inability to prove redaction fails closed.

## Rollout and E2E gates

1. **Contract/threat review:** state transitions, offline grace/suspension, cryptography, credential ownership, API/CLI, update signing.
2. **Web + Hub:** organization/account/subscription/membership/EULA audit, emailed one-time setup key, hash-at-rest rotation, v1 session exchange/relay.
3. **Service manager + Worker:** native services, sealed config, setup-key redemption/rotation, first metadata bootstrap, diagnostics, LAN compatibility.
4. **Commander migration:** Worker parity and removal of embedded production dependency.
5. **StoreDesk + StoreDesk Mobile:** conditional Electron onboarding/normal entry, readiness-gated approval UX, separate secure tokens, LAN and Hub transport; Worker bootstrap precedes Mobile.
6. **Release safety:** signed staged updates, automatic rollback, pilot rings, support diagnostics.

Required E2E matrix covers multi-organization cross-tenant denial, membership/store scoping, subscription installation limits, setup-email sent/failure/reissue, setup-key success/invalid/expired/replay/concurrency, EULA wrong-version/tamper/reacceptance/audit retention, conditional Electron entry/resume, Worker-only credential delivery and rotation/revocation, first-bootstrap failure/retry/idempotence, Mobile-before-ready denial, owner/admin approval and denial, subscription suspension/grace, LAN with cloud unavailable, Hub relay isolation, Commander unavailable/read-only, database degraded, update success/failure, rollback, config corruption, key loss, log redaction, and cross-version compatibility on Windows/macOS/Linux. Module CI is necessary but not sufficient; QA records unavailable platform or physical-device checks explicitly.

## Already applied this WO (frontend IA)

- Sidebar restored to product flow: Dashboard, POS, Products, Price Book, Vendors, Invoice Upload, Review Queue, Mobile, Settings  
- Default route → `/dashboard` (not only POS)  
- Settings “More tools” demoted to Pricing rules / Vendor prices / Lottery only  

## Next WOs to open

1. `WO-20260728-store-setup-lifecycle` — approve setup-v1 and split dependency-ordered delivery
2. `WO-…-single-server` — consolidate Express and migrate Commander
3. `WO-…-real-extraction` — replace sample invoice rows
4. `WO-…-mobile-home` — restore scan-first StoreDesk Mobile IA
5. `WO-…-catalog-unify` — Price Book vs Product/Variant decision + orphans

Explore notes: [Electron](d43b2eb6-4978-4a10-91d8-1860bd5294b5) · [Server](1225cdf3-450e-4e2b-a5d3-b6c0027b01bd) · [Mobile](4d9e0b5b-d483-474e-b368-22f34a9f8b92)
