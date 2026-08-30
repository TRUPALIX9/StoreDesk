# StoreDesk system map & gap fill plan

**Last updated:** 2026-08-30 (Antigravity full-repo scan)

---

## Repo structure

```
StoreDesk/                         (parent — git submodules)
├── store-desk-electron/           Electron v34 + React 19 + MUI 6 desktop
├── store-desk-worker/             Node.js + Express 4 + Prisma/SQLite edge API
├── store-desk-mobile/             Flutter 3 + Dart 3 companion app
├── store-desk-web/                Next.js 15 marketing + license admin (Vercel)
├── brand-kit/                     Logos, icons, colors
├── docs/                          All product docs (you are here)
├── scripts/                       Build helpers (fetch-binaries, etc.)
├── resources/bin/                 Packaged binaries (worker.exe, cloudflared.exe, WinSW)
├── AGENTS.md                      Master product spec
└── DESIGN.md                      Design token reference
```

---

## Connection topology

```
┌─────────────────────────────────────────────────────┐
│  Store PC                                           │
│                                                     │
│  ┌──────────────────┐    IPC     ┌───────────────┐  │
│  │  StoreDesk       │◄──────────►│ Electron main │  │
│  │  (Renderer)      │            │   process     │  │
│  │  React/MUI       │            │  main.ts      │  │
│  │  :5173 (dev)     │            │  serviceManager│  │
│  └─────────┬────────┘            └───────┬───────┘  │
│            │ http://localhost:4310        │spawn/IPC │
│            ▼                             ▼          │
│  ┌──────────────────────────────────────────────┐   │
│  │  StoreDesk Worker  (Express + Prisma/SQLite) │   │
│  │  :4310  (bind 127.0.0.1 prod / 0.0.0.0 dev) │   │
│  │  ──────────────────────────────────────────  │   │
│  │  Commander (Verifone) ◄─── priceBook.service │   │
│  └──────────────────────────────┬───────────────┘   │
│                                 │ cloudflared        │
└─────────────────────────────────┼────────────────────┘
                                  │ outbound TLS
                                  ▼
                    https://<store-id>.storedesk.net
                         (Cloudflare Tunnel)
                                  ▲
                    ┌─────────────┴──────────────┐
                    │  StoreDesk Mobile (Flutter) │
                    │  Dio → CF Tunnel URL        │
                    └─────────────────────────────┘
                    ┌─────────────────────────────┐
                    │  StoreDesk Web (Vercel)     │
                    │  Next.js 15 / Atlas Mongo   │
                    └─────────────────────────────┘
```

**Rules (non-negotiable):**
- Electron renderer → `http://localhost:4310` (same PC, never CF Tunnel)
- Mobile → `https://<store-id>.storedesk.net` (CF Tunnel, never LAN IP)
- Web → `https://<store-id>.storedesk.net` (same CF Tunnel)
- Nothing hits MongoDB/SQLite directly except Worker (Prisma/SQLite) and Web (Atlas/Mongoose)

---

## StoreDesk Electron (v0.0.4) — actual state

**Stack:** Electron 34, React 19, MUI 6, TanStack Query 5, Redux Toolkit 2, Vite 6

### Pages

| Route | Component | Status |
|-------|-----------|--------|
| `/setup` | `SetupWizardPage` | Partial — UI done; key-redemption backend incomplete |
| `/login`, `/app-login` | `AppUserLoginPage` | Done |
| `/dashboard` | `DashboardPage` | Done |
| `/pos` | `POSWorkspacePage` | Done |
| `/pos/transactions` | `TransactionsPage` | Done |
| `/price-book` | `PriceBookPage` | Done |
| `/cost-analysis` | `CostAnalysisPage` | Done |
| `/vendors` | `VendorsPage` | Done |
| `/vendor-prices` | `VendorPricesPage` | Done |
| `/pricing-rules` | `PricingRulesPage` | Done |
| `/products/:id` | `ProductDetailPage` | Done |
| `/lottery` | `LotterySetupPage` | Stub (520 bytes) |
| `/worker-manage` | `ManageWorkerPage` | Done (37 KB — full tunnel + service UI) |
| `/user-management` | `UserManagementPage` | Done |
| `/settings` | `SettingsPage` | Done |

**Removed from UI (permanent):** Invoice upload/review, Mobile Access APK URL / pairing QR.

