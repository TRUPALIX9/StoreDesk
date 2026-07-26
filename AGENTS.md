# StoreDesk Master Cursor Prompt

You are building **StoreDesk**, a local-first desktop and mobile system for convenience stores and gas stations.

This project includes:

1. **StoreDesk**  
   Main Electron desktop admin app.

2. **StoreDesk Worker**  
   Edge Node.js + Express + local MongoDB API on the store PC (not a hosted cloud server).

3. **StoreDesk Mobile**  
   Flutter mobile helper app.

The goal is to build a professional, themed, production-quality app for:

- Product setup
- Product variant setup
- UPC/barcode lookup
- Vendor management
- Vendor price comparison
- Invoice upload
- Invoice extraction review
- Suggested selling/setup prices
- Mobile barcode scanning
- Mobile invoice upload
- Future lottery setup

This is **not** a stock-count inventory system.

Do not build:

- Stock quantity
- Current stock
- Add stock
- Reduce stock
- Low stock alerts
- Reorder levels
- Warehouse locations
- Stock movements
- Inventory adjustment

---

# Product Naming

Use this branding:

```txt
Main Desktop App: StoreDesk
Mobile App: StoreDesk Mobile
Edge Worker / API: StoreDesk Worker
Web: StoreDesk Web
Cloud Hub: StoreDesk Cloud Hub
```

Do not call the mobile app “StoreDesk Buddy.”
Do not call the edge API “StoreDesk Server” — it is **StoreDesk Worker** (folder/repo `store-desk-worker/`).
Use **StoreDesk Mobile** and **StoreDesk Worker** in product copy.

---

# Main Goal

Build a local-first system where the store owner can:

1. Add products.
2. Add product variants such as 12 pack, 24 pack, 8 oz, 1 gal, 500 ct, etc.
3. Add vendors.
4. Save vendor prices manually.
5. Upload invoices from desktop or mobile.
6. Review extracted invoice items before saving.
7. Match invoice items by UPC, SKU, vendor code, internal barcode, or name.
8. Save confirmed vendor price history.
9. Compare true cost across vendors.
10. Calculate price per pack, price per item, and price per base unit.
11. Suggest a selling price using margin or markup rules.
12. Pair StoreDesk Mobile mobile app using QR.
13. Let the phone scan barcodes, search products, compare prices, and upload invoices.

---

# Tech Stack

## Desktop: StoreDesk

Use:

- Electron
- React
- TypeScript
- Vite
- Material UI
- Material React Table
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts or ApexCharts later for charts
- Electron Builder later for packaging

## Backend: StoreDesk Worker

Use:

- Node.js
- Express.js
- TypeScript
- MongoDB local
- Mongoose
- Multer for file upload
- Zod for validation
- JWT or secure signed token for mobile authentication
- Vitest for testing

## Mobile: StoreDesk Mobile

Use:

- Flutter
- Dart
- Material 3 theme
- go_router
- flutter_riverpod
- dio
- flutter_secure_storage
- mobile_scanner
- image_picker
- file_picker
- barcode_widget
- intl

---

# UI/UX Theme Requirements

StoreDesk must look like a professional admin dashboard for convenience stores and gas stations.

## Desktop Theme

Use a clean Material UI admin layout.

Style:

- Light mode first
- Dark mode later
- Left sidebar
- Top status bar
- Soft gray background
- White cards
- Clean tables
- Rounded buttons
- Status badges
- Clear dialogs
- Strong search/filter experience

Suggested colors:

- Primary: deep navy or deep blue
- Accent: green
- Warning: amber
- Error: red
- Background: light gray
- Card: white
- Text: dark gray

Theme structure must be centralized.

Create a theme folder that conceptually supports:

- Palette
- Typography
- Spacing
- Shadows
- Component overrides
- Light theme
- Future dark theme

Do not hardcode random colors inside pages.

## Mobile Theme

StoreDesk Mobile must feel simple and fast.

Style:

- Large buttons
- Simple cards
- Clean scan flow
- Easy one-hand use
- Minimal typing
- Clear connection status
- Clear "Best Vendor" badge
- Clear suggested selling price

---

# Local Connection Rule

StoreDesk Mobile must never connect directly to MongoDB.

Correct connection:

```txt
StoreDesk Mobile
    ↓
Local Wi-Fi API URL
    ↓
StoreDesk Worker
    ↓
MongoDB Local
```

The mobile app connects to the local backend using a URL like:

```txt
http://192.168.1.25:4000
```

Important:

- The desktop/server computer must be on.
- The backend server must be running.
- The phone must be on the same Wi-Fi.
- The firewall must allow the backend port.
- The phone must use the computer's local IP.
- Do not use localhost on the phone because localhost means the phone itself.

---

# QR Requirements

StoreDesk desktop must provide two different QR codes.

