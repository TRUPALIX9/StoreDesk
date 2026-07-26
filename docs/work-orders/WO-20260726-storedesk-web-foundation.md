# WO-20260726-storedesk-web-foundation

- **Status:** done
- **Points:** 8
- **Primary owner:** frontend-electron / docs-scribe
- **Modules:** store-desk-web

## Goal

Create Next.js App Router app on Vercel: product website + store license management (Atlas M0).

## Tasks

- [x] Scaffold Next.js in StoreDesk-web / `store-desk-web`
- [x] Brand marketing `/`
- [x] Atlas Store model + admin CRUD (memory fallback)
- [x] License fields STORE_ID / AGENT_KEY / entitlements
- [x] Mock agents page
- [x] Parent `.gitmodules` entry
- [x] `.env.example` with MONGODB_URI
- [ ] Push web remote + parent submodule pointer (needs commit)

## E2E

- [x] `npm run build` passed (marketing + admin + API routes)
- [ ] Create store against live Atlas (needs MONGODB_URI)
