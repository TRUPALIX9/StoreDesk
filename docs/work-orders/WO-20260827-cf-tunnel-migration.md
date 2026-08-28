# WO-20260827-cf-tunnel-migration

**Status:** in_progress
**Priority:** P1
**Story Points:** 13
**Sprint:** 2026-W35
**Management:** collaborative
**Primary owner:** backend-server + mobile-flutter + frontend-electron
**Reviewers:** tech-lead, qa-verifier
**Modules touched:** store-desk-worker, store-desk-mobile, store-desk-web
**Created:** 2026-08-27

---

## Goal

Migrate StoreDesk end-to-end from the dead GCP Cloud Hub / WebSocket relay architecture to the live Cloudflare Tunnel + HTTPS architecture, removing all stale Hub/relay code and wiring the CF tunnel token delivery gap.

## Background

Architecture is already partially implemented:
- Worker already has `cloudflareTunnel.service.ts` spawning `cloudflared`
- Web already provisions CF tunnel at store creation (`createStore()`)
- Mobile already has dual-URL logic (LAN probe → CF fallback)

**Critical gap:** `redeemSetupKey()` in StoreDesk Web does not return `cloudflareToken`/`tunnelUrl` in its response, so `POST /api/setup/v1/activation` in Worker cannot receive the token and the tunnel never starts after activation.

## Acceptance Criteria

- [ ] Web `redeemSetupKey()` returns `cloudflareToken` + `tunnelUrl` in activation response
- [ ] Worker `/api/setup/v1/activation` receives token, seals it, starts tunnel — all in one flow
- [ ] Worker `/api/setup/v1/status` returns `tunnelStatus` (running/stopped/no-token)
- [ ] Mobile removes `hub_relay_service.dart` (dead code, GCP WebSocket URL)
- [ ] Mobile `network_providers.dart` removes `hubRelayProvider` and `HubRelayService` injection
- [ ] Mobile stores CF tunnel URL as `server_url` in secure storage after login
- [ ] Mobile `api_client.dart` removes `_hubRelay` field and `_shouldUseRelay()` dead path
- [ ] ManageWorkerPage shows tunnel status (running/stopped/no-token) with start/stop buttons
- [ ] `npm run check` passes on Worker (BypassSandbox)
- [ ] `flutter analyze` passes on Mobile
- [ ] `npm run check` passes on Electron

## Out of Scope

- Service manager adapter stubs (separate WO — adapters are stubs but don't block tunnel)
- cloudflared binary download/install (separate WO — binary must be pre-installed or in PATH)
- Web UI changes beyond the API fix
- Inventory / stock (never)

## Phase Breakdown

| Phase | Deliverable | SP | Module | Gate |
|-------|-------------|----|--------|------|
| 1 — Web: fix redeem response | `redeemSetupKey()` returns `cloudflareToken` + `tunnelUrl` | 2 | store-desk-web | `npm run build` |
| 2 — Worker: tunnel status endpoint | `GET /api/setup/v1/tunnel/status` returns live status | 2 | store-desk-worker | `npm run check` |
| 3 — Worker: bind localhost only | Change `0.0.0.0` → `127.0.0.1` + env var `BIND_HOST` | 1 | store-desk-worker | `npm run check` |
| 4 — Mobile: remove Hub relay | Delete `hub_relay_service.dart`, clean `api_client.dart`, `network_providers.dart` | 2 | store-desk-mobile | `flutter analyze` |
| 5 — Mobile: store tunnel URL on login | After AppUser login, write `tunnelUrl` to `server_url` in secure storage | 3 | store-desk-mobile | `flutter analyze` + manual test |
| 6 — Electron: ManageWorkerPage tunnel UI | Show tunnel status chip + start/stop buttons | 2 | store-desk-electron | `npm run check` |
| 7 — Docs + Handoff | Update api-contract.md, sprint-status.md | 1 | docs | qa-verifier sign-off |

**Total SP: 13**

## Touch List

- `store-desk-web/src/lib/control-plane.ts` — `redeemSetupKey()` fetch CF token from Store record and include in response
- `store-desk-worker/src/index.ts` — `app.listen()` host: `0.0.0.0` → `127.0.0.1` (env var `BIND_HOST`)
- `store-desk-worker/src/services/cloudflareTunnel.service.ts` — add `getTunnelStatus()` export
- `store-desk-worker/src/routes/setup.routes.ts` — add `GET /v1/tunnel/status` endpoint
- `store-desk-mobile/lib/core/network/hub_relay_service.dart` — DELETE
- `store-desk-mobile/lib/core/network/api_client.dart` — remove `_hubRelay`, `_shouldUseRelay()`, `HubRelayService` import
- `store-desk-mobile/lib/core/network/network_providers.dart` — remove `hubRelayProvider`
- `store-desk-mobile/lib/features/connection/` — store `tunnelUrl` as `server_url` after login
- `store-desk-electron/src/pages/ManageWorkerPage.tsx` — tunnel status card

## Dependencies

- CF tunnel token must exist in Store model (`store-desk-web/src/models/Store.ts`) — confirmed ✅
- `cloudflared` binary must be in PATH on store PC — pre-requisite, out of scope

## Handoff Log

_(append entries as work progresses)_
