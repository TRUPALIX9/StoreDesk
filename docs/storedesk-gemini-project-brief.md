# StoreDesk — Super-Detailed Project Brief (for Gemini / LLM paste)

**Purpose:** Paste this whole file into Gemini (or any LLM) as authoritative StoreDesk context.  
**As of:** 2026-08-02 — reflects current code after **invoice upload/review UI** and **desktop APK / pairing QR** were removed.  
**Parent repo:** `https://github.com/TRUPALIX9/StoreDesk.git` (Git submodules; branches `production` + `develop`).

---

## 0. How to use this brief (instructions for Gemini)

1. Treat this document as the **source of truth** for product scope, module boundaries, and data placement.
2. Prefer **local-first** answers: catalog, Commander, vendor prices stay on the store PC.
3. **Never invent** stock/inventory quantity, reorder, warehouse, or Commander write-back (`uPLUs`).
4. Prefer names: **StoreDesk** (desktop), **StoreDesk Worker**, **StoreDesk Mobile** (Play label: StoreDesk), **StoreDesk Web**, **Cloud Hub**. Do not call the phone app “Buddy” in new copy.
5. If code and this brief disagree, say so and suggest verifying the submodule path listed below.
6. When proposing features, keep Atlas on the **control plane only** (~M0 size budget) — do not put catalog in the cloud.

---

## 1. One-sentence pitch

**StoreDesk** is a local-first ops suite for convenience stores and gas stations: Verifone Commander Price Book / Ruby reports / T-Log on the PC, Sheets-backed POS analytics, vendor costs and suggested sell prices, plus a phone helper and a cloud **license/org** control plane — **without** stock inventory, **without** invoice upload UI, and **without** local APK/pairing QR (access is org AppUsers from the Web license).

---

## 2. Product naming & repositories

| Product name | Role | Folder | Git remote |
|--------------|------|--------|------------|
| **StoreDesk** | Electron desktop admin | `store-desk-electron/` | `https://github.com/TRUPALIX9/store-desk-electron.git` |
| **StoreDesk Worker** | Edge Express API + local Mongo | `store-desk-worker/` | `https://github.com/TRUPALIX9/store-desk-worker.git` |
| **StoreDesk Mobile** | Flutter phone helper (`com.storedesk`) | `store-desk-mobile/` | `https://github.com/TRUPALIX9/store-desk-mobile.git` |
| **StoreDesk Web** | Marketing + license/admin (Vercel + Atlas) | `store-desk-web/` | `https://github.com/storedesk-dev/StoreDesk-web.git` |
| **Cloud Hub** | WSS store-room relay (Cloud Run) | `store-desk-cloud-backend/` | `https://github.com/TRUPALIX9/store-desk-cloud-backend.git` |
| **Parent** | Docs, scripts, submodule pointers, agent team | repo root | `https://github.com/TRUPALIX9/StoreDesk.git` |
| **brand-kit** | Logos + colors `#1A63F4` / `#00A87B` | `brand-kit/` | (parent) |

**Git rules:** Commit app code **inside** the submodule; then update the parent pointer. Do not merge submodules into a monorepo. Clone with `--recurse-submodules`.

---

## 3. What the product does / does not

### Does (in scope)

| Area | Behavior |
|------|----------|
| POS analytics | Daily sales table, charts, Georgia sale-tax helpers; often from Google Sheets |
| Commander Price Book | Live `vPLUs` (read-only) + local vendor-cost overlays |
| Cost Analysis | Sell vs vendor case / per-item cost and margin |
| POS Reports | Ruby `vrubyrept` period KPIs (tax, fuel/merch, network, departments, tenders) |
| Transactions | Commander T-Log `vtransset` ticket cards |
| Catalog / vendors | Products, variants, UPCs, vendors, vendor price history (manual entry) |
| Pricing rules | Margin / markup / rounding → suggested sell (reject margin ≥ 100%) |
| Mobile helper | AppUser login → scan / search / vendor prices / barcode display |
| Web control plane | Org + subscription + store license, AppUsers/assignments, setup keys, Hub registry |
| Cloud Hub | Authenticated WSS rooms so clients can reach a Worker later (dual-mode) |

### Does not (non-negotiable)

