# WO-20260720-remove-excel-catalog-seed

- **Status:** done
- **Management:** directive
- **Priority:** P1
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** tech-lead
- **Modules:** store-desk-electron | docs

## Goal

Remove the Hop-In Excel / POS retail catalog seed end-to-end (data, seed services, Catalog/Inventory page, legacy wiring). Verifone Commander is the live source of truth for Price Book PLUs.

## Acceptance criteria

- [x] `retailCatalogSeed.ts` and catalog seed builders deleted
- [x] Price Book starts empty; populate via Commander sync/lookup or manual add
- [x] Catalog/Inventory nav item and page removed (`/inventory` redirects to Price Book)
- [x] No `source: "catalog"` remaining in types/API
- [x] Storage/demo seed no longer merges 16k catalog products
- [x] `npm run check` passes in `store-desk-electron`
- [x] Same catalog seed removed from `store-desk-server` (`npm run check` passes)

## Out of scope

- Changing Commander protocol
- StoreDesk Buddy
- Full product CRUD redesign (small demo products for invoice flows remain)

## Touch list

- Deleted: Electron + Server `retailCatalogSeed.ts`, `retailCatalog.service.ts`, Electron `priceBookSeed.ts`, `InventoryPage.tsx`, `scripts/hop-in-4630-catalog.normalized.json`
- Updated: storage (both), AppLayout/App routes, Price Book UI/types, tests, docs

## Notes

User: live Commander is SoT; remove Excel catalog entirely — no page, no legacy, no data.

## Handoff log

—
