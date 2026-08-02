# StoreDesk release status

**Verified:** 2026-07-26 (EDT); parent and Cloud Hub revisions refreshed 2026-07-28
**Scope:** Parent repository plus all five pinned submodules
**Source of truth:** Local `production` checkouts, parent gitlinks, GitHub repository/release/workflow APIs, manifests, READMEs, and local artifact inspection

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

Included modules: Electron/React/MUI shell, product and variant setup, vendors and vendor prices, invoice upload/review, pricing rules/comparison, Mobile Access pairing/download UI, live read-only Commander Price Book, Cost Analysis, POS Reports, and T-Log transactions.

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
| Module status | **Partial** |
| Path / repository | `store-desk-mobile/` — `TRUPALIX9/store-desk-mobile` |
| Version | `1.0.4+5` (`pubspec.yaml`) |
| Branch / default branch | Local `production`; GitHub default `production` |
| HEAD | `5d6956cc490253174c0eb829d210f0641a64f299` |
| Latest tag / release | None / none |
| CI | **Ready** — current SHA passed on `production` and `develop` |
| APK | **Ready** — local release APK exists |
| AAB | **Not built** — no local app bundle exists |
| Release workflow | **Not built** — no `Android APK Build` workflow run and no GitHub Release |
| Docker | Not applicable; Flutter Android/iOS platform packaging |

Included modules: pairing/manual connection, secure token and server URL storage, home, barcode scan/manual entry, product search/result, vendor-price comparison, suggested selling price, invoice image/PDF upload, generated barcode display, and settings.

Known blockers: no physical Android device validation is recorded, no AAB exists for Play distribution, and iOS packaging/distribution is not built.

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
| CI | **Partial** — prior pinned SHA `751afb6` passed; the refreshed `f1f23d8` deploy-workflow SHA was not reverified during the original audit |
| Local build | Not retained (`store-desk-cloud-backend/dist/` absent); prior SHA was CI-verified and `f1f23d8` remains to be reverified |
| Container | **Partial** — multi-stage Node 20 `Dockerfile` exists; Docker is not installed locally, so no local image was verified |
| Deployment | **Partial** — a Cloud Run revision was attempted but failed startup; the listen-before-Atlas fix and deploy workflow are now pinned, but no successful redeploy is recorded |

Included modules: `/health`, `/ws`, Atlas `AGENT_KEY` validation, agent/client store rooms, presence, ping/pong, room relay without Redis, listen-before-Atlas startup handling, and GitHub Actions deployment to Cloud Run.

Known blockers: complete a successful Cloud Run deploy with one instance plus session affinity for current in-memory room correctness, reverify CI for `f1f23d8`, and verify end-to-end Worker relay.

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
| Worker → Cloud Hub | **Partial** | Outbound WSS and `/api/` relay code exist; the refreshed Hub SHA adds Cloud Run startup and deployment fixes, but no successful deployed-Hub end-to-end test is recorded. |
| Web → Cloud Hub identity | **Partial** | Both use the Atlas Store/license identity concept; Hub deployment is absent and current Web SHA is preview-only. |
| Parent GitHub Actions → private submodules | **Blocked** (ops) | Workflow expects `secrets.SUBMODULES_PAT` on checkout; operator must add that Actions secret (see `docs/env-by-project.md` §0). Default `GITHUB_TOKEN` alone cannot clone private sibling repos. |

## Conservative cleanup result

- Removed only `store-desk-mobile/.DS_Store`, an untracked macOS metadata file.
- Preserved both APKs, including `store-desk-worker/downloads/storedesk-buddy.apk`.
- Did not remove ignored build output, caches, source, secrets, user data, or uncertain files.
- No submodule source or parent gitlink was changed.
