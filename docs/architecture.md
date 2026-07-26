# StoreDesk Architecture

Local-first system for convenience stores and gas stations. Three apps share one API.

## Components

| Component | Tech | Role |
|-----------|------|------|
| **StoreDesk** | Electron + React + MUI | Desktop admin UI |
| **StoreDesk Worker** | Node.js + Express + MongoDB | Local API on port 4310 |
| **StoreDesk Buddy** | Flutter | Mobile scanning and invoice upload |

## Data flow

```txt
Desktop / Mobile UI
        ↓ HTTP (JSON)
StoreDesk Worker (Express)
        ↓
MongoDB (local)  — or in-memory store when MONGO_URI is unset
```

## Deployment model

- Server binds `0.0.0.0:4310` so phones on the same Wi‑Fi can reach it.
- Electron currently embeds a copy of the server; the standalone `store-desk-server` package is the long-term home for the API.
- Uploaded invoice files land on disk under `uploads/` (Multer).

## Scope boundaries

**In scope:** products, variants, vendors, vendor prices, invoices, extraction review, pricing suggestions, mobile pairing.

**Out of scope:** inventory quantities, stock movements, reorder levels, warehouse locations.

## Authentication

- Desktop talks to the server on localhost without tokens (trusted LAN admin).
- StoreDesk Buddy pairs via a 6-digit code; successful pairing yields a bearer token checked by `mobileAuth` middleware.

## Key services

| Service | Purpose |
|---------|---------|
| `priceCalculation.service` | price per pack / item / base unit |
| `productMatching.service` | UPC, SKU, vendor code, name matching |
| `vendorPrice.service` | best price and history per variant |
| `invoiceConfirm.service` | confirmed rows → `VendorPrice` only |
| `mobile.service` | pairing codes and device tokens |
| `pricingSuggestion.service` | margin/markup selling price |

See `database-schema.md` and `api-contract.md` for details.
