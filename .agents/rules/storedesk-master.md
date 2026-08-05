# StoreDesk — Non-negotiable product rules (always active)

## Naming

| Correct | Wrong |
|---------|-------|
| **StoreDesk** (desktop) | "StoreDesk Desktop" as product name |
| **StoreDesk Worker** (edge API) | "StoreDesk Server" |
| **StoreDesk Mobile** (Flutter app) | "StoreDesk Buddy" |
| **StoreDesk Web** (license portal) | — |
| **StoreDesk Cloud Hub** (WSS hub) | — |

## Banned features — never build

- Stock quantity, current stock, add stock, reduce stock
- Low stock alerts, reorder levels, warehouse locations
- Stock movements, inventory adjustments
- `Inventory`, `StockMovement`, `Warehouse`, `Reorder`, `StockAdjustment` models or APIs

## Removed from current UI — do not re-add without a Work Order

- Mobile invoice upload / review
- Desktop APK download QR
- Mobile pairing QR (mobile uses AppUser login from org license)

## Submodule commits

1. Make changes **inside** the correct submodule directory.
2. `git commit` and `git push` in the submodule.
3. Bump the parent repo's submodule pointer and push the parent.
4. Never merge submodule source trees into the parent repo as plain files.

## Branches

- `develop` — integration line (land work here first)
- `production` — stable released line
- Never push directly to `production` without QA passing

## Mobile connection

- Phone connects to: `http://<LAN_IP>:4310`
- Never `localhost` on the phone (localhost = the phone itself)
- StoreDesk Mobile never connects directly to MongoDB

## Invoice → price

- User must review `InvoiceItem` rows before `VendorPrice` is created
- Never auto-save raw extraction as a final vendor price
- Never silently overwrite old `VendorPrice` rows — append history

## Android Studio (mobile branch)

- Mobile development IDE is **Android Studio**, not VS Code
- Run and debug Flutter from Android Studio Device Manager
- CI check from Android Studio terminal: `flutter analyze && flutter test`
