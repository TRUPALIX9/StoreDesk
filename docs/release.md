# StoreDesk Release Guide

## Environment

StoreDesk Server defaults:

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

## StoreDesk Server

```powershell
cd store-desk-server
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

## StoreDesk Buddy (Android APK)

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
copy build\app\outputs\flutter-apk\app-release.apk ..\store-desk-server\downloads\storedesk-buddy.apk
```

Restart server and verify:

```powershell
cd ..\store-desk-server
npm run dev
```

Test in browser:

```txt
http://localhost:4310/downloads/storedesk-buddy.apk
```

## End-to-end demo checklist

1. Start local MongoDB (optional — in-memory fallback works without it).
2. Start StoreDesk Server:

   ```powershell
   cd store-desk-server
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
7. Install StoreDesk Buddy APK (from download route or `adb install`).
8. Open StoreDesk Buddy and scan pairing QR.
9. Confirm pairing success on desktop.
10. Scan or search a product; view vendor prices.
11. Upload invoice PDF/image from mobile.
12. Review invoice on desktop.
13. Confirm **no inventory/stock screens** exist anywhere.

## iPhone path

iOS builds require Xcode on macOS. Use TestFlight or direct Xcode install. APK QR is Android-only.

## GitHub — push all three repos

### Electron (remote exists)

```powershell
cd store-desk-electron
git push origin main
```

### Mobile (remote exists)

```powershell
cd store-desk-mobile
git push origin main
```

### Server (create remote first)

Create repo: `TRUPALIX9/store-desk-server` (private recommended).

```powershell
cd store-desk-server
git remote add origin https://github.com/TRUPALIX9/store-desk-server.git
git branch -M main
git push -u origin main
```

If `origin` already exists, run `git remote -v` before adding. Do not force push.

## Release candidate checklist

- [ ] Electron `npm run ci` passes
- [ ] Server `npm run ci` passes (16 tests)
- [ ] Mobile CI passes on GitHub Actions (or locally with Flutter)
- [ ] Desktop installer builds
- [ ] APK built and copied to `downloads/storedesk-buddy.apk`
- [ ] APK download route returns 200
- [ ] Pairing works on real Android device
- [ ] All three repos pushed to GitHub
