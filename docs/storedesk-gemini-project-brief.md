# StoreDesk — Full Project Brief (Gemini / LLM context)

**Audience:** Paste or upload this file into Gemini (or another LLM) for accurate project context.  
**As of:** 2026-07-25 — grounded in the live codebase and docs under `StoreDesk/`.  
**Do not invent stock/inventory features.** This product explicitly excludes on-hand quantity tracking.

---

## 1. Product naming

| Name | What it is | Folder / remote |
|------|------------|-----------------|
| **StoreDesk** | Electron desktop admin app | `store-desk-electron/` → `https://github.com/TRUPALIX9/store-desk-electron.git` |
| **StoreDesk Server** | Node.js + Express API (local) | `store-desk-server/` → `https://github.com/TRUPALIX9/store-desk-server.git` |
| **StoreDesk Mobile** | Flutter phone helper (never call it “StoreDesk Mobile”) | `store-desk-mobile/` → `https://github.com/TRUPALIX9/store-desk-mobile.git` |
| **Parent** | Docs, scripts, submodule pointers | `StoreDesk/` → `https://github.com/TRUPALIX9/StoreDesk.git` |

---

## 2. What the product does / does not

### Does

- Local-first convenience-store / gas-station ops on the store PC and Wi‑Fi.
- **Point of Sale:** daily sales table, analytics, Georgia sale-tax helpers; often fed by Google Sheets sync.
- **Price Book:** live Verifone Commander PLUs (`vPLUs`, read-only) + local vendor-cost overlays.
- **Cost Analysis:** sell price vs vendor case / per-item cost and margin (same Price Book API).
- **POS Reports:** Ruby Commander period reports (`vrubyrept`) — print-aligned KPIs (tax, fuel/merch, network, departments, tenders).
- **Transactions:** paginated ticket cards from Commander T-Log (`vtransset`).
- Products / variants / vendors / vendor price history / invoice upload → review → confirm prices.
- **StoreDesk Mobile:** pair over LAN, scan barcodes, look up products/prices, upload invoices.
- Suggested selling prices from margin/markup rules (no inventory math).

### Does not (non-negotiable)

- Stock quantity, on-hand counts, add/reduce stock, low-stock alerts, reorder levels, warehouse locations, stock movements.
- No `Inventory` / `StockMovement` product models as the core product (an `/api/inventory` route exists as a catalog/list alias historically — it is **not** stock tracking).
- No writing PLUs back to Commander (`uPLUs` not implemented).
- Buddy never talks to MongoDB directly — only to StoreDesk Server over HTTP.

---

## 3. Local-first architecture

```txt
┌─────────────────────┐         ┌──────────────────────────┐
│  StoreDesk          │  HTTP   │  StoreDesk Server        │
│  (Electron, PC)     │────────►│  http://0.0.0.0:4310     │
│  localhost:4310     │  JWT    │                          │
└─────────────────────┘         │  catalog / prices / POS  │
                                │  invoices / mobile pair  │
┌─────────────────────┐  Wi‑Fi  │  optional Mongo blob     │
│  StoreDesk Mobile    │────────►│                          │
│  http://LAN_IP:4310 │  token  └──────────────────────────┘
└─────────────────────┘
```

| Rule | Detail |
|------|--------|
| Port | **4310**, bind **`0.0.0.0`** for LAN phones |
| Desktop | `http://localhost:4310` (or Vite `/api` proxy in dev) |
| Phone | Must use PC **LAN IP** — `localhost` on the phone is wrong |
| Mongo | Optional local; often in-memory store + optional AppState blob persist |
| Hosted | No hosted backend / hosted Mongo unless explicitly requested |

### Dual Express (important gap)

There are **two Express code copies**:

| Copy | Path | When |
|------|------|------|
| **Canonical** | `store-desk-server/` | Default Electron `npm run dev` (external server) + Buddy |
| **Embedded** | `store-desk-electron/src/server/` | `npm run dev:embedded` / Electron-bundled API |