- Stock quantity, on-hand counts, add/reduce stock, low stock, reorder, warehouses, stock movements
- Invoice **upload / extraction review UI** on desktop or mobile (legacy Worker APIs may still exist — do not re-expose in UI without a Work Order)
- Desktop **APK download URL** or **pairing QR** — retired; org users come from Web license
- Writing PLUs back to Commander (`uPLUs`)
- Phone / desktop clients talking directly to MongoDB or Atlas
- Putting catalog / Commander / vendor-price history in Atlas

---

## 4. How the system works (end-to-end)

### 4.1 Proven LAN path (today)

```txt
┌──────────────────────┐     HTTP/JWT      ┌────────────────────────────┐
│ StoreDesk (Electron) │ ───────────────► │ StoreDesk Worker            │
│ localhost:4310       │                  │ 0.0.0.0:4310                │
└──────────────────────┘                  │  • catalog / vendor prices  │
                                          │  • POS / Sheets             │
┌──────────────────────┐     LAN/HTTP     │  • Price Book / Commander*  │
│ StoreDesk Mobile     │ ───────────────► │  • local Mongo or memory    │
│ AppUser login        │                  └─────────────┬──────────────┘
└──────────────────────┘                                │
                                                        ▼
                                               Local Mongo / in-memory
                                               (+ Verifone Commander on LAN)

┌──────────────────────┐                  ┌────────────────────────────┐
│ Browser              │ ───────────────► │ StoreDesk Web (Vercel)     │
│ InternalAdmin only   │                  │ Atlas control plane only   │
└──────────────────────┘                  └────────────────────────────┘
```

\*Commander Price Book / Ruby / T-Log are richest on Electron **embedded** server (`npm run dev:embedded`); standalone Worker may lag — see Dual Express gap.

### 4.2 Target dual-mode path (setup-v1)

```txt
StoreDesk / Mobile
  → AppUser login (Web-provisioned)
  → short-lived Hub client session (assignment-scoped)
  → Cloud Hub WSS room
  → StoreDesk Worker (holds Worker credential + local data)
  → local Mongo + Commander
```

Rules:

- Clients never receive the permanent Worker credential.
- Atlas stores hashes, org hierarchy, AppUsers, assignments, entitlement — **not** catalog.
- Manual LAN URL / pairing QR / 6-digit pairing are **retired target UX** (legacy Worker pair routes may still exist).

### 4.3 Access / license model (current product rule)

```txt
StoreDesk Web InternalAdmin
  → create Organization + Subscription + Store (+ WorkerInstallation)
  → provision AppUsers + UserAssignments for that org/store/Worker
  → Desktop and Mobile sign in as those AppUsers
  → NO APK QR on desktop, NO pairing QR on desktop
```

Local **User Access** page in Electron is the store-facing view of org user provisioning (demo/local UI may still be stubbed; canonical provisioning is Web).

### 4.4 Dual Express (critical architecture gap)

| Copy | Path | When used |
|------|------|-----------|
| **Canonical Worker** | `store-desk-worker/` | Default Electron `npm run dev` + Mobile |
| **Embedded Electron API** | `store-desk-electron/src/server/` | `npm run dev:embedded` |

Same port **4310**. Features can land in one copy and not the other. **Optimization #1:** converge on Worker only; delete or freeze the embed.

---

## 5. Module-by-module features & pages

### 5.1 StoreDesk (Electron) — `store-desk-electron/`

**Tech:** Electron + React + TypeScript + Vite + MUI + TanStack Query + React Router (HashRouter).

#### Primary sidebar (`AppLayout.tsx`)

| Nav label | Route | Page | What it does |
|-----------|-------|------|--------------|
| Point of Sale | `/pos` | `POSWorkspacePage` | Daily sales, analytics, tax helpers |
| POS Reports | `/pos/reports` | `PosReportsPage` | Commander Ruby period KPIs |
| Transactions | `/pos/transactions` | `TransactionsPage` | T-Log ticket cards |
| Price Book | `/price-book` | `PriceBookPage` | Live PLUs + vendor overlays |
| Cost Analysis | `/cost-analysis` | `CostAnalysisPage` | Sell vs vendor cost / margin |
| Manage Worker | `/worker-manage` | `ManageWorkerPage` | Local Worker/service management UI |
| User Access | `/user-management` | `UserManagementPage` | Org users / page permissions (license model) |
| Settings | `/settings` | `SettingsPage` | Worker URL, Sheets/GTC, dump/reseed, more tools |

