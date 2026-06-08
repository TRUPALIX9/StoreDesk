# StoreDesk

Local-first vendor pricing and invoice-review system for convenience stores and gas stations.

**StoreDesk is not an inventory system.** It focuses on products, vendor prices, invoice extraction review, and mobile helper workflows.

## Overview

StoreDesk contains three apps:

| App | Submodule folder | Role |
| --- | --- | --- |
| **StoreDesk** | `store-desk-electron/` | Electron desktop admin |
| **StoreDesk Server** | `store-desk-server/` | Local Express + MongoDB API |
| **StoreDesk Buddy** | `store-desk-mobile/` | Flutter mobile companion |

Everything runs locally. No hosted backend or hosted MongoDB is required.

## Repository model

**This repo is the parent repository.** The three app folders are **Git submodules**:

- `store-desk-electron` → https://github.com/TRUPALIX9/store-desk-electron
- `store-desk-server` → https://github.com/TRUPALIX9/store-desk-server
- `store-desk-mobile` → https://github.com/TRUPALIX9/store-desk-mobile

Each submodule has its own Git history, remotes, commits, and CI. The parent repo tracks which commit of each submodule belongs to the complete StoreDesk project.

## Project structure

```txt
StoreDesk/                         # parent Git repo
├── store-desk-electron/           # submodule — StoreDesk desktop
├── store-desk-server/             # submodule — StoreDesk Server
├── store-desk-mobile/             # submodule — StoreDesk Buddy
├── docs/
├── scripts/
├── AGENTS.md
├── README.md
├── .gitmodules
└── .cursor/
    └── rules/
        └── storedesk-master.mdc
```

## Clone instructions

First-time clone:

```powershell
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
cd StoreDesk
```

If already cloned without submodules:

```powershell
git submodule update --init --recursive
```

See `scripts/README.md` for more submodule commands.

## Update submodules

Pull parent and initialize submodules:

```powershell
git pull
git submodule update --init --recursive
```

Update submodules to latest remote `main`:

```powershell
git submodule update --remote --merge
```

## Working inside a submodule

Example — change server code:

```powershell
cd store-desk-server
git checkout main
git pull
npm install
npm run dev
```

Commit inside the submodule first:

```powershell
git add .
git commit -m "Update server API"
git push
```

Then update the parent pointer:

```powershell
cd ..
git add store-desk-server
git commit -m "Update server submodule pointer"
git push
```

## Local architecture

| Component | Connection |
| --- | --- |
| MongoDB | `mongodb://127.0.0.1:27017/storedesk` (local) |
| StoreDesk Server | `http://localhost:4310` (listens on `0.0.0.0`) |
| StoreDesk desktop | `http://localhost:4310` |
| StoreDesk Buddy | `http://YOUR_COMPUTER_LAN_IP:4310` (same Wi-Fi) |

Health checks:

- http://localhost:4310/api/health
- http://localhost:4310/api/mobile/health

**Mobile must not use `localhost`** — that refers to the phone itself.

## Running locally

### 1. Start MongoDB (optional)

Server falls back to in-memory mode if MongoDB is unavailable.

### 2. Start StoreDesk Server

```powershell
cd store-desk-server
npm install
copy .env.example .env
npm run dev
```

### 3. Start StoreDesk desktop

```powershell
cd store-desk-electron
npm install
copy .env.example .env
npm run dev
```

### 4. StoreDesk Buddy (requires Flutter)

```powershell
cd store-desk-mobile
npm install
npm run setup:flutter
flutter run
```

## Android APK workflow

```powershell
cd store-desk-mobile
flutter build apk --release
copy build\app\outputs\flutter-apk\app-release.apk ..\store-desk-server\downloads\storedesk-buddy.apk
```

APK download route (after copy):

```txt
http://<LAN_IP>:4310/downloads/storedesk-buddy.apk
```

Returns **404 JSON** until the APK file exists. See `docs/release.md`.

## Git rules

- Commit app changes **inside the correct submodule**.
- Push submodule commits **before** updating the parent pointer.
- The parent tracks submodule commits — always commit `git add store-desk-*` in the parent after submodule pushes.
- Do not edit app source as normal tracked files in the parent repo.
- Do not delete `.gitmodules` or submodule metadata manually.
- Do not force push unless explicitly instructed.

## Quality checks

| Repo | Fast | Full CI |
| --- | --- | --- |
| Electron | `npm run check` | `npm run ci` |
| Server | `npm run check` | `npm run ci` |
| Mobile | `npm run check` | `npm run ci` (Flutter required) |

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Empty submodule folders after clone | `git submodule update --init --recursive` |
| Detached HEAD in submodule | `git checkout main` inside the submodule |
| Parent pointer out of date | Push submodule first, then commit parent pointer |
| Mobile cannot reach server | Use LAN IP, not localhost; same Wi-Fi |
| APK route 404 | Build APK and copy to `store-desk-server/downloads/` |
| Flutter checks skipped locally | Install Flutter SDK; GitHub Actions runs full mobile CI |

## Master documentation

- **`AGENTS.md`** — full product spec and agent rules
- **`.cursor/rules/storedesk-master.mdc`** — always-on Cursor rule
- **`docs/`** — architecture, API contract, release guide, mobile flow

## Current status

- Parent repo: `TRUPALIX9/StoreDesk` with submodule pointers for the app repos.
- Electron: `TRUPALIX9/store-desk-electron` pushed with Husky, CI, and desktop release artifacts.
- Mobile: `TRUPALIX9/store-desk-mobile` pushed with Husky, CI, and Android APK artifacts.
- Server: `TRUPALIX9/store-desk-server`.
- Flutter SDK: still required locally before full mobile checks or APK builds can run on this machine.
