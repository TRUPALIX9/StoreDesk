---
name: storedesk-ui
description: >-
  StoreDesk Electron design system and UI consistency (PageShell, SectionCard,
  no redundant subtitles). Use with the mui skill when building or reviewing
  desktop pages (POS, Inventory, Price Book, Settings, sale tax, auth).
---

# StoreDesk UI Consistency

## Skill stack (load in order)

1. **`.cursor/skills/react-dev/SKILL.md`** — typed React/TS.
2. **`.cursor/skills/mui/SKILL.md`** — Material UI sx/theme/components.
3. **This skill** — StoreDesk page architecture and content density.
4. **MUI MCP** — official prop/API docs for the installed `@mui/material` major.
5. **Critique agent** — `.cursor/agents/ui-ux-designer.md` before large visual changes.
6. **Team** — `.cursor/TEAM.md` + `work-order` / `handoff` skills for multi-agent delivery.

## Design architecture

```txt
theme/           → palette, typography, component defaults, layout tokens
components/ui/   → PageShell, SectionCard, FilterBar, FormGrid, DataTableCard, SummaryRow
components/      → AppLayout, PageHeader, LoadingState, StatusChip, AuthShell
pages/           → route screens (compose only; no hardcoded colors)
modules/*/components/ → feature UI (POS, etc.) using shared ui primitives
```

Business logic stays in `api/`, `modules/*/utils/`, and services — never in page layout.

## Page structure (required)

Every page:

```tsx
<PageShell>
  <PageHeader title="…" actions={…} />
  <FilterBar>{/* search / filters */}</FilterBar>
  <DataTableCard>{/* tables */}</DataTableCard>
  {/* or */}
  <SectionCard title="…">{/* forms / summaries */}</SectionCard>
</PageShell>
```

Settings-style forms: `<PageShell maxWidth={720}>` or `<SectionCard maxWidth={720}>`.

## Layout rules

1. Use MUI `Stack` (`useFlexGap` is theme default) for 1D layout; `Box` + CSS grid for 2D.
2. Prefer `FilterBar`, `FormGrid`, `SectionCard`, `DataTableCard` over ad-hoc `Paper`/`Box`.
3. Use theme palette tokens (`primary.main`, `text.secondary`, `divider`) — never raw hex in pages.
4. Tables live inside `DataTableCard`. Forms live inside `SectionCard` or Dialog.
5. Spacing: page gap `2`, section padding `2.5`, form gap `1.5` (see `theme/layout.ts`).
6. Type `sx` props when extracting style maps (`SxProps<Theme>`) per the mui skill.

## No redundant subtitles

**Do not** put explanatory `Typography variant="body2" color="text.secondary"` under every title.

| Allowed | Not allowed |
|---------|-------------|
| Page title via `PageHeader` | Page subtitle explaining what the page does |
| Section title via `SectionCard` | Card subtitle like "POS daily import source" |
| Field `label` / `helperText` | Paragraphs restating the field |
| `Tooltip` / `Alert` when blocked | Always-visible how-to prose |
| Summary key/value (`SummaryRow`) | Tutorial copy in the header |

Guidance belongs in: control labels, `helperText`, dialogs, or Alerts when an action cannot proceed.

## MUI component preferences

- Buttons: `contained` primary action, `outlined` secondary, `text` tertiary
- Status: `StatusChip` or theme `Chip` — not custom colored text
- Empty / blocked states: `Alert`
- Loading / errors: `LoadingState`
- Navigation chrome: `AppLayout` only
- Auth screens: `AuthShell` with **title only**

## Checklist before finishing UI work

- [ ] Followed `.cursor/skills/mui/SKILL.md` patterns (theme tokens, spacing scale)
- [ ] Page uses `PageShell` + `PageHeader`
- [ ] No decorative subtitles under section titles
- [ ] No hardcoded colors (use theme)
- [ ] Filters in `FilterBar`; tables in `DataTableCard`
- [ ] Logic not embedded in JSX layout
- [ ] Consult MUI MCP for unfamiliar component APIs
- [ ] For major visual redesigns, run `.cursor/agents/ui-ux-designer.md` critique first

## Reference

- React skill: `.cursor/skills/react-dev/`
- MUI skill: `.cursor/skills/mui/`
- UI/UX agent: `.cursor/agents/ui-ux-designer.md`
- Layout tokens: `store-desk-electron/src/theme/layout.ts`
- Theme: `store-desk-electron/src/theme/index.ts`
- Primitives: `store-desk-electron/src/components/ui/`
- Architecture notes: `docs/ui-architecture.md`
