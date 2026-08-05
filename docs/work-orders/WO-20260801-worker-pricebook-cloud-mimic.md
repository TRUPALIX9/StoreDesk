# WO-20260801-worker-pricebook-cloud-mimic

- **Status:** done
- **Management:** collaborative
- **Priority:** P0
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** tech-lead, qa-verifier, docs-scribe
- **Phase 1 owner (done):** backend-server
- **Modules:** store-desk-worker | store-desk-electron | store-desk-cloud-backend | docs
- **Parent epic:** WO-20260726-cloud-migration-master
- **Related:** WO-20260726-edge-agent-outbound-wss (G1 deferred), WO-20260726-desktop-dual-mode (D3), docs/system-map.md P0 dual Express

## Goal

Make **local/dev mimic the cloud shape**: Electron is a client; **StoreDesk Worker** owns Commander / Price Book / PLU backup / batch APIs on `:4310`, with optional **Cloud Hub WSS relay** (local Hub for cloud-mimic, Cloud Run for production). Stop treating Electron `src/server` (`dev:embedded`) as the long-term home of Price Book.

## Architecture (locked)

### Production / cloud

```txt
Electron / Mobile  →  Cloud Hub (WSS relay)  →  Worker agent (store PC)
                                              ├─ HTTP :4310 (loopback relay target)
                                              ├─ local Mongo / in-memory AppState
                                              └─ Verifone Commander (LAN)
```

Hub is a **relay only** — catalog + Commander stay on the store PC. Atlas holds licenses/registry only.

### Dev local cloud-mimic (same protocol)

```txt
Terminal A: store-desk-cloud-backend  →  ws://127.0.0.1:8080/ws
Terminal B: store-desk-worker         →  :4310 + outbound HUB_WS_URL
Terminal C: store-desk-electron       →  npm run dev  (dev:external → http://127.0.0.1:4310)
```

| Mode | Electron talks to | Worker Hub env | Same as prod? |
|------|-------------------|----------------|---------------|
| **LAN direct (default)** | `http://127.0.0.1:4310/api` | unset | Yes for store LAN |
| **Local Hub mimic** | still `:4310` today; D3 adds Hub client | `HUB_WS_URL=ws://127.0.0.1:8080/ws` + demo keys | Yes for agent↔Hub protocol |
| **Legacy embedded** | Electron `dev:embedded` Express | n/a | Keep until Phase 3 thin/delete |

**Rule:** do not invent a special embedded-only Price Book protocol. HTTP `/api/price-book/*` on Worker is the contract; Hub relay already proxies any `/api/*` to loopback.

## Phased plan

### Phase 0 — Plan / WO (this session)

- [x] Document architecture + runbook
- [x] Inventory electron SoT vs worker stub

### Phase 1 — Port APIs to Worker (HTTP first)

Port from `store-desk-electron/src/server` → `store-desk-worker/src` (copy/adapt; Worker becomes SoT):

| Piece | Electron embed (legacy dual) | Worker (Phase 1 SoT) |
|-------|------------------------------|----------------------|
| `commanderPlu.service.ts` | still present | **ported** |
| `commanderLookups.service.ts` | still present | **ported** |
| `commanderReports.service.ts` | still present | **ported** |
| `priceBook.service.ts` | still present | **ported** |
| `knownDepartments.service.ts` | still present | **ported** |
| `shared/sellPrice.ts` | still present | **ported** |
| `priceBook.routes.ts` | live Commander | **live** (replaces stub) |
| `posReports.routes.ts` | Ruby reports | **ported** |
| `transactions.routes.ts` | T-Log | **ported** |
| storage PriceBook helpers | upsert/replace/dept filters | **extended** |
| `PriceBookEntry` types | upcModifier, dept, source | **aligned** |

Acceptance for Phase 1:

