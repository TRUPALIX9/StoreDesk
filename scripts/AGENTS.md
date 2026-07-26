# scripts/ — Agent map

Parent context: root `AGENTS.md`.

## Purpose

Local helper scripts and offline invoice seed data for StoreDesk.

## Typical contents

| Asset | Role |
|-------|------|
| `make.ps1` | Windows task runner behind `make` / `make.cmd` |
| `package.json` | Optional Node helpers for scripts |
| `invoices/` | Normalized invoice JSON seeds |
| `README.md` | Human how-to |

## Do not keep

- `commander-downloads/` probe XML dumps
- Committed Commander credentials / session XML

Price Book PLUs come from **live Commander** via app tooling, not checked-in XML dumps.

## Rules

- Do not reintroduce Excel catalog seed pipelines (`Hop-in-4630-*.xlsx`).
- Prefer deterministic, documented transforms for invoice JSON.
- Commit script changes in the **parent** repo (not submodules).

## Owner

`docs-scribe` for README clarity; `tech-lead` / `backend-server` when seed schema changes.
