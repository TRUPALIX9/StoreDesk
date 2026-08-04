<p align="center">
  <img src="brand-kit/logo-lockup-horizontal.svg" alt="StoreDesk" width="420" />
</p>

# StoreDesk

Local-first edge ops for convenience stores and gas stations, with an optional cloud control plane for multi-store licenses and relay.

**StoreDesk is not an inventory system.** It focuses on products, retail prices, vendor costs, invoice extraction review, Commander Price Book / POS reports, and a phone helper — not stock counts or warehouse movements.

| Brand | Hex |
|-------|-----|
| Primary blue | `#1A63F4` |
| Secondary green | `#00A87B` |
| Kit | [`brand-kit/`](brand-kit/) |

**New here?** [`docs/how-storedesk-works.md`](docs/how-storedesk-works.md)  
**Architecture / gaps:** [`docs/system-map.md`](docs/system-map.md) · [`docs/architecture.md`](docs/architecture.md)  
**Release snapshot:** [`docs/release-status.md`](docs/release-status.md) · process [`docs/release.md`](docs/release.md)  
**Agent team:** [`.cursor/TEAM.md`](.cursor/TEAM.md) · [`docs/agent-team-guide.md`](docs/agent-team-guide.md)

---

## What each app does

| App | Folder | Role |
| --- | --- | --- |
| **StoreDesk** | `store-desk-electron/` | Electron desktop admin — Price Book, Cost Analysis, POS, vendors, org user access (no invoices / no APK pairing) |
| **StoreDesk Worker** | `store-desk-worker/` | Edge Express + local MongoDB on the store PC (`0.0.0.0:4310`) |
| **StoreDesk Mobile** | `store-desk-mobile/` | Flutter phone helper — scan, search, vendor prices (no invoice upload). Play `com.storedesk` |
| **StoreDesk Web** | `store-desk-web/` | Next.js marketing + Atlas license / control-plane admin (Vercel) |
| **Cloud Hub** | `store-desk-cloud-backend/` | Outbound WSS rooms (Cloud Run) for multi-store relay |

**Data rule:** Catalog, Commander, invoices, and vendor prices stay on the store PC. Atlas holds licenses / org registry / setup credentials only (~M0).

```txt
Primary Mode (setup-v1 / Cloud-First):
  Clients (Desktop/Mobile) ──► Hub WSS ──► Worker :4310 ──► local Mongo

Legacy LAN Mode (fallback):
  Desktop ──HTTP──► Worker :4310
  Phone   ──LAN───► Worker :4310
```

---

## Repository model

Parent: https://github.com/TRUPALIX9/StoreDesk  

| Submodule | Remote |
|-----------|--------|
| Electron | https://github.com/TRUPALIX9/store-desk-electron |
| Worker | https://github.com/TRUPALIX9/store-desk-worker |
| Mobile | https://github.com/TRUPALIX9/store-desk-mobile |
| Web | https://github.com/storedesk-dev/StoreDesk-web |
| Cloud Hub | https://github.com/TRUPALIX9/store-desk-cloud-backend |

Each submodule has its own history, CI, and releases. The parent tracks which commits make a coherent StoreDesk snapshot.

**Branches (all repos):** `production` (stable / default) · `develop` (integration). Do not use `main`.

```txt
StoreDesk/
|-- store-desk-electron/
|-- store-desk-worker/
|-- store-desk-mobile/
|-- store-desk-web/
|-- store-desk-cloud-backend/
|-- brand-kit/                 # logos + color tokens
|-- docs/                      # architecture, APIs, WO, release
|-- scripts/
|-- AGENTS.md                  # product master for agents
|-- README.md
|-- .gitmodules
`-- .cursor/                   # agents, skills, rules (Codex: .codex/)
```

---

## Current status (high level)

Updated: **2026-08-02**. For SHAs and CI detail see [`docs/release-status.md`](docs/release-status.md).

| Area | State |
|------|--------|
| Desktop + Worker LAN MVP | Usable — products, vendors, prices, Commander Price Book / POS reports, Cost Analysis (invoice UI + pairing QR removed; org users via Web license) |
| Mobile LAN | Usable — pair/connect, scan, search, vendor prices (invoice upload is desktop-only) |
| Mobile Play | **First beta** — version **`0.0.1+1`**, release name **`0.0.1-beta1`**, AAB for Play; APK still for Worker QR sideload |
| Web licenses | Partial — marketing + Atlas admin; setup-v1 hierarchy on `develop` |
| Cloud Hub | Deployed path exists on Cloud Run; dual-mode / assignment E2E still in progress |
| Setup lifecycle | Vertical slices on `develop`; full acceptance not closed |

Active work often lives on **`develop`**; **`production`** is the older shipped LAN baseline.

---

## Clone

```bash
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
cd StoreDesk
```

If already cloned without submodules:

```bash
git submodule update --init --recursive
```

Prefer `develop` for ongoing feature work:

```bash
git checkout develop
git submodule foreach 'git checkout develop && git pull'
```

---

## Working with submodules

Commit inside the submodule first, push, then bump the parent pointer:

```bash
cd store-desk-worker
git checkout develop
git pull
# …edit, commit, push…
cd ..
git add store-desk-worker
git commit -m "Bump store-desk-worker submodule pointer"
git push origin develop
```

---

## Local architecture

| Component | Connection |
| --- | --- |
| MongoDB | `mongodb://127.0.0.1:27017/storedesk` |
| StoreDesk Worker | `http://localhost:4310` (binds `0.0.0.0`) |
| StoreDesk desktop | `http://127.0.0.1:4310` |
| StoreDesk Mobile | `http://YOUR_LAN_IP:4310` — never `localhost` on the phone |

