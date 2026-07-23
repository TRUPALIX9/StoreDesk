---
name: handoff
description: >-
  Structured handoff notes between StoreDesk agents (or sessions). Use whenever
  switching role, pausing mid-Work-Order, or transferring context to another agent.
---

# Handoff Skill

## When required

- Switching from one `.cursor/agents/*` role to another
- Ending a session with an open Work Order
- After qa fail → return to IC
- After API contract change → notify consumers

## Prefer

Append to the Work Order `## Handoff log` section.  
If cross-cutting or multi-WO: `docs/handoffs/HO-YYYYMMDD-short-slug.md`.

## Template

```markdown
### HO — YYYY-MM-DD HH:mm (local)

- **From:** <agent role or session>
- **To:** <agent role>
- **WO:** WO-…
- **State entering handoff:** in_progress | blocked | in_review

#### Done
- …

#### Not done
- …

#### Decisions locked
- …

#### Files touched
- `path` — why

#### Risks / watchouts
- …

#### Next 3 actions
1. …
2. …
3. …

#### Commands already run
- `…` → exit …
```

## Rules

- Be concrete (paths + commands), not essays.
- Never restate the entire AGENTS.md — link folder AGENTS instead.
- If UI: note whether `ui-ux-designer` already reviewed.
- If checks failed: paste the failure summary for `qa-verifier` / IC.
