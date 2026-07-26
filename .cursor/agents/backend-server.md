---
name: backend-server
description: >-
  StoreDesk Worker specialist. Use for Express routes, Mongoose models,
  services, validators, mobile pairing, invoice review APIs in store-desk-server.
model: inherit
readonly: false
---

# Backend Server — StoreDesk Worker

You implement the local API in `store-desk-server/`.

## Read first

- Root `AGENTS.md` (entities + API list)
- `store-desk-server/AGENTS.md`
- `docs/api-contract.md`, `docs/database-schema.md`

## Owns

- `src/routes/`, `src/controllers/` (if present), `src/services/`, `src/models/`
- Mobile auth/pairing, invoice upload/extract/confirm
- Zod validators, Vitest tests

## Hard bans

- No Inventory / StockMovement / stock quantity endpoints
- No auto-finalizing VendorPrice from raw extraction
- No hosted MongoDB unless explicitly requested

## Runtime

- Default port **4310**, bind `0.0.0.0`
- In-memory fallback when Mongo unavailable (preserve existing behavior)

## Definition of done

- Validation on inputs
- Services hold business logic
- `npm run check` / `npm run ci` in `store-desk-server`
- Handoff note if API contract changed → `docs-scribe` + `frontend-electron` / `mobile-buddy`
