---
version: 1.0
name: StoreDesk-Design-System
description: StoreDesk's design language is an inspired interpretation of Stripe's pristine financial dashboard aesthetic, adapted for convenience store admin panels. It utilizes a deep navy primary palette, crisp white cards on a soft gray canvas, and relies on precise tabular typography for dense financial data. Components use tight-radius pills and subtle shadows to evoke trust and performance.
colors:
  primary: "#1A3F7A"
  primary-deep: "#132B54"
  primary-press: "#0C1D3B"
  primary-soft: "#4869A3"
  primary-bg-subdued-hover: "#E8F0FE"
  brand-dark-900: "#0F172A"
  ink: "#0F172A"
  ink-secondary: "#334155"
  ink-mute: "#64748B"
  on-primary: "#FFFFFF"
  canvas: "#FFFFFF"
  canvas-soft: "#F8FAFC"
  hairline: "#E2E8F0"
  hairline-input: "#CBD5E1"
  success: "#1FA35C"
  success-soft: "#D1FAE5"
  warning: "#F59E0B"
  warning-soft: "#FEF3C7"
  error: "#EF4444"
  error-soft: "#FEE2E2"

typography:
  display-lg:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.64px
  heading-md:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.2px
  body-md:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body-tabular:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: tnum
  button-md:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0.2px
  micro-cap:
    fontFamily: "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: 0.4px
    textTransform: uppercase

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    border: "1px solid {colors.hairline-input}"
  card-standard:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 8px
---

## Overview

StoreDesk relies heavily on the **Material UI (MUI)** component library, but uses a strict design token override to achieve a pristine, Stripe-inspired aesthetic. Because StoreDesk handles dense financial information (vendor prices, markups, tax reports), the layout must prioritize trust, clarity, and tabular data density over playful or generic styling.

## 1. Cards & Surfaces
* **Canvas:** Use `{colors.canvas-soft}` (`#F8FAFC`) for the main application background. Do not use pure white for the app background.
* **Cards:** Use `{colors.canvas}` (`#FFFFFF`) with precise, soft shadows. Avoid large, blurry drop-shadows.

## 2. Tabular Data & Pricing
* **Typography:** When displaying prices, markups, and margins, ALWAYS use `{typography.body-tabular}` to ensure tabular figures (`font-variant-numeric: tabular-nums`). This guarantees decimal points align perfectly in columns.
* **Density:** Tables should be compact with subtle row borders (`1px solid {colors.hairline}`). Avoid excessive padding inside cells.

## 3. Status Badges
Status indicators (e.g., "Matched Invoice", "Needs Review", "Best Price") should use pill-shaped badges (`border-radius: 9999px`) with soft backgrounds and solid text colors.
* **Matched/Good:** `{colors.success-soft}` background, `{colors.success}` text.
* **Review/Warning:** `{colors.warning-soft}` background, `{colors.warning}` text.

## 4. Prohibited Patterns
* **DO NOT** use generic rainbow gradients, glows, or neon accents.
* **DO NOT** use excessively large border radii on cards (stick to `8px` or `12px`).
* **DO NOT** override MUI inputs with custom HTML inputs; always use `TextField` with `size="small"`.