#### Guest / auth routes

| Route | Page | Role |
|-------|------|------|
| `/setup` | `SetupWizardPage` | Setup-key onboarding when Worker not ready |
| `/app-login`, `/login` | `AppUserLoginPage` | Primary AppUser login |
| `/legacy-login` | `LoginPage` | Legacy local auth |
| `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | auth pages | Legacy account flows |

#### Settings → More tools (secondary pages)

| Tool | Route | Page |
|------|-------|------|
| Vendors | `/vendors` | `VendorsPage` |
| Vendor prices | `/vendor-prices` | `VendorPricesPage` |
| Pricing rules | `/pricing-rules` | `PricingRulesPage` |
| User access | `/user-management` | (same as sidebar) |
| Lottery setup | `/lottery` | `LotterySetupPage` (placeholder) |
| Dashboard | `/dashboard` | `DashboardPage` (thinned: no invoice cards) |

#### Redirects (removed product surfaces)

| Old path | Now |
|----------|-----|
| `/invoices/upload`, `/review-queue`, `/invoices/:id/review` | → `/settings` |
| `/mobile-access` | → `/user-management` |
| `/inventory`, `/products`, `/variants`, `/prices` | → `/price-book` |

#### Theme

- Primary `#1A63F4`, secondary `#00A87B`
- Centralized tokens: `src/theme/`
- Admin layout: sidebar + content; no stock screens

---

### 5.2 StoreDesk Mobile — `store-desk-mobile/`

**Tech:** Flutter + Riverpod + go_router + Dio + secure storage + mobile_scanner.  
**Play:** package `com.storedesk`, version `0.0.1+1`, release name `0.0.1-beta1`.  
**Demo open testing:** `demo@demo.com` / `Demo@123` (offline demo catalog).

#### Shell tabs (`main_shell.dart`)

| Tab | Route | Feature | Notes |
|-----|-------|---------|-------|
| POS | `/pos` | `features/pos/` | Daily summaries (Worker or demo) |
| Price Book | `/price-book` | `features/price_book/` | Local/list overlays |
| Inventory | `/inventory` | `features/inventory/` | **Product search** — not stock counts |
| Settings | `/settings` | `features/settings/` | Session, disconnect, demo banner |

#### Other routes

| Route | Screen | Role |
|-------|--------|------|
| `/login` | AppUser login | Primary auth (+ demo fill) |
| `/link` | Link store | Legacy connect; pairing only with `?legacy=true` |
| `/scan` | Scanner | Camera barcode |
| `/lookup/:code` | Product result | Best vendor, costs, suggested sell |
| `/vendor-prices/:variantId` | Vendor prices | Compare |
| `/barcode/:value` | Show barcode | CODE128 etc. |
| `/price-book/new`, `/price-book/edit/:id` | Price book form | Overlay edit |
| `/search` | redirect | → `/inventory` |

#### Explicitly removed from mobile

- Invoice upload feature folder / screen / repo
- Photo library permissions used only for invoices
- Expectation of desktop pairing QR / APK QR

#### Brand

- Theme aligned with Web: Source Sans 3, `#1A63F4` / `#00A87B`, `assets/brand/`

---

### 5.3 StoreDesk Worker — `store-desk-worker/`

**Tech:** Node + Express + TypeScript + Mongoose; Vitest.  
**Listen:** `0.0.0.0:4310`.

#### API groups (from `createApp`)

| Mount | Purpose |
|-------|---------|
| `/api/health` | Liveness / DB mode |
| `/api/auth` | Local/legacy auth |
| `/api/setup`, `/api/diagnostics` | Setup lifecycle |
| `/api/server-info` | LAN info (+ legacy pairing/devices) |
| `/api/dashboard` | Dashboard aggregates |
| `/api/inventory` | Catalog list alias (**not** stock qty) |
| `/api/admin` | Dump / reset / stats |
| `/api/pos` | Daily POS, analytics |
| `/api/settings` | GTC / sale-tax / Sheets profiles |
| `/api/integrations/sheets` | Sheets sync helpers |
| `/api/cron` | Cron triggers |
| `/api/products`, `/api/variants` | Catalog CRUD |
| `/api/vendors` | Vendors |
| `/api/vendor-prices`, `/api/prices` | Vendor price history / compare |
| `/api/pricing-rules`, `/api/pricing` | Rules + suggestions |
| `/api/price-book` | Price Book (port status may lag embed) |
| `/api/mobile` | Mobile lookups (+ **legacy** pair / invoice upload routes) |
| `/api/invoices`, `/api/invoice-items`, `/api/review-queue` | **Legacy** invoice APIs (UI removed) |
| `/downloads` | Legacy APK path (desktop no longer advertises) |

