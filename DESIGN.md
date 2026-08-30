---
version: 2.0
name: StoreDesk-Design-System
description: StoreDesk's updated design language unifies the desktop Electron app with the new web branding. It utilizes a vibrant tech-forward primary blue, mint green accents, crisp white cards on a cold blue-tinted background canvas, and relies on precise tabular typography for dense financial data.
colors:
  primary: "#1a63f4"
  primary-deep: "#0e43d8"
  primary-press: "#0c3bbb"
  primary-soft: "#dce8ff"
  primary-bg-subdued-hover: "#eef6ff"
  brand-dark-900: "#122033"
  ink: "#122033"
  ink-secondary: "#4f5d73"
  ink-mute: "#6b7c93"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f3f7ff"
  hairline: "rgba(14, 67, 216, 0.16)"
  hairline-input: "rgba(14, 67, 216, 0.25)"
  success: "#00a87b"
  success-soft: "#e3f8ef"
  success-light: "#28c88b"
  warning: "#f59e0b"
  warning-soft: "#fef3c7"
  error: "#ef4444"
  error-soft: "#fee2e2"

typography:
  display-lg:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.64px
  heading-md:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.2px
  body-md:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-tabular:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
    fontFeature: tnum
  button-md:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0.2px
  micro-cap:
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
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
    boxShadow: "0 1px 3px 0 rgba(26, 99, 244, 0.2), 0 1px 2px -1px rgba(26, 99, 244, 0.1)"
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
    boxShadow: "0 1px 3px 0 rgba(14, 67, 216, 0.08), 0 1px 2px -1px rgba(14, 67, 216, 0.04)"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.micro-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 8px
---

## Overview

StoreDesk relies heavily on the **Material UI (MUI)** component library, but uses a strict design token override to achieve a pristine aesthetic that aligns exactly with the new StoreDesk Web branding. Because StoreDesk handles dense financial information (vendor prices, markups, tax reports), the layout must prioritize trust, clarity, and tabular data density, while feeling like a modern, tech-forward product.

## 1. Cards & Surfaces
* **Canvas:** Use {colors.canvas-soft} (\#f3f7ff\) for the main application background. Do not use pure white for the app background.
* **Cards:** Use {colors.canvas} (\#ffffff\) with precise, soft blue-tinted shadows. Avoid large, blurry drop-shadows or stark gray/black shadows.

## 2. Tabular Data & Pricing
* **Typography:** When displaying prices, markups, and margins, ALWAYS use {typography.body-tabular} to ensure tabular figures (\ont-variant-numeric: tabular-nums\). This guarantees decimal points align perfectly in columns.
* **Density:** Tables should be compact with subtle row borders (\1px solid {colors.hairline}\). Avoid excessive padding inside cells.

## 3. Status Badges
Status indicators (e.g., "Matched Invoice", "Needs Review", "Best Price") should use pill-shaped badges (\order-radius: 9999px\) with soft backgrounds and solid text colors.
* **Matched/Good:** {colors.success-soft} background, {colors.success} text.
* **Review/Warning:** {colors.warning-soft} background, {colors.warning} text.

## 4. Prohibited Patterns
* **DO NOT** use generic rainbow gradients, glows, or neon accents. Stick to the brand's primary blue and green washes if depth is needed.
* **DO NOT** use excessively large border radii on cards (stick to \8px\ or \12px\).
* **DO NOT** override MUI inputs with custom HTML inputs; always use \TextField\ with \size="small"\.
