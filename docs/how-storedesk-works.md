# How StoreDesk Works (End to End)

This document explains **what StoreDesk is**, **what it does**, and **how the parts connect** in practice.

For agent/team ops see [`agent-team-guide.md`](./agent-team-guide.md) (full) and `.cursor/TEAM.md` (short org chart). For gap backlog see `docs/system-map.md`. For the full product spec see root `AGENTS.md`. Brand tokens and logos: [`../brand-kit/README.md`](../brand-kit/README.md) (primary `#1A63F4`, secondary `#00A87B`).

---

## 1. What StoreDesk is

**StoreDesk** is an **edge-first** desktop + phone system for convenience stores and gas stations, with a **cloud control plane** for multi-store licenses (StoreDesk Web + Atlas). Catalog and Commander stay on the store PC.

It helps the store owner and staff:

- See **daily POS sales** (often synced from Google Sheets)
- Browse **live Verifone Commander PLUs** and local vendor costs
- Keep a **Price Book** / **Cost Analysis** sheet (UPC-centered sell + vendor columns)
- Manage **organization users** provisioned with the store license in StoreDesk Web (no local APK URL or pairing QR)
- Run **StoreDesk** on a phone (Play beta) with AppUser login against the assigned Worker
- Manage **store licenses** and agent keys on StoreDesk Web (Vercel + Atlas M0)

It is **not** a stock / inventory-count system.

| In scope | Out of scope |
|----------|----------------|
| Products, variants, UPCs | On-hand quantity |
| Vendor costs and history | “Add stock” / “reduce stock” |
| Manual vendor prices / Price Book costs | Invoice upload/review UI (removed from desktop) |
| Suggested selling price from margin/markup | Low-stock / reorder alerts |
| POS sales summary, analytics, sale tax helpers | Warehouse locations / stock movements |
| Org AppUsers from Web license | Direct phone → MongoDB; local APK QR / pairing codes |

---

## 2. The apps

Everything lives in one parent Git repo with **submodules**:

```txt
StoreDesk/                          ← parent (docs, scripts, submodule pointers)
├── store-desk-electron/            ← StoreDesk (desktop)
├── store-desk-worker/              ← StoreDesk Worker (edge API)
├── store-desk-mobile/              ← StoreDesk Mobile (phone)
├── store-desk-web/                 ← StoreDesk Web (marketing + licenses)
├── store-desk-cloud-backend/       ← Cloud Hub (WSS)
└── brand-kit/                      ← logos + color tokens
```

| Name | Tech | Job |
|------|------|-----|
| **StoreDesk** | Electron + React + MUI | Admin / ops desktop UI |
| **StoreDesk Worker** | Node + Express + local Mongo | Edge API (catalog, Commander, vendor prices) |
| **StoreDesk Mobile** | Flutter | Phone helper — AppUser login, scan/search/prices. Play/launcher label **StoreDesk** |
| **StoreDesk Web** | Next.js on Vercel | Product site + store license admin (Atlas) |
| **Cloud Hub** | Node on Cloud Run | WSS rooms for multi-store relay (Epic 1+) |

Product branding:

- Desktop = **StoreDesk**
- API = **StoreDesk Worker**
- Phone = **StoreDesk** on device; **StoreDesk Mobile** in docs/repos
- Web = **StoreDesk Web**
- Relay = **StoreDesk Cloud Hub**
- Visual kit = `brand-kit/` (lockup + mark + color tokens)

Phone distribution: see [`mobile-flow.md`](./mobile-flow.md) (Play AAB; access via org AppUser / license, not desktop pairing QR).

### Target cloud shape (migration)

```txt
Phone / Desktop  →  Cloud Hub (WSS)  →  Edge Agent on store PC  →  local Mongo + Commander
Admin browser    →  StoreDesk Web     →  Atlas (licenses only)
```

Keep `:4310` until Desktop + Mobile dual-mode through the Hub is proven. No Redis in Phase 0–1.

---

## 3. How they connect (the one important picture)

```txt
┌─────────────────────┐         ┌──────────────────────────┐
│  StoreDesk          │  HTTP   │  StoreDesk Worker        │
│  (Electron, PC)     │────────►│  http://0.0.0.0:4310     │
│  localhost:4310     │  JWT    │                          │
└─────────────────────┘         │  • catalog / prices      │
                                │  • POS daily / sheets    │
┌─────────────────────┐  Wi‑Fi  │  • mobile AppUser lookup │
│  StoreDesk Mobile   │────────►│  • vendor prices         │
│  scan/search/prices │  LAN    │  • optional Mongo blob   │
│  AppUser login      │  token  └──────────────────────────┘
│  http://LAN_IP:4310 │
└─────────────────────┘
```

