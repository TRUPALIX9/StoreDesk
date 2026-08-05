---
name: handoff
description: >-
  Skill for writing Handoff notes when switching agent roles, pausing mid-WO,
  or returning failed QA to an IC. Append entries to the WO Handoff log or
  create a standalone file in docs/handoffs/.
---

# Handoff Skill

Use whenever:
- Switching agent roles during a Work Order
- Pausing mid-WO (end of session)
- QA fails → returning to IC with fix needed
- API contract changed → notifying consumer agents

## Where to write

- **Preferred:** append under `## Handoff log` in the Work Order file
- **Cross-cutting / standalone:** `docs/handoffs/HO-YYYYMMDD-short-slug.md`

## Template

```markdown
### HO — YYYY-MM-DD HH:mm (local)

- **From:** [agent role]
- **To:** [agent role]
- **WO:** WO-YYYYMMDD-short-slug
- **State entering handoff:** in_progress | blocked | in_review

#### Done
- [what was completed]

#### Not done
- [what remains]

#### Decisions locked
- [key decisions that must not be revisited without a new WO]

#### Files touched
- `path/to/file.ts` — what changed

#### Risks / watchouts
- [known risks or fragile areas]

#### Next 3 actions
1. Action for next agent
2. ...
3. ...

#### Commands already run
```bash
cd store-desk-worker && npm run check  # PASS
```
```

## Rules

- Be concrete — exact paths, exact commands.
- Link folder `AGENTS.md` instead of pasting the full product spec.
- Note if `ui-ux-designer` has already reviewed the UI (saves a round-trip).
- Never put secrets in handoff files.
- Mark Flutter checks as PENDING (not green) if Flutter SDK is not installed.
