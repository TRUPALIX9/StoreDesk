# StoreDesk Architecture

Local-first system for convenience stores and gas stations. This document defines the target **setup contract v1 (`setup-v1`)**; current implementation gaps are tracked in `system-map.md` and `WO-20260728-store-setup-lifecycle`.

## Components and trust boundaries

| Component | Tech / placement | Role and trust |
|-----------|------------------|----------------|
| **StoreDesk** | Electron + React + MUI, store PC | Desktop client; uses a desktop token, never cloud or Worker credentials |
| **StoreDesk Worker** | Node.js + Express + local MongoDB, `0.0.0.0:4310` | Canonical local API, catalog/invoice data boundary, Commander adapter, and sole holder of the store-scoped Worker credential |
| **StoreDesk Mobile** | Flutter, phone | Approved device client; uses a separate mobile token and never accesses MongoDB or Commander directly |
| **StoreDesk service manager** | Bundled native helper, store PC | Privileged install/service/update/rollback/diagnostics boundary |
| **StoreDesk Web** | Next.js + Atlas, Vercel | Multi-organization accounts, subscriptions, store registry, memberships, setup-key delivery, EULA audit, approval, and credential rotation control plane |
| **StoreDesk Cloud Hub** | Node.js WSS, Cloud Run | Authenticated store-room relay; no catalog, Commander, or invoice persistence |

```txt
StoreDesk ──desktop token──┐
StoreDesk Mobile ─device──┼── HTTP :4310 ── StoreDesk Worker ── local Mongo + Commander
                          │                        │
                          └── short-lived relay ─ Hub ◄── outbound Worker session

StoreDesk Web ── Atlas: organizations/accounts/users/subscriptions/stores/installations/audit + credential hashes only
StoreDesk service manager ── local privileged service/update/config operations
```

LAN mode remains supported and does not require the Hub. Cloud loss can make activation, remote relay, entitlement refresh, or updates unavailable, but local catalog and reviewed invoice workflows remain on the store PC.

## Setup lifecycle v1

The service manager persists the authoritative local state; StoreDesk Worker reports a sanitized projection.

```txt
not_installed → installed → awaiting_activation → active
                                      │            ├→ degraded ─→ active
                                      │            ├→ suspended ─→ active
                                      │            └→ updating ─→ active
                                      │                        └→ rollback ─→ active | degraded
                                      └────────────────────────────→ awaiting_activation
```

| State | Meaning / allowed work |
|-------|------------------------|
| `not_installed` | No managed services or installation identity. Installer-only state. |
| `installed` | Files, installation key, ACLs, and native service definitions exist; no activation attempted. |
| `awaiting_activation` | Worker can expose loopback setup health and exchange a setup key; business and relay APIs are unavailable. |
| `active` | Entitlement valid; local APIs and approved relay are available. |
| `degraded` | Local service remains usable where safe; one or more optional dependencies (cloud, Commander, update service) is unavailable. |
| `suspended` | New cloud relay and privileged/config changes are denied. Local data remains intact; offline behavior is limited to the last verified entitlement policy and audit-visible grace period. |
| `updating` | Service manager drains requests, snapshots compatible config, stages a signed release, and runs health gates. |
| `rollback` | Service manager restores the last known-good binaries/config schema after a failed gate; store data is never deleted. |

Every transition records timestamp, actor/reason code, from/to state, installation ID, versions, and correlation ID without credentials. Reboot resumes the persisted transition. `updating` and `rollback` are transient; failures end in `active` or `degraded`, never an unreported half-install.

Electron keeps a separate resumable onboarding checkpoint projection: `account_authenticated → acknowledgements_accepted → eula_accepted → worker_installed → setup_key_redeemed → hub_verified → first_sync_complete → ready`. On login it selects one of two paths:

