# Codex — StoreDesk

Codex should treat the **repo root** as the working tree.

- Product master: `AGENTS.md`
- Team: `.cursor/TEAM.md` + full guide `docs/agent-team-guide.md`
- Skills: read `.codex/skills/*/SKILL.md` (mirrors → `.cursor/skills/`)
- Folder maps: nearest `AGENTS.md` under `docs/`, `scripts/`, `tools/`, `store-desk-*`
- **Do not use** Claude Code or `.claude/`

For non-trivial work: Work Order in `docs/work-orders/` + handoffs when switching roles.

## Context budget

Keep prompts small. Prefer maps over dumps:

1. Root `AGENTS.md` → nearest submodule `AGENTS.md` → only the files needed for the task
2. Skill: **`.codex/skills/context-budget/SKILL.md`** → canonical `.cursor/skills/context-budget/SKILL.md`
3. Indexing ignore: root **`.cursorignore`**

**Do not read** unless the task is specifically about that path:

```txt
node_modules/  dist/  build/  .next/  coverage/  .dart_tool/  ios/Pods/  android/.gradle/
package-lock.json  *.apk  *.aab  release/  win-unpacked/
scripts/commander-downloads/  secrets/  .env  *service-account*.json
```

When searching, constrain to `src/`, `lib/`, `app/`, `docs/`, or `.github/workflows/`.

## Branches and CI

- Default branch: **`production`** (not `main`). Integration: **`develop`**.
- Same model in parent repo and every `store-desk-*` submodule.
- CI: `.github/workflows/ci.yml` in each repo — triggers on `production` and `develop`.
- Commit app changes inside the submodule, push, then bump the parent submodule pointer.
- Docker: Cloud Hub only (`store-desk-cloud-backend/Dockerfile` → Cloud Run). Edge apps are not dockerized.
