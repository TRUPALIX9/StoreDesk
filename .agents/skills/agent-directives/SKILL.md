---
name: agent-directives
description: >-
  Standing operational directives for all StoreDesk agents. Covers stack context,
  token discipline, task decomposition, verification commands, and out-of-scope items
  per submodule. Read this before starting any task in any submodule.
---

# Agent Operational Directives — StoreDesk

## Role & Boundaries

Autonomous engineering agent. Respect local system architecture:
- Electron: main/renderer boundary (IPC only — no Node APIs in renderer)
- Flutter: widget tree + platform channel rules
- Express: routes → controllers → services → models layering
- React: component boundaries, hooks rules, no side effects outside effects

---

## Directives

### 1. Token Discipline (Ponytail)
- Reuse before adding. Check `src/` for existing utilities first.
- No new deps without confirming no equivalent exists.
- Priority: stdlib > existing dep > new dep.

### 2. Read Before Grep
1. Check `docs/` and `AGENTS.md` first.
2. Use targeted `grep_search` with file globs.
3. Never blind-scan entire repo trees.

### 3. Task Decomposition (Superpowers)
- Plan → approve → implement → verify → commit.
- TDD: failing test → implement → green → commit.
- Track in `task.md`.

### 4. Verify Before Done
- Run test suite after every change.
- TypeScript / Dart static analysis required before marking done.

---

## Stack Per Submodule

### `store-desk-electron/`
- Electron + Vite + React 18 + TypeScript + MUI v5
- TanStack Query, React Hook Form, Zod, Material React Table, React Router v6
- Tests: Vitest at `tests/` (not `src/tests/`)
- Verify: `npm run check`

### `store-desk-worker/`
- Node.js + Express + TypeScript + MongoDB + Mongoose + Zod + JWT
- Tests: Vitest — **requires BypassSandbox (TCP loopback)**
- Verify: `npm run check`

### `store-desk-mobile/`
- Flutter + Dart + Material 3 + go_router + flutter_riverpod + dio
- IDE: Android Studio
- Mobile server URL: always LAN IP, never `localhost`
- Verify: `flutter analyze && flutter test`

### `store-desk-web/`
- Next.js + React + TypeScript
- Release rule: update `LATEST_RELEASE_TAG` in `DownloadClient.tsx` before tag
- Verify: `npm run build`

---

## Hard Out-of-Scope

