# WO-20260818-end-to-end-ui-redesign

**Status:** in_progress
**Priority:** P1
**Management:** delegated
**Primary owner:** eng-manager (Antigravity)
**Reviewers:** ui-ux-designer
**Modules touched:** store-desk-electron
**Created:** 2026-08-18

---

## Goal

Execute a complete end-to-end UI refactor across all Electron pages for a polished, consistent Stripe-inspired aesthetic with full-page utilization, standard paddings, and centralized error handling via a new Message Registry.

## Background

The UI currently suffers from cramped `maxWidth="lg"` containers, redundant titles, raw circular loading spinners, inline hardcoded text, and inconsistent padding. The UI/UX Designer Agent produced a comprehensive brief demanding `PageShell` full-width layouts, `EmptyState` and `LoadingSkeleton` usage, `card-standard` (8px border radius + precise shadow), and tabular numbers for financial grids. 

## Acceptance criteria

- [ ] All remaining pages (Vendors, Cost Analysis, Settings, Transactions, Auth, Manage Worker) converted to use `PageShell` without `maxWidth="lg"`.
- [ ] All redundant `<h4>` and `<h5>` sub-titles removed from page bodies.
- [ ] `<CircularProgress />` components replaced with `LoadingSkeleton`.
- [ ] Empty tables/lists wrapped in the standard `EmptyState` component.
- [ ] Tabular data wrapped in `DataTableCard` utilizing `font-feature-settings: 'tnum'`.
- [ ] All inline text for alerts, tooltips, and empty states extracted to `src/registry/messages.ts` and fetched via `useAppMessage()`.
- [ ] Error Boundary successfully wraps the React tree.

## Out of scope

- Updating the `store-desk-mobile` application.
- Altering the Express backend API schemas beyond what is strictly necessary to return standard Error Codes.

## Touch list

- `store-desk-electron/src/pages/*` — applying new layout standards.
- `store-desk-electron/src/registry/messages.ts` — tracking new error codes.
- `store-desk-electron/src/components/*` — standardizing empty states and cards.

## Dependencies

- None

## Handoff log

- **2026-08-18:** Phase 1 executed. Created Global Error Boundary, Developer Playground, defined `messages.ts` and `useAppMessage()`. Completely refactored `PriceBookPage` and `PosReportsPage` to use the new layouts. Typecheck passes. Next phase: Iteratively porting remaining pages per this plan.