**Current reality (2026-07):** Live Commander **Price Book**, **POS Reports**, and **Transactions** are implemented primarily on the **Electron embedded server**. Standalone `store-desk-server` may lag those routes. For Commander-backed UI work, use **`npm run dev:embedded`** in Electron (or port features to the standalone server). See `docs/system-map.md` and `docs/verifone-commander-price-book.md`.

---

## 4. Design / UX (as implemented)

### Primary sidebar (`AppLayout.tsx`)

1. **Point of Sale** → `/pos`
2. **POS Reports** → `/pos/reports`
3. **Transactions** → `/pos/transactions`
4. **Price Book** → `/price-book`
5. **Cost Analysis** → `/cost-analysis`
6. **Settings** → `/settings`

Extra routes still exist (dashboard, vendors, invoice upload/review, pricing rules, lottery placeholder, mobile access) but are **not** in the primary nav — often reached from Settings “More tools” or deep links. `/inventory`, `/products`, `/variants`, `/prices` redirect to Price Book.

### Price Book

- Source of truth for PLU core fields: **live Commander `vPLUs`**.
- Local overlays: vendor costs (101, Sam’s Club, Global, Hackney, Gandhi, Custom) + optional expiry.
- Refresh loads live list; Sync is demoted (API `POST /api/price-book/commander/sync` for optional offline cache only).
- Search by name / UPC / price; department filter; “Open by UPC”.
- Never writes Commander.

### Cost Analysis

- Same `GET /api/price-book` merge.
- Client util compares sell vs vendor per-item / best cost / margin %.

### POS Reports (Ruby-only)

- No report-type picker in the main UI path; defaults to combined **`ruby-daily`**.
- Fetches `vrubyrept` for tax + summary + department + network; periods from `vreportpdlist` (includes `filename=current`).
- **Fuel sales KPI** = Ruby `summaryInfo.fuelSales` (print “Fuel sales”). Do **not** use `difference.outsideSales` as the primary Gas tile.
- Registers-focused preview: HIGH/LOW tax, merch/inside, network CREDIT/DEBIT, cash, credit fee; department table; **no** outside-sales / outside-grand framing in the UI.
- Ticket detail is **not** on this page — use Transactions.

### Transactions

- Periods from T-Log period list; tickets from `vtransset`.
- Paginated cards: register + time → items summary → total → tender/void chips; expand for full lines.
- No outdoor-pump-only filter (keeps voids / register cards intact).

### Theme

- Material UI admin: navy primary, green accent, light gray background, white cards.
- Centralized theme tokens under `store-desk-electron/src/theme/`.
- Title-only section headers; flat outlined surfaces (see `docs/ui-architecture.md` / storedesk-ui skill).

---

## 5. Schema / data concepts

### Price Book

```ts
// store-desk-electron/src/shared/types.ts (conceptual)
PriceBookEntry {
  id, upc, upcModifier?, name, department?,
  sellingPrice, sellUnit?, expiryDate?,
  source?: "commander" | "manual",
  vendorSamsClub?, vendorGlobal?, vendorHackney?,
  vendor101?, vendorGandhi?, vendorCustom?,
  createdAt, updatedAt
}
```

- Overlay key: `upc::modifier`.
- Synthetic live id when no overlay: `pb_{upc}_{upcModifier}`.
- Merge: Commander wins name/dept/sell/sellUnit/upc; local wins vendor slots + expiry.

### Known departments

- Persisted JSON under `data/known-departments.json` (embedded server).
- Discovered from Ruby department reports; merged into Price Book department filters.

### POS daily (Sheets / import path)

- `PosDailySummary`: date, high/low/sale tax, totalSales, gas, lottery, credit, cash, expenses, source (`file` | `google_sheets` | `manual`), etc.
- Used by Point of Sale workspace — **separate** from live Ruby report KPIs.

### Catalog / pricing (Mongo-style entities in AGENTS.md)

