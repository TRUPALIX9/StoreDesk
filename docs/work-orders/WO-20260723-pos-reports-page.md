# WO-20260723-pos-reports-page

- **Status:** in_review
- **Management:** collaborative
- **Priority:** P1
- **Requester:** user
- **Primary owner:** frontend-electron
- **Reviewers:** qa-verifier
- **Modules:** store-desk-electron | docs

## Goal

POS Reports = **Ruby-only** Commander reports (`vrubyrept` / `vreportpdlist`) with print-aligned KPIs. Ticket detail on **Transactions** (`vtransset`).

## Follow-up (2026-07-23) — Registers-only + no Type + Transactions cards

User: “registers — no outside gas things” + “no need for type here” + clearer Transactions cards.

- Remove **Report type** control; always load combined **ruby-daily**
- Hide outside sales / outside grand / outside-vs-fuel dual metrics from preview
- Keep register KPIs: tax, merch/inside, network CREDIT/DEBIT, cash, 2% credit fee
- Keep one clean **Fuel sales** tile (`fuelSales`, e.g. 6817.91 on 318) — not “Gas/outside”
- Transactions cards: Register + time → items summary → total → tender/void chips; expand for full lines
- **Transactions filter choice:** left all tickets (no outdoor-pump filter) so voids/register cards stay intact

### Acceptance criteria

- [x] Route + sidebar: **POS Reports** at `/pos/reports`
- [x] No Type / report-kind picker; defaults to ruby-daily
- [x] Live Commander fetch when configured
- [x] Period picker includes CURRENT DAILY (`filename=current`)
- [x] Fuel sales KPI = `fuelSales` (318 → 6817.91); no outside framing in UI
- [x] Department + network + tenders on combined daily
- [x] Transactions cards: register/time → items → total → tender/void chips
- [x] Docs + WO updated; `npm run check` passes

## Out of scope

- Writing / closing shifts on Commander
- Lottery / cash expenses KPIs
- Stock / inventory
- Commit / push unless requested

## Notes — Fuel field map (evidence period 318)

| Metric | Source | Value |
|--------|--------|------:|
| **Fuel sales (KPI)** | Ruby `summaryInfo.fuelSales` | **6817.91** |
| Outside sales delta (hidden) | Ruby `difference.outsideSales` | 5068.62 |
| HIGH/LOW tax | Ruby tax `taxableSales` / `netTax` | 959.66/67.19 · 842.15/25.30 |

## Handoff log

### HO — 2026-07-23 (registers-only + Transactions card polish)

- **From:** frontend-electron
- **To:** qa-verifier
- **State:** ready to verify

#### Done
- Removed Report type dropdown; fixed kind = `ruby-daily`
- Removed outside-sales secondary cards / delta rows / Gas-outside framing
- Fuel sales tile kept; period “Type” labels removed from preview
- Transactions: no outdoor filter; card hierarchy polished (register/time → items → total → chips)

#### Next
1. `npm run check` + UI smoke: POS Reports period-only; Transactions card layout
