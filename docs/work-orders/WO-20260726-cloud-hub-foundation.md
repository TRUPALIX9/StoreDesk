# WO-20260726-cloud-hub-foundation

- **Status:** done
- **Epic:** 1 — Cloud Hub
- **Points:** 8
- **Primary owner:** backend-server
- **Modules:** store-desk-cloud-backend

## Goal

Cloud Run–ready WebSocket hub: store rooms, agent/client channels, AGENT_KEY auth against Atlas. **No Redis** (single instance + session affinity).

## Stories

| Story | Pts | Status |
|-------|-----|--------|
| F1 Express + WSS | 3 | done |
| F2 Rooms | 2 | done |
| F3 Auth | 2 | done (Atlas + memory fallback) |
| F4 Deploy stub | 1 | done (Dockerfile + README) |

## Protocol (v0)

```txt
Client → Hub (JSON):
  { "type": "hello", "role": "agent"|"client", "storeId": "SD-…", "agentKey": "sk_…" }
Hub → Client:
  { "type": "welcome", "room": "store_SD-…" }
  { "type": "ping" } every 30s
Client → Hub:
  { "type": "pong" }
Hub rejects bad key with close 4401
```

## E2E

- [x] Agent mock connects with valid key → joins room (vitest)
- [x] Bad key rejected (4401)
- [x] `GET /health` 200
- [x] `npm run ci` passed
- [ ] Deploy to Cloud Run (ops follow-up)
- [ ] Wire live Atlas AGENT_KEY from Web-created stores (ops: set MONGODB_URI)

## Locked decisions

- No Redis in Epic 1
- Keep edge `:4310` untouched (Hub is separate)
- Atlas Store collection shared with StoreDesk Web