Product, ProductVariant, Vendor, VendorPrice, Invoice, InvoiceItem, ExtractionJob, PricingRule, MobileDevice — **no** Inventory / StockMovement as product scope.

Runtime note: much data is still **in-memory arrays** with optional Mongo **blob** load/save, not always one collection per entity.

### Commander XML (brief)

| Cmd | Role in StoreDesk today |
|-----|-------------------------|
| `validate` / `releaseCredential` | Session cookie |
| `vPLUs` | Price Book live PLUs (**read-only**) |
| `vreportpdlist` | Ruby report period picker |
| `vrubyrept` | POS Reports (tax / summary / department / network) |
| `vtlogpdlist` | T-Log periods (Transactions) |
| `vtransset` | Closed/current period ticket set (Transactions) |
| `uPLUs` | **Not used** — no write-back |

Deep docs: `docs/verifone-commander-price-book.md`, `docs/verifone-commander-reports.md`.

---

## 6. API structure (Electron embedded `src/server`)

Base: `http://localhost:4310` — JSON under `/api/*` unless noted.

### Auth

- Dev: JWT often skipped — server `AUTH_DISABLED` / `NODE_ENV !== production`; Vite `VITE_AUTH_DISABLED` / `import.meta.env.DEV` (see `isAuthDisabled`).
- Production: require auth via `optionalGlobalAuth` after `/api/auth`.
- Routes: `/api/auth` — login, register, forgot/reset, verify, me, logout, etc.

### Mounted routers (`createApp` in `src/server/index.ts`)

| Mount | Purpose |
|-------|---------|
| `/api/health` | Health |
| `/api/server-info` | Server info, pairing QR data, devices |
| `/api/dashboard` | Dashboard stats |
| `/api/inventory` | Catalog-style list (not stock qty) |
| `/api/admin` | Store stats / dump / reset |
| `/api/pos` | Daily POS rows, analytics, Sheets import, export |
| `/api/pos/reports` | Commander Ruby reports |
| `/api/pos/transactions` | Commander T-Log tickets |
| `/api/settings` | GTC profile, sale-tax filing, Sheets profiles |
| `/api/integrations/sheets` | Sheets status / sync helpers |
| `/api/cron` | Cron trigger |
| `/api/products`, `/api/variants` | Catalog CRUD |
| `/api/vendors` | Vendors |
| `/api/invoices`, `/api/invoice-items` | Upload / review / confirm |
| `/api/vendor-prices`, `/api/prices` | Vendor price history / compare |
| `/api/pricing-rules`, `/api/pricing` | Rules + suggestions |
| `/api/price-book` | Live PLU + overlays |
| `/api/review-queue` | Invoice review queue |
| `/api/mobile` | Buddy pair + lookups + invoice upload |
| `/downloads` | Buddy APK download |

### Price Book routes

- `GET /api/price-book` — live list + overlays (`search`/`q`, `department`, `limit`, `pageSize`, …)
- `GET /api/price-book/departments`
- `GET /api/price-book/commander/status`
- `GET /api/price-book/commander/lookup?upc=&modifier=`
- `POST /api/price-book/commander/sync` — optional cache only
- `GET /api/price-book/by-upc/:upc`
- `GET|POST|PUT /api/price-book[/:id]` — overlays; never Commander write

### POS Reports routes

- `GET /api/pos/reports/kinds`
- `GET /api/pos/reports/periods?sysid=&includeCurrent=&periodListCmd=`
- `GET /api/pos/reports/fetch?kind=ruby-daily|ruby-tax|ruby-summary|ruby-department|ruby-network&filename=&period=`

### Transactions routes

- `GET /api/pos/transactions/status`
- `GET /api/pos/transactions/periods?sysid=`
- `GET /api/pos/transactions?filename=&period=&page=&pageSize=`

Standalone `store-desk-server` shares many catalog/POS/Sheets routes historically; treat embedded as SoT for the newest Commander report surfaces until ports catch up.

---

## 7. Verifone Commander integration