## QR 1: Android APK Download QR

This QR lets an Android phone download the StoreDesk Mobile APK.

Example target:

```txt
http://192.168.1.25:4000/downloads/storedesk-buddy.apk
```

Desktop should label this clearly:

```txt
Download StoreDesk Mobile for Android
```

Important:

- APK is only for Android.
- iPhone cannot install APK.
- iPhone support should be documented as TestFlight, App Store, or local Xcode install later.

## QR 2: Mobile Pairing QR

This QR connects the installed StoreDesk Mobile app to StoreDesk Worker.

It should contain:

- Server URL
- Pairing code
- Expiration time
- Permissions

Example QR data concept:

```txt
serverUrl: http://192.168.1.25:4000
pairingCode: 842193
expiresAt: date/time
```

Mobile flow:

1. User installs StoreDesk Mobile.
2. User opens StoreDesk Mobile.
3. User taps "Scan Pairing QR."
4. User scans QR from StoreDesk desktop.
5. App saves server URL and token.
6. App is ready.

---

# Repository Structure

StoreDesk uses a **parent Git repository with Git submodules**.

```txt
StoreDesk/                         # parent Git repo (this workspace root when cloned)
├── store-desk-electron/           # submodule — StoreDesk desktop
├── store-desk-worker/             # submodule — StoreDesk Worker
├── store-desk-mobile/             # submodule — StoreDesk Mobile
├── store-desk-web/                # submodule — StoreDesk Web (licenses)
├── store-desk-cloud-backend/      # submodule — Cloud Hub (WSS)
├── brand-kit/                     # logos + icon
├── docs/
├── scripts/
├── AGENTS.md
├── README.md
├── .gitmodules
└── .cursor/
```

GitHub remotes:

- Parent: `https://github.com/TRUPALIX9/StoreDesk.git`
- Electron: `https://github.com/TRUPALIX9/store-desk-electron.git`
- Worker: `https://github.com/TRUPALIX9/store-desk-worker.git`
- Mobile: `https://github.com/TRUPALIX9/store-desk-mobile.git`
- Web: `https://github.com/storedesk-dev/StoreDesk-web.git`
- Cloud Hub: `https://github.com/TRUPALIX9/store-desk-cloud-backend.git` (Epic 1)

Rules:

- **Use Git submodules** — do not merge app repos into the parent codebase.
- Do **not** convert to an npm/pnpm monorepo unless explicitly asked.
- Do **not** rename the app submodule folders (`store-desk-electron`, `store-desk-worker`, `store-desk-mobile`, `store-desk-web`, `store-desk-cloud-backend`) unless explicitly asked.
- Do **not** rewrite or delete Git history.
- Make app-specific code changes **inside the correct submodule**.
- Commit submodule changes inside the submodule, push, then update the parent submodule pointer.
- Clone with `git clone --recurse-submodules` or run `git submodule update --init --recursive`.

---

# Desktop App Structure

Inside `store-desk-electron`, use this structure:

```txt
store-desk-electron/
├── src/
│   ├── app/
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── features/
│   ├── api/
│   ├── hooks/
│   ├── theme/
│   ├── types/
│   └── utils/
│
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   └── ipc/
│
└── tests/
```

Required desktop pages:

```txt
Dashboard
Products
Product Variants
Vendors
Vendor Prices
Invoice Upload
Review Queue
Price Comparison
Pricing Rules
Lottery Setup
Mobile Access
Settings
```

---

# Server Structure

Inside `store-desk-worker`, use this structure:

```txt
store-desk-worker/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── validators/
│   ├── middleware/
│   ├── utils/
│   └── types/
│
└── tests/
```

Required backend services:

```txt
productService
variantService
vendorService
vendorPriceService
invoiceExtractionService
invoiceReviewService
productMatchingService
pricingCalculationService
barcodeService
mobilePairingService
mobileProductLookupService
mobileInvoiceUploadService
fileStorageService
```

Do not create:

```txt
inventoryService
stockMovementService
reorderService
```

---

# Mobile App Structure

Inside `store-desk-mobile`, use this structure:

```txt
store-desk-mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/
│   │   ├── storage/
│   │   ├── theme/
│   │   └── utils/
│   │
│   ├── router/
│   │
│   ├── features/
│   │   ├── connection/
│   │   ├── home/
│   │   ├── scanner/
│   │   ├── products/
│   │   ├── invoices/
│   │   └── settings/
│   │
│   └── shared/
│       └── widgets/
│
├── android/
├── ios/
├── pubspec.yaml
└── test/
```

Required mobile screens:

```txt
Connect Screen
Pairing Screen
Home Screen
Scanner Screen
Product Result Screen
Vendor Prices Screen
Product Search Screen
Upload Invoice Screen
Show Barcode Screen
Settings Screen
```