Rules:

1. **One real backend:** `store-desk-worker` on port **4310**, listening on **`0.0.0.0`** so phones on LAN can connect.
2. Desktop may use `http://localhost:4310` (or Vite’s `/api` proxy in dev).
3. The phone **must** use the PC’s **LAN IP** (e.g. `http://192.168.1.25:4310`). On a phone, `localhost` means the phone itself — that will never reach the store PC.
4. The phone **never** talks to MongoDB. Only the server does.
5. PC must be on, server running, same Wi‑Fi, firewall allowing **4310**.

### Auth in short

| Client | Auth |
|--------|------|
| Desktop | Organization AppUser login (provisioned with Web license) → JWT |
| Mobile | Same AppUser model — sign in on phone; no pairing QR / APK URL from desktop |

---

## 4. What each app does day to day

### 4.1 StoreDesk (desktop) — main screens

Sidebar (current Electron nav):

1. **Point of Sale** — daily sales table, analytics charts, Georgia sales-tax worksheets; Google Sheets sync and GTC profile live mainly under Settings  
2. **POS Reports** — Ruby-only Commander period KPIs (`vrubyrept`); Fuel sales = `fuelSales`; registers-focused  
3. **Transactions** — paginated ticket cards from Commander T-Log (`vtransset`)  
4. **Price Book** — live Verifone Commander PLUs on open/Refresh (`vPLUs`) plus local vendor-cost overlays (manual add overlay supported)  
5. **Cost Analysis** — same live sell prices vs vendor case/per-item costs and margins  
6. **Settings** — account, server URL test, data dump/reseed, Sheets/GTC, **More tools** (vendors, pricing rules, user access, etc.)

Commander details: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md), [`verifone-commander-reports.md`](./verifone-commander-reports.md). Full LLM brief: [`storedesk-gemini-project-brief.md`](./storedesk-gemini-project-brief.md).

**Price Book / POS Reports / Transactions APIs** live on **StoreDesk Worker** `:4310` ([`WO-20260801-worker-pricebook-cloud-mimic`](./work-orders/WO-20260801-worker-pricebook-cloud-mimic.md)). Default Electron **`npm run dev`** talks to Worker (`dev:external`). Electron **`npm run dev:embedded`** is a legacy dual-support fallback only.

Extra pages still exist as routes (dashboard, vendors, lottery placeholder) but are **not** jammed into the main nav.

### 4.2 StoreDesk Worker — what it stores and serves

The server is the **source of truth** for:

- Products and product variants (UPC, pack size, codes)
- Vendors and vendor price history
- Pricing rules / sell-price suggestions
- POS daily rows (often imported from Sheets)
- Price Book entries (UPC sheet with named vendor columns)

Runtime note: today much of the live data is an **in-memory store**. If Mongo is configured, the whole store can be **saved/loaded as a blob** (`AppState`). That is not yet “one Mongo collection per entity” for every request.

### 4.3 StoreDesk Mobile — phone helper

Typical flow:

1. Install from Google Play (or sideload if needed) — **not** from a desktop APK QR.
2. Sign in as an **organization AppUser** created when the store license was provisioned in StoreDesk Web.
3. Scan barcodes, search catalog, and view vendor prices.

Keep the phone simple: big taps, scan-first, clear connection status.

---

## 5. End-to-end journeys

### A. Daily POS / Sheets

```txt
Google Sheet (sales) → Server sync/commit → POS Table / Analytics / Sale Tax UI
```

Operators pick a date range, review gross/tax/net and tender buckets (card, cash, gas, lottery), and work monthly tax worksheets when GTC profile is set.

Commander can also export **closed daily/shift T-Log** XML (`vtransset`) via probe scripts — **not wired into POS yet**. See [`verifone-commander-reports.md`](./verifone-commander-reports.md).

### B. Price Book / cost compare

```txt
Open Price Book → live Commander vPLUs (+ local overlays)
  → Cost Analysis compares sell vs vendor costs per item
```

Details: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md). Suggested sell from pricing rules (margin ≥ 100% rejected) still applies on the Product/Variant path; Price Book Cost Analysis shows margin vs overlay costs.

### C. Vendor costs (no invoice UI)

Vendor costs are entered **manually** (Vendor Prices / Price Book overlays). Invoice upload and extraction review were removed from StoreDesk desktop and mobile.

