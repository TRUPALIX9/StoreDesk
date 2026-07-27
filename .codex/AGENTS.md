# Codex — StoreDesk

Codex should treat the **repo root** as the working tree.

- Product master: `AGENTS.md`
- Team: `.cursor/TEAM.md` + full guide `docs/agent-team-guide.md`
- Skills: read `.codex/skills/*/SKILL.md` (mirrors → `.cursor/skills/`)
- Folder maps: nearest `AGENTS.md` under `docs/`, `scripts/`, `tools/`, `store-desk-*`
- **Do not use** Claude Code or `.claude/`

For non-trivial work: Work Order in `docs/work-orders/` + handoffs when switching roles.

## Branches and CI

- Default branch: **`production`** (not `main`). Integration: **`develop`**.
- Same model in parent repo and every `store-desk-*` submodule.
- CI: `.github/workflows/ci.yml` in each repo — triggers on `production` and `develop`.
- Commit app changes inside the submodule, push, then bump the parent submodule pointer.
- Docker: Cloud Hub only (`store-desk-cloud-backend/Dockerfile` → Cloud Run). Edge apps are not dockerized.
