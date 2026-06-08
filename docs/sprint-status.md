# StoreDesk Sprint Status

Updated: June 8, 2026

## Executive Status

StoreDesk is now an end-to-end local-first product pricing and invoice review workspace with three GitHub repos under `TRUPALIX9`:

- `StoreDesk` parent repo with submodule pointers.
- `store-desk-electron` desktop/admin app.
- `store-desk-server` local API/server.
- `store-desk-mobile` StoreDesk Buddy Flutter companion app.

The system remains intentionally scoped to catalog, vendors, vendor costs, retail prices, invoice review, and mobile scanning/upload. It is not an inventory/stock/reorder system.

## Done

Repository and delivery:

- Parent `StoreDesk` repo structured with app submodules.
- Electron, server, and mobile repos connected to GitHub remotes.
- Husky local hooks added.
- GitHub Actions CI added.
- Desktop release artifact workflow added.
- Android APK artifact workflow added.

Desktop UI/UX:

- StoreDesk desktop uses a Material UI admin layout with sidebar navigation.
- Dashboard shows products, vendors, review items, invoices, missing UPC, missing vendor price, server status, and database mode.
- Product and product variant pages are searchable and capped for large catalog usability.
- Vendors, vendor prices, pricing rules, price comparison, invoice upload, extraction review, review queue, mobile access, settings, and lottery placeholder screens exist.
- Mobile Access includes server URL, APK download QR, pairing QR, and paired devices table.

Mobile UI/UX:

- StoreDesk Buddy has connect-first routing.
- Screens exist for connect, pairing, home, scanner, product lookup, product search, vendor prices, invoice upload, barcode display, and settings.
- Mobile uses secure storage for server URL/token and Dio API client with bearer auth.
- Mobile app is built for Android locally.

Server/backend:

- Express + TypeScript server runs on port `4310`.
- Local in-memory data store works without MongoDB; MongoDB connection is available when configured.
- Core models exist for products, variants, vendors, vendor prices, invoices, invoice items, extraction jobs, pricing rules, and mobile devices.
- API routes exist for catalog, vendors, vendor prices, pricing, invoices, review queue, mobile pairing, mobile product lookup/search, and mobile invoice upload.
- Invoice review can match/correct lines and create vendor price records from confirmed invoice items.

Catalog/data:

- Source workbook: `scripts/Hop-in-4630-556C95D1.xlsx`.
- Normalized JSON: `scripts/hop-in-4630-catalog.normalized.json`.
- 16,718 rows imported from the POS sheet.
- UPC + Modifier is treated as the unique grouping key.
- Description is preserved and parsed for size/unit when possible.
- Price is treated as the current retail/shelf price.
- Profit Margin is preserved in notes when present; blank/0 uses the default margin rule.
- In Stock and Reorder are intentionally ignored and not added to the app model.
- Default vendors created: 101, Hackney, Gandhi Wholesale, Sam's Club.
- Gandhi/Trident invoice 359 normalized at `scripts/invoices/trident-wholesale-359.normalized.json`.
- Gandhi invoice 359 creates 15 invoice review rows from real invoice columns.
- 7 Gandhi invoice lines match the retail catalog and seed current vendor prices.
- 8 Gandhi invoice lines remain in review for manual catalog matching.
- Vendor costs are seeded only from invoice data; unknown costs are not invented.

Toolchain/build:

- Git installed and connected.
- GitHub auth working for `TRUPALIX9`.
- Flutter 3.44.1 installed under `tools/flutter`.
- OpenJDK 17 installed.
- Android Studio installed.
- Android SDK command-line tools, platform tools, SDK 36, SDK 35, build tools, CMake, and NDK installed by Flutter/SDK manager.
- Mobile checks pass locally through `npm run ci`.
- Android release APK built and copied to `store-desk-server/downloads/storedesk-buddy.apk`.

## Verified

- Server `npm run check`: typecheck plus 22 tests pass.
- Electron `npm run check`: typecheck plus 13 tests pass.
- Mobile `npm run ci`: Flutter analyze plus 4 tests pass.
- APK output exists at `store-desk-mobile/build/app/outputs/flutter-apk/app-release.apk`.
- Download copy exists at `store-desk-server/downloads/storedesk-buddy.apk`.
- `adb devices -l` ran successfully but found no attached Android device.

## Pending

- Connect a physical Android device or create an emulator, then install and test the APK.
- Match the 8 unmatched Gandhi invoice rows to catalog items or create new catalog entries after review.
- Add real invoice files for 101, Hackney, Sam's Club, and any other suppliers.
- Convert future vendor invoices into reviewed invoice lines and vendor cost records.
- Compare future vendor costs against the retail catalog and update current best vendor pricing.
- Add production signing/app icon before public distribution.
- Optional: connect MongoDB for durable production data instead of the in-memory development store.

## Next Invoice Workflow

1. Add vendor invoice files.
2. Upload invoice in desktop or StoreDesk Buddy.
3. Review extracted lines.
4. Match by UPC, SKU, vendor item code, or normalized description.
5. Confirm reviewed invoice.
6. StoreDesk writes current vendor prices and keeps old prices as history.
7. Price Comparison shows the best vendor and savings.
