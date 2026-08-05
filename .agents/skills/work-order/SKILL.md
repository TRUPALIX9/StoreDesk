---
name: work-order
description: >-
  Skill for creating and updating StoreDesk Work Orders. Use whenever
  eng-manager accepts a task. Produces a WO file under docs/work-orders/.
---

# Work Order Skill

## File location

```
docs/work-orders/WO-YYYYMMDD-short-slug.md
```

## Required frontmatter + sections

```markdown
# WO-YYYYMMDD-short-slug

**Status:** draft | ready | in_progress | blocked | in_review | done | cancelled
**Priority:** P0 | P1 | P2 | P3
**Management:** directive | collaborative | delegated | review-gate
**Primary owner:** [agent name]
**Reviewers:** [optional list]
**Modules touched:** [submodule names]
**Created:** YYYY-MM-DD

---

## Goal

One sentence: what this WO achieves.

## Background

Why this is needed.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

## Out of scope

- Item A (why)
- Item B (why)

## Touch list

- `store-desk-electron/src/pages/SomePage.tsx` — reason
- `store-desk-worker/src/routes/some.routes.ts` — reason

## Dependencies

- WO-YYYYMMDD-xxx (must complete first / in parallel)
- API contract locked in docs/api-contract.md

## Handoff log

(append entries here as work progresses — see handoff skill)
```

## State transition rules

- Only the primary owner or `eng-manager` changes status.
- `blocked` → name the blocker and who must act.
- `done` → requires QA PASS (or Flutter PENDING with reason) recorded in Handoff log.
- Never put secrets or credentials in WO files.

## Management styles

| Style | Use when |
|-------|----------|
| `directive` | Hotfix, zero ambiguity, exact steps listed |
| `collaborative` | Cross-repo, tech-lead + IC co-plan (default for multi-repo) |
| `delegated` | Single-module, outcome-only, IC owns approach (default for bugfix) |
| `review-gate` | UI redesign — no close until tech-lead + ui-ux-designer review |