### D. Price Book

```txt
Live Commander PLU (name, UPC, mod, dept, sell, unit)
  + local vendor overlays (101, Sam’s, Global, Hackney, Gandhi, Custom, expiry)
  → StoreDesk Worker /api/price-book (HTTP SoT on :4310)
  → overlays via PUT/POST; optional Commander sell-price write via /commander/plu
```

This sits beside the Product/Variant model. Unifying them is a future product decision. See [`verifone-commander-price-book.md`](./verifone-commander-price-book.md).

### E. Phone / desktop access (org license)

```txt
StoreDesk Web: create org + store license
  → provision AppUsers for that organization
  → Desktop / Mobile sign in as those users
  → no APK download URL, no pairing QR on the store PC
```

---

## 6. Data the product cares about

High-level entities (conceptual):

| Entity | Meaning |
|--------|---------|
| **Product** | Brand/item family (e.g. Coca-Cola) |
| **ProductVariant** | Specific pack/size/UPC (e.g. 12-pack 12 oz) |
| **Vendor** | Where you buy (Costco, Hackney, …) |
| **VendorPrice** | One priced observation; history kept, not silently overwritten |
| **PricingRule** | How to suggest sell price (margin / markup / rounding) |
| **AppUser / assignment** | Org user from Web license (desktop + mobile login) |
| **POS daily row** | One day’s sales totals from sheet/import |
| **Price Book entry** | UPC-centric row with vendor cost columns |

---

## 7. Local-first setup (how you run it)

Typical machine setup:

1. Install / start **MongoDB** locally *or* run with memory mode where allowed.
2. Start **StoreDesk Worker**:

   ```powershell
   cd store-desk-worker
   npm install
   npm run dev
   ```

   Listen: `0.0.0.0:4310`.

3. Start **StoreDesk** desktop:

   ```powershell
   cd store-desk-electron
   npm install
   npm run dev
   ```

   Default `dev` expects the **external** server on 4310.

4. Phone: install from Play, sign in as an org AppUser from the Web license (same Wi‑Fi / Hub as assigned).

Parent repo clone reminder:

```powershell
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
```

App code changes are **committed inside each submodule**, then the parent updates the submodule pointer.

---

## 8. Why there are two Express folders (important)

You may see Express code in:

| Location | Status |
|----------|--------|
| `store-desk-worker/` | **Canonical — write API here** |
| `store-desk-electron/src/server/` | **Legacy embed** — same kind of API duplicated so old Electron could run alone (`dev:embedded`) |

That is **double API code**, not double “products.”

- Normal workflow uses **only** `store-desk-worker`.
- Editing both forever causes drift (a feature appears in one copy and not the other).
- Long-term cleanup: delete or stop maintaining the Electron embed.

Desktop UI code (`src/pages`, React) is **not** duplicated there — only the API fork is.

---

## 9. What “done” looks like for the store

An operator can:

1. Open StoreDesk on the PC with Server green in the header.
2. Use **POS** for yesterday’s sales and tax prep.
3. Use **Price Book** (live Commander + Refresh) and **Cost Analysis** to find an item and compare vendor costs.
4. Under **Settings** / **User access**, manage org users (provisioned with the Web license). Sync Sheets when needed.
5. On the phone, sign in and scan a UPC to see best vendor / suggested sell.

All of that stays **on the local network** — no required cloud backend.

---

## 10. Related docs

| Doc | Contents |
|-----|----------|
| `AGENTS.md` | Full product/agent master spec |
| `docs/verifone-commander-price-book.md` | Commander / Price Book / Cost Analysis E2E + API |
| `docs/verifone-commander-reports.md` | Commander T-Log / closed daily & shift `vtransset` schema |
| `docs/architecture.md` | Technical architecture notes |
| `docs/api-contract.md` | HTTP API surfaces |
| `docs/database-schema.md` | Entity fields |
| `docs/wireframes.md` | Screen wireframes |
| `docs/mobile-flow.md` | Mobile AppUser login / scan (Play beta) |
| `docs/ui-architecture.md` | Desktop UI system |
| `docs/system-map.md` | Gaps, dual-server notes, IA lock |
| `docs/sprint-plan.md` / `sprint-status.md` | Delivery status |

---

## 11. One-sentence summary

**StoreDesk is the store’s local command center for POS visibility, catalog/vendor costs, and org-licensed desktop/phone access — running through StoreDesk Worker on the LAN (Hub later), without stock-count inventory or invoice upload.**
