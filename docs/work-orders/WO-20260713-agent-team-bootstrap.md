# WO-20260713-agent-team-bootstrap

- **Status:** done
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** eng-manager
- **Reviewers:** docs-scribe, tech-lead
- **Modules:** docs | scripts | tools | store-desk-electron | store-desk-server | store-desk-mobile

## Goal

Remove Claude (`.claude/`) tooling, keep Cursor + Codex only, add per-folder AGENTS maps, and stand up a managed agent team with work orders and handoffs.

## Acceptance criteria

- [x] `.claude/` removed; docs/skills no longer point at Claude paths
- [x] `.cursor/TEAM.md` + specialist agents under `.cursor/agents/`
- [x] Skills: `agent-team`, `work-order`, `handoff`
- [x] Codex mirrors under `.codex/skills/`
- [x] Folder `AGENTS.md` for docs, scripts, tools, and each submodule
- [x] Always-apply `agent-team` rule wired

## Out of scope

- Implementing new product features
- Syncing submodule remotes / git commits (user-driven)

## Touch list (expected)

- `.cursor/`, `.codex/`, `docs/`, `AGENTS.md`, submodule `AGENTS.md`

## Notes

Management styles available for future WOs: `directive`, `collaborative`, `delegated`, `review-gate`.

## Handoff log

### HO — 2026-07-13 (bootstrap)

- **From:** session
- **To:** future eng-manager sessions
- **State:** done
- **Next:** Open new WOs for remaining Electron UI polish / catalog pages as needed
