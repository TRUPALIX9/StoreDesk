# StoreDesk — Antigravity Agent Team

This folder configures **Google Antigravity (AGY)** agents, skills, and rules
for the StoreDesk project.

> **Runtime precedence:**
> - Antigravity (AGY) → reads `.agents/` in this folder
> - Cursor → reads `.cursor/agents/` and `.cursor/skills/`
> - Codex → reads folder `AGENTS.md` + `.codex/skills/`
> - Never add `.claude/` (Claude Code kits are not used here)

---

## Org chart

```txt
                    eng-manager (AGY: you — the user-facing coordinator)
                         │
              ┌──────────┼──────────┐
              │                     │
         tech-lead              ui-ux-designer
              │                  (critique only)
    ┌─────────┼─────────┐
    │         │         │
frontend   backend   mobile
electron   server    flutter
    │         │         │
    └────┬────┴────┬────┘
         │         │
    qa-verifier  docs-scribe
```

## Team roster

| Role | Skill file | Owns |
|------|-----------|------|
| Engineering Manager | `skills/eng-manager/SKILL.md` | Intake, WO create/close, routing, unblocking |
| Tech Lead | `skills/tech-lead/SKILL.md` | Cross-repo architecture, API contracts, spikes |
| Frontend Electron | `skills/frontend-electron/SKILL.md` | `store-desk-electron/` React/MUI |
| Backend Server | `skills/backend-server/SKILL.md` | `store-desk-worker/` Express/Mongo |
| Mobile Flutter | `skills/mobile-flutter/SKILL.md` | `store-desk-mobile/` Flutter + Android Studio |
| UI/UX Designer | `skills/ui-ux-designer/SKILL.md` | Design critique (read-only by default) |
| QA Verifier | `skills/qa-verifier/SKILL.md` | CI checks, test pass/fail, risk notes |
| Docs Scribe | `skills/docs-scribe/SKILL.md` | `docs/`, folder AGENTS.md, skill/contract sync |

---

## Quick routing

| Ask | Call first |
|-----|-----------|
| Spans repos / ownership unclear | `eng-manager` |
| API shape / data model | `tech-lead` |
| Visual redesign / layout review | `ui-ux-designer` → implementer |
| Electron pages, MUI, theme, ManageWorkerPage | `frontend-electron` |
| service orchestration / cloudflared / OS service lifecycle (Electron main process) | `frontend-electron` |
| Worker API routes, Mongo, services | `backend-server` |
| Flutter screens, scan, product lookup | `mobile-flutter` |
| Android Studio / Gradle / build | `mobile-flutter` |
| "Did it pass CI?" | `qa-verifier` |
| Docs, api-contract, AGENTS maps, sprint docs | `docs-scribe` |


---

## Operating model

```
You (ask) → eng-manager → WO created (with SP estimate + sprint slot)
                          → tech-lead plans (if cross-repo)
                          → specialist builds (phase-by-phase)
                          → handoff note (every agent switch)
                          → qa-verifier checks
                          → docs-scribe updates sprint-status.md + api-contract
                          → eng-manager closes WO
```

## Work Order States

`draft` → `ready` → `in_progress` → `blocked | in_review` → `done | cancelled`

Store active WOs at: `docs/work-orders/WO-YYYYMMDD-short-slug.md`

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

Fibonacci only: 1, 2, 3, 5, 8, 13, 21. Sprint = 1 week. Capacity: 20 SP solo / 30 SP with agents.


---

## Non-negotiables (never violate)

2. **Submodule rule** — code changes inside the correct submodule; commit + push there; then bump parent pointer.
3. **Branches & Production Rule** — Work, commits, and pushes MUST ALWAYS go to `develop`. NEVER merge or push to `production` unless explicitly instructed by the user. Maintain `docs/develop-to-prod.md` to document all changes queued on `develop` ready for production PRs.
4. **Mobile / Web server URL** — always `https://<store-id>.storedesk.net` (Cloudflare Tunnel). Never raw LAN IP. Never `localhost`. Electron uses `http://localhost:4310` directly (same store PC).
6. **Naming** — StoreDesk (desktop), StoreDesk Worker (edge API), StoreDesk Mobile (Flutter), StoreDesk Web.
7. **Releases** — Before cutting a new release, always update the `LATEST_RELEASE_TAG` constant in `store-desk-web/src/app/download/DownloadClient.tsx` to match the new version tag.
8. **Ponytail Philosophy** — Always follow the "Ladder of Laziness" rules. Choose boring, native solutions over custom abstractions, boilerplate, and new dependencies (YAGNI).
9. **Caveman Style** — Communicate in a terse, technical, fragment-based format. Drop filler words, pleasantries, and hedging to optimize token efficiency while keeping code blocks exact.
10. **Open Design System** — Follow all design tokens, colors, typography rules, and density guidelines defined in the root [DESIGN.md](file:///Users/trupal/WORK/RCP/DESIGN.md) when generating UI.
11. **Superpowers Discipline** — Enforce process discipline, TDD, planning, systematic debugging, and mandatory skill invocation for all tasks.

---

## Related Cursor / Codex mirrors

- `.cursor/TEAM.md` — Cursor canonical org chart
- `.cursor/agents/` — Cursor agent definitions
- `.cursor/skills/` — Cursor canonical skills
- `.codex/skills/` — Codex thin pointers
- `docs/agent-team-guide.md` — Full delivery guide (flows, WO, handoffs)
- Root `AGENTS.md` — Product master spec
