---
name: superpowers
description: >-
  Superpowers process skill. Enforces process discipline, planning, TDD,
  systematic debugging, and mandatory skill invocation before any action.
  Source: https://github.com/obra/superpowers (v6.3.0, installed as Antigravity plugin)
---

# Superpowers — Process Discipline for StoreDesk Agents

Superpowers is installed as an Antigravity plugin at:
`~/.gemini/config/plugins/superpowers/`

Its `GEMINI.md` bootstrap auto-loads `using-superpowers` at session start.

## Core Rule (Non-Negotiable)

**Invoke relevant skills BEFORE any response or action** — including clarifying questions, file exploration, or code edits.

If a skill applies, you MUST read and follow its `SKILL.md`. No exceptions.

## Available Superpowers Skills

| Skill | When to Invoke |
|-------|---------------|
| `superpowers:brainstorming` | Before ANY creative work — new features, new components, new behavior |
| `superpowers:writing-plans` | After brainstorming, before touching code on multi-step tasks |
| `superpowers:systematic-debugging` | Before proposing ANY fix for a bug, test failure, or unexpected behavior |
| `superpowers:executing-plans` | When implementing a written plan task-by-task |
| `superpowers:subagent-driven-development` | When coordinating parallel agent work |
| `superpowers:test-driven-development` | Red → Green → Refactor loop |
| `superpowers:verification-before-completion` | Before marking any task done |
| `superpowers:requesting-code-review` | Before merging or closing a WO |
| `superpowers:receiving-code-review` | When responding to review feedback |
| `superpowers:finishing-a-development-branch` | Before PR or branch merge |
| `superpowers:using-git-worktrees` | When isolating parallel feature branches |

## Skill Priority

Process skills first, then domain/implementation skills:

1. `brainstorming` or `systematic-debugging` (sets approach)
2. Domain skill: `tech-lead`, `backend-server`, `frontend-electron`, `mobile-flutter`
3. `ponytail` (YAGNI gate — kills over-engineering)
4. `open-design` (design token alignment for any UI)
5. `qa-verifier` (before WO close)
6. `docs-scribe` (if contracts changed)

## Paths

- **"Build X"** → `brainstorming` → plan → domain skill → `qa-verifier`
- **"Fix bug"** → `systematic-debugging` → domain skill → `qa-verifier`
- **"Deploy / merge"** → `verification-before-completion` → `requesting-code-review` → `finishing-a-development-branch`

## Hard Gates

- No code written without approval from human partner first (brainstorming hard gate).
- No fix proposed without root cause investigation complete (systematic-debugging iron law).
- No WO closed without `qa-verifier` passing.

## Antigravity Platform Reference

See plugin skill file:
`~/.gemini/config/plugins/superpowers/skills/using-superpowers/references/antigravity-tools.md`
