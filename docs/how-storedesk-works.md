# How StoreDesk Works (End to End)

This document explains **what StoreDesk is**, **what it does**, and **how the parts connect** in practice.

For agent/team ops see [`agent-team-guide.md`](./agent-team-guide.md) (full) and `.cursor/TEAM.md` (short org chart). For gap backlog see `docs/system-map.md`. For the full product spec see root `AGENTS.md`.

---

## 1. What StoreDesk is

**StoreDesk** is a **local-first** desktop + phone system for convenience stores and gas stations.

It helps the store owner and staff:

- See **daily POS sales** (often synced from Google Sheets)
- Browse **live Verifone Commander PLUs** and local vendor costs
- Keep a **Price Book** / **Cost Analysis** sheet (UPC-centered sell + vendor columns)
- Upload **invoices**, review extracted lines, and save confirmed **vendor prices**
- Pair **StoreDesk Buddy** on a phone to scan barcodes and look up prices on the store Wi‑Fi

It is **not** a stock / inventory-count system.

| In scope | Out of scope |
|----------|----------------|
| Products, variants, UPCs | On-hand quantity |
| Vendor costs and history | “Add stock” / “reduce stock” |
| Invoice review → save prices | Low-stock / reorder alerts |
| Suggested selling price from margin/markup | Warehouse locations / stock movements |
| POS sales summary, analytics, sale tax helpers | Direct phone → MongoDB |

---

## 2. The three apps

Everything lives in one parent Git repo with **three submodules**:

```txt
StoreDesk/                          ← parent (docs, scripts, submodule pointers)
├── store-desk-electron/            ← StoreDesk (desktop)
├── store-desk-server/              ← StoreDesk Server (API)
└── store-desk-mobile/              ← StoreDesk Buddy (phone)
```

| Name | Tech | Job |
|------|------|-----|
| **StoreDesk** | Electron + React + MUI | Admin / ops desktop UI |
| **StoreDesk Server** | Node + Express (+ optional local Mongo) | Single API all clients use |
| **StoreDesk Buddy** | Flutter | Phone helper on the same Wi‑Fi |

Product branding:

- Desktop = **StoreDesk**
- API = **StoreDesk Server**
- Phone = **StoreDesk Buddy** (never “StoreDesk Mobile”)

---

## 3. How they connect (the one important picture)

```txt
┌─────────────────────┐         ┌──────────────────────────┐
│  StoreDesk          │  HTTP   │  StoreDesk Server        │
│  (Electron, PC)     │────────►│  http://0.0.0.0:4310     │
│  localhost:4310     │  JWT    │                          │
└─────────────────────┘         │  • catalog / prices      │
                                │  • invoices / review     │
┌─────────────────────┐  Wi‑Fi  │  • POS daily / sheets    │
│  StoreDesk Buddy    │────────►│  • mobile pair + lookup  │
│  (phone)            │  token  │  • optional Mongo blob   │
│  http://LAN_IP:4310 │         └──────────────────────────┘
└─────────────────────┘
```

Rules:

1. **One real backend:** `store-desk-server` on port **4310**, listening on **`0.0.0.0`** so phones on LAN can connect.
2. Desktop may use `http://localhost:4310` (or Vite’s `/api` proxy in dev).
3. The phone **must** use the PC’s **LAN IP** (e.g. `http://192.168.1.25:4310`). On a phone, `localhost` means the phone itself — that will never reach the store PC.
4. Buddy **never** talks to MongoDB. Only the server does.
5. PC must be on, server running, same Wi‑Fi, firewall allowing **4310**.

### Auth in short

| Client | Auth |
|--------|------|
| Desktop | User login → JWT stored in the app → sent as `Authorization: Bearer …` |
| Buddy | Scan pairing QR (or enter server URL + code) → device access token saved in secure storage |

---

## 4. What each app does day to day

### 4.1 StoreDesk (desktop) — main screens

Sidebar is intentionally small:

1. **Point of Sale** — daily sales table, analytics charts, Georgia sales-tax worksheets; Google Sheets sync and GTC profile live mainly under Settings  
2. **Price Book** — live Verifone Commander PLUs on open/Refresh (`vPLUs`) plus local vendor-cost overlays (manual add overlay supported)  
3. **Cost Analysis** — same live sell prices vs vendor case/per-item costs and margins  
4. **Settings** — account, server URL test, data dump/reseed, Sheets/GTC, **More tools** (vendors, invoice upload/review, mobile pairing, etc.)

Commander integration details: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md). Use **`npm run dev:embedded`** in Electron when exercising Price Book APIs (not yet on standalone `store-desk-server`).

Extra pages still exist as routes (dashboard, vendors, invoice review, lottery placeholder) but are **not** jammed into the main nav.

