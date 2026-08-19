# WO-20260813-electron-ui-restructure

**Status:** ready
**Priority:** P1
**Management:** review-gate
**Primary owner:** frontend-electron
**Reviewers:** ui-ux-designer, tech-lead
**Modules touched:** store-desk-electron
**Created:** 2026-08-13

---

## Goal

Restructure every page in the StoreDesk Electron desktop app for a significantly better UX/UI: collapsible sidebar with nav groups, Design System rules codified in theme, Settings reimagined as a horizontal multi-step wizard with validation, and per-page layout improvements across all 10 active pages.

## Background

The current Electron UI uses MUI v6 but inconsistently — status is shown via `Chip` everywhere, pages scroll as single long columns, the sidebar is a fixed 252px `permanent` Drawer with no collapse, and Settings is an unstructured pile of `SectionCard` components. The user experience is functional but feels unpolished and unscalable. No UX rules have been codified, causing visual drift between pages.

This WO codifies a Design System, restructures `AppLayout`, and rewrites each page to the new standard — without altering any business logic or API contracts.

## Acceptance criteria

- [ ] Design system rules documented in `src/theme/ux-rules.md` and enforced via theme tokens
- [ ] `AppLayout` sidebar collapses to 68px icon-rail with `Tooltip`, expands to 252px, persists in `localStorage`
- [ ] Nav items grouped: POS / Products & Pricing / Setup — with visual dividers
- [ ] `StatusChip` usage: replaced across all pages with purpose-specific UI patterns (dot indicator, coloured text, or icon+text — NOT Chip for every status)
- [ ] `SettingsPage` rewritten as tabbed layout with horizontal wizard cards for setup steps, React Hook Form + Zod validation per tab section
- [ ] Dashboard: KPI cards with colour-coded borders, System Status + Quick Actions side-by-side
- [ ] POS Workspace: MUI `Tabs` component replaces custom toolbar switcher
- [ ] POS Reports: Preview / Raw XML tabs move into report card header
- [ ] Transactions: summary stats bar (count, total $, voids) above table
- [ ] Price Book: backup info → Alert banner; batch action as sticky bottom bar
- [ ] Cost Analysis: sticky Name column, computed Best Vendor chip, colour-coded Margin % column
- [ ] Vendors: responsive card grid replaces flat table
- [ ] Manage Worker: 4 health-status cards at top, process SectionCard below
- [ ] `tsc --noEmit` passes with zero errors after all changes
- [ ] All pages render without runtime errors in `npm run dev`

## Out of scope

- Any backend (Worker) API changes — purely frontend
- Dark mode — deferred to a future WO
- Mobile Flutter UI — separate repo/WO
- Stock / inventory features — banned by product spec
- APK download QR / Pairing QR — removed from product
- Switching away from MUI — AGENTS.md mandates MUI

## Package additions (Electron only)

| Package | Version | Purpose |
|---------|---------|---------|
| `@mui/x-date-pickers` | ^7.x | DatePicker / DateRangePicker for POS date filters |
| `@mui/x-date-pickers/AdapterDateFns` | ^7.x | Adapter for date-fns |
| `date-fns` | ^3.x | Date utilities (already used pattern) |

> Note: All other UI work uses existing packages (MUI v6, ApexCharts, React Hook Form, Zod).

## Touch list

### New files
- `src/theme/ux-rules.md` — Design system rules document (non-code, reference)
- `src/theme/tokens.ts` — Centralized semantic colour/spacing tokens (exported from theme index)
- `src/components/ui/StatusIndicator.tsx` — Replaces StatusChip for non-tag status display
- `src/components/ui/KpiCard.tsx` — Reusable metric card (icon, number, label, variant)
- `src/components/ui/NavGroup.tsx` — Sidebar nav group divider component
- `src/components/ui/WizardCard.tsx` — Horizontal expandable config step card (Settings wizard)
- `src/components/ui/StickyBatchBar.tsx` — Floating bottom action bar for multi-select flows
- `src/components/ui/HealthStatusCard.tsx` — Service health card (Manage Worker)
- `src/components/ui/BannerAlert.tsx` — Full-width contextual info/warning strip

### Modified files
- `src/theme/index.ts` — Import and spread tokens, add h4 typography, tighten MuiChip to badge-only use
- `src/theme/layout.ts` — Add `cardRadius`, `bannerHeight` constants
- `src/components/AppLayout.tsx` — Collapsible drawer, nav groups, user avatar, collapse toggle
- `src/components/ui/SectionCard.tsx` — Upgrade border-radius to token, add `variant` prop (default/elevated)
- `src/components/ui/index.ts` — Export new components
- `src/pages/DashboardPage.tsx` — KPI cards, 2-col layout, colour-coded price change table
- `src/pages/POSWorkspacePage.tsx` — MUI Tabs, lock icon on GTC tab, spinner sync button
- `src/pages/PosReportsPage.tsx` — Report card header tabs, source badge
- `src/pages/TransactionsPage.tsx` — Summary stats bar, StatusIndicator column
- `src/pages/PriceBookPage.tsx` — BannerAlert for backup, StickyBatchBar
- `src/pages/CostAnalysisPage.tsx` — Sticky Name column, Best column, Margin % colours, legend
- `src/pages/VendorsPage.tsx` — Card grid layout with KpiCard-style vendor cards
- `src/pages/ManageWorkerPage.tsx` — HealthStatusCard row, process SectionCard, bottom buttons
- `src/pages/SettingsPage.tsx` — Tabbed + WizardCard layout, RHF+Zod per section
- `src/pages/UserManagementPage.tsx` — Align to new Design System (minor)

## Dependencies

- None (self-contained Electron submodule work)
- MUI v6 already installed and configured

## Handoff log

2026-08-13 — WO created by eng-manager. Assigned to frontend-electron.
Status: ready → in_progress when implementation begins.