---

# Database Entities

Use these MongoDB collections only:

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

Do not create:

```txt
Inventory
StockMovement
Warehouse
Reorder
StockAdjustment
```

---

# Entity Understanding

## Product

Represents the main product.

Examples:

```txt
Coca Cola
Red Bull
Marlboro
Doritos
Milk
Lottery Scratch Ticket
```

Product fields should support:

```txt
Name
Normalized name
Brand
Category
Description
Default unit
Target margin
Target markup
Suggested selling price
Manual selling price
Notes
Active/inactive
```

## ProductVariant

Represents a specific size, pack, or barcode version.

Examples:

```txt
Coca Cola - 12 Pack - 12 oz cans
Coca Cola - 24 Pack - 12 oz cans
Red Bull - 24 Pack - 8.4 oz cans
Milk - 1 Gallon
Gloves - 100 ct box
```

Variant fields should support:

```txt
Product reference
Variant name
Normalized variant name
UPC
SKU
Internal code
Generated barcode value
Barcode format
Vendor item codes
Pack quantity
Unit size
Unit of measure
Total base units
Target margin
Target markup
Suggested selling price
Manual selling price
Notes
Active/inactive
```

Important calculation:

```txt
totalBaseUnits = packQuantity × unitSize
```

## Vendor

Represents where items are bought from.

Examples:

```txt
Costco
Restaurant Depot
Local Beverage Vendor
Tobacco Distributor
Grocery Supplier
Lottery Supplier
```

Vendor fields should support:

```txt
Name
Normalized name
Contact person
Phone
Email
Address
Website
Payment terms
Delivery terms
Minimum order amount
Notes
Active/inactive
```

## VendorPrice

Represents a vendor's price for a product variant.

It must keep price history.

Never overwrite old prices silently.

VendorPrice fields should support:

```txt
Product reference
Variant reference
Vendor reference
Invoice reference optional
Invoice item reference optional
Price
Currency
Quantity basis
Quantity type
Pack quantity
Unit size
Unit of measure
Price per pack
Price per item
Price per base unit
Effective date
Is current price
Source
Confidence
Notes
```

## Invoice

Represents an uploaded invoice.

Invoice fields should support:

```txt
Vendor reference
Invoice number
Invoice date
Upload date
File name
File type
File path
Subtotal
Tax
Discount
Total amount
Extraction status
Extraction confidence
Raw text
Extraction JSON
Upload source
Notes
```

Upload source can be:

```txt
desktop
mobile
```

## InvoiceItem

Represents one extracted row from an invoice.

InvoiceItem fields should support:

```txt
Invoice reference
Vendor reference
Line number
Raw item text
Extracted name
Normalized extracted name
UPC
SKU
Vendor item code
Matched product reference
Matched variant reference
Match method
Match confidence
Invoice quantity
Quantity type
Pack quantity
Unit size
Unit of measure
Unit price
Line total
Calculated price per pack
Calculated price per item
Calculated price per base unit
Review status
User edited
Notes
```

Review statuses:

```txt
matched
needs_review
new_product
duplicate_possible
invalid
ready_to_save
saved
```

## PricingRule

Supports selling price setup.

Pricing rule fields should support:

```txt
Name
Scope
Category
Product reference
Variant reference
Pricing method
Margin percent
Markup percent
Fixed amount
Rounding rule
Active/inactive
```

Scopes:

```txt
global
category
product
variant
```

Pricing methods:

```txt
margin
markup
fixed_amount
manual
```

Rounding rules:

```txt
none
nearest_0_05
nearest_0_10
nearest_0_25
nearest_0_50
nearest_0_99
```

## MobileDevice

Represents paired StoreDesk Mobile devices.

MobileDevice fields should support:

```txt
Device name
Device type
Device ID optional
Pairing code
Pairing expiration
Access token hash
Permissions
Last seen date
Active/inactive
```

Permissions:

```txt
canScanProducts
canUploadInvoices
canViewPrices
canViewPricingRules
```

Do not include stock permissions.

---

# Core Calculations

## Vendor cost calculations

Use these formulas:

```txt
pricePerPack = lineTotal / invoiceQuantity

pricePerItem = pricePerPack / packQuantity

pricePerBaseUnit = pricePerPack / (packQuantity × unitSize)
```

Use `pricePerBaseUnit` to compare true vendor cost.

## Markup selling price

```txt
sellingPrice = cost × (1 + markupPercent / 100)
```

## Margin selling price

```txt
sellingPrice = cost / (1 - marginPercent / 100)
```

Reject invalid margins greater than or equal to 100%.

---

# Invoice Workflow

Invoices from desktop or mobile must follow this workflow:

