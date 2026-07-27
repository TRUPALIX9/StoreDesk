# StoreDesk Agent Team Guide

How agents, skills, work orders, and product rules fit together.

Canonical short org chart: [`.cursor/TEAM.md`](../.cursor/TEAM.md).  
Full product spec: [root `AGENTS.md`](../AGENTS.md).  
Human product guide: [`how-storedesk-works.md`](./how-storedesk-works.md).

---

## 1. What this system is

StoreDesk uses a **multi-agent team inside Cursor** (with Codex mirrors). Each agent has a fixed role. Work is tracked with **Work Orders** and **Handoffs**. Skills teach repeated patterns (UI, React, WO templates).

```txt
You (product ask)
       │
       ▼
 eng-manager ──► Work Order (docs/work-orders/)
       │
       ▼
 tech-lead / ui-ux-designer ──► plan + contracts
       │
       ▼
 frontend-electron | backend-server | mobile-buddy ──► build
       │
       ▼
 handoff note ──► next role / next session
       │
       ▼
 qa-verifier ──► checks
       │
       ▼
 docs-scribe (if contracts/docs changed) ──► eng-manager closes WO
```

**Runtime only:**

| Stack | Where | Use |
|-------|-------|-----|
| **Cursor** | `.cursor/agents/`, `.cursor/skills/`, `.cursor/rules/` | Primary |
| **Codex** | Folder `AGENTS.md` + `.codex/skills/` (thin pointers) | Same rules |
| **Never** | `.claude/` / Claude Code kits | Do not add |

---

## 2. Non-negotiable product rules

Every agent must obey these. They are also in root `AGENTS.md`.

### Naming

| Correct | Incorrect |
|---------|-----------|
| **StoreDesk** (desktop) | “StoreDesk Desktop” as product name |
| **StoreDesk Worker** | “the API” alone in user-facing copy |
| **StoreDesk Buddy** | “StoreDesk Mobile” |

### Scope

**In scope:** products, variants, UPC/barcode, vendors, vendor price history, invoice upload/review, suggested sell price, Buddy scan/upload, lottery placeholder.

**Never build:** stock quantity, inventory counts, add/reduce stock, low stock, reorder levels, warehouses, stock movements, `Inventory` / `StockMovement` models or APIs.

### Local-first connection

```txt
StoreDesk (PC)  ──localhost:4310──►  StoreDesk Worker (:4310, 0.0.0.0)
StoreDesk Buddy ──LAN_IP:4310────►  StoreDesk Worker
                                         │
                                         ▼
                                    MongoDB (local only)
```

1. Server listens on **port 4310** and **`0.0.0.0`** (LAN phones).
2. Desktop may use `http://localhost:4310`.
3. Phone **must** use the PC LAN IP — never `localhost` on the phone.
4. Buddy **never** connects to MongoDB.
5. No hosted backend / hosted Mongo unless the user explicitly asks.

### Invoice → price flow

```txt
Upload → Invoice → Extract → InvoiceItem rows → User review → Confirm
                                                              │
                                                              ▼
                                                         VendorPrice
                                                    (history preserved)
```

- Never save raw extraction as final vendor price.
- Never silently overwrite old `VendorPrice` rows.
- Business logic lives in **services**, not UI pages.

### Git / repo shape

Parent repo + **Git submodules** — not an npm monorepo.

```txt
StoreDesk/                    ← parent (docs, scripts, pointers)
├── store-desk-electron/      ← commit app changes HERE
├── store-desk-worker/
├── store-desk-mobile/
├── store-desk-web/
└── store-desk-cloud-backend/
```

1. Change app code **inside** the correct submodule.
2. Commit + push in the submodule, then update the parent pointer.
3. Do not merge submodule trees into the parent as normal files.
4. Do not delete `.gitmodules` by hand.

### Branches and CI

| Branch | Role |
|--------|------|
| `production` | Stable / default (replaces `main`) |
| `develop` | Integration line |