**Job of Worker:** only process that talks to **local Mongo** and (when configured) Commander; sole edge API for Mobile/Desktop on LAN.

---

### 5.4 StoreDesk Web — `store-desk-web/`

**Tech:** Next.js App Router on Vercel + Atlas.

#### Marketing pages

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/product` | Product |
| `/how-it-works` | How it works |
| `/about`, `/contact` | Company |
| `/privacy`, `/terms` | Legal |

#### Admin / license UI

| Route | Purpose |
|-------|---------|
| `/admin-gate` | Admin login gate |
| `/admin` | Store / license admin |
| `/admin/agents` | Agent keys / Hub registry |

#### Control-plane APIs (representative)

- Legacy: `/api/stores`, `/api/admin/login`, rotate/suspend
- v1: `/api/v1/admin/organizations`, `subscriptions`, `stores`, `app-users`, `assignments`
- Setup: worker-installations, setup-keys, bootstrap, `/api/v1/setup-keys/redeem`
- App auth: `/api/v1/app-auth/login|enroll|sessions`

**Atlas only** for this module’s DB — see §6.

---

### 5.5 Cloud Hub — `store-desk-cloud-backend/`

**Tech:** Node WSS on Cloud Run. Entry: `src/index.ts`. Core: `hub.ts`, `auth.ts`, `relaySession.ts`.

**Does:** Authenticate Worker agents and AppUser client sessions; join `room:store_{STORE_ID}`; track presence; relay messages.

**Does not:** Persist catalog, Commander, invoices, or vendor prices. No Redis in Phase 0–1 (single instance + session affinity).

Health: `GET /health`. WebSocket: `/ws`.

---

### 5.6 Parent extras

| Path | Role |
|------|------|
| `docs/` | Architecture, Verifone, API contract, WOs, this brief |
| `scripts/` | Commander probes, data helpers |
| `.cursor/` + `.codex/` | Agent team (no `.claude/`) |
| `brand-kit/` | Visual identity |

---

## 6. How we use databases

### 6.1 Two databases — never mix responsibilities

| Store | Where | Holds | Does **not** hold |
|-------|-------|-------|-------------------|
| **Local Mongo** (Worker, store PC) | `MONGO_URI` → e.g. `mongodb://127.0.0.1:27017/storedesk` | Catalog, vendor prices, POS rows, Price Book overlays, legacy invoice collections, optional Commander cache | Org licenses, AppUser passwords as cloud registry, Hub rooms |
| **Atlas** (Web + Hub) | `MONGODB_URI` (cloud) | Organizations, subscriptions, stores/installations, AppUsers, UserAssignments, setup-key **hashes**, Worker credential **hashes**, EULA audit, entitlement, presence, agent keys | Catalog, Commander PLUs/T-Log, vendor-price history, invoice files |

**Size discipline:** Atlas is planned for small M0 (~512MB). Putting store catalogs in Atlas is an anti-pattern for this product.

### 6.2 Local Mongo collections (conceptual schema)

From `docs/database-schema.md` / AGENTS:

```txt
Product
ProductVariant
Vendor
VendorPrice
PricingRule

MobileDevice                          ← legacy pairing path
```

Plus runtime/app-specific docs for POS daily rows, Price Book overlays, settings profiles (exact collection names vary between memory blob vs Mongoose models).

**Important runtime reality:** Many deployments still use an **in-memory store** with optional **AppState blob** persist to Mongo — not always “one request = one Mongoose collection query.” Treat blob mode as transitional technical debt.

### 6.3 Atlas control-plane hierarchy (setup-v1)