```txt
Upload invoice
    ↓
Create Invoice
    ↓
Create ExtractionJob
    ↓
Extract invoice data
    ↓
Create InvoiceItem review rows
    ↓
Match rows by UPC/SKU/vendor code/barcode/name
    ↓
User reviews and edits rows
    ↓
User confirms ready rows
    ↓
Create VendorPrice records
    ↓
Update current vendor price
    ↓
Update suggested selling price
```

Critical rule:

```txt
Never create VendorPrice directly from raw extraction.
Never update inventory because inventory is out of scope.
```

---

# Product Matching Priority

Use this priority:

```txt
1. UPC exact match
2. SKU exact match
3. Generated internal barcode exact match
4. Internal code exact match
5. Vendor item code exact match
6. Normalized exact product/variant name match
7. Fuzzy name suggestion
8. No match
```

Confidence rules:

```txt
UPC exact match: 100
Generated barcode exact match: 100
Vendor code match: 95
SKU match: 90-95
Exact name match: 85
Fuzzy match: maximum 80
Below 85 requires review
```

Do not auto-create products from extraction without user confirmation.

---

# Backend API Requirements

## General

```txt
GET /api/health
GET /api/server-info
```

## Products

```txt
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/search?q=
```

## Variants

```txt
GET    /api/variants
POST   /api/variants
GET    /api/variants/:id
PUT    /api/variants/:id
DELETE /api/variants/:id
GET    /api/variants/by-code/:code
GET    /api/variants/:id/barcode
```

## Vendors

```txt
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:id
PUT    /api/vendors/:id
DELETE /api/vendors/:id
```

## Vendor Prices

```txt
GET    /api/vendor-prices
POST   /api/vendor-prices
GET    /api/vendor-prices/:id
PUT    /api/vendor-prices/:id
DELETE /api/vendor-prices/:id
GET    /api/vendor-prices/by-variant/:variantId
GET    /api/vendor-prices/best/:variantId
GET    /api/vendor-prices/history/:variantId
```

## Invoices

```txt
POST   /api/invoices/upload
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices/:id/extract
GET    /api/invoices/:id/items
PUT    /api/invoice-items/:id
POST   /api/invoices/:id/confirm-prices
```

## Pricing

```txt
GET    /api/pricing-rules
POST   /api/pricing-rules
PUT    /api/pricing-rules/:id
DELETE /api/pricing-rules/:id
POST   /api/pricing/calculate
GET    /api/pricing/suggestion/:variantId
```

## Mobile

```txt
GET    /api/mobile/health
POST   /api/mobile/pair/request
POST   /api/mobile/pair/confirm
GET    /api/mobile/products/by-code/:code
GET    /api/mobile/products/search?q=
GET    /api/mobile/products/:productId
GET    /api/mobile/variants/:variantId
GET    /api/mobile/variants/:variantId/barcode
GET    /api/mobile/vendor-prices/:variantId
GET    /api/mobile/vendor-prices/:variantId/best
GET    /api/mobile/pricing/suggestion/:variantId
GET    /api/mobile/vendors
POST   /api/mobile/invoices/upload
GET    /api/mobile/invoices/:invoiceId/status
GET    /api/mobile/review-queue
```

---

# Dashboard Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ StoreDesk                                      Server: Running ✅   │
├───────────────┬────────────────────────────────────────────────────┤
│ Sidebar       │ Dashboard                                          │
│               │                                                    │
│ Dashboard     │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ Products      │ │ Products     │ │ Vendors      │ │ Review Items │ │
│ Vendors       │ │ 245          │ │ 12           │ │ 8            │ │
│ Prices        │ └──────────────┘ └──────────────┘ └──────────────┘ │
│ Invoices      │                                                    │
│ Price Compare │ ┌────────────────────────────────────────────────┐ │
│ Lottery Setup │ │ Quick Setup                                    │ │
│ Mobile Access │ │                                                │ │
│ Settings      │ │ 1. Start Local Server       [Running ✅]       │ │
│               │ │ 2. Database Connection      [Connected ✅]     │ │
│               │ │ 3. Mobile Access            [Configure]        │ │
│               │ │ 4. Download StoreDesk Mobile [Show QR]          │ │
│               │ │ 5. Pair Phone                [Generate QR]      │ │
│               │ └────────────────────────────────────────────────┘ │
│               │                                                    │
│               │ ┌────────────────────────────────────────────────┐ │
│               │ │ Recent Invoices                                │ │
│               │ │ Vendor | Date | Items | Status                 │ │
│               │ └────────────────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────────────┘
```

Dashboard cards:

```txt
Total Products
Total Vendors
Items Needing Review
Invoices Processed
Best Savings Found
Products Missing UPC
Products Missing Vendor Price
Server Status
Database Status
```

---

# Setup Panel Requirements

The dashboard must include a setup panel.

Setup checklist:

```txt
1. Start StoreDesk Worker
2. Connect MongoDB
3. Add first vendor
4. Add first product
5. Add first product variant
6. Add first vendor price
7. Download StoreDesk Mobile
8. Pair mobile device
9. Upload first invoice
```

Each item should show:

```txt
Complete
Pending
Needs attention
```

---

# Sidebar Wireframe

Use this sidebar:

```txt
Dashboard
Products
Product Variants
Vendors
Vendor Prices
Invoice Upload
Review Queue
Price Comparison
Pricing Rules
Lottery Setup
Mobile Access
Settings
```

Do not include Inventory.

---

# Products Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Products                                            + Add Product   │
├────────────────────────────────────────────────────────────────────┤
│ Search products...         Category ▼       Brand ▼                │
├────────────────────────────────────────────────────────────────────┤
│ Name          Brand       Category      Variants     Status Action │
│ Coca Cola     Coke        Drinks        5            Active Edit   │
│ Red Bull      Red Bull    Drinks        3            Active Edit   │
│ Marlboro      Marlboro    Tobacco       8            Active Edit   │
└────────────────────────────────────────────────────────────────────┘
```