- Land work on `develop`; promote with PR → `production`.
- Each repo has `.github/workflows/ci.yml` on push/PR to both branches.
- Submodule pointer on the parent should track the same branch line (usually `production` on the parent tracks submodule `production` tips).
- **Docker:** only Cloud Hub is containerized (`store-desk-cloud-backend/Dockerfile` for Cloud Run). Worker/Electron/Mobile/Web run natively — see `docs/architecture.md`.

---

## 3. Org chart and agents

```txt
                    eng-manager
                         │
              ┌──────────┼──────────┐
              │                     │
         tech-lead              ui-ux-designer
              │                  (critique)
    ┌─────────┼─────────┐
    │         │         │
frontend   backend   mobile
electron   server    buddy
    │         │         │
    └────┬────┴────┬────┘
         │         │
    qa-verifier  docs-scribe
```

| Role | Agent file | Owns |
|------|------------|------|
| Engineering Manager | `.cursor/agents/eng-manager.md` | Intake, priority, WO create/close, unblock, routing |
| Tech Lead | `.cursor/agents/tech-lead.md` | Cross-repo architecture, API contracts, spikes |
| Frontend Electron | `.cursor/agents/frontend-electron.md` | `store-desk-electron/` UI + MUI |
| Backend Server | `.cursor/agents/backend-server.md` | `store-desk-worker/` API + models + services |
| Mobile Buddy | `.cursor/agents/mobile-buddy.md` | `store-desk-mobile/` Flutter |
| UI/UX Designer | `.cursor/agents/ui-ux-designer.md` | Design critique (readonly by default) |
| QA Verifier | `.cursor/agents/qa-verifier.md` | Module checks, pass/fail + residual risk |
| Docs Scribe | `.cursor/agents/docs-scribe.md` | `docs/`, folder `AGENTS.md`, skill/doc sync |

### When to call whom

| Situation | Call first |
|-----------|------------|
| Ownership unclear / spans repos | `eng-manager` |
| API shape / where does this live? | `tech-lead` |
| Visual redesign / layout critique | `ui-ux-designer` then implementer |
| Electron pages / theme / MUI | `frontend-electron` |
| Routes, Mongo, services, pairing | `backend-server` |
| Flutter screens / scan / pair | `mobile-buddy` |
| “Did CI / checks pass?” | `qa-verifier` |
| Docs, maps, contract text | `docs-scribe` |

---

## 4. Skills

Skills are reusable instruction packs. **Cursor paths are canonical.** Codex copies under `.codex/skills/` are thin pointers — edit Cursor first.

### Delivery skills (every multi-step job)

| Skill | Path | Purpose |
|-------|------|---------|
| **agent-team** | `.cursor/skills/agent-team/SKILL.md` | Org model, routing, management styles |
| **work-order** | `.cursor/skills/work-order/SKILL.md` | Create/update `docs/work-orders/WO-*.md` |
| **handoff** | `.cursor/skills/handoff/SKILL.md` | Role/session transfer notes |

### Desktop UI skills (Electron)

Load in this order when changing desktop UI:

1. **react-dev** — `.cursor/skills/react-dev/SKILL.md` (typed React/TS)
2. **mui** — `.cursor/skills/mui/SKILL.md` (Material UI / theme / `sx`)
3. **storedesk-ui** — `.cursor/skills/storedesk-ui/SKILL.md` (PageShell, density, no subtitle spam)
4. MUI MCP for official prop docs of the installed `@mui/material` major
5. **ui-ux-designer** agent before large visual redesigns

UI architecture narrative: [`ui-architecture.md`](./ui-architecture.md).

### Skill vs agent vs rule

| Kind | Location | Job |
|------|----------|-----|
| **Agent** | `.cursor/agents/*.md` | Who owns the work |
| **Skill** | `.cursor/skills/*/SKILL.md` | How to do a repeated pattern |
| **Rule** | `.cursor/rules/*.mdc` | Always-on constraints for Cursor |
| **Folder AGENTS** | `**/AGENTS.md` | Map of that directory for agents |

Important rules (always on / scoped):

| Rule | Focus |
|------|-------|
| `storedesk-master.mdc` | Product master + submodule + no inventory |
| `agent-team.mdc` | Point at TEAM.md + skills |
| `storedesk-ui.mdc` / `mui.mdc` / `react-dev.mdc` | Desktop UI stack |
| `ui-ux-designer.mdc` | Design critique constraints |

