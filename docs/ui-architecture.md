# StoreDesk UI Architecture

## Goals

- Consistent MUI admin UI across POS, Products, Price Book, Settings, and catalog tools
- Dense, scannable layouts — titles and data, not tutorial copy
- Central theme + shared layout primitives so pages stay thin

## Agent skills (Cursor + Codex)

| Skill / agent | Path | Role |
|-------|------|------|
| **agent-team** | `.cursor/skills/agent-team/` | Org model, management styles |
| **work-order** | `.cursor/skills/work-order/` | WO lifecycle |
| **handoff** | `.cursor/skills/handoff/` | Role/session transfer |
| **react-dev** | `.cursor/skills/react-dev/` | Typed React/TS |
| **mui** | `.cursor/skills/mui/` | Material UI sx/theme/components |
| **storedesk-ui** | `.cursor/skills/storedesk-ui/` | Page shells, density, no subtitles |
| **ui-ux-designer** | `.cursor/agents/ui-ux-designer.md` | Design critic |
| **frontend-electron** | `.cursor/agents/frontend-electron.md` | Implements Electron UI |

Team doc: `.cursor/TEAM.md`. Codex mirrors: `.codex/skills/`.

Rules: `.cursor/rules/react-dev.mdc`, `mui.mdc`, `storedesk-ui.mdc`, `mui-mcp.mdc`, `ui-ux-designer.mdc`, `agent-team.mdc`.

## Layers

```txt
┌─────────────────────────────────────────────┐
│  pages/ + modules/*/components/             │  Feature screens
├─────────────────────────────────────────────┤
│  components/ui/                             │  PageShell, SectionCard, …
│  components/ (PageHeader, AppLayout, …)     │  App chrome
├─────────────────────────────────────────────┤
│  theme/                                     │  Palette, typography, layout
├─────────────────────────────────────────────┤
│  api/ + modules/*/utils/                    │  Data & domain logic
└─────────────────────────────────────────────┘
```

## Page composition

```txt
PageShell
  PageHeader          title + primary actions
  FilterBar           search / filters (optional)
  content
    DataTableCard     tables
    SectionCard       forms / summaries / settings
    Dialog            create / edit
```

## Content rules

1. **One title per section** — no subtitle explaining the section.
2. **Labels on controls** — meaning from fields, not paragraphs.
3. **Alerts only when needed** — blocked actions, errors, empty states.
4. **Flex/Stack first** — `Stack` for 1D; grid via `FormGrid` / `Box`.
5. **Flat surfaces** — outlined Paper; no glow KPI kits; brand blue `#1A63F4` / green `#00A87B` only (`brand-kit/`).
6. **One search** — page FilterBar only for that list.

## Brand

Assets: `brand-kit/` (canonical: `logo-mark.svg`, `logo-lockup-horizontal.svg`, `app-icon.ico`).  
Desktop copies live under `store-desk-electron/public/brand/`.

## Agent workflow (UI change)

1. `eng-manager` opens WO (`review-gate` for redesigns).
2. `ui-ux-designer` critiques if visual.
3. `frontend-electron` implements with `react-dev` → `mui` → `storedesk-ui`.
4. `qa-verifier` runs Electron checks.
5. `docs-scribe` updates this file if the system changed.
