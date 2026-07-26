# WO-20260713-system-flow-gap-redesign

- **Status:** in_review
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** eng-manager
- **Reviewers:** tech-lead, ui-ux-designer, frontend-electron, backend-server, mobile-buddy, qa-verifier, docs-scribe
- **Modules:** store-desk-electron | store-desk-worker | store-desk-mobile | docs

## Goal

Whole-team understanding of how StoreDesk pieces connect and operate; find flow/UX/product gaps; redesign the weakest UI flows; document a fill plan.

## Acceptance criteria

- [x] Connection map: Desktop ↔ Server ↔ Buddy (auth, data, ports)
- [x] Gap list ranked P0–P3 (product, API, UI, docs)
- [x] UI redesign applied where flow is clearly broken/sloppy (main nav surfaces)
- [x] Fill plan written for remaining gaps (owners + WO suggestions)
- [x] Handoff log updated for future sessions

## Out of scope

- Full lottery product build
- Hosted cloud deploy
- Inventory/stock features
- Committing/pushing unless user asks

## Deliverables

- `docs/system-map.md`
- Canvas: `storedesk-system-review.canvas.tsx`
- Electron: `AppLayout` IA, Dashboard home, Settings trim, Dashboard `SectionCard` polish
- Explore notes linked below

## Handoff log

### HO — 2026-07-13 team review

- **From:** eng-manager session
- **To:** next owners per gap table
- **State:** in_review

#### Done
- Full explore: Electron, Server, Buddy
- Desktop nav IA aligned to product journeys
- System map + canvas + this WO

#### Not done (open next WOs)
- Single-server consolidation
- Real extraction
- Buddy Home restore
- Catalog unify decision

#### Commands already run
- `store-desk-electron` `npm run typecheck` → exit 0

#### Explore agents
- Electron: d43b2eb6-4978-4a10-91d8-1860bd5294b5
- Server: 1225cdf3-450e-4e2b-a5d3-b6c0027b01bd
- Buddy: 4d9e0b5b-d483-474e-b368-22f34a9f8b92
