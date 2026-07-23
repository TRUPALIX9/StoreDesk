# WO-20260720-electron-price-book-plu

- **Status:** superseded — see `WO-20260720-live-commander-price-book.md`
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** tech-lead
- **Modules:** store-desk-electron | docs

## Goal

Wire Verifone Commander PLU (NAXML `vPLUs`) into the Electron **Price Book** page end-to-end: list/search seeded catalog PLUs, look up live Commander prices, optional sync — Electron only (no Buddy).

## Acceptance criteria

- [x] Price Book is a first-class sidebar item
- [x] `GET/POST/PUT /api/price-book` works on Electron embedded server
- [x] Price Book seeds from retail catalog PLUs (UPC + modifier + retail)
- [x] Live Commander UPC lookup works when `COMMANDER_*` env is set
- [x] Optional Commander sync upserts PLUs into Price Book (read-only; no `uPLUs` writes)
- [x] `npm run check` passes in `store-desk-electron`

## Out of scope

- StoreDesk Buddy
- Writing prices back to Commander (`uPLUs`)
- Inventory / stock quantity
- Hardcoding Commander passwords in the repo

## Touch list

- `store-desk-electron/src/server/services/priceBook.service.ts`
- `store-desk-electron/src/server/services/priceBookSeed.ts`
- `store-desk-electron/src/server/services/commanderPlu.service.ts`
- `store-desk-electron/src/server/routes/priceBook.routes.ts`
- `store-desk-electron/src/server/services/storage.service.ts`
- `store-desk-electron/src/server/index.ts`
- `store-desk-electron/src/pages/PriceBookPage.tsx`
- `store-desk-electron/src/components/AppLayout.tsx`
- `store-desk-electron/src/api/client.ts`
- `store-desk-electron/src/shared/types.ts`
- `store-desk-electron/src/tests/priceBook.test.ts`

## Notes

Use **`npm run dev:embedded`**. Default `npm run dev` talks to external `store-desk-server`, which does not yet have these routes.

```txt
COMMANDER_HOST=https://192.168.31.11
COMMANDER_USER=MANAGER
COMMANDER_PASSWORD=***
```

**2026-07-20 follow-up:** Commander Sync no longer caps at `pageSize: 50 × maxPages: 2` (=100). UI/API omit `maxPages` by default and page until Commander `ofPages` is exhausted. Price Book table shows PLU core fields only (name, UPC, mod, dept, sell, unit); vendor cost / Sell/ea / expiry columns live on Cost Analysis.

## Handoff log

### HO — 2026-07-20 (local)

- **From:** frontend-electron
- **To:** eng-manager / user
- **WO:** WO-20260720-electron-price-book-plu
- **State entering handoff:** in_review

#### Done
- Price Book sidebar + PLU columns (UPC, mod, dept, retail, source)
- Embedded `/api/price-book` CRUD + catalog seed
- Commander status / lookup / sync (read-only)
- Tests: `src/tests/priceBook.test.ts`

#### Not done
- Port Price Book API into standalone `store-desk-server`
- Write-back to Commander (`uPLUs`)

#### Next 3 actions
1. Smoke with `npm run dev:embedded` + COMMANDER_*
2. Optionally mirror into store-desk-server
3. Close WO after user confirms

### HO — 2026-07-20 (sync-all + table trim)

- **From:** frontend-electron
- **To:** eng-manager / user
- **WO:** WO-20260720-electron-price-book-plu
- **State entering handoff:** in_review

#### Done
- Uncapped Commander sync (page until `ofPages`; default pageSize 50)
- Price Book table: PLU-only columns; cost/vendor columns removed from list
- Paging unit tests + `npm run check`

#### Not done
- Live smoke against real Commander PLU count
- Port sync defaults into standalone `store-desk-server` if mirrored later

#### Next 3 actions
1. Smoke Sync with `dev:embedded` + COMMANDER_* and confirm upserted ≫ 100
2. Close WO after user confirm
3. Optional: mirror Price Book sync into store-desk-server
