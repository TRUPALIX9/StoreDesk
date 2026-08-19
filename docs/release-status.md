# StoreDesk release status

**Verified:** 2026-07-26 (EDT); parent and Cloud Hub revisions refreshed 2026-07-28  
**Mobile Play beta note:** 2026-08-02 — StoreDesk Mobile set to **`0.0.1+1`** / release **`0.0.1-beta1`**; signed **AAB** build path verified. Other module SHA tables below may still reflect the July audit until a full re-audit.
**Scope:** Parent repository plus all five pinned submodules
**Source of truth:** Local checkouts, parent gitlinks, GitHub repository/release/workflow APIs, manifests, READMEs, and local artifact inspection

## Status labels

| Label | Meaning |
| --- | --- |
| **Ready** | Current pinned SHA passes CI and has the expected runtime or distributable path. |
| **Partial** | Core code passes CI, but a release artifact, deployment, or final platform test is still pending. |
| **Blocked** | A required release gate currently fails. |
| **Not built** | The named artifact does not exist locally and no release run produced it. |

## Parent release summary

| Item | Status |
| --- | --- |
| Overall parent release | **Blocked** |
| Repository | `TRUPALIX9/StoreDesk` |
| Version / release | Unversioned coordination snapshot; no tags and no GitHub Release |
| Branch / default branch | Local `production`; GitHub default `production` |
| Audited base HEAD | `87ceadcc9a7de63211522c0e7a430b1691a45825` |
| Submodule set | **Ready** — all five parent gitlinks match the inspected local submodule HEADs |
| CI | **Blocked** — awaiting Actions secret `SUBMODULES_PAT`; workflow already passes that token into recursive checkout (see `docs/env-by-project.md` §0). Prior failures: runs `30235477928` / `30235478055` |
| Packaging | Parent is not packaged; it coordinates independently released repositories |

The parent snapshot is internally aligned, but it is not release-ready until GitHub Actions can authenticate to the private Electron, Worker, Mobile, and Cloud Hub repositories. The public StoreDesk Web submodule checks out successfully.

## StoreDesk — Electron desktop

| Item | Status |
| --- | --- |
| Module status | **Partial** |
| Path / repository | `store-desk-electron/` — `TRUPALIX9/store-desk-electron` |
| Version | `1.0.0` (`package.json`) |
| Branch / default branch | Local `production`; GitHub default `production` |
| HEAD | `335372fff08e87586da38da3547b8296660eabd1` |
| Latest tag / release | None / none |
| CI | **Ready** — current SHA passed on `production` and `develop` |
| Local build | **Ready** — `store-desk-electron/dist/` exists (about 2.0 MB) |
| Desktop package | **Not built** — `store-desk-electron/release/` is absent; no `Desktop Release Build` workflow run |
| Docker | Not applicable; native Electron packaging is expected |

Included modules: Electron/React/MUI shell, product and variant setup, vendors and vendor prices, pricing rules/comparison, live read-only Commander Price Book, Cost Analysis, POS Reports, T-Log transactions, organization user access. **Removed from UI:** invoice upload/review, Mobile Access APK URL / pairing QR.

Known blockers: no Windows installer or macOS DMG has been produced from this SHA, and no formal tag/GitHub Release exists.

## StoreDesk Worker — edge API

| Item | Status |
| --- | --- |
| Module status | **Ready** |
| Path / repository | `store-desk-worker/` — `TRUPALIX9/store-desk-worker` |
| Version | `1.0.0` (`package.json`) |
| Branch / default branch | Local `production`; GitHub default `production` |
| HEAD | `4676e64d406070ac554ff4886e5b4da8ccc4089f` |
| Latest tag / release | None / none |
| CI | **Ready** — current SHA passed on `production` and `develop` |
| Local build | **Ready** — `store-desk-worker/dist/` exists (about 1.2 MB) |
| Runtime / packaging | Native Node.js service on `0.0.0.0:4310`; no installer currently defined |
| Docker | Not applicable for the local-first edge Worker |
| Mobile download artifact | **Ready** — `store-desk-worker/downloads/storedesk-buddy.apk` |

Included modules: health/server info, catalog and variant APIs, vendors and vendor-price history, pricing, invoice upload/extraction review/confirm flow, mobile pairing and protected mobile APIs, APK download route, optional outbound Cloud Hub WSS agent, `/api/` relay, and local MongoDB with in-memory fallback.

Known blockers: persistent production use still requires local MongoDB configuration; the APK filename remains the required legacy route filename even though the product name is StoreDesk Mobile.

## StoreDesk Mobile — Flutter

| Item | Status |
| --- | --- |
| Module status | **Partial** (Play beta artifact ready; E2E device/Play rollout pending) |
| Path / repository | `store-desk-mobile/` — `TRUPALIX9/store-desk-mobile` |
| Version | **`0.0.1+1`** (`pubspec.yaml`) — Play release name **`0.0.1-beta1`** |
| Package / label | `com.storedesk` / launcher **StoreDesk** |
| Brand | Kit colors `#1A63F4` / `#00A87B`; assets in `docs/brand/` + parent `brand-kit/` |
| Branch / default branch | `production` + `develop` (work often on `develop`) |
| Latest tag / release | None on GitHub; first Play beta is operator upload |
| CI | **Ready** — workflows on `production` and `develop` |
| APK | **Ready** path — sideload / Worker `downloads/storedesk-buddy.apk` |
| AAB | **Ready** path — `flutter build appbundle --release` (Play upload) |
| Release workflow | APK artifact workflow exists; Play upload still **manual** |
| Docker | Not applicable; Flutter Android/iOS platform packaging |