Product form fields:

```txt
Product name
Brand
Category
Description
Default unit
Target margin
Target markup
Manual selling price
Notes
Active/inactive
```

---

# Product Variants Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Product Variants                                      + Add Variant │
├────────────────────────────────────────────────────────────────────┤
│ Search UPC, SKU, barcode, name...                                  │
├────────────────────────────────────────────────────────────────────┤
│ Product    Variant             UPC        Pack Size   Code Action  │
│ Coke       12 Pack - 12 oz      049...     12 x 12 oz  SD-001 Edit  │
│ Red Bull   24 Pack - 8.4 oz     611...     24 x 8.4oz  SD-002 Edit  │
└────────────────────────────────────────────────────────────────────┘
```

Variant form fields:

```txt
Product
Variant name
UPC
SKU
Internal code
Vendor item codes
Pack quantity
Unit size
Unit of measure
Generated barcode
Target margin
Target markup
Manual selling price
Notes
Active/inactive
```

---

# Vendors Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Vendors                                               + Add Vendor  │
├────────────────────────────────────────────────────────────────────┤
│ Search vendors...                                                   │
├────────────────────────────────────────────────────────────────────┤
│ Vendor              Phone        Terms      Last Invoice   Action   │
│ Costco              ...          Net 30     06/07/2026     Edit     │
│ Restaurant Depot    ...          COD        06/01/2026     Edit     │
└────────────────────────────────────────────────────────────────────┘
```

Vendor form fields:

```txt
Vendor name
Contact person
Phone
Email
Address
Website
Payment terms
Delivery terms
Minimum order amount
Notes
Active/inactive
```

---

# Vendor Prices Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Vendor Prices                                      + Add Price      │
├────────────────────────────────────────────────────────────────────┤
│ Search product/vendor...                                           │
├────────────────────────────────────────────────────────────────────┤
│ Product      Variant       Vendor       Price   Per Item  Per Unit │
│ Coke         12pk 12oz     Costco       $8.99   $0.75     $0.062   │
│ Coke         12pk 12oz     Rest Depot   $9.49   $0.79     $0.066   │
└────────────────────────────────────────────────────────────────────┘
```

Manual price form fields:

```txt
Product variant
Vendor
Price
Quantity basis
Quantity type
Pack quantity
Unit size
Unit of measure
Effective date
Notes
```

Before saving, show calculated:

```txt
Price per pack
Price per item
Price per base unit
```

---

# Invoice Upload Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Upload Invoice                                                     │
├────────────────────────────────────────────────────────────────────┤
│ Vendor            [ Select Vendor ▼ ]                              │
│ Invoice Date      [ Date Picker ]                                  │
│ Invoice Number    [ Optional ]                                     │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Drag and drop PDF/image invoice here                           │ │
│ │ Supported: PDF, PNG, JPG, JPEG                                 │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ [ Upload Invoice ] [ Upload & Extract ]                           │
└────────────────────────────────────────────────────────────────────┘
```

---

# Review Queue Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Review Queue                                                       │
├────────────────────────────────────────────────────────────────────┤
│ Vendor     Invoice #     Date       Items    Status       Action   │
│ Costco     INV-1021      06/07/26   24       Needs Review Open     │
│ Depot      INV-1009      06/01/26   18       Reviewed     Open     │
└────────────────────────────────────────────────────────────────────┘
```

---

# Extraction Review Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Review Invoice: INV-1021                                           │
├────────────────────────────────────────────────────────────────────┤
│ Vendor: Costco       Date: 06/07/2026       Status: Needs Review   │
├────────────────────────────────────────────────────────────────────┤
│ Match | Item Name | UPC | Pack | Size | Qty | Price | Status       │
│ ✅    | Coke      |049..| 12   |12 oz | 4   | 8.99  | Ready        │
│ ⚠️    | Redbul    |     | 24   |8.4oz | 2   |38.99  | Review       │
│ ❌    | Napkn     |     | 1    |500ct | 5   |12.50  | New Product  │
├────────────────────────────────────────────────────────────────────┤
│ [ Save Edits ] [ Confirm Ready Rows ] [ Create Product From Row ]  │
└────────────────────────────────────────────────────────────────────┘
```

