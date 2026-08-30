# Sprint Plan — StoreDesk

Sprint = 1 week Mon–Fri. Capacity: **20 SP** solo / **30 SP** with agent team.  
Story points: Fibonacci — 1, 2, 3, 5, 8, 13, 21.

---

# Current Sprint — 2026-W36 (1 Sep – 5 Sep 2026)

**Goal:** Full-repo audit → docs updated; begin AppUser Hub session wiring and LotterySetupPage.  
**Capacity:** 20 SP  
**Committed SP:** 8

## Stories

| WO | Title | SP | Owner | Status |
|----|-------|----|-------|--------|
| — | Full-repo audit + system-map / schema / sprint docs update | 3 | docs-scribe | done |
| — | LotterySetupPage — basic UI + Worker lottery routes | 5 | frontend-electron + backend-server | ready |

## Carried Over

_(none)_

## Backlog (next candidates)

| WO | Title | SP | Priority |
|----|-------|----|----------|
| — | AppUser Hub session — mobile + electron login → CF Tunnel | 8 | P0 |
| — | SetupWizardPage — setup-key redemption backend (Worker) | 8 | P0 |
| — | Invoice extraction — real PDF/OCR path (pdf-parse + pattern match) | 8 | P0 |
| — | Worker controllers/ layer — extract from service/route files | 3 | P1 |
| — | Electron `src/features/` + `src/layouts/` — populate first feature slice | 5 | P1 |
| — | Worker: `productService` + `variantService` full CRUD + tests | 5 | P2 |
| — | Worker: `vendorPriceService` price history + best-price query | 5 | P2 |
| — | Mobile: Scanner screen — CF Tunnel product lookup | 5 | P2 |
| — | StoreDesk Web: CF API tunnel provisioning on store creation | 8 | P2 |
| — | Electron: SetupWizardPage — setup-key redemption flow | 8 | P1 |

---

# Sprint Archive

## Sprint 2026-W35 (25 Aug – 29 Aug 2026) — completed

**Committed:** 8 SP | **Done:** 16 SP (overdelivered with agent team)

- WO-20260827-agent-skills-reconfig ✅ — Reconfigure team skills + SP system
- WO-20260827-arch-docs-cf-tunnel ✅ — Update all docs to reflect CF Tunnel + smart client arch
- WO-20260827-worker-two-component ✅ — Clarify Worker API vs service orchestration split
- WO-20260827-cf-tunnel-migration ✅ — CF Tunnel migration end-to-end

## Sprint 0 (completed)
- Repo + submodule structure
- AGENTS.md, docs/, architecture.md, api-contract.md, database-schema.md
- GitHub remotes connected

## Sprint 1–N (completed — see git log)
- Electron: full sidebar nav, Dashboard, Products, Vendors, Prices, Pricing Rules
- Worker: Express scaffolding, routes, models, middleware
- Mobile: connect flow, scanner, product lookup, vendor prices
- Web: Next.js site, download page, license admin

---

# Story Point Reference

| SP | Effort | Description |
|----|--------|-------------|
| 1 | < 1 hr | Config tweak, copy fix, single field change |
| 2 | ~2 hrs | One file, one function, one test |
| 3 | ~4 hrs | One feature slice (model + service OR page + hook) |
| 5 | ~1 day | Full feature (model + service + route + tests OR full page) |
| 8 | ~2 days | Cross-module or multi-phase feature |
| 13 | ~3–4 days | Epic slice — break before starting |
| 21 | > 1 week | Too big — decompose first, no estimate valid |
