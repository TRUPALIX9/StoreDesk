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
| Electron pages, MUI, theme | `frontend-electron` |
| Routes, Mongo, services, Worker | `backend-server` |
| Flutter screens, scan, pairing | `mobile-flutter` |
| Android Studio / Gradle / build | `mobile-flutter` |
| "Did it pass CI?" | `qa-verifier` |
| Docs, api-contract, AGENTS maps | `docs-scribe` |

---

## Operating model

```
You (ask) → eng-manager → Work Order → tech-lead plans
                                       → specialist builds
                                       → handoff note
                                       → qa-verifier checks
                                       → docs-scribe (if contracts changed)
                                       → eng-manager closes WO
```

## Work order states

`draft` → `ready` → `in_progress` → `blocked | in_review` → `done | cancelled`

Store active WOs at: `docs/work-orders/WO-YYYYMMDD-short-slug.md`

---

## Non-negotiables (never violate)

1. **No inventory/stock** — no stock qty, low stock, reorder, warehouses, stock movements.
2. **Submodule rule** — code changes inside the correct submodule; commit + push there; then bump parent pointer.
3. **Branches** — `develop` (integration) and `production` (stable). Never push directly to `production` without QA.
4. **Mobile server URL** — LAN IP only (never `localhost` on the phone).
5. **Invoice → price** — user must review InvoiceItems before VendorPrice is created. Never auto-save raw extraction.
6. **Naming** — StoreDesk (desktop), StoreDesk Worker (edge API), StoreDesk Mobile (Flutter), StoreDesk Web.
7. **Releases** — Before cutting a new release, always update the `LATEST_RELEASE_TAG` constant in `store-desk-web/src/app/download/DownloadClient.tsx` to match the new version tag.

---

## Related Cursor / Codex mirrors

- `.cursor/TEAM.md` — Cursor canonical org chart
- `.cursor/agents/` — Cursor agent definitions
- `.cursor/skills/` — Cursor canonical skills
- `.codex/skills/` — Codex thin pointers
- `docs/agent-team-guide.md` — Full delivery guide (flows, WO, handoffs)
- Root `AGENTS.md` — Product master spec
