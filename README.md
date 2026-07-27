# StoreDesk

Local-first edge ops with optional cloud license control for convenience stores and gas stations.

**StoreDesk is not an inventory system.** It focuses on products, retail prices, vendor costs, invoice extraction review, and mobile helper workflows.

**New here?** Read the end-to-end guide: [`docs/how-storedesk-works.md`](docs/how-storedesk-works.md).

## Overview

StoreDesk contains app repos, tracked from this parent repo as Git submodules.

| App | Submodule folder | Role |
| --- | --- | --- |
| StoreDesk | `store-desk-electron/` | Electron desktop admin |
| StoreDesk Worker | `store-desk-worker/` | Edge Express + local MongoDB API (store PC worker) |
| StoreDesk Mobile | `store-desk-mobile/` | Flutter phone companion |
| StoreDesk Web | `store-desk-web/` | Next.js marketing + store licenses (Atlas) |
| Cloud Hub | `store-desk-cloud-backend/` | WSS store rooms (Epic 1) |

Catalog and Commander stay on the store PC. Atlas is for licenses/registry only.

## Repository Model

This repo is the parent repository:

- `store-desk-electron` -> https://github.com/TRUPALIX9/store-desk-electron
- `store-desk-worker` -> https://github.com/TRUPALIX9/store-desk-worker
- `store-desk-mobile` -> https://github.com/TRUPALIX9/store-desk-mobile
- `store-desk-web` -> https://github.com/storedesk-dev/StoreDesk-web

Each submodule has its own Git history, remote, commits, CI, and release workflow. The parent repo tracks which app commits belong to the complete StoreDesk project.

## Project Structure

```txt
StoreDesk/
|-- store-desk-electron/     # submodule: desktop/admin app
|-- store-desk-worker/       # submodule: edge Worker API
|-- store-desk-mobile/       # submodule: Flutter phone app
|-- store-desk-web/          # submodule: web + licenses
|-- brand-kit/
|-- docs/
|-- scripts/
|-- AGENTS.md
|-- README.md
|-- .gitmodules
`-- .cursor/
    `-- rules/
        `-- storedesk-master.mdc
```

## Current Status

- Parent repo: `TRUPALIX9/StoreDesk` with app submodule pointers.
- Electron repo: `TRUPALIX9/store-desk-electron` with desktop UI, Price Book (live Commander PLUs), invoice review, Husky, CI, and desktop release workflow.
- Worker repo: `TRUPALIX9/store-desk-worker` with local API, mobile APIs, APK download route, Husky, and CI.
- Mobile repo: `TRUPALIX9/store-desk-mobile` with Flutter app, Android project files, Husky, CI, and APK release workflow.
- Price Book source of truth: live Verifone Commander (`vPLUs`); no Excel POS catalog seed.
- Gandhi/Trident invoice source: `scripts/invoices/trident-wholesale-359.normalized.json`.
- Flutter, JDK 17, Android Studio, Android SDK tools, and release APK build are complete on this machine.
- Physical Android device testing is pending because `adb devices -l` currently shows no attached device.

See `docs/sprint-status.md` for the full sprint status.

## Clone Instructions

First-time clone:

```powershell
git clone --recurse-submodules https://github.com/TRUPALIX9/StoreDesk.git
cd StoreDesk
```

If already cloned without submodules:

```powershell
git submodule update --init --recursive
```

## Working With Submodules

Commit app changes inside the submodule first:

```powershell
cd store-desk-worker
git checkout main
git pull
npm install
npm run dev
git add .
git commit -m "Update Worker API"
git push
```

Then update the parent pointer:

```powershell
cd ..
git add store-desk-worker
git commit -m "Update server submodule pointer"
git push
```

## Local Architecture

| Component | Connection |
| --- | --- |
| MongoDB | `mongodb://127.0.0.1:27017/storedesk` |
| StoreDesk Worker | `http://localhost:4310` |
| StoreDesk desktop | `http://localhost:4310` |
| StoreDesk Buddy | `http://YOUR_COMPUTER_LAN_IP:4310` |

Health checks:

- `http://localhost:4310/api/health`
- `http://localhost:4310/api/mobile/health`

Mobile must use the computer LAN IP. `localhost` on a phone points back to the phone.

## Running Locally (development — same PC)

Preferred (whole stack via make):

```powershell
make setup
make install
make stack      # Hub :8080 + Worker :4310 + Desktop
make status
make stop
```

Details: [`docs/local-same-pc.md`](docs/local-same-pc.md).

Manual (same as before):

```powershell
cd store-desk-worker
npm install
copy .env.example .env
npm run dev
```

```powershell
cd store-desk-electron
npm install
copy .env.example .env
npm run dev
```

**Deploy is unchanged** and not driven by make: Hub Docker → Cloud Run; Worker installed on the store PC with production `HUB_WS_URL` / store keys.

Run StoreDesk Buddy:

```powershell
cd store-desk-mobile
npm install
npm run setup:flutter
flutter run
```

## Android APK Workflow

Build the mobile APK:

```powershell
cd store-desk-mobile
flutter build apk --release
copy build\app\outputs\flutter-apk\app-release.apk ..\store-desk-worker\downloads\storedesk-buddy.apk
```

Download route after the APK is copied:

```txt
http://<LAN_IP>:4310/downloads/storedesk-buddy.apk
```

The route returns 404 JSON until the APK file exists.

## Quality Checks

| Repo | Fast | Full CI |
| --- | --- | --- |
| Electron | `npm run check` | `npm run ci` |
| Server | `npm run check` | `npm run ci` |
| Mobile | `npm run check` | `npm run ci` |

## Git Rules

- Commit app changes inside the correct submodule.
- Push submodule commits before updating the parent pointer.
- Commit changed submodule pointers in the parent repo after submodule pushes.
- Do not edit app source as normal tracked files in the parent repo.
- Do not delete `.gitmodules` or submodule metadata manually.
- Do not force push unless explicitly instructed.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Empty submodule folders after clone | `git submodule update --init --recursive` |
| Detached HEAD in submodule | `git checkout main` inside the submodule |
| Parent pointer out of date | Push submodule first, then commit parent pointer |
| Mobile cannot reach server | Use LAN IP, not localhost; same Wi-Fi |
| APK route 404 | Build APK and copy it to `store-desk-worker/downloads/` |
| Flutter path has spaces | Use the generated `C:\StoreDeskBuild` junction or run `npm run setup:flutter` |

## Master Documentation

- `AGENTS.md` - full product spec and agent rules
- `.cursor/rules/storedesk-master.mdc` - always-on Cursor rule
- `docs/` - architecture, API contract, release guide, mobile flow, sprint status