- [x] Worker serves live `GET /api/price-book` (Commander + overlays) when `COMMANDER_*` set
- [x] Worker serves `/api/price-book/commander/*` (status, backup, lookups, plu, batch-price, sync)
- [x] Worker serves POS Reports + Transactions routes (or documented follow-up if blocked)
- [x] Existing Worker CRUD tests updated for new response shapes; `npm run ci` green in worker
- [x] Electron `dev:embedded` **unchanged** (dual-support until Phase 3)
- [x] `.env.example` documents `COMMANDER_*`, `PLU_BACKUP_DIR`, Hub vars
- [x] README / WO runbook: local mimic commands

### Phase 2 — Electron client-only for Price Book

- [x] Default `npm run dev` + external Worker is enough for Price Book / Cost Analysis / POS Reports / Transactions
- [x] Document `dev:embedded` as legacy fallback only
- [ ] Optional: thin or delete electron `src/server` Commander paths after qa-verifier sign-off → **Phase 3**
- [ ] D3 Hub client path (WO-20260726-desktop-dual-mode) when ready

### Phase 3 — Hardening (later)

- [ ] Remove dual Express / G1 consolidate
- [ ] Live Hub E2E (Worker ↔ Hub ↔ client relay of Price Book)
- [ ] Windows service notes already in Worker README (G4)

## Acceptance criteria (WO close)

- [x] Local mimic runbook documented (Worker alone OR Worker + local Hub) — smoke with live Commander pending store LAN
- [x] Price Book client path works against Worker without `dev:embedded` (API client + default `dev:external`; unit CI green)
- [x] Hub relay can reach `/api/price-book` once Worker has routes (G3 `/api/*` allowlist; unit suite green)
- [x] No stock/inventory features added
- [x] qa-verifier (unit): `store-desk-worker` `npm run ci` pass (43 tests); `store-desk-electron` `npm run ci` pass (51 tests)
- [x] docs-scribe: `how-storedesk-works.md` / `system-map.md` / `verifone-commander-price-book.md` note Worker as Price Book home

## Out of scope

- Merging submodules / monorepo
- Moving catalog into Atlas
- Redis / multi-instance Hub
- Removing Electron embedded in the same PR as Phase 1
- Stock / inventory
- Full Mobile cloud (Epic 5)

## Touch list (expected)

**Worker (Phase 1):**

- `src/services/commanderPlu.service.ts` (new)
- `src/services/commanderLookups.service.ts` (new)
- `src/services/commanderReports.service.ts` (new)
- `src/services/priceBook.service.ts` (new)
- `src/services/knownDepartments.service.ts` (new)
- `src/shared/sellPrice.ts` (new)
- `src/shared/types.ts` (PriceBook + Commander lookups)
- `src/services/storage.service.ts` (upsert/replace/dept helpers)
- `src/routes/priceBook.routes.ts` (replace stub)
- `src/routes/posReports.routes.ts` / `transactions.routes.ts` (new) + `src/index.ts` mount
- `tests/priceBook.test.ts` (+ new commander unit stubs if feasible)
- `.env.example`, `README.md`

**Electron (Phase 1):** no required code change (keep embedded).

**Electron (Phase 2):** API client + Price Book UI aligned to Worker response shapes; README demotes `dev:embedded`.

**Parent docs:** this WO; `how-storedesk-works.md`, `system-map.md`, `verifone-commander-price-book.md`.

## Dependencies / blockers

- Commander LAN reachable only on store network (dev may run without password → graceful local-only overlays)
- Hub org E2E optional for Phase 1 (HTTP on Worker is enough)
- Response shape change: Worker stub returned **array**; Electron live returns **object** with `entries` — update tests + confirm Electron UI already expects object (it does when using embedded)

## Local mimic runbook

### A. LAN direct (minimum for Price Book after Phase 1)

```powershell
# Terminal 1 — Worker
cd store-desk-worker
# Ensure .env has PORT=4310 and optional COMMANDER_HOST / COMMANDER_USER / COMMANDER_PASSWORD
npm run dev

# Terminal 2 — Electron (client)
cd store-desk-electron
npm run dev
# → uses http://127.0.0.1:4310 (dev:external)
```

