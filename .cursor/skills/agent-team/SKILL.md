---
name: agent-team
description: >-
  StoreDesk multi-agent team operating model (Cursor + Codex). Use when planning
  work across roles, assigning owners, or clarifying who does what. Read before
  multi-person / multi-repo agent runs.
---

# StoreDesk Agent Team Skill

Canonical org doc: **`.cursor/TEAM.md`**.  
Full guide (flows, rules, skills, WO/handoff): **`docs/agent-team-guide.md`**.

## Stack preference

- **Cursor**: `.cursor/agents/*`, `.cursor/skills/*`, `.cursor/rules/*`
- **Codex**: root / folder `AGENTS.md` + `.codex/skills/*` (thin pointers to Cursor skills)
- **Never**: `.claude/` or Claude Code kits

## When to use which agent

Call **eng-manager** first if ownership is unclear or the task spans repos.

Then:

1. Architecture / contract → `tech-lead`
2. Visual redesign → `ui-ux-designer` (critique) then `frontend-electron` / `mobile-buddy`
3. Implementation → specialist IC
4. Verify → `qa-verifier`
5. Docs → `docs-scribe`

## Required artifacts

| Artifact | Skill | Location |
|----------|-------|----------|
| Work Order | `work-order` | `docs/work-orders/WO-*.md` |
| Handoff | `handoff` | Append to WO or `docs/handoffs/` |

## Management styles (pick one per WO)

Set `management:` on the Work Order:

| Style | Manager behavior |
|-------|------------------|
| `directive` | Manager assigns exact steps; ICs execute only listed tasks |
| `collaborative` | Tech-lead + IC co-plan; manager unblocks and tracks |
| `delegated` | Manager sets outcome + acceptance; IC owns approach |
| `review-gate` | IC builds; no merge/close until tech-lead (and UI designer if UI) reviews |

Default for StoreDesk: **`collaborative`** for cross-repo; **`delegated`** for single-module bugfix; **`review-gate`** for UI redesigns.
