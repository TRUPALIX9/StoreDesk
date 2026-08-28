# Sprint Status — StoreDesk

Updated: 2026-08-27

---

# Current Sprint: 2026-W35 (25 Aug – 29 Aug)

## In Progress

_(none — sprint wrapping up)_

## Blocked

_(none)_

## Done This Sprint

- WO-20260827-agent-skills-reconfig ✅ — QA: PASS — 2026-08-27
- WO-20260827-arch-docs-cf-tunnel ✅ — QA: PASS — 2026-08-27
- WO-20260827-worker-two-component ✅ — QA: PASS — 2026-08-27
- WO-20260827-cf-tunnel-migration ✅ — QA: PASS — 2026-08-27

## Sprint Metrics

| Metric | Value |
|--------|-------|
| SP committed | 16 |
| SP done | 16 |
| SP carried | 0 |
| Velocity | 16 |

---

# System Status

| Component | Status | Notes |
|-----------|--------|-------|
| StoreDesk (Electron) | 🟢 Active dev | ManageWorkerPage has tunnel status UI |
| StoreDesk Worker API (`src/`) | 🟢 Active dev | Core routes done |
| Service Orchestration (Electron) | 🟢 Active dev | `cloudflared` orchestration implemented |
| StoreDesk Mobile | 🟢 Active dev | Cloudflare Tunnel URL integrated |
| StoreDesk Web | 🟢 Active dev | CF API provisioning wired |
| Cloudflare Tunnel | 🟢 Wired | Provisioning flow implemented end-to-end |

---

# Architecture State (Canonical)

```
Electron (same store PC)    → http://localhost:4310  ✅ implemented
Mobile                      → https://<store-id>.storedesk.net  ✅ implemented
Web / Vercel                → https://<store-id>.storedesk.net  ✅ implemented
```

**Key pending items:**
- [x] CF API tunnel provisioning in StoreDesk Web (store creation flow)
- [x] Mobile: replace LAN IP with CF Tunnel URL
- [x] Worker setup endpoints
- [x] Electron `cloudflared` orchestration

---

# Out of Scope (Always)

- Inventory / stock qty / reorder / - Cloud backend (no GCP VM — CF Tunnel is the egress)
- Direct mobile → MongoDB
- LAN IP hardcoding in mobile/web clients
