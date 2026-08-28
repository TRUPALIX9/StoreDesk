---
name: work-order
description: >-
  Skill for creating and updating StoreDesk Work Orders. Use whenever
  eng-manager accepts a task. Produces a WO file under docs/work-orders/.
  Includes story point estimation and sprint slot assignment.
---

# Work Order Skill

## File Location

```
docs/work-orders/WO-YYYYMMDD-short-slug.md
```

## Story Point Scale

| SP | Effort | Use when |
|----|--------|----------|
| 1 | < 1 hr | Config tweak, copy fix, single field |
| 2 | ~2 hrs | One file, one function, one test |
| 3 | ~4 hrs | One feature slice (model + service OR page + hook) |
| 5 | ~1 day | Full feature (model + service + route + tests OR full page) |
| 8 | ~2 days | Cross-module or multi-phase feature |
| 13 | ~3-4 days | Epic slice — break before starting |
| 21 | > 1 week | Too big — decompose, no estimate valid |

Fibonacci only: 1, 2, 3, 5, 8, 13, 21.

## WO Template

```markdown
# WO-YYYYMMDD-short-slug

**Status:** draft | ready | in_progress | blocked | in_review | done | cancelled
**Priority:** P0 | P1 | P2 | P3
**Story Points:** [1 | 2 | 3 | 5 | 8 | 13 | 21]
**Sprint:** YYYY-Wxx (ISO week) | backlog
**Management:** directive | collaborative | delegated | review-gate
**Primary owner:** [agent name]
**Reviewers:** [optional]
**Modules touched:** [submodule names]
**Created:** YYYY-MM-DD

---

## Goal

One sentence: what this WO achieves.

## Background

Why this is needed. Link to architecture docs if relevant.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All verify commands pass (see Verify section)

## Out of Scope

- Item A — why excluded
- Item B — why excluded
- No inventory / stock (always)

## Phase Breakdown

| Phase | Deliverable | SP | Gate |
|-------|-------------|----|------|
| 1 — [name] | [what ships] | [SP] | [check command] |
| 2 — [name] | [what ships] | [SP] | [check command] |
| N — Docs + Handoff | docs updated, handoff written | 1 | qa-verifier sign-off |

## Touch List

- `store-desk-electron/src/pages/SomePage.tsx` — reason
- `store-desk-worker/src/routes/some.routes.ts` — reason

## Dependencies

- WO-YYYYMMDD-xxx must complete first / runs in parallel
- API contract locked in `docs/api-contract.md`

## Verify Commands

| Module | Command | Sandbox |
|--------|---------|---------|
| Electron | `npm run check` | Standard |
| Worker | `npm run check` | BypassSandbox: true |
| Mobile | `flutter analyze && flutter test` | Android Studio |
| Web | `npm run build` | Standard |

## Handoff Log

_(append entries here as work progresses — see handoff skill)_
```

## State Transition Rules

- Only the primary owner or `eng-manager` changes status.
- `blocked` → name the blocker + who must act.
- `done` → requires QA PASS recorded in Handoff Log + `docs/sprint-status.md` updated.
- Never put secrets or credentials in WO files.

## Management Styles

| Style | Use when |
|-------|----------|
| `directive` | Hotfix, zero ambiguity, exact steps listed |
| `collaborative` | Cross-repo, tech-lead + IC co-plan (default for multi-repo) |
| `delegated` | Single-module, outcome-only, IC owns approach (default for bugfix) |
| `review-gate` | UI redesign — no close until ui-ux-designer reviews |

## Sprint Tracking

After creating a WO:
1. Add story to `docs/sprint-plan.md` under current sprint or backlog.
2. Update `docs/sprint-status.md` as status changes.
3. Sprint capacity: 20 SP solo / 30 SP with agent team per week.
