# WO-20260720-cost-analysis-page

- **Status:** in_review
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** qa-verifier
- **Modules:** store-desk-electron | docs

## Goal

Add a StoreDesk Electron **Cost Analysis** page that compares Price Book PLU selling prices against vendor costs (101, Sam's Club, Global, Hackney, Gandhi, custom), emphasizing item description and **per-item** sell vs cost. Also improve Price Book list filters (name, UPC, department, clear) — **no source UI** (Commander is the only user-facing source).

## Acceptance criteria

- [x] Route + sidebar: **Cost Analysis** at `/cost-analysis`
- [x] Lists same Price Book PLU data (`/api/price-book`)
- [x] Columns emphasize name, UPC (+ mod), sell (+ per-item when sellUnit > 1), vendor case + per-item costs
- [x] Search/filter UX: one Search (name / UPC / selling price) + Department dropdown + Clear; AppBar `?q=`
- [x] Price Book filters improved; **source column/filter/chips removed from UI**
- [x] No new stock/inventory features; no Commander write-back; no Excel catalog
- [x] `npm run check` passes in `store-desk-electron`
- [x] `store-desk-electron/AGENTS.md` nav notes updated

## Out of scope

- Writing prices back to Commander (`uPLUs`)
- Restoring Excel catalog seed
- StoreDesk Buddy
- Stock / inventory quantity
- Surfacing `source` (commander/manual) in UI

## Touch list (expected)

- `store-desk-electron/src/pages/CostAnalysisPage.tsx`
- `store-desk-electron/src/pages/PriceBookPage.tsx`
- `store-desk-electron/src/utils/priceBookCost.ts`
- `store-desk-electron/src/components/AppLayout.tsx`
- `store-desk-electron/src/App.tsx`
- `store-desk-electron/src/api/client.ts`
- `store-desk-electron/src/server/services/storage.service.ts`
- `store-desk-electron/src/server/services/priceBook.service.ts`
- `store-desk-electron/src/server/routes/priceBook.routes.ts`
- `store-desk-electron/src/tests/priceBookCost.test.ts`
- `store-desk-electron/AGENTS.md`
- `docs/work-orders/WO-20260720-cost-analysis-page.md`

## Dependencies / blockers

- Price Book live SoT (Commander) already in place; Excel catalog seed removed.

## Notes

- Prefer client/shared util for per-item math; list API supports structured `search`/`q` (name|UPC|selling price) + exact `department` (+ optional internal `source` for API compat — not shown in UI).
- **Price Book list** shows PLU core only (name, UPC, mod, dept, sell, unit). Vendor slots / Sell/ea / expiry stay on **Cost Analysis** (and remain editable in the Price Book item dialog).
- Use `npm run dev:embedded` for smoke against Electron embedded server.
- **Price Book filter improvements** ship in this same WO (one Search + Department dropdown + Clear + AppLayout header `q`).
- **2026-07-20:** Commander Sync pages all PLUs (no `maxPages: 2` / 100-item default).

## Handoff log

### HO — 2026-07-20 (local)

- **From:** frontend-electron
- **To:** eng-manager / qa-verifier
- **WO:** WO-20260720-cost-analysis-page
- **State entering handoff:** in_review

#### Done
- Cost Analysis page + nav route (`/cost-analysis`)
- Shared filters: one Search (name|UPC|price) + Department dropdown; no source UI
- Price Book table expanded (sell unit, sell/ea, vendor slots, expiry)
- Shared `priceBookCost` util + tests; list API search + `/departments`
- `npm run check` passed (typecheck + 19 tests)

#### Not done
- Optional smoke with `dev:embedded`

#### Next 3 actions
1. Optional UI smoke on Cost Analysis + filters
2. Close WO after user confirm
3. (Optional) mirror list filters into standalone `store-desk-worker` later

### HO — 2026-07-22 (docs)

- **From:** docs-scribe
- **To:** eng-manager
- **Note:** Documented under `docs/verifone-commander-price-book.md`. WO status remains **in_review**.