### Electron main IPC channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `app:info` | main→renderer | App name + version |
| `worker:getStatus` | renderer→main | Worker running + PID |
| `worker:status` | broadcast | Worker up/down |
| `worker:crashed` | broadcast | Worker exit code |
| `serviceManager:installTunnel` | renderer→main | Install CF tunnel token |
| `serviceManager:startTunnel` | renderer→main | Start cloudflared |
| `serviceManager:stopTunnel` | renderer→main | Stop cloudflared |
| `serviceManager:getTunnelStatus` | renderer→main | Tunnel state |
| `serviceManager:installWorker` | renderer→main | Install Worker as OS service |
| `serviceManager:startWorker` | renderer→main | Start Worker service |
| `serviceManager:stopWorker` | renderer→main | Stop Worker service |
| `serviceManager:getWorkerServiceStatus` | renderer→main | Worker service state |
| `serviceManager:restartWorker` | renderer→main | Restart Worker |

### Main process boot (packaged)
1. Run `npx prisma db push` in bundled Worker dir
2. Check :4310 for existing OS service
3. If none: spawn `worker.exe` as child process
4. Wait for port ready (12 s timeout)
5. Broadcast `worker:status` → open window

### Packaged binaries bundled
`worker.exe`, `cloudflared.exe`, `StoreDeskWorkerService.exe`, `StoreDeskWorkerService.xml`

### Empty structural dirs (open gaps)
`src/features/` (gitkeep), `src/layouts/` (gitkeep)

---

## StoreDesk Worker (v1.0.0) — actual state

**Stack:** Node.js, Express 4, Prisma 5, SQLite (not MongoDB)  
**Port:** 4310 | **Dev:** `tsx watch` | **Prod:** compiled `dist/index.js` + `pkg` exe

> ⚠️ README and prior docs say MongoDB — the actual Prisma datasource is **SQLite**.

### Route surface (20 route files)

| Mount | File |
|-------|------|
| `/api/auth` | `auth.routes.ts` |
| `/api/health`, `/health` | `health.routes.ts` |
| `/api/server-info`, `/server-info` | `serverInfo.routes.ts` |
| `/api/setup` | `setup.routes.ts` |
| `/api/diagnostics` | `setup.routes.ts` (diagnosticsRouter) |
| `/api/dashboard` | `dashboard.routes.ts` |
| `/api/admin` | `admin.routes.ts` |
| `/api/pos` | `pos.routes.ts` |
| `/api/pos/reports` | `posReports.routes.ts` |
| `/api/pos/transactions` | `transactions.routes.ts` |
| `/api/settings` | `settings.routes.ts` |
| `/api/integrations/sheets` | `integrationsSheets.routes.ts` |
| `/api/cron` | `cron.routes.ts` |
| `/api/products` | `products.routes.ts` |
| `/api/variants` | `variants.routes.ts` |
| `/api/vendors` | `vendors.routes.ts` |
| `/api/vendor-prices`, `/api/prices` | `prices.routes.ts` |
| `/api/pricing-rules` | `pricingRules.routes.ts` |
| `/api/pricing` | `pricing.routes.ts` |
| `/api/price-book` | `priceBook.routes.ts` |
| `/downloads` | `downloads.routes.ts` |

### Services (23 files)

`appStatePersistence`, `auth`, `barcode`, `commanderLookups`, `commanderPlu`, `commanderReports`, `email`, `hubRelay`, `knownDepartments`, `mobile`, `normalizeCode`, `priceBook`, `priceCalculation`, `pricingSuggestion`, `rubyReportParse`, `sealedConfig`, `storage`, `textNormalize`, `transSetParse`, `transactions`, `user`, `vendorPrice`, `integrationSettings`

### Startup auto-tasks
- Prisma `connectDatabase()` → SQLite
- `initializeAppStatePersistence()`
- `ensureDeveloperUser()`
- If Commander configured: hourly PLU cache sync (skips if < 1 hr stale)

### Build
- Dev: `npm run dev` (`tsx watch`)
- Build exe: `npm run build:exe` → `../resources/bin/worker.exe` (via `pkg`)
- Test: `vitest run`

### Empty dir (gap)
`src/controllers/` (gitkeep — all logic lives in services + routes directly)

---

## StoreDesk Mobile (v0.0.4+4) — actual state

**Stack:** Flutter ≥3.4, Dart ≥3.4  
**Package:** `com.storedesk` | **Label:** StoreDesk

### Feature dirs (lib/features/)

`analytics`, `auth`, `connection`, `dashboard`, `pos`, `price_book`, `products`, `reports`, `sales_tax`, `scanner`, `settings`, `shell`, `transactions`

### Key deps