```txt
Organization
  └── Subscription(s)
  └── Store
        └── WorkerInstallation (immutable orgId/storeId/workerInstallationId)
AppUser ──< UserAssignment >── exact Org/Store/WorkerInstallation
InternalAdmin ── Web admin only (not a customer login)
```

Credential classes (must stay separate): InternalAdmin, AppUser, setup key, Worker credential, Hub client session, refresh credential.

### 6.4 Client → DB rule

```txt
Electron / Mobile  →  Worker HTTP (or Hub→Worker)  →  local Mongo
Browser admin      →  Web API                      →  Atlas
Hub                →  Atlas (auth/registry only)   →  relay only
```

Phone and desktop **never** open a Mongo driver to Atlas or local DB.

---

## 7. Verifone Commander (edge)

| Command | Used for | Write? |
|---------|----------|--------|
| validate / releaseCredential | Session | n/a |
| `vPLUs` | Price Book live PLUs | **Read-only** |
| `vreportpdlist` | Ruby report periods | Read |
| `vrubyrept` | POS Reports KPIs | Read |
| `vtlogpdlist` | T-Log periods | Read |
| `vtransset` | Transactions tickets | Read |
| `uPLUs` | — | **Not implemented** |

Deep docs: `docs/verifone-commander-price-book.md`, `docs/verifone-commander-reports.md`.

Env (Worker/Electron embed): `COMMANDER_HOST`, `COMMANDER_USER`, `COMMANDER_PASSWORD` — never commit real secrets.

---

## 8. Core calculations (still valid)

```txt
pricePerPack = lineTotal / invoiceQuantity   # if using priced lines
pricePerItem = pricePerPack / packQuantity
pricePerBaseUnit = pricePerPack / (packQuantity × unitSize)

sellingPrice (markup) = cost × (1 + markupPercent / 100)
sellingPrice (margin) = cost / (1 - marginPercent / 100)   # reject margin ≥ 100%
```

Use **price per base unit** to compare true vendor cost.

---

## 9. Day-to-day operator journeys

### A. Morning POS / tax

Sheets sync → POS workspace → date range → analytics / Georgia tax worksheets.

### B. Price Book / Cost Analysis

Open Price Book → live `vPLUs` (+ overlays) → Cost Analysis for margin vs vendor columns. Overlays save locally; Commander never written.

### C. Vendor cost entry (replaces invoice UI)

Vendors + Vendor Prices (manual) or Price Book vendor overlay columns. History preserved; do not silently overwrite old VendorPrice rows when APIs create new observations.

### D. Phone lookup

Install from Play → AppUser login (org license) → Scan/Search → product + best vendor + suggested sell.

### E. License / onboarding (Web + setup)

InternalAdmin creates org/store/license → emails setup key → Electron setup wizard / service manager activates Worker → AppUsers sign in on desktop/mobile.

---

## 10. Optimization playbook (prioritized)

### P0 — Correctness & architecture

1. **Eliminate Dual Express drift**  
   Port Price Book / POS Reports / Transactions fully to `store-desk-worker`; deprecate `store-desk-electron/src/server`. One API = fewer bugs and smaller agent context.

2. **Delete or fence legacy invoice / pairing / APK surfaces on Worker**  
   UI is gone; leave dead APIs invites regression. Prefer remove mounts + models after data migration, or feature-flag 410 Gone.

3. **Finish setup-v1 AppUser/Hub path**  
   Make Web → AppUser → Hub → Worker the only supported access story; remove leftover pairing UX from Mobile (`legacy=true`).

4. **Real Mongoose collections vs AppState blob**  
   Blob dump/load does not scale; migrate hot paths (products, vendor prices, price-book overlays, POS) to proper collections + indexes.

### P1 — Performance

5. **Price Book pagination & server-side filters**  
   Avoid shipping full `vPLUs` dumps to the renderer; page/filter on Worker; cache Commander responses with short TTL + manual Refresh.

6. **Commander session reuse**  
   Keep validate cookie warm; coalesce concurrent report fetches; timeout/backoff to keep UI responsive when Commander is slow.

7. **Mobile payload slimming**  
   Lookup endpoints return only fields the phone shows; avoid large vendor history unless requested.

