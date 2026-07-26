# WO-20260726-cloud-migration-master

- **Status:** in_progress
- **Management:** collaborative
- **Priority:** P0
- **Points:** 3
- **Primary owner:** eng-manager
- **Modules:** docs | store-desk-web | store-desk-electron | store-desk-server | store-desk-mobile | store-desk-cloud-backend

## Goal

Track StoreDesk migration from local-first to cloud-relayed multi-store (Web + Atlas control plane + Edge Agent / Worker + Desktop dual-mode + StoreDesk Mobile).

## Locked decisions

- Phone product: **StoreDesk Mobile** (not Buddy)
- Edge API product: **StoreDesk Worker** (not Server); folder still `store-desk-server/`
- Cloud DB: MongoDB Atlas M0 (~512MB) for licenses/registry only
- No Redis
- Keep `:4310` until dual-mode proven
- Brand: `#1A63F4` / `#00A87B` (+ kit shadows/mint)
- Web remote: `https://github.com/storedesk-dev/StoreDesk-web`

## Child WOs

| WO | Pts | Status |
|----|-----|--------|
| WO-20260726-scripts-commander-cleanup | 2 | done |
| WO-20260726-brand-kit-rollout | 5 | done |
| WO-20260726-docs-cloud-mobile-rename | 3 | done |
| WO-20260726-storedesk-web-foundation | 8 | done (pushed) |
| WO-20260726-cloud-hub-foundation | 8 | done locally — GitHub `storedesk-dev/store-desk-cloud-backend` **not created yet** (org permission) |
| WO-20260726-edge-agent-outbound-wss | 13 | in_progress (G2 shipped; G1/G3/G4 deferred) |

## Later epics

| Epic | Pts | WO |
|------|-----|-----|
| Desktop dual-mode | 8 | TBD (Epic 4) |
| StoreDesk Mobile cloud | 8 | TBD (Epic 5) |

## E2E / push log

- Web: pushed `801423f` → storedesk-dev/StoreDesk-web
- Electron Worker rename: `e2126d1` pushed
- Worker (server) rename: `c55018d` pushed; Hub outbound: `9622a90` pushed
- Mobile docs: `66a1a42` pushed
- Hub GitHub repo: blocked — `TRUPALIX9 cannot create a repository for storedesk-dev`

## Handoff

### HO — 2026-07-26 continue

- Next: create Hub repo under storedesk-dev org, then G3 Commander relay + G4 Windows service notes; then Desktop dual-mode.
