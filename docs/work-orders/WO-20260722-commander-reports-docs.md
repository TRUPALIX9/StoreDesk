# WO-20260722-commander-reports-docs

- **Status:** done
- **Management:** directive
- **Priority:** P2
- **Requester:** eng-manager
- **Primary owner:** docs-scribe
- **Modules:** docs | scripts

## Goal

Document Verifone Commander portal / T-Log reports — especially closed daily shift `vtransset` — from scripts + sample XML only (no invented APIs).

## Acceptance criteria

- [x] `docs/verifone-commander-reports.md` with report kinds, closed daily schema, monthly gaps, mermaid flows
- [x] Index pointers from `docs/AGENTS.md`, `how-storedesk-works.md`, `system-map.md`, Price Book doc
- [x] Clear: no official Verifone PDF in repo; POS still Sheets-backed

## Out of scope

- Implementing Commander → PosDailySummary import
- Calling `cclosedaynow` / closing periods from StoreDesk

## Notes

2026-07-22 docs-scribe.