Each row must allow editing:

```txt
Extracted item name
Matched product
Matched variant
UPC
SKU
Vendor item code
Invoice quantity
Quantity type
Pack quantity
Unit size
Unit of measure
Unit price
Line total
Review status
Notes
```

---

# Price Comparison Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Price Comparison                                                   │
├────────────────────────────────────────────────────────────────────┤
│ Search Product/Variant: [ Coke 12 Pack ]                           │
├────────────────────────────────────────────────────────────────────┤
│ Product: Coca Cola                                                 │
│ Variant: 12 Pack - 12 oz cans                                      │
│ UPC: 049000000000                                                  │
│ Code: SD-000102                                                    │
├────────────────────────────────────────────────────────────────────┤
│ Vendor            Case Price   Per Item   Per Oz    Last Seen      │
│ Costco            $8.99        $0.75      $0.062    06/07/26       │
│ Restaurant Depot  $9.49        $0.79      $0.066    06/01/26       │
│ Local Vendor      $10.20       $0.85      $0.071    05/28/26       │
├────────────────────────────────────────────────────────────────────┤
│ Best Vendor: Costco                                                │
│ Savings vs Highest: $1.21 per case                                 │
│                                                                    │
│ Cost Setup                                                         │
│ Best Cost: $8.99                                                   │
│ Target Margin: 30%                                                 │
│ Suggested Selling Price: $12.84                                    │
│ Rounded Price: $12.99                                              │
└────────────────────────────────────────────────────────────────────┘
```

---

# Pricing Rules Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Pricing Rules                                      + Add Rule       │
├────────────────────────────────────────────────────────────────────┤
│ Rule Name        Scope       Method      Percent     Rounding       │
│ Default Margin   Global      Margin      30%         nearest .99    │
│ Drinks Rule      Category    Markup      25%         nearest .99    │
└────────────────────────────────────────────────────────────────────┘
```

Rule form fields:

```txt
Rule name
Scope
Category/product/variant selection
Pricing method
Margin percent
Markup percent
Fixed amount
Rounding rule
Active/inactive
```

---

# Lottery Setup Page Wireframe

Keep this as a placeholder first.

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Lottery Setup                                                      │
├────────────────────────────────────────────────────────────────────┤
│ Coming Soon                                                        │
│                                                                    │
│ Planned features:                                                  │
│ - Lottery vendor setup                                             │
│ - Game number setup                                                │
│ - Ticket book setup                                                │
│ - Commission/rate setup                                            │
│ - Settlement tracking                                              │
│ - Lottery reports                                                  │
└────────────────────────────────────────────────────────────────────┘
```

Do not build full lottery logic until vendor pricing and invoice flow are stable.

---

# Mobile Access Page Wireframe

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Mobile Access                                                      │
├────────────────────────────────────────────────────────────────────┤
│ Local Server                                                       │
│ Status: Running ✅                                                 │
│ URL: http://192.168.1.25:4000                                      │
│                                                                    │
│ ┌────────────────────────────┐ ┌────────────────────────────┐       │
│ │ Download StoreDesk Mobile   │ │ Pair Mobile Device          │       │
│ │                            │ │                            │       │
│ │ Android APK QR             │ │ Pairing QR                  │       │
│ │ [ QR CODE ]                │ │ [ QR CODE ]                 │       │
│ │                            │ │                            │       │
│ │ Android only               │ │ Code: 842193                │       │
│ │ iPhone setup later         │ │ Expires in: 10 minutes      │       │
│ └────────────────────────────┘ └────────────────────────────┘       │
│                                                                    │
│ Paired Devices                                                     │
│ Device Name        Type       Last Seen       Status     Action     │
│ Trupal iPhone      iOS        Today           Active     Disable    │
│ Store Samsung      Android    Today           Active     Disable    │
└────────────────────────────────────────────────────────────────────┘
```

---

# Settings Page Requirements

Settings should include:

```txt
App version
Server URL
MongoDB connection status
Upload folder location
Theme mode
Data backup later
Developer/debug info
```

---

# StoreDesk Mobile Mobile Wireframes

## First Launch

```txt
┌────────────────────────────┐
│ StoreDesk Mobile            │
├────────────────────────────┤
│ Welcome                    │
│                            │
│ Connect this phone to      │
│ your StoreDesk system.     │
│                            │
│ [ Scan Pairing QR ]        │
│ [ Enter Server Manually ]  │
└────────────────────────────┘
```

