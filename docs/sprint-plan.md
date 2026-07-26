# StoreDesk Sprint Plan

Extracted from the master project prompt. See root `AGENTS.md` for full scope, wireframes, and rules.

---

## Sprint 0 — Repo and Documentation

Goal: Prepare the repo for clean development.

Tasks:

```txt
- Verify root README
- Verify Electron README
- Verify Mobile README
- Add AGENTS.md
- Add docs folder
- Add architecture.md
- Add wireframes.md
- Add database-schema.md
- Add api-contract.md
- Push private repo to GitHub
```

Acceptance criteria:

```txt
- Project scope is documented
- StoreDesk and StoreDesk Buddy names are documented
- No inventory/stock scope remains
- GitHub repo is pushed
```

---

## Sprint 1 — Flutter Setup

Goal: Verify StoreDesk Buddy can run.

Tasks:

```txt
- Install Flutter SDK
- Run flutter doctor
- Verify Dart from Flutter SDK
- Run mobile npm install
- Run mobile npm run ci
- Run flutter pub get
- Run flutter analyze
- Run flutter test
- Update mobile README verified section
```

Acceptance criteria:

```txt
- Flutter is installed
- Mobile tooling runs
- README reflects current setup
```

---

## Sprint 2 — Server Foundation

Goal: Create StoreDesk Worker.

Tasks:

```txt
- Create store-desk-worker folder
- Add Express app
- Add TypeScript setup
- Add environment config
- Add health endpoint
- Add error middleware
- Add MongoDB connection
- Add server README
- Add check and ci scripts
```

Acceptance criteria:

```txt
- Server starts locally
- Health endpoint works
- MongoDB connection works
- Server CI command works
```

---

## Sprint 3 — Database Models

Goal: Create all core MongoDB models.

Tasks:

```txt
- Create Product model
- Create ProductVariant model
- Create Vendor model
- Create VendorPrice model
- Create Invoice model
- Create InvoiceItem model
- Create ExtractionJob model
- Create PricingRule model
- Create MobileDevice model
```

Acceptance criteria:

```txt
- All models exist
- Indexes exist
- Timestamps exist
- No Inventory model exists
- No StockMovement model exists
```

---

## Sprint 4 — Core Services

Goal: Build backend business logic.

Tasks:

```txt
- Add normalizeText utility
- Add normalizeCode utility
- Add barcodeService
- Add pricingCalculationService
- Add productMatchingService
- Add vendorPriceService
- Add invoiceReviewService
- Add mobilePairingService
- Add fileStorageService
```

Acceptance criteria:

```txt
- Pricing formulas are tested
- Barcode lookup is tested
- Product matching is tested
- Vendor best price logic works
- Invoice confirmation creates VendorPrice only
```

---

## Sprint 5 — Backend APIs

Goal: Create API endpoints.

Tasks:

```txt
- Products CRUD APIs
- Variants CRUD APIs
- Vendors CRUD APIs
- Vendor Prices APIs
- Pricing Rules APIs
- Invoice Upload APIs
- Invoice Review APIs
- Mobile Health API
- Mobile Pairing APIs
- Mobile Product Lookup API
- Mobile Invoice Upload API
```

Acceptance criteria:

```txt
- APIs validate inputs
- APIs return clean errors
- Mobile APIs require token after pairing
- Invoice upload goes to review
- No stock APIs exist
```

---

## Sprint 6 — Desktop Backend Integration

Goal: Connect StoreDesk Electron app to StoreDesk Worker.

Tasks:

```txt
- Add API client
- Add React Query hooks
- Add server status check
- Add backend URL setting
- Show server status on dashboard
- Show MongoDB status on dashboard
```

Acceptance criteria:

```txt
- Desktop can call server
- Dashboard shows server status
- API errors show user-friendly messages
```

---

## Sprint 7 — Desktop Product/Vendor UI

Goal: Build core admin pages.

Tasks:

```txt
- Products page
- Product form
- Product variants page
- Variant form
- Vendors page
- Vendor form
- Vendor prices page
- Manual price form
- Generated barcode display
```

Acceptance criteria:

```txt
- Product CRUD works
- Variant CRUD works
- Vendor CRUD works
- Manual vendor price entry works
- Barcode is visible for variants
```

---

## Sprint 8 — Price Comparison and Pricing Rules

Goal: Make the pricing engine useful.

Tasks:

```txt
- Price Comparison page
- Vendor comparison table
- Best vendor highlight
- Savings vs highest vendor
- Price history view
- Pricing Rules page
- Suggested selling price display
```

Acceptance criteria:

