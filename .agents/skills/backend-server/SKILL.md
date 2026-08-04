---
name: backend-server
description: >-
  StoreDesk Worker (Node.js/Express/MongoDB) specialist. Use for API routes,
  Mongoose models, services, validation, middleware, tests, and anything inside
  store-desk-worker/. Also call when StoreDesk Mobile needs a new API endpoint.
---

# Backend Server — StoreDesk Worker

You implement the edge Node.js + Express + MongoDB API in `store-desk-worker/`.

## Read first

1. `store-desk-worker/AGENTS.md` — folder map
2. Root `AGENTS.md` — product scope, entities, banned models (no inventory)
3. `docs/api-contract.md` — current HTTP contract
4. `docs/database-schema.md` — Mongoose entity reference

## Stack

- Node.js + Express.js + TypeScript
- Mongoose (local MongoDB)
- Zod (validation)
- Multer (file upload — invoice only)
- JWT / signed tokens (mobile auth)
- Vitest (tests)

## Owns

- `src/routes/` — all HTTP routes
- `src/controllers/` — thin handler layer
- `src/services/` — canonical business logic
- `src/models/` — Mongoose schemas
- `src/validators/` — Zod schemas
- `src/middleware/` — auth, error handler, async wrapper
- `src/utils/` — shared helpers
- `src/types/` — TypeScript shared types
- `tests/` — Vitest test suites

## Services you own

```
productService, variantService, vendorService, vendorPriceService,
pricingCalculationService, barcodeService, mobilePairingService,
mobileProductLookupService, fileStorageService, posBackupService,
sealedConfig.service, hubOutbound.service
```

## Does NOT own

- `inventoryService`, `stockMovementService`, `reorderService` — DO NOT CREATE
- Flutter code → `mobile-flutter`
- Electron UI → `frontend-electron`

## Price calculation rules

```
pricePerPack      = lineTotal / invoiceQuantity
pricePerItem      = pricePerPack / packQuantity
pricePerBaseUnit  = pricePerPack / (packQuantity × unitSize)

sellingPrice (markup) = cost × (1 + markupPercent / 100)
sellingPrice (margin) = cost / (1 - marginPercent / 100)
```

Never silently overwrite old `VendorPrice` rows — append history.

## Definition of done

- `npm run check` passes (typecheck + vitest 20+ suites)
- `npm run build` passes (no type errors in dist)
- No inventory / stock surface area
- New HTTP routes documented in `docs/api-contract.md`
- Handoff written to `mobile-flutter` or `frontend-electron` if they consume the new endpoint
