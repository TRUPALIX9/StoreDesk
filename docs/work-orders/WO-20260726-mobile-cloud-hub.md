# WO-20260726-mobile-cloud-hub

- **Status:** in_progress
- **Epic:** 5 — StoreDesk Mobile cloud
- **Points:** 8
- **Primary owner:** mobile-buddy
- **Modules:** store-desk-mobile | store-desk-cloud-backend | store-desk-worker | store-desk-electron

## Goal

StoreDesk Mobile reaches store data the same way Desktop will in cloud mode:

```txt
StoreDesk Mobile
        │
        ▼
Cloud Hub (main backend)
        │
        ▼
StoreDesk Worker (edge agent on backoffice PC)
```

LAN `:4310` remains a fallback for same-Wi‑Fi stores until Hub path is proven.

## Also in this WO (cross-app polish)

| Story | Pts | Status |
|-------|-----|--------|
| M1 Hub client scaffold (role `client`, relay) | 3 | done (scaffold + Settings test relay) |
| M2 Pairing / settings for Hub URL + store key | 2 | done (Settings Hub panel; LAN pairing unchanged) |
| M3 App icon + animated splash until ready | 1 | done |
| X1 Electron app icon + branded animated boot | 1 | done |
| X2 Reports/Transactions use same loading pattern | 1 | done |
| X3 UI tokens / schema labels consistent Desktop↔Mobile↔API | 2 | done (brand colors + Worker/Mobile naming) |

## Locked

- Same Hub protocol as Desktop: `hello` role `client`, then `relay` payloads to Worker `/api/*`
- Phone never opens Mongo
- Brand: `#1A63F4` / `#00A87B`; logo from `brand-kit/`
- Product name: **StoreDesk Mobile**

## Also completed 2026-07-26 — Mobile 5-tab IA

Bottom nav: **POS Reports** (Ruby) | **Price Book** | **Transactions** (live + today summary) | **Vendors** | **Settings**.

Worker exposes `/api/pos/reports/*` and `/api/pos/transactions*` for Mobile (same Commander Ruby/T-Log path as Desktop).

## E2E

- [ ] Mobile can connect via Hub when Worker agent is online (local: `make stack`)
- [x] Scan / product lookup can use Hub when mode=hub (ApiClient relay; needs live Hub+Worker)
- [x] App icon visible on device + Electron window/taskbar
- [x] Animated StoreDesk loading until first ready frame (app + reports)
- [x] `flutter analyze` clean; Worker + Electron `npm run ci` pass
- [ ] `flutter test` / APK from spaced path `HOP IN 4630` fails (`objective_c` hook); use junction `C:\StoreDesk` for APK
- [x] Debug APK builds via `C:\StoreDesk\store-desk-mobile` junction
- [x] Same-PC local stack documented (`docs/local-same-pc.md`, `make stack`)

## Handoff

### 2026-07-26 same-PC + Mobile IA

- `make setup` / `make stack` / `make hub` / `make worker` point at `store-desk-worker` + local Hub
- Mobile allows localhost pairing; Desktop Link phone has Same PC / emulator host modes
- ApiClient routes through Hub when `connection_mode=hub`
- Mobile tabs: POS Reports, Price Book, Transactions, Vendors, Settings
- Requires `COMMANDER_PASSWORD` on Worker for live Ruby reports / T-Log
