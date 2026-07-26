# WO-20260726-desktop-dual-mode

- **Status:** todo
- **Epic:** 4 — Desktop dual-mode
- **Points:** 8
- **Primary owner:** frontend-electron
- **Modules:** store-desk-electron | store-desk-server

## Goal

StoreDesk Desktop can run against **local Worker `:4310`** (default) and, when Hub is available, optionally reach a store room through Cloud Hub relay — without breaking LAN-only stores.

## Stories

| Story | Pts | Status |
|-------|-----|--------|
| D1 Mode switch / settings | 3 | todo |
| D2 Prefer localhost:4310 | 2 | todo |
| D3 Hub client path (relay) | 3 | todo |

## Locked

- Keep `:4310` until dual-mode proven
- Marketing stays LAN / backoffice-PC focused until D3 ships
- Depends on Hub repo under `storedesk-dev` + Worker G2/G3

## E2E

- [ ] Desktop settings: Local Worker URL
- [ ] Health check against `:4310`
- [ ] Optional Hub connect smoke (when Hub env present)
- [ ] `npm run ci` in electron

## Handoff

Opened after Edge Agent G2/G3/G4 code complete. Start when Hub remote exists or continue LAN-only Desktop polish first.