- If an authorized installation reports `active`, healthy, and `firstSyncComplete`, Electron attaches using its desktop-client credential and opens normal StoreDesk.
- If the selected organization/store has no ready installation, Electron opens onboarding at the first incomplete checkpoint. It never marks setup complete from UI state alone; readiness is the Worker's signed/authenticated status.

OS/elevation, privacy/local-data handling, and EULA acceptance precede setup-key redemption. Mobile download may be shown earlier, but pairing, approval, and application access are disabled until the Worker reaches `ready`.

## Identity, subscription, and approval

- A **User** is a global login identity and may belong to multiple organizations. It has no tenant authority without an active **OrganizationMembership**.
- An **Organization** is the tenant and owns one v1 **Account** (customer/billing profile), one or more stores, memberships, and subscriptions. `organizationId` is mandatory in every control-plane authorization decision and audit event.
- An **Account** belongs to exactly one organization. It does not own users directly and is never used as a substitute tenant boundary.
- A **Subscription** belongs to one organization/account and grants store, Worker-installation, device, and feature entitlements plus grace policy. A store/installation records the subscription used for entitlement; cross-organization references are rejected.
- A **Store** belongs to exactly one organization. A **WorkerInstallation** belongs to exactly one store and organization and consumes one eligible subscription entitlement. Multiple installations are allowed only when the subscription permits them.
- An **OrganizationMembership** grants `owner`, `organization_admin`, `store_admin`, or `member` access, optionally restricted to named stores. Authorization resolves membership and store scope on every request; client-supplied organization IDs are never trusted without that check.
- A **DeviceApproval** is `pending`, `approved`, `denied`, `revoked`, or `expired`, names one installation and device, records approver/audit metadata, and never stores a plaintext token.
- StoreDesk Worker is the local issuer/enforcer for LAN desktop/mobile tokens. StoreDesk Web is the authority for cloud relay approval and entitlement.

EULA acceptance is immutable audit data, not a mutable boolean. Each acceptance records `eulaVersion`, canonical-document SHA-256, user ID, organization/account ID, store/installation ID (when allocated), accepted timestamp, request correlation ID, and safe user-agent/source metadata. A superseding EULA version requires a new acceptance before privileged setup or reconfiguration; audit retention follows the legal retention policy.

## Credential and encryption contract

| Class | Plaintext owner | Server-side representation | Rules |
|-------|-----------------|----------------------------|-------|
| Setup key | Web emails once to an authorized organization user; Electron passes it through protected IPC and Worker holds only during exchange | Key ID + Argon2id secret hash + organization/store/installation/recipient binding, expiry, attempt count, consumed/revoked metadata | At least 128 random bits, single use, short TTL, never displayed in list APIs or logged; email contains no permanent credential |
| Worker credential | StoreDesk Worker only | Atlas credential ID + Argon2id hash; previous hash retained only for bounded rotation overlap | At least 256 random bits, store/installation scoped, rotatable; never sent to StoreDesk, StoreDesk Mobile, or Hub client role |
| Desktop/mobile token | Issued by Worker to one approved client | Worker stores HMAC-SHA-256 digest keyed by installation key plus status/expiry | At least 256 random bits, device/audience scoped, independently revocable |
| Client relay refresh credential | Approved StoreDesk/StoreDesk Mobile client | Control plane stores credential ID + Argon2id hash | Exchanged over TLS for a short-lived relay session; not accepted as Worker auth |
| Relay session | Approved Worker or client process | Short-lived signed claims; no plaintext persistence required | Includes `iss`, `aud`, `sub`, `storeId`, `installationId`, `role`, scopes, `iat`, `exp`, `jti`; Hub rejects role/audience mismatch |

Random high-entropy token hashes are never reversible. Passwords, setup keys, and refresh/Worker credentials use a memory-hard password hash; local token lookup uses keyed HMAC. Rotation and revocation are audited by credential ID only.

