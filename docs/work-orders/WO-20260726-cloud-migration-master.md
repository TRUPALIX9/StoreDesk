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
- Keep `:4310` until dual-mode proven
- Brand: `#1A63F4` / `#00A87B` (+ kit shadows/mint)
- Web remote: `https://github.com/storedesk-dev/StoreDesk-web`
- **Marketing:** only ship features that exist (Worker + Desktop + Mobile on backoffice LAN). Do not advertise Hub/cloud licenses to clients until dual-mode ships.

## Child WOs

| WO | Pts | Status |
|----|-----|--------|
| WO-20260726-scripts-commander-cleanup | 2 | done |
| WO-20260726-brand-kit-rollout | 5 | done |
| WO-20260726-docs-cloud-mobile-rename | 3 | done |
| WO-20260726-storedesk-web-foundation | 8 | done (ongoing polish) |
| WO-20260726-cloud-hub-foundation | 8 | done — pushed `https://github.com/TRUPALIX9/store-desk-cloud-backend` |
| WO-20260726-edge-agent-outbound-wss | 13 | done (live Hub E2E pending org repo) |
| WO-20260726-desktop-dual-mode | 8 | in_progress (D1/D2 done; D3 Hub client blocked on org repo) |

## Later epics

| Epic | Pts | WO |
|------|-----|-----|
| StoreDesk Mobile cloud | 8 | TBD (Epic 5) |

## E2E / push log

- Web: light theme + client-facing product story (no Hub marketing)
- Worker Hub outbound + G3 relay + G4 notes
- Hub GitHub repo: `https://github.com/TRUPALIX9/store-desk-cloud-backend` (private)

## Handoff

### HO — 2026-07-26 Hub remote on TRUPALIX9

- Hub remote: `https://github.com/TRUPALIX9/store-desk-cloud-backend` (private), submodule URL updated.
- Next: live Hub join E2E with Worker; Desktop dual-mode D3.
