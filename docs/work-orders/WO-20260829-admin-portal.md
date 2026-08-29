# WO-20260829-admin-portal

**Status:** done
**Priority:** P2
**Story Points:** 5
**Sprint:** 2026-W35
**Management:** collaborative
**Primary owner:** frontend-electron (store-desk-web admin UI)
**Reviewers:** tech-lead
**Modules touched:** store-desk-web
**Created:** 2026-08-29
**Closed:** 2026-08-29

---

## Goal

Build the internal Admin Portal in StoreDesk Web to let Antigravity/engineers manage organizations, stores, POS configuration, Cloudflare Tunnel URLs, and App Users from the cloud.

## Acceptance Criteria

- [x] `/admin` dashboard — lists all organizations with status badges and quick-nav
- [x] `/admin/organizations` — searchable org list table
- [x] `/admin/organizations/[orgId]` — org detail with **Stores** tab and **App Users** tab (Billing tab explicitly removed from scope)
- [x] `/admin/organizations/[orgId]/stores/[storeId]` — store detail: edit Tunnel URL, edit `configJson` (POS commander config with Zod validation), check live Cloudflare tunnel connection status
- [x] `GET /api/v1/admin/organizations/[organizationId]/app-users` — returns org-scoped app users joined with their assignment data (store, role)
- [x] `PUT /api/v1/admin/organizations/[organizationId]/stores/[storeId]` — updates store fields + validates `configJson` against `ConfigSchema` (Zod, `verifone_commander` only)
- [x] `GET + PUT /api/v1/edge/sync/config` — edge pull endpoint so Worker can fetch latest cloud config on demand
- [x] `POST /setup/v1/sync-cloud` in Worker — pulls config + tunnel token from cloud, updates sealedConfig + IntegrationSettings
- [x] **Refetch Config** button in `ManageWorkerPage.tsx` — triggers `sync-cloud` from Electron UI
- [x] `tsc --noEmit` passes on `store-desk-web`

## Out of Scope

- Billing / subscription UI (removed per product decision — no billing stubs)
- User provisioning form from admin UI (provisioning happens via setup key flow)
- Dark mode

## Touch List

- `store-desk-web/src/app/admin/organizations/[orgId]/page.tsx` — Stores + App Users tabs (no billing)
- `store-desk-web/src/app/api/v1/admin/organizations/[organizationId]/app-users/route.ts` — [NEW] org-scoped user list
- `store-desk-web/src/app/api/v1/admin/organizations/[organizationId]/stores/[storeId]/route.ts` — GET + PUT with Zod ConfigSchema
- `store-desk-web/src/app/api/v1/edge/sync/config/route.ts` — GET added (Worker pull)
- `store-desk-worker/src/routes/setup.routes.ts` — `POST /v1/sync-cloud` added
- `store-desk-electron/src/api/client.ts` — `syncCloudConfig()` method added
- `store-desk-electron/src/pages/ManageWorkerPage.tsx` — Refetch Config button added

## Handoff Log

- **2026-08-29:** WO created and completed in same session. All API routes, UI tabs, and sync flow implemented. TypeCheck passes. Committed to `develop` on all three submodules.
