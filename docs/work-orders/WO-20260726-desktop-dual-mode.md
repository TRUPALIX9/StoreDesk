# WO-20260726-desktop-dual-mode

- **Status:** in_progress
- **Epic:** 4 — Desktop dual-mode
- **Points:** 8
- **Primary owner:** frontend-electron
- **Modules:** store-desk-electron | store-desk-worker | store-desk-cloud-backend

## Goal

StoreDesk Desktop talks to the **Cloud Hub (main backend)** for store data. Hub asks the store’s **Worker** (edge agent) and returns the latest. Desktop does **not** call Worker on the backoffice PC directly in cloud mode.

```txt
StoreDesk Desktop (Electron)
        │  WSS / relay ask
        ▼
Cloud Hub  (main backend — Cloud Run)
        │  room relay to agent
        ▼
StoreDesk Worker (backoffice PC, outbound WSS)
        │
        ▼
Local Mongo + Verifone Commander
```

LAN-only / dev may still hit `:4310` as a temporary fallback until Hub path is proven — not the product cloud design.

## Stories

| Story | Pts | Status |
|-------|-----|--------|
| D1 Settings shell | 3 | done (interim Local Worker URL — supersede with Hub settings in D3) |
| D2 Local `:4310` fallback | 2 | done (dev/LAN only) |
| D3 Hub client (primary) | 5 | todo — Desktop → Hub → Worker relay |

## Locked (2026-07-26)

- **Cloud path:** Electron → Cloud Hub → Worker. No “Electron must use local Worker” for multi-store / cloud.
- Worker keeps outbound WSS + HTTP `:4310` for Mobile LAN and Hub agent duties.
- Hub remote: `https://github.com/TRUPALIX9/store-desk-cloud-backend`
- Marketing stays LAN-focused until D3 ships.

## D3 acceptance

- [ ] Desktop settings: Hub URL + store credentials (not “Local Worker URL” as primary)
- [ ] Desktop sends relay asks through Hub; Worker answers via existing G3 `/api/*` relay
- [ ] Latest Price Book / health-style reads work without Desktop on store LAN
- [ ] Worker still required on backoffice PC (agent must be online)
- [ ] `npm run ci` in electron

## Handoff

### HO — 2026-07-26 architecture correction

- User: Electron should talk to **main backend (Hub)**; Hub fetches latest from **Worker**. Local Worker URL is not the cloud product path.
- After Cloud Run Hub is up: implement D3 Hub client; demote Local Worker to optional LAN/dev fallback.
