# Sprint Status — StoreDesk

Updated: 2026-08-30

---

# Current Sprint: 2026-W36 (1 Sep – 5 Sep)

## In Progress

- Full-repo audit + system-map / schema / sprint docs update — docs-scribe — ✅ done (this run)

## Blocked

_(none)_

## Done This Sprint

- Full-repo audit 2026-08-30 — docs-scribe — QA: PASS

## Done Last Sprint (W35)

- WO-20260827-agent-skills-reconfig ✅ — QA: PASS — 2026-08-27
- WO-20260827-arch-docs-cf-tunnel ✅ — QA: PASS — 2026-08-27
- WO-20260827-worker-two-component ✅ — QA: PASS — 2026-08-27
- WO-20260827-cf-tunnel-migration ✅ — QA: PASS — 2026-08-27

## Sprint Metrics

| Metric | W35 | W36 (current) |
|--------|-----|---------------|
| SP committed | 8 | 8 |
| SP done | 16 | 3 |
| SP carried | 0 | — |
| Velocity | 16 | TBD |

---

# System Status — 2026-08-30 actual

| Component | Status | Notes |
|-----------|--------|-------|
| StoreDesk Electron | 🟢 Active | v0.0.4; 15 pages implemented; `LotterySetupPage` stub |
| StoreDesk Worker API | 🟢 Active | v1.0.0; 20 route files; 23 services; SQLite via Prisma |
| Worker DB | 🟡 Note | Prisma/SQLite (not MongoDB — docs were stale) |
| Commander integration | 🟢 Active | Hourly PLU sync; `priceBook.service` + `commanderPlu.service` |
| Cloudflare Tunnel | 🟢 Wired | `serviceManager.ts` IPC; `cloudflared.exe` bundled |
| StoreDesk Mobile | 🟢 Active | v0.0.4+4; 13 feature dirs; CF Tunnel URL auth |
| StoreDesk Web | 🟡 Partial | v0.1.0; Vercel preview ready; prod deployment pending |
| Invoice extraction | 🔴 Stub | `pdf-parse` dep installed; OCR path not wired |
| AppUser Hub sessions | 🔴 Not wired | Hub v0 agentKey only; assignment sessions unimplemented |
| SetupWizardPage backend | 🟡 Partial | UI done; Worker setup-key redemption endpoint incomplete |

---

# Architecture State (Canonical)

```
Electron (same store PC)    → http://localhost:4310           ✅ implemented
Mobile                      → https://<store-id>.storedesk.net  ✅ implemented
Web / Vercel                → https://<store-id>.storedesk.net  ✅ implemented
```

**Open P0 items:**
- AppUser Hub session (mobile + electron)
- SetupWizardPage end-to-end key redemption
- Real invoice extraction (OCR)

---

# Out of Scope (Always)

- Inventory / stock qty / reorder
- Cloud backend hosting (CF Tunnel is the egress — no GCP VM)
- Direct mobile → MongoDB/SQLite
- LAN IP hardcoding in mobile/web clients
