# docs/ — Agent map

Parent product context: root `AGENTS.md`. Agent team: `.cursor/TEAM.md`.

## Purpose

Human and agent documentation for the whole StoreDesk system. Prefer editing an existing file over creating a parallel one.

## File map

| File | Contents |
|------|----------|
| `storedesk-gemini-project-brief.md` | **Full Gemini/LLM paste brief** — modules, pages, DB split, how it works, optimization (updated 2026-08-02) |
| `agent-team-guide.md` | **Agents, skills, WO/handoff flow, product rules** (start here for team ops) |
| `how-storedesk-works.md` | End-to-end human guide: what it is, how apps connect, journeys |
| `system-map.md` | Connection map + ranked gap fill plan (team review) |
| `verifone-commander-price-book.md` | **Commander / Price Book / Cost Analysis** — capabilities, E2E, API, protocol notes |
| `verifone-commander-reports.md` | **Commander Ruby + T-Log / closed daily & shift** — periods, KPIs, POS Reports |
| `architecture.md` | System architecture (desktop ↔ Worker ↔ StoreDesk Mobile) |
| `api-contract.md` | HTTP API surfaces |
| `wireframes.md` | Desktop/mobile UX wireframes |
| `ui-architecture.md` | Electron UI system + Cursor skills |
| `mobile-flow.md` | StoreDesk Mobile pairing/scan/prices + Play beta `0.0.1-beta1` vs APK (no mobile invoice upload) |

| `sprint-plan.md` / `sprint-status.md` | Delivery plan/status |
| `release.md` | Branching, APK/AAB, Play beta, checklists |
| `../brand-kit/README.md` | Logos + color tokens (`#1A63F4` / `#00A87B`) |
| `cloud-backend-deploy.md` | Cloud Hub (WSS) deploy — Cloud Run checklist |
| `env-by-project.md` | Env vars per submodule — local / GitHub / Cloud Run / Vite |
| `release-status.md` | Canonical parent + module versions, SHAs, CI, artifacts, deployments, compatibility, and blockers |
| `work-orders/` | Active agent Work Orders (`WO-*.md`) |
| `handoffs/` | Optional cross-session handoffs (`HO-*.md`) |

## Owner

Primary: `docs-scribe`. Tech contract edits reviewed by `tech-lead`.

## Rules

- Product names: StoreDesk / StoreDesk Worker / StoreDesk Mobile
- Document local-first (port 4310); no hosted backend unless asked
- Do not document stock/inventory product scope as in-scope