Included modules: pairing/manual connection, secure token and server URL storage, home, barcode scan/manual entry, product search/result, vendor-price comparison, suggested selling price, generated barcode display, settings, brand-aligned theme, Play demo mode. **No** mobile invoice upload in current beta (desktop Invoice Upload / Review Queue only).

Known blockers: physical Android + Play Console rollout validation is operator-owned; iOS / TestFlight not in this beta; setup-v1 AppUser/Hub path still incomplete vs LAN pairing.

## StoreDesk Web — marketing and licenses

| Item | Status |
| --- | --- |
| Module status | **Partial** |
| Path / repository | `store-desk-web/` — `storedesk-dev/StoreDesk-web` |
| Version | `0.1.0` (`package.json`) |
| Branch / default branch | Local `production`; GitHub default is still `main` |
| HEAD | `7a54c2fd04fd2d03bd96522b9b377bfaf49339ba` |
| Latest tag / release | None / none |
| CI | **Ready** — current SHA passed on `production` and `develop` |
| Deployment | **Partial** — current SHA has a successful Vercel Preview; latest observed Production deployment is an older SHA |
| Local build | Not retained (`store-desk-web/.next/` absent); exact current SHA is CI-verified |
| Docker | Not applicable; Vercel/Next.js deployment |

Included modules: product marketing pages, how-it-works/about/contact/privacy/terms, admin password gate, Atlas-backed store licenses, support periods, agent-key rotation, store suspension, and mock agents view.

Known blockers: promote the current SHA to Vercel Production and align the GitHub default branch with the documented `production` branch policy.

## StoreDesk Cloud Hub — WSS rooms

| Item | Status |
| --- | --- |
| Module status | **Partial** |
| Path / repository | `store-desk-cloud-backend/` — `TRUPALIX9/store-desk-cloud-backend` |
| Version | `0.1.0` (`package.json`) |
| Branch / default branch | Local `production`; GitHub default `production` |
| HEAD | `f1f23d82c38429de7013c2b189bce204bdac7336` |
| Latest tag / release | None / none |
| CI | **Partial** — prior pinned SHA `751afb6` passed; `f1f23d8` pending reverification |
| Local build | Not retained (`dist/` absent) |
| **Deployment target** | **e2-micro VM** (GCP Always Free) + PM2 + Cloudflare Tunnel — **replaces Cloud Run** |
| Container (Dockerfile) | Kept for local smoke only; **not production deploy path** |
| Cloud Run | **Deprecated** — `WO-20260727-cloud-backend-deploy` superseded by `WO-20260812-hub-e2micro-migration` |

Included modules: `/health`, `/ws`, Atlas auth, agent/client store rooms, presence, ping/pong, relay, `sync.pull`, `sync.delta`, `LIVE_PRICE_REQ/RES` (planned), PM2 `ecosystem.config.cjs`, Cloudflare Tunnel config, SSH deploy script + GitHub Actions CD.

Known blockers (as of 2026-08-12):
- VM not yet provisioned (operator ops step)
- `ecosystem.config.cjs` + `deploy-vm.sh` + `deploy-vm.yml` not yet committed to submodule
- `LIVE_PRICE_REQ` handler not yet in `hub.ts`
- Delta hashing not yet committed to Worker

## Android artifacts

| Artifact | Status | Exact path | Size | SHA-256 |
| --- | --- | --- | --- | --- |
| Flutter release APK | **Ready** | `store-desk-mobile/build/app/outputs/flutter-apk/app-release.apk` | 56,677,229 bytes | `969d6b1a85bd37a0f37071a990e84526b52a2e06fcef27381a5739d51f9ef2bb` |
| Worker-served APK | **Ready** | `store-desk-worker/downloads/storedesk-buddy.apk` | 56,677,229 bytes | `969d6b1a85bd37a0f37071a990e84526b52a2e06fcef27381a5739d51f9ef2bb` |
| Android App Bundle | **Not built** | Expected: `store-desk-mobile/build/app/outputs/bundle/release/app-release.aab` | — | — |

The two APK files are byte-identical. The Worker copy is intentionally preserved because `/downloads/storedesk-buddy.apk` depends on that exact legacy filename.

## Cross-repository compatibility

| Integration | Status | Evidence / remaining work |
| --- | --- | --- |
| Parent → all submodules | **Ready** | Every parent gitlink equals the inspected local HEAD listed above. |
| Desktop → Worker | **Ready** | Both target local Worker port `4310`; pinned SHAs have green CI. |
| Mobile → Worker | **Partial** | Pairing, protected APIs, LAN URL, and byte-identical served APK are present; physical-device test remains pending. |
| Worker → Cloud Hub | **Partial** | Outbound WSS and `/api/` relay code exist. Hub migration to e2-micro VM planned (`WO-20260812-hub-e2micro-migration`); VM not yet provisioned. |
| Web → Cloud Hub identity | **Partial** | Both use the Atlas Store/license identity concept; Hub VM deployment pending. |
| Parent GitHub Actions → private submodules | **Blocked** (ops) | Workflow expects `secrets.SUBMODULES_PAT` on checkout; operator must add that Actions secret (see `docs/env-by-project.md` §0). Default `GITHUB_TOKEN` alone cannot clone private sibling repos. |

## Conservative cleanup result

- Removed only `store-desk-mobile/.DS_Store`, an untracked macOS metadata file.
- Preserved both APKs, including `store-desk-worker/downloads/storedesk-buddy.apk`.
- Did not remove ignored build output, caches, source, secrets, user data, or uncertain files.
- No submodule source or parent gitlink was changed.