| Principle | Implementation |
|-----------|----------------|
| Read-only | `vPLUs`, `vrubyrept`, `vtransset`, period lists — **no `uPLUs`** |
| Price Book | Live SoT for sell/description/dept |
| POS Reports | Ruby only (`vrubyrept` + `vreportpdlist`) |
| Transactions | T-Log (`vtransset` + `vtlogpdlist`) |
| Close day/period | Auth may list `cclosedaynow` / `cclosepdnow` — **not called by StoreDesk** |

### Env vars (placeholders only — never commit real secrets)

```txt
COMMANDER_HOST=https://192.168.x.x
COMMANDER_USER=MANAGER
COMMANDER_PASSWORD=

PORT=4310
MONGO_URI=mongodb://127.0.0.1:27017/storedesk
APP_SECRET=change-me-in-development
AUTH_DISABLED=          # true/false; default skips auth in non-production
VITE_AUTH_DISABLED=     # Vite client counterpart
VITE_API_URL=http://localhost:4310/api
GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-service-account.json
```

See `store-desk-electron/.env.example`. Do not commit `.env`, `scripts/commander-auth.xml` (live cookies), or GCP keys.

---

## 8. Repo structure & key docs

```txt
StoreDesk/                          # parent
├── store-desk-electron/            # StoreDesk desktop (+ embedded API)
├── store-desk-server/              # StoreDesk Server
├── store-desk-mobile/              # StoreDesk Mobile
├── docs/                           # architecture, Verifone, WOs, this brief
├── scripts/                        # Commander probe/fetch helpers
├── AGENTS.md                       # product master prompt
├── .gitmodules
└── .cursor/                        # agent team (Cursor + Codex; no .claude/)
```

### Must-read docs

| Doc | Contents |
|-----|----------|
| Root `AGENTS.md` | Full product / sprint / entity rules |
| `docs/how-storedesk-works.md` | Human E2E guide |
| `docs/system-map.md` | Dual Express gap + IA |
| `docs/verifone-commander-price-book.md` | Price Book / Cost Analysis / `vPLUs` |
| `docs/verifone-commander-reports.md` | Ruby + T-Log reports, periods, KPIs |
| `docs/storedesk-gemini-project-brief.md` | **This file** |
| `docs/agent-team-guide.md` | Agent ops |
| `docs/work-orders/` | Active WOs (e.g. POS Reports) |

### Agent runtime

Cursor (`.cursor/`) + Codex (`.codex/` pointers). Roles: eng-manager, tech-lead, frontend-electron, backend-server, mobile-buddy, ui-ux-designer, qa-verifier, docs-scribe.

### Checks

```txt
store-desk-electron:  npm run ci
store-desk-server:    npm run ci
store-desk-mobile:    npm run ci   # needs Flutter locally
```

---

## 9. Typical local workflows

| Goal | Suggested command |
|------|-------------------|
| Desktop + external API | Run `store-desk-server` on 4310; Electron `npm run dev` |
| Price Book / POS Reports / Transactions (Commander) | Electron `npm run dev:embedded` + Commander env set |
| Buddy | Server on `0.0.0.0:4310`; phone uses `http://LAN_IP:4310`; pair via Mobile Access QR |

---

## 10. Explicit gaps / follow-ups (do not assume done)

- Port embedded Price Book / POS Reports / Transactions to standalone `store-desk-server` (dual Express drift).
- Invoice extraction is still largely stub/sample — review before VendorPrice is mandatory.
- Buddy Price Book is not fully wired to the live Commander Price Book API.
- Lottery Setup is a placeholder.
- Monthly Commander periods not observed in saved `vtlogpdlist` samples (SHIFT + DAILY only).

---

## 11. One-sentence pitch

**StoreDesk** is a local-first desktop command center (with **StoreDesk Mobile** on Wi‑Fi) for convenience stores: live Verifone Commander price book and Ruby/T-Log reporting, Sheets-backed POS analytics, vendor cost overlays, and invoice-reviewed vendor prices — **without** stock inventory.
)
