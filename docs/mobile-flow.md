# StoreDesk Mobile — flows and distribution

Phone product in docs: **StoreDesk Mobile**. Launcher / Play label: **StoreDesk** (`com.storedesk`).

Brand: primary `#1A63F4`, secondary `#00A87B` — assets in parent `brand-kit/` and `store-desk-mobile/docs/brand/`.

Related: [`store-desk-mobile/README.md`](../store-desk-mobile/README.md) · [`how-storedesk-works.md`](./how-storedesk-works.md) · [`release.md`](./release.md)

---

## 1. Roles

| Piece | Job |
|-------|-----|
| StoreDesk (Electron) | Desktop ops (POS, Price Book, Cost Analysis). **No** invoice UI, **no** APK URL, **no** pairing QR |
| StoreDesk Worker | API the phone talks to (`:4310`); local Mongo; optional Hub agent |
| StoreDesk Mobile | Scan / search / prices after **AppUser** login |
| StoreDesk Web | Creates org + license and provisions organization users used by desktop/mobile |
| Cloud Hub | Later dual-mode path; not required for LAN beta |

The phone **never** connects to MongoDB or Commander directly.

---

## 2. Access model (license → org users)

```txt
StoreDesk Web admin
  → create Organization + Store license
  → provision AppUsers for that organization
  → Desktop / Mobile sign in as those users
```

There is **no** desktop Mobile Access page for APK download or pairing QR. Configuration is saved on the organization users created with the license.

---

## 3. Install paths

### A. Google Play beta / open testing

| Field | Value |
|-------|--------|
| Version name | `0.0.1` |
| Version code | `1` |
| Release name | `0.0.1-beta1` |
| Artifact | Signed **AAB** |
| Track | Internal testing first, then open testing |

**Open testing demo login** (no live Worker required):

| Field | Value |
|-------|--------|
| Email | `demo@demo.com` |
| Password | `Demo@123` |

This enables in-app **demo mode** with sample products, vendor prices, and POS.

```bash
cd store-desk-mobile
flutter build appbundle --release
```

### B. Sideload (optional)

APK sideload may still exist for internal builds, but **desktop does not show an APK QR or download URL**. Prefer Play for store staff.

---

## 4. Day-to-day journeys

### Connect / sign in

1. Open StoreDesk on the phone.
2. Sign in as an org AppUser (from Web license), or use demo credentials for Play review.
3. Use Home: Scan, Search, Settings.

### Scan / lookup

1. Scan (or manual code).
2. Worker resolves variant by UPC / code.
3. Show product, best vendor, costs, suggested sell.
4. Optional: all vendor prices, show barcode.

### Search

1. Search name / UPC / internal code.
2. Open a result → same product surfaces as scan.

### Invoice upload

Not on mobile or desktop StoreDesk UI. Use manual vendor prices / Price Book overlays.

### Settings

- View connection / session  
- Test connection  
- Sign out / clear session  

---

## 5. Out of scope on the phone

- Stock / inventory counts  
- Invoice upload  
- Direct MongoDB  
- Pairing QR / APK URL from desktop  