## Manual Connect

```txt
┌────────────────────────────┐
│ Connect Manually           │
├────────────────────────────┤
│ Server URL                 │
│ [ http://192.168.1.25:4000 ]│
│                            │
│ Pairing Code               │
│ [ 842193 ]                 │
│                            │
│ [ Connect ]                │
└────────────────────────────┘
```

## Home

```txt
┌────────────────────────────┐
│ StoreDesk Mobile            │
├────────────────────────────┤
│ Connected: StoreDesk ✅    │
│                            │
│ [ Scan Barcode ]           │
│ [ Search Product ]         │
│ [ Upload Invoice ]         │
│ [ Recent Lookups ]         │
│                            │
│ Recent                     │
│ Coke 12pk                  │
│ Red Bull 24pk              │
└────────────────────────────┘
```

## Scanner

```txt
┌────────────────────────────┐
│ Scan Product Code          │
├────────────────────────────┤
│                            │
│      Camera Preview        │
│                            │
│   ┌──────────────────┐     │
│   │                  │     │
│   │   Scan Area      │     │
│   │                  │     │
│   └──────────────────┘     │
│                            │
│ [ Torch ] [ Manual Entry ] │
└────────────────────────────┘
```

## Product Result

```txt
┌────────────────────────────┐
│ Product Found              │
├────────────────────────────┤
│ Coca Cola                  │
│ 12 Pack - 12 oz cans       │
│                            │
│ UPC: 049000000000          │
│ Code: SD-000102            │
│                            │
│ Best Vendor                │
│ Costco                     │
│                            │
│ Case Price: $8.99          │
│ Per Item: $0.75            │
│ Per Oz: $0.062             │
│                            │
│ Suggested Sell Price       │
│ $12.99                     │
│                            │
│ [ View All Vendor Prices ] │
│ [ Show Barcode ]           │
│ [ Upload Invoice ]         │
└────────────────────────────┘
```

## Vendor Prices

```txt
┌────────────────────────────┐
│ Vendor Prices              │
├────────────────────────────┤
│ Coke 12 Pack - 12 oz       │
│                            │
│ BEST                       │
│ Costco                     │
│ Case: $8.99                │
│ Per Item: $0.75            │
│ Per Oz: $0.062             │
│ Last Seen: 06/07/2026      │
│                            │
│ Restaurant Depot           │
│ Case: $9.49                │
│ Per Item: $0.79            │
│ Per Oz: $0.066             │
│ Last Seen: 06/01/2026      │
└────────────────────────────┘
```

## Search Product

```txt
┌────────────────────────────┐
│ Search Products            │
├────────────────────────────┤
│ [ Search name, UPC, code ] │
│                            │
│ Results                    │
│                            │
│ Coca Cola 12pk             │
│ Best: Costco $8.99         │
│ Sell: $12.99               │
│                            │
│ Red Bull 24pk              │
│ Best: Costco $38.99        │
│ Sell: $54.99               │
└────────────────────────────┘
```

## Upload Invoice

```txt
┌────────────────────────────┐
│ Upload Invoice             │
├────────────────────────────┤
│ Vendor                     │
│ [ Select Vendor ▼ ]        │
│                            │
│ Invoice Date               │
│ [ 06/07/2026 ]             │
│                            │
│ [ Take Photo ]             │
│ [ Pick Image ]             │
│ [ Pick PDF ]               │
│                            │
│ Selected: invoice.jpg      │
│                            │
│ [ Upload For Review ]      │
└────────────────────────────┘
```

## Show Barcode

```txt
┌────────────────────────────┐
│ Item Barcode               │
├────────────────────────────┤
│ Coca Cola 12 Pack          │
│                            │
│ ||||||||||||||||||||||     │
│ SD-000102                  │
│                            │
│ [ Share ]                  │
└────────────────────────────┘
```

## Settings

```txt
┌────────────────────────────┐
│ Settings                   │
├────────────────────────────┤
│ Server URL                 │
│ http://192.168.1.25:4000   │
│                            │
│ Device                     │
│ Store Samsung              │
│                            │
│ [ Test Connection ]        │
│ [ Disconnect ]             │
│ [ Clear Saved Data ]       │
└────────────────────────────┘
```

---

# Quality Rules

Follow these rules:

1. Use TypeScript for desktop and server.
2. Use Dart null safety for mobile.
3. Keep business logic out of UI pages.
4. Keep business logic inside services.
5. Keep API request/response logic separate.
6. Use validation for all forms and APIs.
7. Use consistent theme structure.
8. Use reusable components.
9. Avoid giant components.
10. Do not build stock/inventory features.
11. Do not skip invoice review.
12. Do not expose MongoDB to mobile.
13. Keep mobile simple and fast.
14. Preserve vendor price history.
15. Use price per base unit for comparison.