8. **Atlas query hygiene**  
   Index `organizationId`, `storeId`, `workerInstallationId`, AppUser email; never scan whole collections for admin lists without pagination.

9. **Hub scale plan**  
   When multi-instance needed: Redis/Memorystore for room membership **or** sticky sessions + documented single-instance limit (current Phase 0–1).

### P2 — Product / DX

10. **Wire Mobile Price Book to live Commander Price Book API** (parity with desktop).  
11. **Unify Electron User Access with Web AppUser APIs** (stop demo-only local user table).  
12. **Observability:** structured Worker logs + health that reports Commander/Mongo/Hub separately (`degraded` vs `active`).  
13. **CI:** keep `npm run ci` green per submodule; Flutter `npm run ci` when Flutter available.  
14. **Docs/context budget:** prefer this brief + `how-storedesk-works.md` over dumping whole repos into LLM context.

### P3 — Cost / security

15. Keep Atlas on M0-friendly schema (hashes + metadata only).  
16. Rotate setup keys / Worker credentials via Web; never email permanent Worker secrets.  
17. Cleartext HTTP only on trusted LAN; Hub/TLS for internet path.  
18. Secrets: `MONGO_URI` local vs `MONGODB_URI` Atlas naming — never put Atlas URI in `NEXT_PUBLIC_*` or Flutter defines.

---

## 11. Env cheat sheet (names only)

| Module | Key vars |
|--------|----------|
| Worker / Electron API | `PORT=4310`, `MONGO_URI`, `APP_SECRET`, `AUTH_DISABLED`, Commander `COMMANDER_*`, Sheets GCP creds |
| Electron Vite | `VITE_API_URL`, `VITE_AUTH_DISABLED` |
| Web | `MONGODB_URI` (Atlas), admin secrets — never `NEXT_PUBLIC_` for secrets |
| Hub | `MONGODB_URI`, `PORT`, Cloud Run secrets |
| Mobile | No Mongo URI; AppUser/session via secure storage; demo credentials for Play only |

Full matrix: `docs/env-by-project.md`.

---

## 12. Repo map & must-read docs

```txt
StoreDesk/
├── store-desk-electron/
├── store-desk-worker/
├── store-desk-mobile/
├── store-desk-web/
├── store-desk-cloud-backend/
├── brand-kit/
├── docs/
│   ├── storedesk-gemini-project-brief.md   ← this file
│   ├── how-storedesk-works.md
│   ├── architecture.md
│   ├── system-map.md
│   ├── api-contract.md
│   ├── database-schema.md
│   ├── mobile-flow.md
│   ├── verifone-commander-price-book.md
│   ├── verifone-commander-reports.md
│   └── work-orders/
├── AGENTS.md
└── .cursor/
```

### Checks

```txt
store-desk-electron:  npm run ci
store-desk-worker:    npm run ci
store-desk-mobile:    npm run ci   # needs Flutter
```

---

## 13. Explicit gaps (do not assume done)

- Dual Express: Commander surfaces may still be embed-first.
- Legacy Worker invoice / pair / `/downloads` APK routes may still exist without UI.
- Mobile Price Book ≠ full live Commander Price Book parity.
- Lottery Setup is a placeholder.
- Electron User Access may still be local stub vs live Web AppUser APIs.
- setup-v1 E2E (Web license → setup key → Worker seal → Hub AppUser) not fully closed.

---

## 14. Agent / LLM do’s and don’ts

**Do**

- Keep business logic in services, not giant UI pages.
- Preserve vendor price history.
- Use brand tokens; keep Material/Flutter themes centralized.
- Update Work Orders under `docs/work-orders/` for multi-module changes.

**Don’t**

- Build inventory/stock features.
- Re-add invoice upload or pairing/APK QR without a Work Order.
- Put catalog in Atlas.
- Use `localhost` as the phone’s Worker URL.
- Call the phone app “Buddy” in user-facing copy.

---

## 15. Closing summary for Gemini

StoreDesk is five modules around one rule: **edge holds store data; cloud holds licenses and identity.** Desktop runs POS + Commander + costs; Mobile looks up prices after org AppUser login; Worker is the LAN API; Web + Atlas provision orgs/users; Hub relays later. Optimize by unifying the API, fencing legacy invoice/pairing code, indexing proper Mongo collections, and keeping Atlas tiny.