Setup-key issuance and redemption are separate audited operations. Delivery failure does not expose the key in an admin response; an authorized admin may revoke and issue a replacement. Redemption is atomic and idempotent for the same installation/correlation request, so concurrent submissions cannot mint two Worker credentials. The permanent Worker credential is returned exactly once over TLS directly to the Worker activation process, sealed before success is reported, and is never available to email, Web UI, Electron renderer/main state, or Mobile.

The service manager creates one 256-bit installation key. Secret local configuration is an authenticated versioned envelope (`AES-256-GCM`, unique 96-bit nonce per write, authentication tag, schema version, and installation ID as associated data). The key is held in an OS machine keystore where supported; otherwise it is a separate SYSTEM/root-only file. Config, key, backups, logs, and diagnostics use least-privilege OS ACLs. Key loss does not trigger insecure fallback: the installation enters recovery and requires reactivation/re-entry of local secrets.

## Service and process model

- The installer bundles the service manager and StoreDesk Worker. Windows uses WinSW, macOS uses launchd, and Linux uses systemd; stable names and paths are listed in `env-by-project.md`.
- **Package location decision:** source, tests, native templates, and release assembly live in `store-desk-worker/packages/service-manager/` as a private TypeScript package in the Worker submodule. It is versioned and released with a compatible Worker artifact. Electron consumes only the signed packaged CLI/helper artifact and typed IPC contract; service-manager source is not duplicated in Electron or the parent repository.
- The service manager exposes a privileged local CLI and IPC endpoint only. It is not mounted under public Worker `:4310` or relayed through the Hub.
- The manager owns install/uninstall, start/stop/restart, status, configuration sealing, update staging, health gates, rollback, and redacted diagnostic bundles.
- Worker owns application health and dependency probes. StoreDesk may request non-privileged diagnostics but cannot read raw encrypted config or the installation key.
- Updates require a signed manifest and artifact digest, stage beside the active release, preserve the last known-good release, and enforce schema compatibility before cutover.

## Canonical edge API and Commander

StoreDesk Worker is the only target API process. The legacy `store-desk-electron/src/server` copy is a migration source, not an alternate production runtime. Price Book, Commander PLU lookup/status, POS Reports, T-Log Transactions, storage overlays, and their tests must move into Worker before the embedded server is retired. `COMMANDER_*` secrets belong only in Worker encrypted config. Existing Commander reads remain read-only; write-back needs a separate reviewed contract.

Uploaded invoices and catalog data remain local. Raw extraction never creates a final `VendorPrice`; human review remains mandatory and price history is preserved.

The Worker's first bootstrap/sync is control-plane metadata only: installation binding, organization/store identity, subscription entitlements and grace policy, protocol compatibility, server time, credential status, and Hub reachability. It must not upload or mirror catalog, Commander, invoice, or vendor-price data. Worker records an idempotent bootstrap completion marker and health evidence before Electron becomes ready; Mobile pairing is gated on that marker.

## Deployment and rollout

| Component | Runtime |
|-----------|---------|
| StoreDesk Cloud Hub | Cloud Run container, one instance/session affinity in Phase 0–1; no Redis |
| StoreDesk Worker / service manager | Native managed services on store PC |
| StoreDesk | Native desktop installer |
| StoreDesk Mobile | Flutter APK/iOS distribution |
| StoreDesk Web | Vercel |

Rollout phases: contract/threat review → control plane → service manager/Worker → Commander migration → clients/relay → signed update/rollback → staged pilot → general availability. Each phase is backward-compatible with LAN `:4310` until relay E2E is proven.

Parent and submodules use `develop` for integration and `production` for stable releases. See `api-contract.md`, `env-by-project.md`, `system-map.md`, and `database-schema.md`.

## Scope boundaries

In scope: products, variants, vendors, vendor-price history, reviewed invoices, pricing, mobile pairing, Commander read integration, setup/service lifecycle, and optional approved relay.

Never in scope: inventory quantities, stock movements, reorder levels, warehouse locations, direct mobile/desktop MongoDB access, or cloud storage of the store catalog/Commander/invoices.
