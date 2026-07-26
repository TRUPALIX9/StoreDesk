# WO-20260726-edge-agent-outbound-wss

- **Status:** in_progress
- **Epic:** 3 — Edge Agent (StoreDesk Worker)
- **Points:** 13 (this slice focuses on G2 outbound WSS; G1/G3/G4 follow)
- **Primary owner:** backend-server
- **Modules:** store-desk-server | store-desk-cloud-backend

## Goal

StoreDesk Worker on the store PC opens an **outbound** WebSocket to Cloud Hub with `STORE_ID` + `AGENT_KEY`, while **keeping HTTP `:4310`** for local Desktop/Mobile.

## Stories (this WO slice)

| Story | Pts | Status |
|-------|-----|--------|
| G2 Outbound WSS | 3 | in_progress |
| G1 Consolidate embed | 5 | deferred |
| G3 Commander relay | 3 | deferred (stub relay ack only) |
| G4 Windows service notes | 2 | deferred |

## Env (Worker)

```txt
HUB_WS_URL=ws://localhost:8080/ws
STORE_ID=SD-…
AGENT_KEY=sk_…
```

If unset, Worker runs LAN-only (current behavior).

## E2E

- [x] Worker starts `:4310` with or without Hub env
- [x] Unit: hello payload + ping/pong + relay stub
- [x] Health includes `hub` status object
- [ ] Live Hub join (needs Hub process + created GitHub remote)
- [ ] Desktop still uses localhost:4310 (manual)

## Shipped

- `src/services/hubOutbound.service.ts`
- Env: `HUB_WS_URL`, `STORE_ID`, `AGENT_KEY`
- Commit on Worker remote: see parent master WO log
