# scripts/ — Agent map

Parent context: root `AGENTS.md`.

## Purpose

Offline data prep for invoice seeds and helper scripts used by StoreDesk.

## Typical contents

| Asset | Role |
|-------|------|
| `invoices/` | Normalized invoice JSON (e.g. Gandhi/Trident) |
| `make.ps1` / related | Local helper scripts |
| `README.md` | Human how-to for regenerating artifacts |
| Commander helpers | Live Verifone Commander probe/login scripts (not committed secrets) |

## Rules

- Price Book PLUs come from **live Commander**, not an Excel catalog dump.
- Do not reintroduce `Hop-in-4630-*.xlsx` / `hop-in-4630-catalog.normalized.json` seed pipelines.
- Prefer deterministic, documented transforms for invoice JSON; do not silently change price meaning.
- Commit script changes in the **parent** repo (not submodules).

## Owner

`docs-scribe` for README clarity; `tech-lead` / `backend-server` when seed schema changes.
