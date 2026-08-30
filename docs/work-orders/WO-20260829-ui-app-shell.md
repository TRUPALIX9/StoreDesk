# WO-20260829-ui-app-shell

**Status:** ready
**Priority:** P0
**Story Points:** 5
**Sprint:** Backlog
**Management:** review-gate
**Primary owner:** frontend-electron
**Reviewers:** ui_ux_designer
**Modules touched:** store-desk-electron
**Created:** 2026-08-29

---

## Goal
Implement a modular, Stripe-inspired App Shell (Sidebar, Header, Banners) utilizing the strict DESIGN.md v2.0 palette.

## Background
The current AppLayout.tsx is monolithic and relies heavily on hardcoded Tailwind "slate" colors rather than the v2.0 StoreDesk Web design system. The ui_ux_designer agent has mandated breaking this into modular components and strictly enforcing the new blue/mint color scheme.

## Acceptance Criteria
- [ ] Split AppLayout.tsx into \AppSidebar.tsx\, \AppHeader.tsx\, \SystemBanners.tsx\, \ServerStatusWidget.tsx\.
- [ ] Sidebar uses \#122033\ (brand-dark-900).
- [ ] Main canvas uses \#f3f7ff\ (canvas-soft).
- [ ] Hover/Active states use \#1a63f4\ (primary).
- [ ] Drop all arbitrary shadows; enforce hairline borders (\gba(14, 67, 216, 0.16)\).

## Phase Breakdown
| Phase | Deliverable | SP | Gate |
|-------|-------------|----|------|
| 1 - Component Extraction | AppLayout split into distinct React components | 2 | Type check passes |
| 2 - Token Application | Apply DESIGN.md tokens & remove hardcoded hexes | 2 | Visual review |
| 3 - Verification | Final check by ui_ux_designer | 1 | qa-verifier sign-off |