Health:

- `http://localhost:4310/api/health`
- `http://localhost:4310/api/mobile/health`

---

## Running locally

**Worker**

```bash
cd store-desk-worker
npm install
cp .env.example .env   # or copy on Windows
npm run dev
```

**Desktop**

```bash
cd store-desk-electron
npm install
cp .env.example .env
npm run dev
```

**Mobile**

```bash
cd store-desk-mobile
npm install
npm run setup:flutter
flutter run
```

See [`store-desk-mobile/README.md`](store-desk-mobile/README.md) for Play AAB / sideload APK detail.

---

## Android distribution

| Path | Artifact | Audience |
|------|----------|----------|
| **Google Play beta** | AAB `0.0.1-beta1` (`com.storedesk`) | Internal / closed testers |
| **LAN sideload** | APK → `store-desk-worker/downloads/storedesk-mobile.apk` | In-store QR from desktop |

```bash
# Play
cd store-desk-mobile && flutter build appbundle --release

# Worker download QR
flutter build apk --release
cp build/app/outputs/flutter-apk/app-release.apk \
  ../store-desk-worker/downloads/storedesk-mobile.apk
```

Download URL after copy: `http://<LAN_IP>:4310/downloads/storedesk-mobile.apk`

---

## Quality checks

| Repo | Fast | Full CI |
| --- | --- | --- |
| Electron | `npm run check` | `npm run ci` |
| Worker | `npm run check` | `npm run ci` |
| Mobile | `npm run check` | `npm run ci` |
| Web | `npm run check` | `npm run ci` |
| Cloud Hub | `npm run check` | `npm run ci` |

---

## Brand kit

| Asset | Path |
|-------|------|
| Lockup | [`brand-kit/logo-lockup-horizontal.svg`](brand-kit/logo-lockup-horizontal.svg) |
| Mark | [`brand-kit/logo-mark.svg`](brand-kit/logo-mark.svg) |
| Tokens | [`brand-kit/README.md`](brand-kit/README.md) |

Use kit colors in UI; keep business logic in services, not pages.

---

## Git rules

- Commit app changes inside the correct submodule; then update the parent pointer.
- Do not merge submodule trees into the parent as normal files.
- Do not convert to an npm monorepo or delete `.gitmodules` by hand.
- Do not force push unless explicitly instructed.
- Keep secrets out of git (`key.properties`, `*.jks`, service-account JSON, real `.env`).

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Empty submodule folders | `git submodule update --init --recursive` |
| Detached HEAD in submodule | `git checkout develop` or `production` inside the submodule |
| Mobile cannot reach Worker | Same Wi‑Fi; use LAN IP, not localhost; firewall allows 4310 |
| APK route 404 | Build APK and copy to `store-desk-worker/downloads/storedesk-mobile.apk` |
| Parent CI cannot clone apps | Set `SUBMODULES_PAT` — see `docs/env-by-project.md` |

---

## Documentation map

| Doc | Contents |
|-----|----------|
| [`AGENTS.md`](AGENTS.md) | Full product spec + non-negotiables |
| [`docs/how-storedesk-works.md`](docs/how-storedesk-works.md) | Human end-to-end guide |
| [`docs/system-map.md`](docs/system-map.md) | Connections + gap plan |
| [`docs/api-contract.md`](docs/api-contract.md) | HTTP / Hub surfaces |
| [`docs/mobile-flow.md`](docs/mobile-flow.md) | Phone journeys + Play beta |
| [`docs/release.md`](docs/release.md) | Branching, APK/AAB, checklist |
| [`docs/work-orders/`](docs/work-orders/) | Active Work Orders |
| [`.cursor/skills/context-budget/`](.cursor/skills/context-budget/) | Keep agent context off `node_modules` / `build` |
