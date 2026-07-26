# WO-20260726-scripts-commander-cleanup

- **Status:** done
- **Points:** 2
- **Primary owner:** docs-scribe
- **Modules:** scripts

## Goal

Remove one-off Commander probe XML downloads and credential leftovers; keep intentional tooling.

## Tasks

- [x] Delete `scripts/commander-downloads/`
- [x] Remove leftover large/probe XMLs at scripts root if present
- [x] Update `scripts/AGENTS.md` + `scripts/README.md`

## E2E

- [x] No `commander-downloads` tree
- [x] Scripts README lists remaining tools only
