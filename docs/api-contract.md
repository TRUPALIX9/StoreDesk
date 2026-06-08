# StoreDesk API Contract

Base URL: `http://<host>:4310` (default port **4310**).

JSON request/response bodies unless noted. Errors return `{ "error": "message" }` with appropriate HTTP status.

## General

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server and database mode |
| GET | `/api/server-info` | Version, port, local URLs |

## Products

| Method | Path |
|--------|------|
| GET | `/api/products` |
| POST | `/api/products` |
| GET | `/api/products/:id` |
| PUT | `/api/products/:id` |
| DELETE | `/api/products/:id` |
| GET | `/api/products/search?q=` |

## Variants

| Method | Path |
|--------|------|
| GET | `/api/variants` |
| POST | `/api/variants` |
| GET | `/api/variants/:id` |
| PUT | `/api/variants/:id` |
| DELETE | `/api/variants/:id` |
| GET | `/api/variants/by-code/:code` |
| GET | `/api/variants/:id/barcode` |

## Vendors

| Method | Path |
|--------|------|
| GET | `/api/vendors` |
| POST | `/api/vendors` |
| GET | `/api/vendors/:id` |
| PUT | `/api/vendors/:id` |
| DELETE | `/api/vendors/:id` |

## Vendor prices

Alias: `/api/prices` mirrors `/api/vendor-prices`.

| Method | Path |
|--------|------|
| GET | `/api/vendor-prices` |
| POST | `/api/vendor-prices` |
| GET | `/api/vendor-prices/:id` |
| PUT | `/api/vendor-prices/:id` |
| DELETE | `/api/vendor-prices/:id` |
| GET | `/api/vendor-prices/by-variant/:variantId` |
| GET | `/api/vendor-prices/best/:variantId` |
| GET | `/api/vendor-prices/history/:variantId` |

## Invoices

| Method | Path |
|--------|------|
| POST | `/api/invoices/upload` | multipart file |
| GET | `/api/invoices` |
| GET | `/api/invoices/:id` |
| POST | `/api/invoices/:id/extract` |
| GET | `/api/invoices/:id/items` |
| PUT | `/api/invoice-items/:id` |
| POST | `/api/invoices/:id/confirm-prices` |

## Review queue

| Method | Path |
|--------|------|
| GET | `/api/review-queue` |

## Pricing (planned)

| Method | Path |
|--------|------|
| GET | `/api/pricing-rules` |
| POST | `/api/pricing-rules` |
| PUT | `/api/pricing-rules/:id` |
| DELETE | `/api/pricing-rules/:id` |
| POST | `/api/pricing/calculate` |
| GET | `/api/pricing/suggestion/:variantId` |

## Mobile (Bearer token after pairing)

| Method | Path |
|--------|------|
| GET | `/api/mobile/health` |
| POST | `/api/mobile/pair/request` |
| POST | `/api/mobile/pair/confirm` |
| GET | `/api/mobile/products/by-code/:code` |
| GET | `/api/mobile/products/search?q=` |
| GET | `/api/mobile/products/:productId` |
| GET | `/api/mobile/variants/:variantId` |
| GET | `/api/mobile/variants/:variantId/barcode` |
| GET | `/api/mobile/vendor-prices/:variantId` |
| GET | `/api/mobile/vendor-prices/:variantId/best` |
| GET | `/api/mobile/pricing/suggestion/:variantId` |
| GET | `/api/mobile/vendors` |
| POST | `/api/mobile/invoices/upload` |
| GET | `/api/mobile/invoices/:invoiceId/status` |
| GET | `/api/mobile/review-queue` |

## Invoice confirm rule

`POST /api/invoices/:id/confirm-prices` creates **VendorPrice** records only. It must not create or update inventory.