---

## 5. End-to-end delivery flow

### Step 1 — Intake (`eng-manager`)

1. Read `.cursor/TEAM.md` + root `AGENTS.md` non-negotiables.
2. Create a Work Order: `docs/work-orders/WO-YYYYMMDD-short-slug.md` (skill: **work-order**).
3. Set primary owner, management style, acceptance criteria, out of scope.
4. Tell the user the WO id and owner.

### Step 2 — Plan (`tech-lead`, optional `ui-ux-designer`)

1. Confirm which submodule(s) change.
2. Lock API / entity contracts if needed (`docs/api-contract.md`, `docs/database-schema.md`).
3. For UI redesigns: critique first, then hand off to implementer.
4. Write a short handoff to the IC (skill: **handoff**).

### Step 3 — Build (specialist IC)

1. Read the nearest folder `AGENTS.md` and required skills.
2. Implement only inside the assigned module.
3. Keep pages thin; put logic in services / utils / API clients.
4. Do not expand into inventory/stock.

### Step 4 — Handoff (whenever role or session changes)

Required when:

- Switching agent roles
- Pausing mid-WO
- QA fails → return to IC
- API contract changed → notify consumers

Prefer appending under the WO `## Handoff log`.  
Cross-cutting notes: `docs/handoffs/HO-YYYYMMDD-short-slug.md`.

Handoffs must list: done / not done / decisions / files / risks / next 3 actions / commands already run.

### Step 5 — Verify (`qa-verifier`)

| Module | Command |
|--------|---------|
| Electron | `cd store-desk-electron && npm run check` (or `npm run ci` when release-bound) |
| Server | `cd store-desk-worker && npm run check` |
| Buddy | `cd store-desk-mobile && npm run check` |

If Flutter is not installed: mark Buddy **pending** — never fake green.

### Step 6 — Docs (`docs-scribe`, if needed)

Update contracts, `ui-architecture.md`, folder `AGENTS.md`, or this guide when structure/rules change.

### Step 7 — Close (`eng-manager`)

All acceptance boxes checked, QA verdict recorded, WO status → `done`. Summarize for the user.

---

## 6. Work Orders

**Skill:** `.cursor/skills/work-order/SKILL.md`  
**Folder:** [`docs/work-orders/`](./work-orders/)

### States

```txt
draft → ready → in_progress → blocked | in_review → done | cancelled
```

### Required fields

- Status, management style, priority
- Primary owner (one)
- Modules touched
- Goal, acceptance criteria, out of scope
- Touch list, dependencies
- Handoff log

### Management styles (set `management:` on the WO)

| Style | Behavior | Typical use |
|-------|----------|-------------|
| `directive` | Manager assigns exact steps; IC only does listed tasks | Hotfix with zero ambiguity |
| `collaborative` | Tech-lead + IC co-plan; manager unblocks | **Default for cross-repo** |
| `delegated` | Outcome + acceptance only; IC owns approach | Single-module bugfix |
| `review-gate` | IC builds; no close until tech-lead (+ UI designer if UI) reviews | UI redesigns |

### Rules

- Status changes via owner or `eng-manager` only.
- On block: set `blocked`, name the blocker and who must act.
- Never put secrets (passwords, tokens, service JSON) in WO files.

---

## 7. Handoffs

**Skill:** `.cursor/skills/handoff/SKILL.md`  
**Folder:** [`docs/handoffs/`](./handoffs/)

Template essentials:

```markdown
### HO — YYYY-MM-DD HH:mm (local)

- **From:** …
- **To:** …
- **WO:** WO-…
- **State entering handoff:** in_progress | blocked | in_review

#### Done
#### Not done
#### Decisions locked
#### Files touched
#### Risks / watchouts
#### Next 3 actions
#### Commands already run
```

Rules: concrete paths and commands; link folder `AGENTS.md` instead of pasting the whole product spec; note whether `ui-ux-designer` already reviewed UI.

---