---

# Sprint Plan

See `docs/sprint-plan.md` for the full sprint breakdown (Sprint 0–18).

---

# Milestones

## MVP 1 — Manual Price Comparison

Complete when:

```txt
- Product CRUD works
- Variant CRUD works
- Vendor CRUD works
- Manual vendor price works
- Price comparison works
- Suggested selling price works
```

## MVP 2 — StoreDesk Mobile Lookup

Complete when:

```txt
- Mobile pairs with desktop/server
- Barcode scanning works
- Product lookup works
- Vendor comparison works on phone
```

## MVP 3 — Invoice Review Flow

Complete when:

```txt
- Desktop invoice upload works
- Mobile invoice upload works
- Review rows are created
- User confirms rows
- VendorPrice records are created
```

## MVP 4 — Mobile QR Setup

Complete when:

```txt
- Dashboard/Mobile Access shows APK QR
- Dashboard/Mobile Access shows pairing QR
- StoreDesk Mobile can connect through QR
```

## MVP 5 — Release Candidate

Complete when:

```txt
- Tests pass
- CI passes
- Desktop packages
- Android APK builds
- Documentation complete
```

---

# Cursor Implementation Instructions

## Agent team (Cursor + Codex)

Runtime is **Cursor** (`.cursor/`) and **Codex** (`.codex/` + folder `AGENTS.md`). Do **not** use Claude Code or `.claude/`.

- **Full guide:** `docs/agent-team-guide.md` (flows, rules, skills, WO/handoff)
- Org chart / management styles: `.cursor/TEAM.md`
- Agents: `.cursor/agents/` (`eng-manager`, `tech-lead`, `frontend-electron`, `backend-server`, `mobile-buddy`, `ui-ux-designer`, `qa-verifier`, `docs-scribe`)
- Skills: `.cursor/skills/` (`agent-team`, `work-order`, `handoff`, `mui`, `react-dev`, `storedesk-ui`)
- Work orders: `docs/work-orders/`
- Folder maps: nearest `AGENTS.md` under `docs/`, `scripts/`, `tools/`, and each submodule

Work carefully in small steps.

Before making changes:

```txt
1. Inspect the repository.
2. Read all README files.
3. Read AGENTS.md if it exists.
4. Preserve existing passing Electron checks.
5. Do not delete working setup unless necessary.
```

Implementation priority:

```txt
1. Add or update AGENTS.md.
2. Create docs/wireframes.md from this plan.
3. Create store-desk-worker foundation.
4. Add models and services.
5. Add backend APIs.
6. Connect Electron to backend.
7. Build desktop pages.
8. Add Mobile Access page with QR concept.
9. Build Flutter app screens.
10. Add mobile connection and pairing.
11. Add barcode lookup.
12. Add invoice upload.
13. Add testing and packaging.
```

After every major change:

```txt
- Summarize changed files.
- Run available checks.
- Report what passed.
- Report what is pending.
- Do not continue if a critical check breaks unless you fix it.
```

Required checks:

```txt
Electron:
npm run ci

Server:
npm run ci

Mobile:
flutter analyze
flutter test
```

If Flutter is not installed locally, do not fake success. Document it as pending.

---

# Non-Negotiable Rules

```txt
- Do not build stock tracking.
- Do not build inventory quantity.
- Do not build low stock alerts.
- Do not build reorder levels.
- Do not create StockMovement.
- Do not create Inventory model.
- Do not let mobile connect directly to MongoDB.
- Do not save raw invoice extraction directly as final vendor price.
- Always require invoice review before creating VendorPrice.
- Use StoreDesk for desktop.
- Use StoreDesk Mobile for mobile.
- Use StoreDesk Worker for backend.
- StoreDesk Worker runs on port 4310 and listens on 0.0.0.0 for LAN mobile access.
- Backend and MongoDB are local-first — no hosted backend or hosted MongoDB unless explicitly asked.
- Keep three separate Git submodule repos; do not merge into parent or convert to monorepo.
- Commit app changes in the submodule; commit submodule pointer updates in the parent repo.
- Use themed UI packages.
- Keep design professional and simple.
```

---

# Final Expected Product

The final system should feel like this:

```txt
StoreDesk is the desktop command center for a convenience store or gas station.

The owner can manage products, vendors, invoices, vendor prices, and pricing rules.

StoreDesk Mobile is the phone helper app.

Employees can scan products, search items, view best vendor price, view suggested selling price, and upload invoices.

Everything runs locally through StoreDesk Worker on the same Wi-Fi.

MongoDB stays local and protected.

The system is simple, themed, professional, and expandable later for lottery setup and more store operations.
```
