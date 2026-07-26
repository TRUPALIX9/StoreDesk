# WO-20260726-cloud-migration-master

- **Status:** in_progress
- **Management:** collaborative
- **Priority:** P0
- **Points:** 3
- **Primary owner:** eng-manager
- **Modules:** docs | store-desk-web | store-desk-electron | store-desk-server | store-desk-mobile

## Goal

Track StoreDesk migration from local-first to cloud-relayed multi-store (Web + Atlas control plane + Edge Agent + Desktop dual-mode + StoreDesk Mobile).

## Locked decisions

- Phone product: **StoreDesk Mobile** (not Buddy)
- Cloud DB: MongoDB Atlas M0 (~512MB) for licenses/registry only
- No Redis
- Keep `:4310` until dual-mode proven
- Brand: `#1A63F4` / `#00A87B` (+ kit shadows/mint)

## Child WOs (Phase 0)

| WO | Pts | Status |
|----|-----|--------|
| WO-20260726-scripts-commander-cleanup | 2 | done |
| WO-20260726-brand-kit-rollout | 5 | done |
| WO-20260726-docs-cloud-mobile-rename | 3 | done |
| WO-20260726-storedesk-web-foundation | 8 | done |
| WO-20260726-cloud-hub-foundation | 8 | done |

## Later epics

| Epic | Pts | WO |
|------|-----|-----|
| Edge Agent | 13 | TBD (Epic 3 / WO-G) |
| Desktop dual-mode | 8 | TBD (Epic 4) |
| StoreDesk Mobile cloud | 8 | TBD (Epic 5) |

## Phase 0 E2E log

- 2026-07-26: Deleted `scripts/commander-downloads/` and leftover probe XMLs; scripts AGENTS/README updated.
- 2026-07-26: Brand kit stable names + Electron theme/sidebar/AuthShell/LoadingState + `build/icon.ico`.
- 2026-07-26: Docs/rules rename Buddy → StoreDesk Mobile; cloud control-plane notes in how-storedesk-works + master rule.
- 2026-07-26: `store-desk-web` Next.js scaffolded (marketing `/`, `/admin` licenses memory/Atlas, mock agents). `npm run build` passed.
- 2026-07-26: Electron `npm run typecheck` passed.
- 2026-07-26: Commits — electron `88c0571`, web `f82c980`, server `ea68bf6`, mobile `3d476c5`, parent `fea6b37`.

## Epic 1 E2E log

- 2026-07-26: `store-desk-cloud-backend` Hub — health, WSS `/ws`, rooms, auth, Dockerfile; `npm run ci` 3 tests passed; commit `bc36950`.

## Handoff log

### HO — 2026-07-26 start

- Deleted done/superseded WOs (bootstrap, excel seed, commander docs x2, electron-price-book-plu)
- Kept in_review WOs: system-flow-gap, cost-analysis, live-commander-price-book, pos-reports

### HO — 2026-07-26 Phase 0 + Epic 1 Hub foundation

- Phase 0 committed. Epic 1 Cloud Hub scaffolded and CI green. Next: Edge Agent outbound WSS (WO-G) while keeping `:4310`.