### B. Local Hub cloud-mimic (same WSS protocol as Cloud Run)

```powershell
# Terminal 1 — Hub
cd store-desk-cloud-backend
# Demo auth without Atlas: storeId SD-DEMO01 / agentKey sk_dev_demo_key
npm run dev
# ws://127.0.0.1:8080/ws

# Terminal 2 — Worker as agent
cd store-desk-worker
# In .env:
# HUB_WS_URL=ws://127.0.0.1:8080/ws
# STORE_ID=SD-DEMO01
# AGENT_KEY=sk_dev_demo_key
# + COMMANDER_* as needed
npm run dev
# Confirm GET http://127.0.0.1:4310/api/health → hub.connected true

# Terminal 3 — Electron (still HTTP to :4310 until D3 Hub client)
cd store-desk-electron
npm run dev
```

### C. Legacy (until Phase 3 thin/delete)

```powershell
cd store-desk-electron
npm run dev:embedded
# Do NOT also run Worker on 4310
```

## Notes

- Prefer **copy/adapt into Worker**, not leave Electron as SoT.
- Hub G3 already relays `/api/*` → `127.0.0.1:$PORT`; once Price Book is on Worker, cloud path works without new relay types.
- Feature flag / dual-support: keep `dev:embedded` until Phase 3.

## Acceptance notes (close)

- Worker is HTTP SoT for `/api/price-book*`, `/api/pos/reports`, `/api/pos/transactions`.
- Electron default `npm run dev` = `dev:external` → `127.0.0.1:4310`; client expects object list shape + Commander backup/lookups/batch.
- Dual embed retained; thin/delete deferred to Phase 3.
- Live Commander E2E on store LAN still operator-dependent (`COMMANDER_*`); offline unit CI covers local overlays.
- Checks: Worker `npm run ci` 43 tests; Electron `npm run ci` 51 tests (2026-08-01).

## Handoff log

### HO — 2026-08-01 22:25 (local)

- **From:** eng-manager
- **To:** backend-server
- **WO:** WO-20260801-worker-pricebook-cloud-mimic
- **State entering handoff:** in_progress

#### Done
- Read TEAM / work-order / how-storedesk-works / system-map / Hub WOs
- Inventoried gap: Worker price-book stub vs Electron full Commander stack
- Created this WO + architecture + runbook

#### Not done
- Phase 1 code port into `store-desk-worker`
- Test updates / ci
- Phase 2 Electron client-only

#### Decisions locked
- Local/dev must mimic cloud shape (Worker + optional local Hub)
- Phase 1 = HTTP on Worker first; Hub already relays `/api/*`
- Keep Electron embedded until Worker path works
- No stock/inventory; no submodule merge

#### Files touched
- `docs/work-orders/WO-20260801-worker-pricebook-cloud-mimic.md` — this WO

#### Risks / watchouts
- Storage API mismatch (worker create vs electron upsert/replace)
- Types thinner on Worker (`upcModifier`, `department`, `source`, lookups)
- Existing `tests/priceBook.test.ts` expects array list response
- Do not break `dev:embedded` in same change set

#### Next 3 actions
1. Copy Commander/Price Book services + sellPrice into Worker; extend types/storage
2. Replace `priceBook.routes.ts`; mount POS reports/transactions
3. Fix tests → `npm run ci` in worker; leave electron embedded intact

#### Commands already run
- Submodule inventory / file line counts — exploratory only

### HO — 2026-08-01 22:30 (local)

- **From:** backend-server
- **To:** eng-manager
- **WO:** WO-20260801-worker-pricebook-cloud-mimic
- **State entering handoff:** in_progress (Phase 1 code complete; WO checkboxes for Phase 1 ready to tick)