### 4.2 StoreDesk Server — what it stores and serves

The server is the **source of truth** for:

- Products and product variants (UPC, pack size, codes)
- Vendors and vendor price history
- Invoices, invoice line items, review status
- Pricing rules / sell-price suggestions
- Mobile pairing codes and devices
- POS daily rows (often imported from Sheets)
- Price Book entries (UPC sheet with named vendor columns)

Runtime note: today much of the live data is an **in-memory store**. If Mongo is configured, the whole store can be **saved/loaded as a blob** (`AppState`). That is not yet “one Mongo collection per entity” for every request.

### 4.3 StoreDesk Buddy — phone helper

Typical flow:

1. Install APK (Android) from a download QR shown on desktop (or other install path).
2. Open Buddy → **Link / pair** using the desktop pairing QR (server URL + short-lived code).
3. After pairing: scan barcodes, search catalog, view vendor prices, upload an invoice photo/PDF for **desktop review**.

Buddy should stay simple: big taps, scan-first, clear connection status.

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

### C. Invoice → confirmed vendor price (critical rule)

```txt
Upload PDF/image
  → create Invoice + ExtractionJob
  → extract line items (today: sample/stub extraction — not full OCR yet)
  → match to products (UPC / SKU / codes / name)
  → human review / edit
  → confirm ready rows
  → create VendorPrice records (history preserved)
  → update “current” vendor price + selling suggestion
```

**Never** save raw extraction straight as final vendor price. Review always comes first. Confirming prices does **not** change inventory quantities (there are none).

### D. Price Book

```txt
Live Commander PLU (name, UPC, mod, dept, sell, unit)
  + local vendor overlays (101, Sam’s, Global, Hackney, Gandhi, Custom, expiry)
  → Electron embedded /api/price-book (not yet mirrored on store-desk-server)
  → Price Book edit dialog saves overlays only (no Commander write-back)
```

This sits beside the Product/Variant model. Unifying them is a future product decision. See [`verifone-commander-price-book.md`](./verifone-commander-price-book.md).

### E. Pair StoreDesk Buddy

```txt
Desktop Settings → Mobile Access / Link phone
  → show APK download QR (Android)
  → show pairing QR (serverUrl + code + expiry)
  → Buddy scans → saves URL + token → ready on LAN
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
| **Invoice / InvoiceItem** | Upload + lines waiting for review |
| **PricingRule** | How to suggest sell price (margin / markup / rounding) |
| **MobileDevice** | Paired Buddy handset |
| **POS daily row** | One day’s sales totals from sheet/import |
| **Price Book entry** | UPC-centric row with vendor cost columns |

Matching priority for invoice lines (simplified): UPC → SKU → internal barcode → internal code → vendor code → exact name → fuzzy name → no match. Low confidence stays in review.

---

## 7. Local-first setup (how you run it)

Typical machine setup:

1. Install / start **MongoDB** locally *or* run with memory mode where allowed.
2. Start **StoreDesk Server**:

   ```powershell
   cd store-desk-server
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

4. Phone: install Buddy, open Mobile Access / link tools on desktop, scan pairing QR on the same Wi‑Fi.

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
| `store-desk-server/` | **Canonical — write API here** |
| `store-desk-electron/src/server/` | **Legacy embed** — same kind of API duplicated so old Electron could run alone (`dev:embedded`) |

That is **double API code**, not double “products.”

- Normal workflow uses **only** `store-desk-server`.
- Editing both forever causes drift (a feature appears in one copy and not the other).
- Long-term cleanup: delete or stop maintaining the Electron embed.

Desktop UI code (`src/pages`, React) is **not** duplicated there — only the API fork is.

---

## 9. What “done” looks like for the store

An operator can:

1. Open StoreDesk on the PC with Server green in the header.
2. Use **POS** for yesterday’s sales and tax prep.
3. Use **Price Book** (live Commander + Refresh) and **Cost Analysis** to find an item and compare vendor costs.
4. Under **Settings**, sync Sheets, pair a phone, or open invoice review when needed.
5. On Buddy, scan a UPC and see best vendor / suggested sell without walking back to the office PC.

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
| `docs/mobile-flow.md` | Buddy pairing/scan (may lag live router) |
| `docs/ui-architecture.md` | Desktop UI system |
| `docs/system-map.md` | Gaps, dual-server notes, IA lock |
| `docs/sprint-plan.md` / `sprint-status.md` | Delivery status |

---

## 11. One-sentence summary

**StoreDesk is the store’s local command center for POS visibility, catalog/vendor costs, invoice-confirmed prices, and a paired phone helper — running entirely through StoreDesk Server on the LAN, without stock-count inventory.**
