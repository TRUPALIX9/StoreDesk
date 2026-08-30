# WO-20260829-ui-data-tables

**Status:** draft
**Priority:** P1
**Story Points:** 5
**Sprint:** Backlog
**Management:** collaborative
**Primary owner:** frontend-electron
**Reviewers:** ui_ux_designer
**Modules touched:** store-desk-electron
**Created:** 2026-08-29

---

## Goal
Overhaul the global Material React Table implementations across Products, Variants, Vendors, and Pricing Rules pages.

## Background
StoreDesk handles dense financial information. The tables must prioritize tabular data density, ensure numeric alignment, and remove excessive padding.

## Acceptance Criteria
- [ ] Enforce \{typography.body-tabular}\ (\ont-variant-numeric: tabular-nums\) on all numeric columns.
- [ ] Remove excessive padding; enforce compact spacing.
- [ ] Table headers use \gba(14, 67, 216, 0.16)\ for subtle borders, rather than stark grays.

## Phase Breakdown
| Phase | Deliverable | SP | Gate |
|-------|-------------|----|------|
| 1 - Global Table Theme | Update MUI table overrides in theme.ts | 2 | visual check |
| 2 - Refactor Products | Refactor Products & Variants views | 2 | type check passes |
| 3 - Verification | Final visual check | 1 | qa-verifier sign-off |
