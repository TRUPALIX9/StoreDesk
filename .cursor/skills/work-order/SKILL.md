---
name: work-order
description: >-
  Create and update StoreDesk Work Orders (WO) for agent team delivery. Use when
  eng-manager starts a task, when scope changes, or when closing/cancelling work.
---

# Work Order Skill

## Create

1. Path: `docs/work-orders/WO-YYYYMMDD-short-slug.md`
2. Fill the template below.
3. Tell the user the WO id and primary owner.

## Template

```markdown
# WO-YYYYMMDD-short-slug

- **Status:** draft | ready | in_progress | blocked | in_review | done | cancelled
- **Management:** directive | collaborative | delegated | review-gate
- **Priority:** P0 | P1 | P2 | P3
- **Requester:** user | eng-manager
- **Primary owner:** frontend-electron | backend-server | mobile-buddy | tech-lead | docs-scribe
- **Reviewers:** (optional)
- **Modules:** store-desk-electron | store-desk-worker | store-desk-mobile | docs | scripts

## Goal

One paragraph.

## Acceptance criteria

- [ ] …
- [ ] …

## Out of scope

- …

## Touch list (expected)

- `path/...`

## Dependencies / blockers

- …

## Notes

…

## Handoff log

Link or paste handoffs chronologically (see `handoff` skill).
```

## Update rules

- Status transitions only via the owner or eng-manager.
- When blocked: set `blocked`, write blocker + next asker.
- When done: all acceptance boxes checked; qa-verifier verdict recorded.
- Never put secrets (API keys, service account JSON) in WO files.
