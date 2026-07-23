# WO-20260720-live-commander-price-book

- **Status:** in_review
- **Management:** collaborative
- **Priority:** P0
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** tech-lead, qa-verifier
- **Modules:** store-desk-electron | docs

## Goal

Stop treating **Sync into local store** as the Price Book source of truth. Commander `vPLUs` is live SoT for PLU name / UPC / mod / dept / sell / unit. Local storage holds **vendor cost overlays** (101, Sam’s, Global, Hackney, Gandhi, Custom, expiry) keyed by UPC+modifier, merged onto live Commander rows for Cost Analysis and the edit dialog.

## Acceptance criteria

- [x] Price Book list/search/department loads from live Commander (paged), not “must Sync first”
- [x] Sync button removed/demoted; default UX is open → fetch live; Refresh re-fetches
- [x] Local store mainly vendor-cost overlays; Commander fields win on merge
- [x] Price Book table stays PLU-only columns
- [x] Cost Analysis uses same live sell + local vendor costs
- [x] Search: description | UPC | price; department dropdown
- [x] Read-only toward Commander (vPLUs only; no uPLUs writes)
- [x] Clear warning when Commander not configured
- [x] Tests updated away from sync-seeded catalog assumption
- [x] `npm run check` passes in `store-desk-electron`

## Out of scope

- Writing prices back to Commander (`uPLUs`)
- StoreDesk Buddy
- Stock / inventory
- Porting this API into standalone `store-desk-server` (follow-up)

## Architecture

```txt
Price Book / Cost Analysis
        │
        ▼
GET /api/price-book  →  listLivePriceBook()
        │
        ├─ Commander vPLUs (paged / UPC lookup)  ← SoT for name, sell, dept, unit
        └─ Local overlays by upc+mod             ← vendor costs, expiry
        │
        ▼
Merged PriceBookEntry[] (+ meta: live, truncated, departments)
```

Optional `POST /api/price-book/commander/sync` remains as an **offline cache** helper only — not exposed as primary UI.

## Touch list

- `store-desk-electron/src/server/services/priceBook.service.ts`
- `store-desk-electron/src/server/services/commanderPlu.service.ts`
- `store-desk-electron/src/server/routes/priceBook.routes.ts`
- `store-desk-electron/src/api/client.ts`
- `store-desk-electron/src/pages/PriceBookPage.tsx`
- `store-desk-electron/src/pages/CostAnalysisPage.tsx`
- `store-desk-electron/src/components/PriceBookFilterBar.tsx`
- `store-desk-electron/src/tests/priceBook.test.ts`
- `store-desk-electron/AGENTS.md`
- `docs/work-orders/WO-20260720-live-commander-price-book.md`

## Notes

- Browse without search: pages until `limit` (default 500) for snappy open; UI notes truncation and prompts search.
- UPC-like search (`^\d{4,}$`): targeted Commander lookup.
- Name/price/department filters: page Commander and filter in memory until limit matches.
- Use **`npm run dev:embedded`** with `COMMANDER_*` env.

## Handoff log

### HO — 2026-07-20 (live Commander SoT)

- **From:** frontend-electron
- **To:** eng-manager / user
- **WO:** WO-20260720-live-commander-price-book
- **State entering handoff:** in_review

#### Done
- Live `listLivePriceBook` + overlay merge
- Sync demoted; Refresh is primary re-fetch
- Price Book + Cost Analysis UI updated
- Tests for merge / unconfigured / mocked live list

#### Not done
- Live smoke against real store PLU count
- Mirror into `store-desk-server`

#### Next 3 actions
1. Smoke with `dev:embedded` + COMMANDER_*
2. qa-verifier `npm run check`
3. Close WO after user confirm

### HO — 2026-07-22 (docs)

- **From:** docs-scribe
- **To:** eng-manager
- **WO:** WO-20260720-live-commander-price-book
- **Note:** Integration documented in `docs/verifone-commander-price-book.md` (`WO-20260722-commander-price-book-docs`). Implementation status remains **in_review** pending live smoke / user close.
