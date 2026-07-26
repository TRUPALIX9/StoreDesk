# docs/ — Agent map

Parent product context: root `AGENTS.md`. Agent team: `.cursor/TEAM.md`.

## Purpose

Human and agent documentation for the whole StoreDesk system. Prefer editing an existing file over creating a parallel one.

## File map

| File | Contents |
|------|----------|
| `storedesk-gemini-project-brief.md` | **Full project brief for Gemini/LLM paste** — product, UX, schema, APIs, Verifone, repos |
| `agent-team-guide.md` | **Agents, skills, WO/handoff flow, product rules** (start here for team ops) |
| `how-storedesk-works.md` | End-to-end human guide: what it is, how apps connect, journeys |
| `system-map.md` | Connection map + ranked gap fill plan (team review) |
| `verifone-commander-price-book.md` | **Commander / Price Book / Cost Analysis** — capabilities, E2E, API, protocol notes |
| `verifone-commander-reports.md` | **Commander Ruby + T-Log / closed daily & shift** — periods, KPIs, POS Reports |
| `architecture.md` | System architecture (desktop ↔ server ↔ Buddy) |
| `api-contract.md` | HTTP API surfaces |
| `database-schema.md` | Mongo entities (no Inventory/Stock) |
| `wireframes.md` | Desktop/mobile UX wireframes |
| `ui-architecture.md` | Electron UI system + Cursor skills |
| `mobile-flow.md` | Buddy pairing/scan/upload flows |
| `invoice-extraction.md` | Extraction/review notes |
| `sprint-plan.md` / `sprint-status.md` | Delivery plan/status |
| `release.md` | Release notes/process |
| `work-orders/` | Active agent Work Orders (`WO-*.md`) |
| `handoffs/` | Optional cross-session handoffs (`HO-*.md`) |

## Owner

Primary: `docs-scribe`. Tech contract edits reviewed by `tech-lead`.

## Rules

- Product names: StoreDesk / StoreDesk Server / StoreDesk Mobile
- Document local-first (port 4310); no hosted backend unless asked
- Do not document stock/inventory product scope as in-scope
