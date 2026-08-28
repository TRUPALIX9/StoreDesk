---
name: open-design
description: >-
  Open Design system skill. Directs agents to parse DESIGN.md to align all
  generated layouts, MUI theme configurations, and component styles.
---

# Open Design System

Ensure all UI components, pages, templates, and styles align with the design system in `DESIGN.md`.

## Guidelines:
1. **Always Read Design Rules**: Read [DESIGN.md](file:///Users/trupal/WORK/RCP/DESIGN.md) before writing any UI or styling code.
2. **Follow Color Tokens**: Use only the designated colors (`primary`, `success`, `ink`, `canvas-soft`, etc.) defined under `colors`. Do not use generic browser defaults or ad-hoc custom hex codes.
3. **Tabular Numerics**: For financial data, prices, metrics, or table displays, apply `font-variant-numeric: tabular-nums` or the corresponding `{typography.body-tabular}` token.
4. **Density and Sizing**: Maintain visual density guidelines. Use compact margins and paddings for dense dashboards.
5. **No Prohibited Patterns**: Avoid neon accents, generic rainbow gradients, or oversized border radii on containers (keep cards to `8px` or `12px` border-radius).
6. **Tool Consistency**: Use MUI components (like `TextField` with `size="small"`) and central theme overrides rather than writing custom HTML components.
