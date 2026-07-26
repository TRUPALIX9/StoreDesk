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
| D1 Mode switch / settings | 3 | done (Local Worker URL; Hub mode deferred) |
| D2 Prefer localhost:4310 | 2 | done (default `127.0.0.1:4310`) |
| D3 Hub client path (relay) | 3 | todo |

## Locked

- Keep `:4310` until dual-mode proven
- Marketing stays LAN / backoffice-PC focused until D3 ships
- Depends on Hub repo under `storedesk-dev` + Worker G2/G3

## E2E

- [x] Desktop settings: Local Worker URL
- [x] Default `http://127.0.0.1:4310`
- [ ] Optional Hub connect smoke (when Hub env present)
- [ ] `npm run ci` in electron

## Handoff

D1/D2 shipped in Settings + `api/config.ts`. D3 waits on Hub org remote.
