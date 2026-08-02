---
name: context-budget
description: >-
  Keep StoreDesk agent context small: prefer AGENTS.md and src docs; skip build
  outputs, lockfile noise, and generated artifacts unless debugging those paths.
  Use before broad codebase searches or large refactors.
---

# StoreDesk context budget

Goal: spend tokens on **source of truth**, not on regenerated or vendor trees.

## Read first (cheap map)

1. Root `AGENTS.md` (scope / non-negotiables)
2. Nearest submodule `AGENTS.md`
3. `docs/system-map.md` or `docs/architecture.md` when cross-repo
4. Active Work Order under `docs/work-orders/` if one exists

Do **not** open every README or every page under `docs/` unless the task needs it.

## Never open unless the task is about that path

| Pattern | Why |
|---------|-----|
| `**/node_modules/**` | Vendor; use `package.json` |
| `**/dist/**`, `**/build/**`, `**/.next/**`, `**/out/**` | Build output |
| `**/coverage/**`, `**/.turbo/**`, `**/.cache/**` | Tool caches |
| `**/android/.gradle/**`, `**/ios/Pods/**`, `**/.dart_tool/**` | Mobile tooling |
| `**/*.apk`, `**/*.aab`, `**/release/**`, `**/win-unpacked/**` | Packaging artifacts |
| `**/package-lock.json`, `**/pnpm-lock.yaml`, `**/yarn.lock` | Huge; only when changing deps |
| `scripts/commander-downloads/**`, `**/*.xml` under probe dumps | Large fixtures |
| `**/.git/**`, submodule `.git` internals | Not product code |
| `secrets/**`, `**/*service-account*.json`, `.env*` (except `.env.example`) | Secrets — never load into context |

## Prefer targeted search

- Grep/glob with path filters into `src/`, `lib/`, `app/`, `docs/`, `.github/workflows/`
- Open 1–3 files that match the symbol/route, not whole directories
- For “how does X work?”, start at routes/services, not UI + build + tests all at once

## Submodule rule

Work **inside the correct submodule**. Do not scan sibling apps unless the Work Order is cross-repo.

## When generated files are OK

- Fixing a **compile error** that points at `dist/` → still fix **source**, not `dist/`
- Debugging a **Flutter/Android build** → open only the failing log snippet / gradle file named in the error
- Reviewing a **lockfile change** the user explicitly asked to commit

## Codex / Cursor pairing

Canonical skill: `.cursor/skills/context-budget/SKILL.md`  
Codex pointer: `.codex/skills/context-budget/SKILL.md`  
Indexing ignore: root `.cursorignore`
