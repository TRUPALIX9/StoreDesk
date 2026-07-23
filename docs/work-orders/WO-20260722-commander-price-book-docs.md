# WO-20260722-commander-price-book-docs

- **Status:** done
- **Management:** directive
- **Priority:** P2
- **Requester:** eng-manager
- **Primary owner:** docs-scribe
- **Reviewers:** eng-manager
- **Modules:** docs | store-desk-electron | scripts

## Goal

Document Verifone Commander / Price Book integration end-to-end (capabilities, API from real routes, protocol notes from observed scripts, UI, env/auth) without inventing official Verifone URLs.

## Acceptance criteria

- [x] Main doc under `docs/verifone-commander-price-book.md`
- [x] API section from `priceBook.routes.ts` / services (no invented endpoints)
- [x] Protocol notes + clear “no official Verifone PDF in repo”
- [x] Index pointers in `docs/AGENTS.md`, `how-storedesk-works.md`, `system-map.md`, `store-desk-electron/AGENTS.md`
- [x] Related July 20 WOs noted; no false history rewrite

## Out of scope

- Implementing `uPLUs` write-back
- Porting Price Book API into `store-desk-server`
- Committing secrets

## Touch list

- `docs/verifone-commander-price-book.md`
- `docs/AGENTS.md`
- `docs/how-storedesk-works.md`
- `docs/system-map.md`
- `docs/sprint-status.md` (pointer / pending wording)
- `store-desk-electron/AGENTS.md`
- `docs/work-orders/WO-20260720-*.md` (notes only)
- `docs/work-orders/WO-20260722-commander-price-book-docs.md`

## Notes

Docs-scribe pass 2026-07-22. Follow-up: `docs/verifone-commander-reports.md` (T-Log / closed daily).