#### Done
- Ported Commander/Price Book stack into `store-desk-worker` (services + live routes)
- Extended Worker `PriceBookEntry` types + storage helpers (`upsert` / `replace` / dept filters)
- Mounted `/api/pos/reports` + `/api/pos/transactions`
- Updated `tests/priceBook.test.ts` for object list shape; offline CI (no Commander)
- Documented `COMMANDER_*` / `PLU_BACKUP_DIR` in `.env.example` + README Price Book / Hub mimic note
- `npm run ci` green in worker (43 tests)

#### Not done
- Phase 2: Electron client-only default / demote `dev:embedded`
- Parent docs (`how-storedesk-works.md` / `system-map.md`) — docs-scribe
- Deeper Commander unit suite port from Electron (optional; API + sellPrice covered)

#### Next 3 actions
1. frontend-electron: verify Price Book / Cost Analysis / POS Reports against Worker `npm run dev` (no embedded)
2. docs-scribe: note Worker as Price Book HTTP home + local mimic runbook in system docs
3. qa-verifier: smoke Worker+Electron LAN path; tick Phase 1 acceptance on WO

#### Files touched (Worker)
- New: commander* / priceBook / knownDepartments / rubyReportParse / transSetParse / transactions services; sellPrice; posReports + transactions routes
- Updated: priceBook.routes, storage, types, index, tests, `.env.example`, README

### HO — 2026-08-01 22:35 (local)

- **From:** eng-manager
- **To:** frontend-electron
- **WO:** WO-20260801-worker-pricebook-cloud-mimic
- **State entering handoff:** in_progress (Phase 1 done; Phase 2 open)

#### Done
- Phase 1 accepted at unit level ([backend-server](ca38bfa9-d601-4ca5-add8-d7687ff1a7f6) — Worker `npm run ci` green)
- WO inventory + close criteria updated; primary owner → frontend-electron
- Parent docs pointed at Worker as Price Book HTTP home

#### Not done
- Phase 2: prove Electron `npm run dev` (external) for Price Book / Cost Analysis / POS Reports / Transactions
- Demote `dev:embedded` in Electron docs/README after smoke
- Optional thin/delete of electron `src/server` Commander paths

#### Decisions locked
- Worker is HTTP SoT for Price Book/Commander; Electron embed remains dual-support until Phase 2 smoke
- No commit unless user asks

#### Next 3 actions
1. Smoke: Worker `npm run dev` + Electron `npm run dev` with `COMMANDER_*` on store LAN
2. Fix any API client mismatches; document `dev:embedded` as legacy
3. Hand to qa-verifier for dual-path regression, then eng-manager closes remaining WO boxes

### HO — 2026-08-01 22:50 (local)

- **From:** eng-manager
- **To:** closed
- **WO:** WO-20260801-worker-pricebook-cloud-mimic
- **State entering handoff:** done

#### Done
- Confirmed Worker Price Book/Commander/POS routes + Electron client alignment (object list, lookups, backup, batch)
- Documented `dev:embedded` as legacy in Electron README + parent docs
- Fixed LoadingState offline message (`store-desk-worker`)
- Updated WO acceptance; Phase 3 thin/delete + D3 Hub client remain open elsewhere
- `npm run ci` green: Worker 43 tests; Electron 51 tests

#### Not done
- Live Commander store-LAN smoke (operator env)
- Phase 3: remove Electron embed / Hub client E2E

#### Decisions locked
- Dual-support embed kept; Worker is SoT for Price Book HTTP
- Commit + push requested by user

#### Files touched
- Worker: Commander/Price Book port + tests + env/README
- Electron: Price Book client/UI + dual embed parity + README/LoadingState
- Parent docs: WO, how-storedesk-works, system-map, verifone-commander-price-book, cloud-migration master

#### Next 3 actions
1. Commit + push worker, electron, parent
2. Optional: live Commander smoke on store LAN
3. Later WO: Phase 3 thin embed + D3 Hub client

#### Commands already run
- `store-desk-worker`: `npm run ci` → exit 0 (43 tests)
- `store-desk-electron`: `npm run ci` → exit 0 (51 tests)