| Package | Use |
|---------|-----|
| `mobile_scanner ^7.0.0` | Barcode scan |
| `dio ^5.7.0` | HTTP |
| `flutter_riverpod ^2.6.1` | State |
| `go_router ^14.6.2` | Navigation |
| `flutter_secure_storage ^9.2.2` | Token store |
| `barcode_widget ^2.0.4` | Barcode display |
| `web_socket_channel ^3.0.1` | WSS |
| `fl_chart ^0.71.0` | Charts |
| `google_fonts ^6.2.1` | Typography |

### Connection model
- Auth: AppUser login (org-provisioned)
- URL: `https://<store-id>.storedesk.net` (CF Tunnel)
- **No invoice upload in beta**

---

## StoreDesk Web (v0.1.0) — actual state

**Stack:** Next.js 15 + Turbopack, Tailwind 4, Atlas MongoDB via Mongoose

### App routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing home |
| `/product` | Product page |
| `/how-it-works` | How-it-works |
| `/about` | About |
| `/contact` | Contact |
| `/privacy`, `/terms` | Legal |
| `/download` | App download + release tags |
| `/admin` | Internal admin (orgs, agents) |
| `/admin-gate` | Admin password gate |

### Deploy
Vercel. Preview ready. Production deployment needs promotion.

---

## Database — Prisma / SQLite (Worker)

File: `store-desk-worker/prisma/schema.prisma`

| Model | Key fields |
|-------|-----------|
| `Product` | `organizationId, storeId, name, brand, category, normalPrice` |
| `ProductVariant` | `productId, upc, sku, packQuantity, unitSize, totalBaseUnits, barcode` |
| `Vendor` | `name, contactPerson, phone, email, paymentTerms` |
| `VendorPrice` | `vendorId, variantId, pricePerPack, pricePerItem, pricePerBaseUnit, isCurrentPrice` |
| `PricingRule` | `scope, pricingMethod, marginPercent, markupPercent, roundingRule` |
| `MobileDevice` | `pairingCode, accessTokenHash, permissionsJson, lastSeenAt` |
| `POSDailySummary` | `date, totalSales, creditCard, cash, gas, lottery` — unique `orgId+storeId+date` |
| `Transaction` | `transactionId, amount, time, type, itemsJson` |
| `POSMonthlyReport` | `monthKey, totalSales, rawXml, syncedToSheets` — unique `orgId+storeId+monthKey` |
| `PriceBookEntry` | `upc, name, department, sellingPrice, vendorSamsClub, vendorGlobal, …` |
| `IntegrationSettings` | `commanderHost, commanderUsername, googleSheetsJson` — unique `orgId+storeId` |
| `User` | `email, passwordHash, organizationId, storeId` |

---

## Packaging

| Artifact | Command | Output |
|----------|---------|--------|
| `worker.exe` | `npm run build:exe` (store-desk-worker) | `resources/bin/worker.exe` |
| `cloudflared.exe` | `scripts/fetch-binaries.ts` | `resources/bin/cloudflared.exe` |
| `StoreDeskWorkerService.exe/.xml` | Static WinSW | `resources/bin/` |
| Electron NSIS installer | `npm run package` (store-desk-electron) | `release/` |
| Flutter APK | `flutter build apk --release` | `store-desk-mobile/build/…/app-release.apk` |
| Worker-served APK | Copy of Flutter APK | `store-desk-worker/downloads/storedesk-buddy.apk` |

---

## Open gaps — 2026-08-30

| Pri | Gap | Notes |
|-----|-----|-------|
| P0 | AppUser Hub session not wired (mobile + electron) | Hub v0 uses agentKey; assignment sessions unimplemented |
| P0 | SetupWizardPage — setup-key redemption backend incomplete | UI exists; Worker endpoint pending |
| P0 | Invoice extraction is stub | `pdf-parse` dep installed; real OCR path not wired |
| P0 | Worker README/release-status.md says MongoDB | Actual DB is SQLite via Prisma — correct all docs |
| P1 | `LotterySetupPage` is a 520-byte placeholder | No functionality |
| P1 | `src/features/` + `src/layouts/` empty in Electron | Structural dirs with gitkeep only |
| P1 | `src/controllers/` empty in Worker | All logic in services/routes |
| P1 | Web GitHub default branch is `main` | Needs ops rename to `production` |
| P2 | Parent CI blocked on `SUBMODULES_PAT` Actions secret | Ops step required |
| P2 | No Windows installer produced yet | `release/` absent; `npm run package` not run |
| P2 | `release-status.md` references `store-desk-cloud-backend` | Not in `.gitmodules`; remove from release table |

---

## Prior content preserved

_The setup-v1 target map, identity model, credential compatibility warning, Commander migration target, and gap backlog from the prior version of this document remain valid planning targets. See `docs/architecture.md` for the full security/identity design._