## 8. Folder `AGENTS.md` map

Closest `AGENTS.md` wins for directory context.

| Path | Purpose |
|------|---------|
| `/AGENTS.md` | Product master (scope, entities, APIs, non-negotiables) |
| `/docs/AGENTS.md` | Docs file map + docs owner |
| `/scripts/AGENTS.md` | Catalog / invoice / helper scripts |
| `/tools/AGENTS.md` | Parent tooling |
| `/store-desk-electron/AGENTS.md` | Desktop app map |
| `/store-desk-worker/AGENTS.md` | API map |
| `/store-desk-mobile/AGENTS.md` | Buddy app map |

---

## 9. Product flows agents must not break

These are the operational flows documented for humans in [`how-storedesk-works.md`](./how-storedesk-works.md). Agents implement around them; they do not invent parallel inventory flows.

| Flow | Apps | Rule |
|------|------|------|
| Catalog / products / variants | Desktop + Server | No stock fields |
| Vendor prices + history | Desktop + Server | History preserved |
| Price comparison + suggested sell | Desktop + Server | Use price per base unit |
| Invoice upload → review → confirm | Desktop or Buddy → Server | Review before `VendorPrice` |
| Buddy pair (QR) | Desktop QR + Buddy + Server | Token to Server only |
| Buddy scan / search | Buddy → Server | LAN URL, never Mongo |
| Lottery | Desktop placeholder | No full lottery until pricing/invoice stable |

Matching priority for invoice items (server): UPC → SKU → generated barcode → internal code → vendor item code → exact name → fuzzy → none. Below confidence 85 requires review.

---

## 10. Definition of done (any agent)

A change is done only when:

1. Acceptance criteria on the WO are checked (or N/A explained).
2. Touched module’s check command was run (or Flutter pending documented).
3. No new stock/inventory surface area.
4. Submodule boundaries respected.
5. Handoff written if another role must continue.
6. Docs/contracts updated if APIs or UI system changed.

---

## 11. Quick start for a new chat

1. Open this guide or `.cursor/TEAM.md`.
2. If multi-step / multi-repo → create or open a Work Order.
3. Route to the right agent (table in §3).
4. Load the matching skills before editing.
5. Handoff when switching; QA before close.

### Example: “Redesign Price Book page”

1. `eng-manager` → WO, `management: review-gate`, owner `frontend-electron`.
2. `ui-ux-designer` → critique (readonly).
3. Handoff → `frontend-electron` with react-dev + mui + storedesk-ui.
4. If API gaps → `tech-lead` / `backend-server` first.
5. `qa-verifier` → Electron check.
6. `docs-scribe` if UI architecture notes changed.
7. `eng-manager` closes WO.

### Example: “Add mobile invoice status endpoint”

1. `eng-manager` → WO, owner `backend-server`, reviewer `tech-lead`.
2. `tech-lead` confirms contract in `docs/api-contract.md`.
3. `backend-server` implements + tests.
4. Handoff → `mobile-buddy` if Buddy must call it.
5. `qa-verifier` → server (+ Buddy if UI changed).
6. Close.

---

## 12. Related docs

| Doc | Contents |
|-----|----------|
| [`.cursor/TEAM.md`](../.cursor/TEAM.md) | Short org chart + ops |
| [`how-storedesk-works.md`](./how-storedesk-works.md) | End-to-end product guide |
| [`system-map.md`](./system-map.md) | Connection map + gap plan |
| [`architecture.md`](./architecture.md) | System architecture |
| [`api-contract.md`](./api-contract.md) | HTTP APIs |
| [`database-schema.md`](./database-schema.md) | Mongo entities |
| [`ui-architecture.md`](./ui-architecture.md) | Electron UI system |
| [`mobile-flow.md`](./mobile-flow.md) | Buddy pairing / scan / upload |
| [`invoice-extraction.md`](./invoice-extraction.md) | Extraction / review |
| [`sprint-plan.md`](./sprint-plan.md) | Sprint backlog |
| [`work-orders/`](./work-orders/) | Active WOs |
| [`handoffs/`](./handoffs/) | Optional HO files |
