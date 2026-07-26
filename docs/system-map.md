# StoreDesk system map & gap fill plan

Team review for `WO-20260713-system-flow-gap-redesign`.
Owners: eng-manager (coord), tech-lead, frontend-electron, backend-server, mobile-buddy, ui-ux-designer, docs-scribe.

## Product IA (locked)

Desktop sidebar (current Electron nav):

1. Point of Sale (`/pos`)  
2. POS Reports (`/pos/reports`) — Ruby `vrubyrept`  
3. Transactions (`/pos/transactions`) — T-Log `vtransset`  
4. Price Book (`/price-book`) — live Commander PLUs  
5. Cost Analysis (`/cost-analysis`) — sell vs vendor costs  
6. Settings  

Commander E2E: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md), [`verifone-commander-reports.md`](./verifone-commander-reports.md). LLM brief: [`storedesk-gemini-project-brief.md`](./storedesk-gemini-project-brief.md).

## Dual Express — why it exists (and why it’s a problem)

There are **not two products**. There is one API on port **4310**, but historically **two copies of the code**:

| Copy | Where | When it runs |
|------|--------|----------------|
| **StoreDesk Worker** (canonical) | `store-desk-worker/` | `npm run dev` in that repo — what Buddy + default Electron use |
| **Embedded Electron server** | `store-desk-electron/src/server/` | Only if you run `npm run dev:embedded` / `dev:server` inside Electron |

**Why it was added:** Early on, Electron could start its own API so desktop alone worked without the sibling server repo. That helped solo desktop demos.

**What you should use today:** one server — **`store-desk-worker`** on `4310`. Electron’s default `npm run dev` is `dev:external` and expects that.

**Why keep calling it a gap:** the embedded copy is a fork. Features (Price Book, Mongo blob persist) can land on one and not the other. Two processes fighting over `4310` also fails. Recommendation: keep **only** `store-desk-worker`; treat Electron `src/server` as legacy until removed.

## How the system connects

```txt
StoreDesk (Electron React)
  └─ HTTP JWT  →  StoreDesk Worker :4310  (0.0.0.0)
                      ├─ memory arrays (+ optional Mongo AppState blob)
                      └─ files / downloads

StoreDesk Mobile (Flutter)
  └─ Wi‑Fi LAN  →  same Server /api/mobile/*  (device Bearer token)
```

| Client | Talks to | Must not |
|--------|----------|----------|
| Electron | `localhost:4310` or Vite `/api` proxy | Mongo directly |
| Buddy | `http://LAN_IP:4310` | `localhost` on phone; Mongo |

Default Electron `npm run dev` expects **external** `store-desk-worker`. Embedded `src/server` still exists and can drift (Price Book / persistence).

## Core journeys

1. **Price Book (Commander)** — Live `vPLUs` list/search + local vendor overlays; Refresh (not Sync-first). Cost Analysis compares sell vs vendor costs. Details: [`verifone-commander-price-book.md`](./verifone-commander-price-book.md)  
2. **Invoice truth** — Upload → extract (stub) → Review → Confirm → VendorPrice history  
3. **POS ops** — Sheets sync → daily table/analytics → Georgia sale tax. Live Commander: **POS Reports** (Ruby) + **Transactions** (`vtransset`) — see [`verifone-commander-reports.md`](./verifone-commander-reports.md).  
4. **Buddy pair** — Desktop Mobile Access QR → Buddy `/link` → then POS/Price Book shell today  

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
| P0 | Invoice extraction is sample-only | backend-server | Real PDF/OCR path |
| P0 | Buddy Home removed; Inventory naming | mobile-buddy + ui-ux | Restore helper home; rename Products |
| P1 | Spec API aliases (`confirm-prices`, DELETE, mobile product/variant) | tech-lead + backend | Aliases + missing routes |
| P1 | Orphan Electron pages (Products CRUD, Variants, Price Comparison) | frontend-electron | Wire or delete |
| P1 | Mongo models unused (blob only) | tech-lead | Decide blob vs collections |
| P2 | Settings still holds Sheets/GTC | frontend-electron | Move under POS |
| P2 | Docs drift (`mobile-flow`, README) | docs-scribe | Update to real routes |
| P3 | Mobile permissions / token hash / devices auth | backend-server | Harden pairing |

## Already applied this WO (frontend IA)

- Sidebar restored to product flow: Dashboard, POS, Products, Price Book, Vendors, Invoice Upload, Review Queue, Mobile, Settings  
- Default route → `/dashboard` (not only POS)  
- Settings “More tools” demoted to Pricing rules / Vendor prices / Lottery only  

## Next WOs to open

1. `WO-…-single-server` — consolidate Express  
2. `WO-…-real-extraction` — replace sample invoice rows  
3. `WO-…-buddy-home` — restore scan-first Buddy IA  
4. `WO-…-catalog-unify` — Price Book vs Product/Variant decision + orphans  

Explore notes: [Electron](d43b2eb6-4978-4a10-91d8-1860bd5294b5) · [Server](1225cdf3-450e-4e2b-a5d3-b6c0027b01bd) · [Buddy](4d9e0b5b-d483-474e-b368-22f34a9f8b92)
