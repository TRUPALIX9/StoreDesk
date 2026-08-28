---
name: mobile-flutter
description: >-
  StoreDesk Mobile (Flutter/Dart) specialist. Use for any work inside
  store-desk-mobile/: screens, navigation, scanner, product lookup, vendor
  prices, app theme, Riverpod state, or Android Studio/Gradle build issues.
  IDE is Android Studio (not VS Code).
---

# Mobile Flutter — StoreDesk Mobile

Implement the Flutter helper app in `store-desk-mobile/`.

## Read First

1. `store-desk-mobile/AGENTS.md` — folder map
2. Root `AGENTS.md` — mobile screens, connection model, what is removed
3. `docs/mobile-flow.md` — auth, scan, search, connection model
4. `.agents/skills/error-codes-registry/SKILL.md` — error + empty state rules

## Development Environment

**IDE: Android Studio** (not VS Code / Flutter extension).

- Run, debug, hot-reload from **Android Studio**.
- Gradle issues → check `android/build.gradle`, `android/app/build.gradle`.
- Dart/Flutter SDK must be registered in Android Studio SDK settings.
- Terminal commands run from Android Studio integrated terminal.
- Clean build: `flutter clean && flutter pub get && flutter run`
- Analyze: `flutter analyze`

## Stack

```
Flutter + Dart
Material 3 theme
go_router          — declarative navigation
flutter_riverpod   — state management
dio                — HTTP client
flutter_secure_storage  — store token + server URL
mobile_scanner     — barcode scanning
intl               — formatting
```

## Network Rule (Critical)

Mobile **always** connects via `https://<store-id>.storedesk.net` (Cloudflare Tunnel).
- Never `localhost` (that's the phone itself).
- Never raw LAN IP.
- URL is provisioned by StoreDesk Web → stored in secure storage after AppUser login.
- If Worker is down → tunnel is down → both paths dead. Show clear offline error.

## Owns

```
lib/features/connection/    — server URL entry + health check
lib/features/home/          — home screen
lib/features/scanner/       — barcode scan screen
lib/features/products/      — product result + variant detail
lib/features/settings/      — app settings, logout, app info
lib/core/                   — network, storage, theme, constants, errors
lib/router/                 — go_router config
lib/shared/widgets/         — shared UI components
```

## Screen List

```
Connect / Login Screen   — AppUser auth + tunnel URL health check
Home Screen              — quick-access tiles
Scanner Screen           — barcode scanner
Product Result           — product + variant detail + best vendor badge
Vendor Prices            — price per vendor + best badge
Product Search           — text search
Show Barcode             — display internal barcode
Settings Screen          — server URL, logout, app info
```

## Rules

- Talk only to StoreDesk Worker via CF Tunnel — never directly to MongoDB.
- Large tap targets (min 48×48 dp), one-hand flows, clear connection status.
- Use `AppUser` login (org credentials from StoreDesk Web license) — no pairing QR.
- No stock / inventory screens or copy.
- No invoice upload (removed from current product — do not re-add without a WO).

## Sprint / Phase Pattern

| Phase | Deliverable | Gate |
|-------|-------------|------|
| 1 — Model + Provider | Data model + Riverpod provider + unit test | `flutter analyze` clean |
| 2 — Screen | Widget + routing + error states | `flutter test` green |
| 3 — Integration | End-to-end with Worker API | Manual hot-reload test |
| 4 — Handoff | Handoff note if Worker needs new endpoint | `qa-verifier` sign-off |

## Definition of Done

- `flutter analyze` returns no errors
- `flutter test` passes all unit tests
- Hot reload tested on emulator or device in Android Studio
- Handoff to `backend-server` if new Worker endpoint needed
