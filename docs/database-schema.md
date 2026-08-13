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
```

No `Inventory`, `StockMovement`, or stock-related collections.

---

## Product

| Field | Type | Notes |
|-------|------|-------|
| organizationId, storeId | string | required |
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
| organizationId, storeId | string | required |
| productId | ObjectId → Product | required |
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
| organizationId, storeId | string | required |
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
| organizationId, storeId | string | required |
| vendorId | ObjectId → Vendor | required |
| variantId | ObjectId → ProductVariant | required |
| invoiceItemId | ObjectId → InvoiceItem | optional |
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
| organizationId, storeId | string | required |
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
| organizationId, storeId | string | required |
| invoiceId, vendorId | ObjectId | required |
| lineNumber | number | |
| rawItemText, extractedName | string | |
| upc, sku, vendorItemCode | string | optional |
| quantity, quantityType | | case, each, box, pallet |
| packQuantity, unitSize, unitOfMeasure | | |
| unitPrice, lineTotal | number | |
| matchedProductId, matchedVariantId | ObjectId | optional |
| matchMethod, matchConfidence, matchReason | | |
| reviewStatus | enum | needs_review, ready_to_save, saved |
| validationErrors, validationWarnings | string[] | |

---

## ExtractionJob

| Field | Type | Notes |
|-------|------|-------|
| invoiceId | ObjectId | required |
| status | enum | queued, running, completed, failed |
| rawOutput | Mixed | extraction payload |
| warnings | string[] | |
| completedAt | string | optional |

---

## PricingRule

| Field | Type | Notes |
|-------|------|-------|
| organizationId, storeId | string | required |
| name | string | required |
| scope | enum | global, category, product, variant |
| category | string | when scope = category |
| productId, variantId | ObjectId | when scoped |
| pricingMethod | enum | margin, markup, fixed_amount, manual |
| marginPercent, markupPercent | number | optional |
| fixedAmount | number | optional |
| roundingRule | enum | none, nearest_0_05, … nearest_0_99 |
| active | boolean | default true |

---

## MobileDevice

Paired StoreDesk Buddy instance.

| Field | Type | Notes |
|-------|------|-------|
| organizationId, storeId | string | required |
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

Local overlays for Commander PLUs. 

| Field | Type | Notes |
|-------|------|-------|
| id | string | synthetic id `pb_{upc}_{mod}` |
| organizationId, storeId | string | required |
| upc | string | required, stripped leading zeros |
| upcModifier | string | default `"0"` |
| name | string | description |
| department | string | optional |
| sellingPrice | number | required |
| sellUnit | number | optional |
| source | enum | `commander`, `manual` |
| vendorSamsClub, vendorGlobal, vendorHackney, vendor101, vendorGandhi, vendorCustom | object | local cost slots |

*Persistence Note:* `appStatePersistence.service.ts` uses a compound unique key (`organizationId`, `storeId`, `upc`, `upcModifier`) when upserting to resolve `E11000` duplicate key conflicts across synced instances.
