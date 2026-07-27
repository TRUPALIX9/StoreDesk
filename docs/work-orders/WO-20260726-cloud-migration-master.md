# WO-20260726-cloud-migration-master

- **Status:** in_progress
- **Management:** collaborative
- **Priority:** P0
- **Points:** 3
- **Primary owner:** eng-manager
- **Modules:** docs | store-desk-web | store-desk-electron | store-desk-worker | store-desk-mobile | store-desk-cloud-backend

## Goal

Track StoreDesk migration from local-first to cloud-relayed multi-store (Web + Atlas control plane + Edge Agent / Worker + Desktop dual-mode + StoreDesk Mobile).

## Locked decisions

- Phone product: **StoreDesk Mobile** (not Buddy)
- Edge API product: **StoreDesk Worker** (not Server); folder still `store-desk-worker/`
- Cloud DB: MongoDB Atlas M0 (~512MB) for licenses/registry only
- No Redis
- Keep Worker `:4310` for LAN Mobile / agent local HTTP until dual-mode proven
- Brand: `#1A63F4` / `#00A87B` (+ kit shadows/mint)
- Web remote: `https://github.com/storedesk-dev/StoreDesk-web`
- Hub remote: `https://github.com/TRUPALIX9/store-desk-cloud-backend`
- **Cloud Desktop path:** Electron → Cloud Hub → Worker (not Electron → local Worker)
- **Marketing:** only ship features that exist (Worker + Desktop + Mobile on backoffice LAN). Do not advertise Hub/cloud to clients until D3 ships.

## Child WOs

| WO | Pts | Status |
|----|-----|--------|
| WO-20260726-scripts-commander-cleanup | 2 | done |
| WO-20260726-brand-kit-rollout | 5 | done |
| WO-20260726-docs-cloud-mobile-rename | 3 | done |
| WO-20260726-storedesk-web-foundation | 8 | done (ongoing polish) |
| WO-20260726-cloud-hub-foundation | 8 | done — pushed `https://github.com/TRUPALIX9/store-desk-cloud-backend` |
| WO-20260726-edge-agent-outbound-wss | 13 | done (live Hub E2E after Cloud Run) |
| WO-20260726-desktop-dual-mode | 8 | in_progress — D3: Electron → Hub → Worker (not local Worker) |
| WO-20260726-mobile-cloud-hub | 8 | in_progress — Epic 5 + same-PC `make stack` |

## Later epics

| Epic | Pts | WO |
|------|-----|-----|
| StoreDesk Mobile cloud | 8 | WO-20260726-mobile-cloud-hub (in progress) |

## E2E / push log

- Web: light theme + client-facing product story (no Hub marketing)
- Worker Hub outbound + G3 relay + G4 notes
- Hub GitHub repo: `https://github.com/TRUPALIX9/store-desk-cloud-backend` (private)
- Epic 5: Mobile Hub client + ApiClient relay; same-PC local stack (`docs/local-same-pc.md`)

## Handoff

### HO — 2026-07-26 Desktop path locked

- Cloud: **Electron → Hub → Worker** for latest store data.
- Local Worker URL in Desktop Settings = LAN/dev fallback only, not the cloud design.
- Next after Cloud Run: Worker live join E2E, then Desktop D3 Hub client.

### HO — 2026-07-26 Epic 5 started

- Mobile → Hub → Worker locked; LAN `:4310` fallback kept.
- Brand splash/loaders + app icons aligned across Desktop/Mobile.
- Remaining: wire Dio through Hub when mode=hub; live Hub E2E.