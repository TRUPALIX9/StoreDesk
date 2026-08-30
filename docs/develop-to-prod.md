# Develop to Production PR Log

This document tracks all features, bug fixes, and API contract updates currently committed and pushed on the `develop` branch that are queued for production release.

> **Production Deployment Rule**: Changes must remain on `develop` until the user explicitly instructs to merge and release to `production`.

---

## Queued Release Items (develop branch)

### 1. Developer Setup & Account Provisioning
- **Developer Account**: Automatically provisions `development@demo.com` with password `demo@1` as a verified AppUser in **SQLite (Prisma)** on Worker startup (`ensureDeveloperUser()`). Note: prior docs said MongoDB — actual datasource is SQLite.
- **Developer Tunnel**: Default Cloudflare Tunnel fallback configured to `https://develop.storedesk.net` across Worker sealed config and client endpoints.

### 2. Live Verifone Commander Integration
- **Source of Truth Item Lookup**: `findLivePriceBookByUpc` queries live Verifone Commander POS first to fetch real-time register item name, department, selling price, and sell unit, gracefully merging with local MongoDB vendor cost overlays (`vendorSamsClub`, `vendorGlobal`, `vendorHackney`, `vendor101`, `vendorGandhi`, `vendorCustom`).
- **On-Open Live Fetch**: `GET /api/price-book/:id` triggers live Commander fetch whenever an item is opened in desktop POS or mobile app.

### 3. Full CORS Preflight Support
- **Cross-Origin & OPTIONS Preflight**: Configured explicit `cors` middleware with `origin: true`, `credentials: true`, allowed methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`), allowed headers (`Content-Type`, `Authorization`, `X-Requested-With`, `Accept`, `Origin`), and `app.options("*", cors())`.
- **Browser Mobile Web**: Enables Flutter Web (`http://localhost:8085`) and browser clients to communicate with `https://develop.storedesk.net` without preflight CORS blocks.

### 4. UI & Form Enhancements
- **Price Book Forms**: `vendorHackney` returnable status toggle pre-filled in item form; UPC modifier pre-filled cleanly when adding new variants.
- **Electron Pre-fill**: Pre-fills `development@demo.com` (`demo@1`) on `AppUserLoginPage`.
