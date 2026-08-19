# WO-20260812-bg-sync-carousel

**Status:** `ready`  
**Priority:** P1  
**Management:** collaborative  
**Primary owner:** backend-server (Worker services) · frontend-electron (Electron UI)  
**Reviewers:** tech-lead, qa-verifier  
**Modules touched:** `store-desk-worker` · `store-desk-electron`  
**Created:** 2026-08-12  
**Related WO:** `WO-20260812-hub-e2micro-migration` (Cloud Hub e2-micro VM migration — runs in parallel)

---

## Goal

Add three features to StoreDesk that improve data availability and the POS Reports UX:

1. **Background Sync Service (Worker)** — automatically fetches and saves transactions + daily/monthly reports to local MongoDB on a configurable timer. Rolling window ensures the DB doesn't grow unbounded.
2. **Configurable Retention (Settings)** — users can tune the max record counts and sync interval via the Settings page in Electron.
3. **Carousel Slider Header (POS Reports)** — replaces the period dropdown with a horizontal date carousel. Auto-loads today's report on open. Past days show total sales from cache. Future dates are blocked. Works offline using locally-saved data.

---

## Design Principles

- **PLU refresh is never triggered from Electron UI.** The `cacheCommanderPriceBook()` call at startup (`index.ts` line 102) is the sole PLU refresh entry point. The background sync adds time-based re-runs but does NOT add any button or API call from the desktop app.
- **Cache-first UX.** The carousel always checks local MongoDB before calling Commander. Commander is the fallback, not the primary.
- **Rolling window, not append-only.** When a collection exceeds its configured limit, the oldest records are pruned automatically after each sync cycle.
- **Sync is silent.** No toasts, dialogs, or interruptions during automatic background sync. The Settings page shows last-sync status passively.

---

## Acceptance Criteria

### Worker
- [ ] `POSMonthlyReportModel` defined and exported from `src/models/index.ts`
- [ ] `backgroundSync.service.ts` exports: `startBackgroundSync`, `stopBackgroundSync`, `restartBackgroundSync`, `getBackgroundSyncStatus`
- [ ] `runSync()` calls `syncTransactions`, `syncDailyReport`, `syncMonthlyReport` — each with prune logic
- [ ] Sync interval is read from `getRetentionLimits().backgroundSyncIntervalMin` (default 15 min)
- [ ] `startBackgroundSync()` called in `startServer()` after Commander config check
- [ ] `GET /api/settings/retention` returns defaults `{ maxDailyReports:1000, maxTransactions:400, maxMonthlyReports:24, backgroundSyncIntervalMin:15 }`
- [ ] `PUT /api/settings/retention` updates Mongo + restarts timer
- [ ] `GET /api/settings/sync-status` returns `{ lastSyncAt, transactions, daily, monthly }`
- [ ] `POST /api/settings/sync-now` triggers a sync cycle immediately (fire-and-forget, returns `{ ok:true }`)
- [ ] `GET /api/pos/reports/cached/daily` returns sorted list of `POSDailySummary` records
- [ ] `GET /api/pos/reports/cached/daily/:dateKey` returns single record or 404
- [ ] `GET /api/pos/reports/cached/monthly` returns sorted list of `POSMonthlyReport` records
- [ ] Commander offline → sync functions log and return gracefully without crashing Worker
- [ ] Pruning works: setting `maxDailyReports=3` and running sync 4+ times leaves exactly 3 records

### Electron
- [ ] `api.client.ts` has: `getRetentionLimits`, `saveRetentionLimits`, `getSyncStatus`, `triggerSyncNow`, `cachedDailyReports`, `cachedDailyReport`, `cachedMonthlyReports`
- [ ] `SettingsPage.tsx` shows new `SectionCard` "Data Retention & Background Sync" with 4 number fields + Save + Sync Now
- [ ] Save button calls `PUT /api/settings/retention` and shows success/error state
- [ ] `DailyReportCarousel.tsx` exists and renders ≥5 day cards in a scrollable row
- [ ] Future dates (dateKey > today) are non-clickable, opacity 0.35, lock icon
- [ ] Today's card is auto-selected on POS Reports mount
- [ ] Today's report auto-loads (cache-first, Commander fallback) without any button click
- [ ] Past days with saved data show `✓ Saved` chip + total sales amount
- [ ] Selecting a past day with cache loads instantly from local data (no Commander call)
- [ ] Selecting a past day without cache triggers Commander fetch
- [ ] `◀ ▶` arrows shift visible window; keyboard arrows navigate selection
- [ ] POS Reports page still shows Preview / Raw XML tabs below the carousel

---

## Touch List

### `store-desk-worker` (commit to `develop`)
| File | Change |
|------|--------|
| `src/models/index.ts` | Add `POSMonthlyReportModel` schema + export |
| `src/services/backgroundSync.service.ts` | **NEW** |
| `src/services/settings/integrationSettings.service.ts` | Add `getRetentionLimits`, `saveRetentionLimits` |
| `src/routes/settings.routes.ts` | Add `GET/PUT /retention`, `GET /sync-status`, `POST /sync-now` |
| `src/routes/posReports.routes.ts` | Add `GET /cached/daily`, `GET /cached/daily/:dateKey`, `GET /cached/monthly` |
| `src/index.ts` | Add `startBackgroundSync()` call after server listen |

### `store-desk-electron` (commit to `develop`)
| File | Change |
|------|--------|
| `src/api/client.ts` | Add retention + sync + cached report API methods |
| `src/pages/SettingsPage.tsx` | Add Data Retention SectionCard |
| `src/pages/PosReportsPage.tsx` | Replace period Select with DailyReportCarousel, auto-load today |
| `src/modules/pos/components/DailyReportCarousel.tsx` | **NEW** |

---

## Related Work Orders

| WO | Status | Relation |
|----|--------|---------|
| `WO-20260812-hub-e2micro-migration` | `in_progress` | Parallel — Hub VM migration. No code dependency between the two. Both commit to `develop` independently. |
| `WO-20260727-cloud-backend-deploy` | `superseded` | Superseded by hub-e2micro-migration |

---

## Out of Scope

- PLU refresh button in Electron UI — PLU is background-only on the Worker (already runs at startup)
- Transactions carousel (TransactionsPage keeps its current dropdown + paginated list)
- Monthly report carousel (carousel is daily-only for this WO)
- Stock / inventory (always out of scope per AGENTS.md)

---

## Handoff Log

- 2026-08-12 — eng-manager: WO created. Implementation plan in `implementation_plan.md` (Antigravity artifact). Code phase pending user approval of plan.
- 2026-08-12 — specialists: **Implementation completed.** All features built:
  - Background Sync Service runs automatically on Worker startup, updates MongoDB daily/monthly summaries + transaction logs, and enforces rolling window retention limits (default 1000 daily, 400 transaction, 24 monthly).
  - Data Retention settings added in Settings page (Save settings & manual Sync Now triggers).
  - Reports page dropdown replaced by custom horizontallly scrollable Timeline Carousel slider, supporting blocked future dates, cache-first instant loading, and today auto-load.
  - Verified: Build runs successfully for both modules; all 52 unit/integration tests passed green. Ready for QA sign-off.
