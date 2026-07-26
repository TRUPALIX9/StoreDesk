# WO-20260726-edge-agent-outbound-wss

- **Status:** done
- **Epic:** 3 — Edge Agent (StoreDesk Worker)
- **Points:** 13
- **Primary owner:** backend-server
- **Modules:** store-desk-worker | store-desk-cloud-backend

## Goal

StoreDesk Worker on the store PC opens an **outbound** WebSocket to Cloud Hub with `STORE_ID` + `AGENT_KEY`, while **keeping HTTP `:4310`** for local Desktop/Mobile.

## Stories (this WO slice)

| Story | Pts | Status |
|-------|-----|--------|
| G2 Outbound WSS | 3 | done |
| G1 Consolidate embed | 5 | deferred (Epic 4 dual-mode) |
| G3 Commander relay | 3 | done (HTTP `/api/*` loopback relay) |
| G4 Windows service notes | 2 | done (README) |

## Env (Worker)

```txt
HUB_WS_URL=ws://localhost:8080/ws
STORE_ID=SD-…
AGENT_KEY=sk_…
```

If unset, Worker runs LAN-only (current behavior).

## Relay payload (G3)

```txt
Client → Hub room:
  { "type":"relay", "payload":{ "id", "method", "path":"/api/…", "query?", "body?" } }
Agent → Hub room:
  { "type":"relay", "from":"agent", "payload":{ "id", "ok", "status", "body"|"error" } }
```

Paths must be under `/api/` on `127.0.0.1:$PORT` only.

## E2E

- [x] Worker starts `:4310` with or without Hub env
- [x] Unit: hello + ping/pong + HTTP relay validation
- [x] Health includes `hub` status object
- [x] Unit: path allowlist + method reject
- [ ] Live Hub join (ops: Hub GitHub/org remote + running Hub)
- [ ] Desktop still uses localhost:4310 (manual)

## Shipped

- `src/services/hubOutbound.service.ts`
- `src/services/hubRelay.service.ts`
- Env: `HUB_WS_URL`, `STORE_ID`, `AGENT_KEY`
- README: Cloud Hub + Windows service notes
