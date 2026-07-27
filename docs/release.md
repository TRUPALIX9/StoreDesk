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

- http://localhost:4310/downloads/storedesk-buddy.apk

If APK is missing, the server returns **404 JSON** with build instructions.

## StoreDesk Mobile (Android APK)

### Windows Flutter setup

1. Install Flutter SDK: https://docs.flutter.dev/get-started/install/windows
2. Add Flutter to PATH.
3. Run `flutter doctor`.
4. Accept Android licenses: `flutter doctor --android-licenses`
5. Install Android Studio / Android SDK if needed.

### Build and deploy APK

```powershell
cd store-desk-mobile
npm run setup:flutter
flutter pub get
flutter analyze
flutter test
flutter build apk --release
```

Copy APK:

```powershell
copy build\app\outputs\flutter-apk\app-release.apk ..\store-desk-worker\downloads\storedesk-buddy.apk
```

Restart server and verify:

```powershell
cd ..\store-desk-worker
npm run dev
```

Test in browser:

```txt
http://localhost:4310/downloads/storedesk-buddy.apk
```

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

5. Open **Mobile Access** — confirm QR codes and server URL.
6. Connect Android phone to the same Wi-Fi.
7. Install StoreDesk Mobile APK (from download route or `adb install`).
8. Open StoreDesk Mobile and scan pairing QR.
9. Confirm pairing success on desktop.
10. Scan or search a product; view vendor prices.
11. Upload invoice PDF/image from mobile.
12. Review invoice on desktop.
13. Confirm **no inventory/stock screens** exist anywhere.

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
- [ ] APK built and copied to `downloads/storedesk-buddy.apk`
- [ ] APK download route returns 200
- [ ] Pairing works on real Android device
- [ ] All three repos pushed to GitHub
