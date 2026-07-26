# StoreDesk Agent Team

Cursor-only runtime. Codex CLI uses the same `AGENTS.md` + `.codex/skills/` mirrors.
**Do not use Claude Code / `.claude/`.**

Full human + agent guide (flows, rules, skills, WO/handoff): **`docs/agent-team-guide.md`**.

## Org chart

```txt
                    eng-manager
                         │
              ┌──────────┼──────────┐
              │                     │
         tech-lead              ui-ux-designer
              │                  (critique)
    ┌─────────┼─────────┐
    │         │         │
frontend   backend   mobile
electron   server    buddy
    │         │         │
    └────┬────┴────┬────┘
         │         │
    qa-verifier  docs-scribe
```

| Role | Agent file | Owns |
|------|------------|------|
| Engineering Manager | `.cursor/agents/eng-manager.md` | Intake, priority, work orders, handoffs, unblock |
| Tech Lead | `.cursor/agents/tech-lead.md` | Cross-repo architecture, API contracts, spikes |
| Frontend (Electron) | `.cursor/agents/frontend-electron.md` | `store-desk-electron/` UI + MUI |
| Backend (Server) | `.cursor/agents/backend-server.md` | `store-desk-worker/` API + models |
| Mobile (StoreDesk Mobile) | `.cursor/agents/mobile-buddy.md` | `store-desk-mobile/` Flutter |
| UI/UX Designer | `.cursor/agents/ui-ux-designer.md` | Design critique (readonly by default) |
| QA Verifier | `.cursor/agents/qa-verifier.md` | `npm run ci` / Flutter checks / regressions |
| Docs Scribe | `.cursor/agents/docs-scribe.md` | `docs/`, folder `AGENTS.md`, skills sync |

## Operating model

1. **Intake** → `eng-manager` turns a user ask into a **Work Order** (skill: `work-order`).
2. **Plan** → `tech-lead` (+ `ui-ux-designer` for UI) accept scope and file touch list.
3. **Build** → specialist agent(s) implement inside the correct submodule.
4. **Handoff** → writer fills Handoff note (skill: `handoff`) when switching role or pausing.
5. **Verify** → `qa-verifier` runs the module’s checks; `docs-scribe` updates docs/AGENTS if contracts changed.
6. **Close** → `eng-manager` marks WO done and summarizes for the user.

## Work order states

`draft` → `ready` → `in_progress` → `blocked` | `in_review` → `done` | `cancelled`

Store active WOs under `docs/work-orders/` as `WO-YYYYMMDD-short-slug.md`.

## Folder understanding

Closest `AGENTS.md` wins for Codex/Cursor directory context:

| Path | Purpose |
|------|---------|
| `/AGENTS.md` | Product master (scope, entities, APIs, non-negotiables) |
| `/docs/AGENTS.md` | Human + agent docs map |
| `/scripts/AGENTS.md` | Catalog/invoice data scripts |
| `/tools/AGENTS.md` | Parent tooling helpers |
| `/store-desk-electron/AGENTS.md` | Desktop app map |
| `/store-desk-worker/AGENTS.md` | API map |
| `/store-desk-mobile/AGENTS.md` | StoreDesk Mobile app map |

## Skills (Cursor canonical)

| Skill | Path |
|-------|------|
| agent-team | `.cursor/skills/agent-team/` |
| work-order | `.cursor/skills/work-order/` |
| handoff | `.cursor/skills/handoff/` |
| storedesk-ui | `.cursor/skills/storedesk-ui/` |
| mui | `.cursor/skills/mui/` |
| react-dev | `.cursor/skills/react-dev/` |

Codex mirrors (thin pointers): `.codex/skills/*/SKILL.md`.
