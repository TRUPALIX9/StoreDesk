---
name: backend-server
description: >-
  StoreDesk Worker API specialist. Use for Express routes, Prisma models,
  services, Zod validators, middleware, and tests inside store-desk-worker/src/.
---

# Backend Server — StoreDesk Worker

### Ownership chain for service control

```
Electron (ManageWorkerPage.tsx)
    ↓ IPC
Electron Main Process
    ↓ spawns / delegates
OS service (WinSW / launchd / systemd) + cloudflared Windows Service
```

- **Visual UI** for start/stop/restart/tunnel/config lives in **Electron** (`ManageWorkerPage.tsx`).
- The `service orchestration` logic and tunnel orchestration have been migrated entirely into the Electron main process via IPC. The Worker API no longer handles tunnel start/stop or system restarts.
- Electron is the master orchestrator. If the Worker crashes, Electron recovers it.


## Component 1: StoreDesk Worker API (`src/`)

**What it is:** Express application. Business logic API. Runs on port **4310** on the store PC.  
**Exposed via:** Cloudflare Tunnel → `https://<store-id>.storedesk.com`  
**Owns:** products, variants, vendors, vendor prices, invoices, pricing, mobile endpoints.

### Network / Connection Model

```
Electron (same store PC)
    ↓ http://localhost:4310  ← direct loopback, no tunnel, zero latency
Worker API (Express)
    ↓
SQLite local + Verifone Commander

StoreDesk Mobile (remote / on-premises Wi-Fi / internet)
    ↓ https://<store-id>.storedesk.net  ← Cloudflare Tunnel CNAME
    ↓ outbound tunnel (cloudflared on store PC)
Worker API (Express) ← same process, same port 4310

StoreDesk Web (Vercel control plane — pushing config / sync)
    ↓ https://<store-id>.storedesk.net  ← Cloudflare Tunnel
Worker API (Express)
```

**Smart client rule (Electron only):**
- Uses `http://localhost:4310` — always. Direct loopback. Zero latency. Offline-capable.
- If localhost:4310 is dead → the Worker process is down → the tunnel is equally dead (cloudflared forwards to the same dead port). No fallback exists.
- Tunnel URL is only relevant if Electron is running on a **different machine** than the Worker (non-standard setup).

**Mobile and Web:**
- Always use `https://<store-id>.storedesk.net` — no path to localhost.
- Port **4310** listens on `localhost` only. `cloudflared` handles all external ingress.
- If Worker is down → both tunnel and localhost are dead. Recovery is via `ManageWorkerPage.tsx` which communicates with the Electron main process (now the master orchestrator).

**No GCP VM. No relay hub. No LAN IP hardcoding.**
JWT validates `organizationId/storeId/workerInstallationId` on every request.
In-memory fallback when SQLite unavailable.



### Stack

```
Node.js + Express.js + TypeScript
SQLite local + Prisma
Zod (validation)
Multer (file upload — invoices only)
JWT (AppUser sessions — validated at Worker + optionally at CF Worker proxy edge)
Vitest (tests — requires BypassSandbox: true, TCP loopback)
```

### Folder Ownership (`src/`)

```
routes/        HTTP route wiring (thin — just wire controller)
controllers/   Parse req → call service → return res (no logic)
services/      All business logic and domain rules
models/        Prisma schemas + model exports
validators/    Zod schemas (one per entity/route group)
middleware/    Auth, error handler, async wrapper
config/        Configuration loading
db/            SQLite connection
utils/         Shared helpers (math, formatting, date)
types/         Shared TypeScript interfaces
shared/        Cross-cutting shared code
data/          Seed / static data
constants.ts   App-wide constants
```

**Layer order (strict):** `routes/ → controllers/ → services/ → models/`  
Never call a model directly from a route. Always through a service.

### Active Services

```
productService            variantService
vendorService             vendorPriceService
pricingCalculationService barcodeService
mobilePairingService      mobileProductLookupService
fileStorageService
```

**Banned — never create:**
```
inventoryService    stockMovementService    posBackupService    hubOutbound.service     sealedConfig.service
```

### Price Calculation Rules

```
pricePerPack      = lineTotal / invoiceQuantity
pricePerItem      = pricePerPack / packQuantity
pricePerBaseUnit  = pricePerPack / (packQuantity × unitSize)

sellingPrice (markup) = cost × (1 + markupPercent / 100)
sellingPrice (margin) = cost / (1 - marginPercent / 100)
```

Reject margins ≥ 100%.  
Never silently overwrite `VendorPrice` rows — append history, set `isCurrent: false` on previous.

### Invoice Rule (Critical)

```
Upload → InvoiceItem rows → user reviews → user confirms → VendorPrice created
```

### Sprint / Phase Pattern

| Phase | Deliverable | Gate |
|-------|-------------|------|
| 1 — Model & Schema | Prisma model + Zod validator | `npm run check` green |
| 2 — Service Layer | Business logic + unit tests | `npm run check` green (BypassSandbox) |
| 3 — Controller + Route | HTTP handler + integration tests | `npm run check` green |
| 4 — Docs + Handoff | `api-contract.md` + `database-schema.md` updated | `qa-verifier` sign-off |

### Verify

```bash
npm run check   # tsc + vitest — BypassSandbox: true required
npm run build   # dist type check
```

---

## Read First (Both Components)

1. [`store-desk-worker/AGENTS.md`](file:///Users/trupal/WORK/RCP/store-desk-worker/AGENTS.md)
2. Root [`AGENTS.md`](file:///Users/trupal/WORK/RCP/AGENTS.md) — scope, entities, banned models
3. [`docs/api-contract.md`](file:///Users/trupal/WORK/RCP/docs/api-contract.md)
4. [`docs/database-schema.md`](file:///Users/trupal/WORK/RCP/docs/database-schema.md)
5. [`.agents/skills/error-codes-registry/SKILL.md`](file:///Users/trupal/WORK/RCP/.agents/skills/error-codes-registry/SKILL.md)

---

## Definition of Done (Worker API)

- [ ] `npm run check` passes (BypassSandbox)
- [ ] `npm run build` passes
- [ ] New routes in `docs/api-contract.md`
- [ ] Schema changes in `docs/database-schema.md`
- [ ] Handoff to `mobile-flutter` / `frontend-electron` if they consume new endpoint
- [ ] `qa-verifier` sign-off in WO handoff log
