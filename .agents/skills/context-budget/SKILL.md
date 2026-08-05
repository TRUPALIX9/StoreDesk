---
name: context-budget
description: >-
  Keep StoreDesk agent context lean: prefer AGENTS.md maps and src/ docs;
  skip build outputs, lockfiles, mobile tooling caches, and secrets.
  Use before broad codebase searches or large refactors.
---

# StoreDesk Context Budget

Goal: spend tokens on **source of truth**, not on regenerated or vendor trees.

## Read first (cheap map, in order)

1. Root `AGENTS.md` — scope + non-negotiables
2. Nearest submodule `AGENTS.md`
3. `docs/system-map.md` or `docs/architecture.md` for cross-repo tasks
4. Active Work Order under `docs/work-orders/` if one exists

Do **not** open every README or every doc unless the task specifically needs it.

## Never open unless the task is specifically about that path

| Pattern | Why |
|---------|-----|
| `**/node_modules/**` | Vendor; use `package.json` instead |
| `**/dist/**`, `**/build/**`, `**/.next/**`, `**/out/**` | Build output |
| `**/coverage/**`, `**/.turbo/**`, `**/.cache/**` | Tool caches |
| `**/android/.gradle/**`, `**/ios/Pods/**`, `**/.dart_tool/**` | Mobile tooling |
| `**/.android/**`, `**/.flutter/**`, `**/.gradle/**` | Android Studio SDK caches |
| `**/*.apk`, `**/*.aab`, `**/release/**`, `**/win-unpacked/**` | Packaging artifacts |
| `**/package-lock.json`, `**/pnpm-lock.yaml`, `**/yarn.lock` | Huge; only when changing deps |
| `scripts/commander-downloads/**`, `**/*.xml` under probe dumps | Large data fixtures |
| `**/.git/**`, submodule `.git` internals | Not product code |
| `secrets/**`, `**/*service-account*.json`, `.env*` (except `.env.example`) | Secrets — never load |

## Prefer targeted search

- Grep/glob with path filters into `src/`, `lib/`, `app/`, `docs/`, `.github/workflows/`
- Open 1–3 files that match the symbol/route, not whole directories
- For "how does X work?" → start at `routes/` or `services/`, not UI + build + tests all at once

## Submodule rule

Work **inside the correct submodule**. Do not scan sibling apps unless the WO is cross-repo.

## Android Studio context note

Mobile work is done in **Android Studio**. The `.idea/` folder and Android SDK
paths are IDE metadata — skip them unless debugging a project-level IDE config.
Focus on `lib/` (Dart source) and `android/` (only when fixing Gradle issues).

## When generated files are OK

- Fixing a **compile error** pointing at `dist/` → fix **source**, not `dist/`
- Debugging a **Flutter/Gradle build** → open only the failing Gradle file named in the error
- Reviewing a **lockfile change** the user explicitly asked to commit
