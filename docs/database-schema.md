# StoreDesk Database Schema

MongoDB collections (Mongoose). All documents use `createdAt` / `updatedAt` unless noted.

## Collections

```txt
Product
ProductVariant
Vendor
VendorPrice
Invoice
InvoiceItem
ExtractionJob
PricingRule
MobileDevice
PriceBookEntry
POSDailySummary
Transaction
IntegrationSettings
```

No `Inventory`, `StockMovement`, or stock-related collections.

---

## Product

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| name | string | indexed, text search |
| brand | string | indexed |
| category | string | indexed |
| description | string | optional |
| defaultUnit | string | default `each` |
| normalPrice | number | manual selling reference |
| active | boolean | default true |

---

## ProductVariant

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| productId | string → Product | required |
| variantName | string | e.g. "12 Pack - 12 oz cans" |
| upc | string | sparse unique |
| sku | string | sparse |
| vendorItemCode | string | sparse |
| packQuantity | number | default 1 |
| unitSize | number | default 1 |
| unitOfMeasure | string | default `each` |
| caseQuantity | number | default 1 |
| totalBaseUnits | number | `packQuantity × unitSize` |
| barcode | string | generated internal barcode |
| notes | string | optional |
| active | boolean | default true |

---

## Vendor

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| name | string | required, text search |
| contactPerson, phone, email, address, website | string | optional |
| paymentTerms | string | optional |
| notes | string | optional |
| lastOrderDate | string | optional |
| active | boolean | default true |

---

## VendorPrice

Price history per vendor + variant. Never silently overwrite old rows; use `isCurrentPrice`.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| vendorId | string → Vendor | required |
| variantId | string → ProductVariant | required |
| invoiceItemId | string → InvoiceItem | optional |
| priceDate | string | ISO date |
| quantity | number | invoice quantity basis |
| packQuantity, unitSize, unitOfMeasure | | from matched variant |
| lineTotal, unitPrice | number | |
| pricePerPack, pricePerItem, pricePerBaseUnit | number | calculated |
| isCurrentPrice | boolean | indexed |

Index: `{ vendorId, variantId, isCurrentPrice }`

---

## Invoice

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| vendorId, vendorName | | required |
| invoiceNumber | string | optional |
| invoiceDate | string | required |
| status | enum | uploaded, extracting, needs_review, saved, failed |
| fileName, filePath | string | upload metadata |
| subtotal, tax, discount, totalAmount | number | |
| confidence | number | extraction confidence |
| warnings | string[] | |

---

## InvoiceItem

One extracted invoice row.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| invoiceId, vendorId | string | required |
| lineNumber | number | |
| rawItemText, extractedName | string | |
| upc, sku, vendorItemCode | string | optional |
| quantity, quantityType | | case, each, box, pallet |
| packQuantity, unitSize, unitOfMeasure | | |
| unitPrice, lineTotal | number | |
| matchedProductId, matchedVariantId | string | optional |
| matchMethod, matchConfidence, matchReason | | |
| reviewStatus | enum | needs_review, ready_to_save, saved |
| validationErrors, validationWarnings | string[] | |

---

## ExtractionJob

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| invoiceId | string | required |
| status | enum | queued, running, completed, failed |
| rawOutput | Mixed | extraction payload |
| warnings | string[] | |
| completedAt | string | optional |

---

## PricingRule

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| name | string | required |
| scope | enum | global, category, product, variant |
| category | string | when scope = category |
| productId, variantId | string | when scoped |
| pricingMethod | enum | margin, markup, fixed_amount, manual |
| marginPercent, markupPercent | number | optional |
| fixedAmount | number | optional |
| roundingRule | enum | none, nearest_0_05, … nearest_0_99 |
| active | boolean | default true |

---

## MobileDevice

Paired StoreDesk Mobile instance.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| deviceName | string | |
| deviceType | string | e.g. android, ios |
| deviceId | string | optional hardware id |
| pairingCode | string | indexed, expires |
| pairingExpiresAt | Date | |
| accessTokenHash | string | never store raw token |
| permissions | object | canScanProducts, canUploadInvoices, canViewPrices, canViewPricingRules |
| lastSeenAt | Date | optional |
| active | boolean | default true |

---

## PriceBookEntry

Persistent local database-backed price book collection seeded from Commander PLU backups and local overlays.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| upc | string | indexed, required |
| upcModifier | string | default `0`, indexed |
| name | string | required, text search |
| department | string | indexed |
| sellUnit | number | default 1 |
| source | string | e.g. `commander`, `manual` |
| sellingPrice | number | required |
| expiryDate | string | optional |
| vendorSamsClub, vendorGlobal, vendorHackney, vendor101, vendorGandhi, vendorCustom | Mixed | vendor cost overlays |

Unique Index: `{ organizationId, storeId, upc, upcModifier }`

---

## POSDailySummary

Aggregated register daily sales metrics, tax totals, shift breakdowns, and department sales.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| date | string | YYYY-MM-DD format, indexed |
| totalSales, creditCard, cash, gas, lottery | number | register metrics |
| saleTax, highTax, lowTax | number | tax totals |
| departmentSales | Array | department name, amount, item count |

Unique Index: `{ organizationId, storeId, date }`

---

## Transaction

Real-time POS register itemized transactions.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| transactionId | string | required, indexed |
| amount, time | | transaction timestamp & total |
| type | enum | `Card`, `Cash` |
| items | Array | item name, quantity, price, upc, category |
| salesTax, highTax, lowTax | number | tax breakdown |

Index: `{ organizationId, storeId, time: -1 }`

---

## IntegrationSettings

Persisted POS integration configuration, Commander IP/credentials, and import tracking.

| Field | Type | Notes |
|-------|------|-------|
| _id | string | required |
| organizationId, storeId | string | required, indexed |
| commander | object | `host`, `username`, `password` |
| lastImportSource, lastImportAt | string | sync metadata |
