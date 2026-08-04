# StoreDesk Release Guide

## Branching

StoreDesk uses two long-lived branches in the parent repo and every app submodule:

| Branch | Role |
|--------|------|
| `production` | Released / stable line (former `main`) |
| `develop` | Integration line for ongoing work |

Flow:

1. Land feature work on `develop` (direct push or PR into `develop`).
2. Promote with a PR from `develop` → `production`.
3. CI runs on pushes and PRs targeting both `production` and `develop`.

Parent CI recursively checks out private app submodules. The default `GITHUB_TOKEN` cannot clone those sibling repos — set repository secret **`SUBMODULES_PAT`** on `TRUPALIX9/StoreDesk` (fine-grained Contents read on private `TRUPALIX9` submodules, or classic `repo` scope). See `docs/env-by-project.md` §0.

Do not use `main` — it has been replaced by `production`.

## Environment

StoreDesk Worker defaults:

```env
PORT=4310
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/storedesk
```

Desktop dev API URL:

```env
VITE_API_URL=http://localhost:4310/api
```

Mobile must use the computer LAN IP, for example:

```txt
http://192.168.1.25:4310
```

## StoreDesk desktop (Electron)

```powershell
cd store-desk-electron
npm run ci
npm run package
```

Windows installer output: `store-desk-electron/release/StoreDesk Setup *.exe`

Unpacked build: `store-desk-electron/release/win-unpacked/StoreDesk.exe`

On Windows without code-signing privileges, packaging uses `signAndEditExecutable: false`.

## StoreDesk Worker

```powershell
cd store-desk-worker
copy .env.example .env
npm run ci
npm run dev
```

Health:

- http://localhost:4310/api/health
- http://localhost:4310/api/mobile/health

APK route (after APK is copied):

- http://localhost:4310/downloads/storedesk-mobile.apk

If APK is missing, the server returns **404 JSON** with build instructions.

## StoreDesk Mobile (Android)

Brand: launcher / Play label **StoreDesk** (`com.storedesk`); docs say StoreDesk Mobile. Colors `#1A63F4` / `#00A87B` — `brand-kit/` and `store-desk-mobile/docs/brand/`. Full flow: [`mobile-flow.md`](./mobile-flow.md).

### Versioning (Play beta)

| Field | Value |
|-------|--------|
| Version name | `0.0.1` |
| Version code | `1` |
| Release name | `0.0.1-beta1` |
| `pubspec.yaml` | `0.0.1+1` |

Bump `version:` in `store-desk-mobile/pubspec.yaml` before each Play upload. Version **code** must always increase for Play.

### Flutter setup

1. Install Flutter SDK: https://docs.flutter.dev/get-started/install
2. Add Flutter to PATH; run `flutter doctor` and accept Android licenses.
3. Install Android Studio / SDK (and Xcode on macOS for iOS later).

### Google Play — AAB (preferred for Console)

```bash
cd store-desk-mobile
npm run setup:flutter
flutter pub get
npm run ci
flutter build appbundle --release
```

Upload `build/app/outputs/bundle/release/app-release.aab` to **Internal testing** first. Release name: `0.0.1-beta1`. Signing uses gitignored `android/key.properties` + upload `.jks`.

Suggested “What’s new” text lives in [`store-desk-mobile/README.md`](../store-desk-mobile/README.md).

### LAN sideload — APK (Worker download QR)

```bash
cd store-desk-mobile
flutter build apk --release
cp build/app/outputs/flutter-apk/app-release.apk \
  ../store-desk-worker/downloads/storedesk-mobile.apk
```

Verify:

```txt
http://localhost:4310/downloads/storedesk-buddy.apk
```

If the APK is missing, Worker returns **404 JSON** with build instructions. The filename `storedesk-buddy.apk` is the route contract; product name remains StoreDesk.

## End-to-end demo checklist

1. Start local MongoDB (optional — in-memory fallback works without it).
2. Start StoreDesk Worker:

   ```powershell
   cd store-desk-worker
   npm run dev
   ```

3. Confirm health endpoints respond.
4. Start StoreDesk desktop:

   ```powershell
   cd store-desk-electron
   npm run dev
   ```

5. Open **User access** — confirm org users (from Web license); no APK / pairing QR.
6. Sign in on Android with an org AppUser (or demo login for Play review).
7. Confirm pairing QR / APK URL screens are gone.
8. Scan or search a product; view vendor prices.
9. Confirm **no** invoice upload/review UI on desktop or mobile.
10. Confirm **no inventory/stock screens** exist anywhere.

## iPhone path

iOS builds require Xcode on macOS. Use TestFlight or direct Xcode install. APK QR is Android-only.

## GitHub — repos and branches

Every StoreDesk repo (parent + submodules) uses **`production`** (stable) and **`develop`** (integration). Do not use `main`.

```powershell
# Parent
cd StoreDesk
git push origin production develop

# Submodule example (commit inside submodule first, then update parent pointer)
cd store-desk-worker
git push origin production develop
cd ..
git add store-desk-worker
git commit -m "Bump store-desk-worker submodule pointer"
git push origin develop
```

Remotes:

| Repo | GitHub |
|------|--------|
| Parent | `TRUPALIX9/StoreDesk` |
| Electron | `TRUPALIX9/store-desk-electron` |
| Worker | `TRUPALIX9/store-desk-worker` |
| Mobile | `TRUPALIX9/store-desk-mobile` |
| Web | `storedesk-dev/StoreDesk-web` |
| Cloud Hub | `TRUPALIX9/store-desk-cloud-backend` |

## Release candidate checklist

- [ ] Electron `npm run ci` passes
- [ ] Server `npm run ci` passes (16 tests)
- [ ] Mobile CI passes on GitHub Actions (or locally with Flutter)
- [ ] Desktop installer builds
- [ ] APK built and copied to `downloads/storedesk-mobile.apk` (LAN path)
- [ ] APK download route returns 200
- [ ] Play AAB built for current `pubspec` version; internal track notes ready
- [ ] Pairing works on real Android device
- [ ] Parent + submodule pointers pushed (`production` / `develop` as appropriate)