```txt
- Prices sort by price per base unit
- Best vendor is clear
- Suggested price is calculated
- Margin and markup are supported
```

---

## Sprint 9 — Invoice Upload and Review

Goal: Build invoice workflow.

Tasks:

```txt
- Desktop invoice upload page
- File upload handling
- Extraction placeholder
- Review queue page
- Extraction review page
- Editable invoice rows
- Manual product matching
- Create product/variant from row
- Confirm rows into VendorPrice
```

Acceptance criteria:

```txt
- Upload creates Invoice
- Extraction creates InvoiceItems
- User can edit rows
- User can confirm rows
- Confirmed rows create VendorPrice
- No inventory update happens
```

---

## Sprint 10 — Mobile Access and QR

Goal: Let StoreDesk Buddy connect easily.

Tasks:

```txt
- Mobile Access page
- Show local server URL
- Detect local Wi-Fi IP
- Show server status
- Generate APK download QR
- Generate pairing QR
- List paired devices
- Disable paired device
```

Acceptance criteria:

```txt
- User can see local server URL
- User can scan APK QR on Android
- User can scan pairing QR in StoreDesk Buddy
- Paired devices are listed
```

---

## Sprint 11 — StoreDesk Buddy Foundation

Goal: Build Flutter app foundation.

Tasks:

```txt
- Flutter app routing
- Material 3 theme
- Secure storage service
- Dio API client
- Auth interceptor
- Error handling
- Shared widgets
- App shell
```

Acceptance criteria:

```txt
- Flutter app launches
- Theme is applied
- Routing works
- API client reads server URL and token
```

---

## Sprint 12 — StoreDesk Buddy Connection Flow

Goal: Pair mobile app with StoreDesk.

Tasks:

```txt
- First launch screen
- Scan pairing QR
- Manual server entry
- Pairing code entry
- Save server URL
- Save access token
- Test connection
- Home screen
```

Acceptance criteria:

```txt
- User can pair device
- User can connect manually
- App remembers connection
- Home screen shows connected state
```

---

## Sprint 13 — StoreDesk Buddy Barcode Lookup

Goal: Scan and find products.

Tasks:

```txt
- Scanner screen
- Camera permission flow
- Torch button
- Manual code entry
- Product lookup API call
- Product result screen
- Product not found state
```

Acceptance criteria:

```txt
- Barcode scan works
- Product details show
- Best vendor price shows
- Suggested selling price shows
- No stock info appears
```

---

## Sprint 14 — StoreDesk Buddy Search and Prices

Goal: Search products and compare vendors.

Tasks:

```txt
- Product search screen
- Debounced search
- Search result cards
- Vendor prices screen
- Best vendor badge
- Show barcode screen
```

Acceptance criteria:

```txt
- Search works by name/code
- Vendor prices are sorted by unit cost
- Barcode displays correctly
```

---

## Sprint 15 — StoreDesk Buddy Invoice Upload

Goal: Upload invoices from phone.

Tasks:

```txt
- Vendor dropdown
- Invoice date picker
- Invoice number optional
- Take photo
- Pick image
- Pick PDF
- Upload file
- Show upload result
```

Acceptance criteria:

```txt
- Mobile invoice upload works
- Invoice goes to review queue
- No VendorPrice created until review
```

---

## Sprint 16 — Invoice Extraction Upgrade

Goal: Improve invoice processing.

Tasks:

```txt
- Store uploaded files safely
- Extract PDF text
- Store raw text
- Add extraction JSON validator
- Add image OCR/AI placeholder
- Document future AI extraction hook
```

Acceptance criteria:

```txt
- PDF invoices can produce raw text
- Bad extraction is safely handled
- Review flow still required
```

---

## Sprint 17 — Testing and CI

Goal: Stabilize all apps.

Tasks:

```txt
- Backend service tests
- Backend API tests
- Electron page tests
- Flutter model tests
- Flutter repository tests
- GitHub Actions for Electron
- GitHub Actions for Server
- GitHub Actions for Mobile
```

Acceptance criteria:

```txt
- Electron CI passes
- Server CI passes
- Mobile analyze/test passes
- Critical no-inventory tests pass
```

---

## Sprint 18 — Packaging and Release

Goal: Build installable apps.

Tasks:

```txt
- Electron app icon
- Electron packaging
- macOS build
- Windows build config
- Flutter Android APK build
- Android APK download from local server
- iOS setup notes
- Release documentation
```

Acceptance criteria:

```txt
- StoreDesk desktop build works
- StoreDesk Buddy APK builds
- APK download QR works
- Docs explain iPhone path
```
