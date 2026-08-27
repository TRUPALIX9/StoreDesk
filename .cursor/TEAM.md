# StoreDesk Agent Team

Cursor runtime: `.cursor/agents/*` + `.cursor/skills/*` + `.cursor/rules/*`  
Antigravity (AGY) runtime: `.agents/` (mirrors + extends the Cursor team)  
Codex CLI: root / folder `AGENTS.md` + `.codex/skills/*` (thin pointers)  
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
electron   server    storedesk
    │         │         │
    └────┬────┴────┬────┘
         │         │
    qa-verifier  docs-scribe
```

| Role | Cursor agent | AGY skill | Owns |
|------|-------------|-----------|------|
| Engineering Manager | `eng-manager.md` | `skills/eng-manager/SKILL.md` | Intake, priority, work orders, handoffs, unblock |
| Tech Lead | `tech-lead.md` | `skills/tech-lead/SKILL.md` | Cross-repo architecture, API contracts, spikes |
| Frontend (Electron) | `frontend-electron.md` | `skills/frontend-electron/SKILL.md` | `store-desk-electron/` UI + MUI |
| Backend (Server) | `backend-server.md` | `skills/backend-server/SKILL.md` | `store-desk-worker/` API + models |
| Mobile (StoreDesk Mobile) | `mobile-storedesk.md` | `skills/mobile-flutter/SKILL.md` | `store-desk-mobile/` Flutter + **Android Studio** |
| UI/UX Designer | `ui-ux-designer.md` | `skills/ui-ux-designer/SKILL.md` | Design critique (readonly by default) |
| QA Verifier | `qa-verifier.md` | `skills/qa-verifier/SKILL.md` | CI checks / Flutter analyze / regressions |
| Docs Scribe | `docs-scribe.md` | `skills/docs-scribe/SKILL.md` | `docs/`, folder `AGENTS.md`, skills sync |

## Mobile development environment

Mobile branch uses **Android Studio** (not VS Code):

- Run / debug / hot-reload via Android Studio Device Manager
- CI check from Android Studio terminal: `flutter analyze && flutter test`
- AGY skill: `.agents/skills/mobile-flutter/SKILL.md`

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
| `/.agents/AGENTS.md` | AGY team org chart + routing |
| `/docs/AGENTS.md` | Human + agent docs map |
| `/scripts/AGENTS.md` | Catalog/invoice data scripts |
| `/tools/AGENTS.md` | Parent tooling helpers |
| `/store-desk-electron/AGENTS.md` | Desktop app map |
| `/store-desk-worker/AGENTS.md` | API map |
| `/store-desk-mobile/AGENTS.md` | StoreDesk Mobile app map |

## Skills (Cursor canonical / AGY mirrors)

| Skill | Cursor path | AGY path |
|-------|-------------|---------|
| agent-team | `.cursor/skills/agent-team/` | `.agents/skills/eng-manager/` |
| work-order | `.cursor/skills/work-order/` | `.agents/skills/work-order/` |
| handoff | `.cursor/skills/handoff/` | `.agents/skills/handoff/` |
| context-budget | `.cursor/skills/context-budget/` | `.agents/skills/context-budget/` |
| storedesk-ui | `.cursor/skills/storedesk-ui/` | — (Electron only) |
| mui | `.cursor/skills/mui/` | — (Electron only) |
| react-dev | `.cursor/skills/react-dev/` | — (Electron only) |

**Context:** use `context-budget` + root `.cursorignore` so agents do not load `node_modules/`, `dist/`, `build/`, lockfiles, APKs, `.gradle/`, `.dart_tool/`, or secrets into the prompt.

## Git branches and CI

Parent repo and every app submodule use two long-lived branches:

| Branch | Role |
|--------|------|
| `production` | Released / stable line (default; replaces `main`) |
| `develop` | Integration line for ongoing work |

Flow: land work on `develop` → promote with PR `develop` → `production`. CI runs on push/PR to both branches in each repo (`.github/workflows/ci.yml`).

Submodule rule unchanged: commit inside the submodule, push its branch, then update the parent submodule pointer on the matching parent branch.

Docker: No submodules are containerized today. Electron, Worker, Mobile, and Web run natively on the store PC or Vercel; no Docker required for local-first edge.
