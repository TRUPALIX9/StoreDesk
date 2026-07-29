# WO-20260728-store-setup-lifecycle

- **Status:** in_progress
- **Management:** collaborative
- **Priority:** P0
- **Requester:** user
- **Primary owner:** eng-manager
- **Reviewers:** tech-lead, qa-verifier
- **Modules:** store-desk-web | store-desk-cloud-backend | store-desk-worker | store-desk-electron | store-desk-mobile | docs

## Goal

Deliver one secure, supportable StoreDesk installation and activation lifecycle across the cloud control plane and store PC. Central InternalAdmin operators use Web admin to create Organization → Subscription → Store → WorkerInstallation hierarchy, email bound setup keys to site contacts, provision AppUsers, and grant exact UserAssignments. Organization/contact metadata is never a customer Web login. Electron with no Worker enters setup-key onboarding; activated Electron and Mobile use AppUser login and assignment-scoped Hub sessions, never pairing or manual Worker/LAN selection. Worker remains the local data/Commander boundary, owns its permanent credential, and completes exact-ID metadata bootstrap before assigned clients connect.

## Phases

1. **Contract and threat review** — approve the v1 state, identity, credential, service-control, relay, path, and recovery contracts.
2. **Control plane** — implement hierarchy-scoped organizations/subscriptions/stores/installations, AppUsers/UserAssignments, one-time setup keys, credential rotation, and assignment-scoped relay sessions.
3. **Store runtime** — bundle the service manager, encrypted configuration, native WinSW/launchd/systemd integration, Worker activation/rotation, health, and diagnostics.
4. **Canonical edge API** — migrate Commander and remaining embedded Electron API behavior into StoreDesk Worker; remove client dependence on Electron’s legacy embedded server.
5. **Clients and relay** — adopt AppUser login, one-assignment auto-connect/multi-assignment selector, refresh/revoke/logout/device audit, and assignment-authorized Hub relay; retire pairing/manual LAN/Worker selection.
6. **Release safety** — signed updates, staged rollout, automatic rollback, recovery tooling, and cross-platform E2E gates.

## Acceptance criteria

- [ ] A persisted, observable setup state machine implements `not_installed → installed → awaiting_activation → active → degraded → suspended → updating → rollback`, with reviewed transition guards, recovery paths, and no cloud outage blocking supported local operations.
- [ ] Only central InternalAdmin operators authenticate to Web admin. Organization is a tenant/container, not a login identity; no organization customer Web login, membership portal, password-reset, or self-service contract exists.
- [ ] Admin Worker creation selects an existing Organization and Store/site, captures Worker name/contact email/store number/address, generates immutable `workerInstallationId`, and persists canonical `organizationId/storeId/workerInstallationId` plus support snapshots. Every retrieval/presence/sync/audit/diagnostics/admin operation scopes the complete hierarchy and UI displays it.
- [ ] StoreDesk Web issues a high-entropy, expiring, single-use setup key bound to exact organization/store/installation/subscription/contact email and sends it to the site contact. Contact email is routing metadata, not login. Delivery/list APIs never reveal the key; failure requires revoke/reissue; replay/concurrency cannot mint duplicate Worker credentials.
- [ ] Setup-key redemption transactionally records immutable OS/system/privacy/EULA acknowledgement with versions, canonical document hash, exact IDs, contact email, acceptance/redemption timestamps, and audit correlation. No customer cloud session is involved.
- [ ] StoreDesk Worker exchanges the setup key over TLS for a rotatable store-scoped Worker credential that is returned exactly once directly to Worker, sealed before success, redacted everywhere, and represented server-side only by an approved hash. Email, Web users/admin APIs, Electron, and Mobile never receive the permanent credential.
- [ ] Central admins provision AppUsers by email and explicit UserAssignments to exact Organization → Store → WorkerInstallation with role/scopes. One-time app enrollment/recovery is consumed only in Electron/Mobile; there is no customer Web reset portal. AppUser identity is distinct from InternalAdmin, setup key, Worker credential, refresh credential, and Hub sessions.
- [ ] Login/session issuance and Hub/Worker relay enforce active user, assignment, hierarchy, role, scopes, audience, device, subscription, readiness, expiry, and revocation. One assignment auto-connects; multiple show only the authorized selector; refresh/revoke/disable/logout/device/session audit and offline messaging are covered.
- [ ] Electron with no activated local Worker opens resumable setup-key onboarding directly, with no cloud-user login. Activated Electron and Mobile use AppUser login. QR/6-digit pairing, manual LAN URL, manual Worker ID selection, and pairing-primary target implementation are retired.
- [ ] Worker verifies Hub/subscription/protocol state and completes an idempotent exact-ID metadata-only first bootstrap/presence before assigned Electron/Mobile sessions connect; no local catalog/Commander/invoice/vendor-price data moves to Atlas.
- [ ] The installer includes `store-desk-worker/packages/service-manager/` and native service definitions for Windows/WinSW, macOS/launchd, and Linux/systemd; install, status, start, stop, restart, update, rollback, diagnostics, and recovery behavior match the v1 contract. Electron bundles only its signed artifact/typed IPC client.
- [ ] Local secret configuration is encrypted with AES-256-GCM under a unique installation key, protected by the OS keystore when available and restrictive SYSTEM/root ACLs otherwise; backup, corruption, key-loss, and reinstall behavior are tested.
- [ ] StoreDesk Web models Organization, Subscription, Store, WorkerInstallation, AppUser, UserAssignment, SetupKey, EulaAcceptance, client device/session state, and audit events; InternalAdmin auth remains separate and assignment/entitlement checks gate relay without moving local business data into Atlas.
- [ ] Commander connectivity, Price Book, POS Reports, and Transactions move from `store-desk-electron/src/server` into canonical StoreDesk Worker services/routes, with Commander credentials stored only in encrypted Worker configuration and read-only behavior preserved unless a separately reviewed write contract is approved.
- [ ] StoreDesk Cloud Hub accepts only short-lived, audience-bound relay sessions for approved Worker or client principals, enforces store/role/request allowlists and correlation IDs, and never accepts a client presenting a Worker credential.
- [ ] Signed/versioned updates are staged, health-gated, and automatically rolled back to the last known-good release; rollback restores binaries/config schema compatibility without deleting store data.
- [ ] Redacted diagnostics include lifecycle state, versions, service status, database/Commander/Hub reachability, recent bounded logs, update history, and correlation IDs, with automated secret/PII leakage tests.
- [ ] E2E gates cover fresh install, setup replay/expiry, exact-ID binding, credential rotation/revocation, AppUser assignment isolation, one/multiple/zero assignment login, disable/logout/device revocation, retired-pairing denial, offline messaging, Hub relay, suspension, degraded cloud/Commander states, update failure, rollback, reboot persistence, and uninstall/reinstall on all three service platforms.
- [ ] All module CI checks pass at compatible pinned revisions; QA records installer/physical-device checks or explicitly documents unavailable platform coverage before this Work Order can be closed.

## Out of scope

- Inventory quantities, stock movements, reorder levels, warehouse locations, or any inventory model/API.
- Direct StoreDesk Mobile or StoreDesk access to MongoDB or Commander.
- Uploading local catalog, Commander payloads, invoice files, or vendor-price history to Atlas.
- Redis or multi-instance Hub room scaling in Phase 0–1.
- Commander write-back, unattended configuration reset, or destructive data rollback.

## Touch list (expected)

- `store-desk-web/` — InternalAdmin, hierarchy, AppUser/UserAssignment, setup-key/email/EULA, rotation, client session, and audit control plane.
- `store-desk-cloud-backend/` — v1 principal authentication, relay authorization, presence, expiry, and audit-safe protocol.
- `store-desk-worker/` — activation client, credential vault, exact-ID bootstrap/presence, assignment enforcement, canonical Commander services, health, and relay agent.
- `store-desk-electron/` — setup-key onboarding, AppUser login/assignment UX, session lifecycle, and removal of pairing/embedded-server dependencies.
- `store-desk-mobile/` — AppUser login/assignment/session lifecycle, secure storage, Hub transport, and pairing/manual-connect removal.
- `store-desk-worker/packages/service-manager/` — private service-manager package containing native adapters/templates, encrypted config, updates, rollback, diagnostics, and release assembly; Electron consumes its signed artifact only.
- `docs/architecture.md`
- `docs/api-contract.md`
- `docs/env-by-project.md`
- `docs/system-map.md`

## Dependencies / blockers

- Tech-lead contract review is approved with the amendments recorded below; implementation must use the selected service-manager location and may not revert the tenant/EULA/setup-key/readiness gates without a new review.
- Security review is required for cryptographic envelope/key storage, activation/rotation, update signing, and relay authorization.
- Code-signing identities, release hosting, and supported OS baselines must be selected before packaging gates can pass.
- StoreDesk Cloud Hub remains single-instance/session-affine until a separately approved scale-out design.

## Notes

- Contract version: `setup-v1`; breaking wire or persisted-state changes require a new version and compatibility window.
- StoreDesk Worker remains on `0.0.0.0:4310` internally, but primary clients use assignment-scoped Hub sessions. No manual LAN URL/Worker selection or unauthenticated fallback is allowed; emergency local recovery is disabled by default and outside onboarding.
- The emailed setup key and every plaintext credential are write-only/one-time values. Email carries only the short-lived setup key; it never carries a permanent Worker credential. Documentation, fixtures, screenshots, telemetry, and examples use non-secret placeholders only.
- Hash-at-rest, redaction, service names, paths, and API/CLI shapes are specified in the linked architecture/API/env/system docs and must remain synchronized.

## Tech-lead decision note — 2026-07-28

**Verdict:** approved with contract amendments; ready for specialist implementation after security review of crypto, email delivery, tenant authorization, EULA retention, and privileged IPC.

Options considered for the service manager:

1. Electron-owned package — rejected because it duplicates Worker lifecycle/config ownership and risks exposing privileged or Worker-only secrets to the desktop release.
2. New parent package or sixth repository/submodule — rejected because the parent is not a monorepo and a separate release graph adds compatibility/pointer overhead before the boundary is proven.
3. Worker-owned private package — selected: `store-desk-worker/packages/service-manager/`.

The selected package is versioned/released with Worker, owns native templates and privileged lifecycle logic, and is compatibility-tested in Worker CI. Electron receives a signed packaged helper plus typed IPC contract, not the source or permanent credential.

Exact contract amendments:

- Removed customer Web identity/membership contracts. Organization is a tenant; InternalAdmin is Web-only; AppUser/UserAssignment is Electron/Mobile-only.
- Locked admin Worker creation and all control operations to immutable Organization → Store → WorkerInstallation IDs plus support display snapshots.
- Replaced Web-displayed activation codes with recipient-bound, emailed, expiring, single-use setup keys and fail-closed delivery/reissue/audit rules.
- Added immutable OS/privacy acknowledgement and EULA acceptance audit with version and canonical document hash.
- Made Worker the only recipient/holder of the permanent credential, including a Worker-completed rotation challenge rather than returning rotations to an admin.
- Added Electron's direct setup-key onboarding when Worker is absent and AppUser assignment login when active.
- Added idempotent exact-ID metadata-only first bootstrap/readiness and assignment-gated Electron/Mobile access.
- Retired QR/6-digit pairing, manual LAN URL, manual Worker selection, and pairing-primary UI/API target behavior.
- Added atomic/idempotent redemption, tenant-reference checks, email-log suppression, and cross-tenant/replay/concurrency test requirements.

Implementation handoff:

- **To `backend-server`:** implement Worker activation/config/bootstrap and the Worker-owned service-manager package/CLI/adapters; preserve port `4310`, local-first data, and Worker-only credential handling.
- **To StoreDesk Web/Cloud Hub implementers:** stop/rework any customer Web identity/portal or pairing implementation; implement InternalAdmin hierarchy, AppUser/UserAssignment auth, exact-ID setup/email/EULA, entitlement, revocation, and assignment-bound sessions.
- **To `frontend-electron`:** implement direct setup-key onboarding only when Worker is absent; otherwise AppUser login and authorized assignment selection. Remove pairing/manual Worker/LAN primary flows; never persist setup keys or Worker credentials.
- **To `mobile-buddy`:** replace pairing/manual connect with AppUser login, assignment selection, refresh/logout/offline UX, and Hub transport.
- **To `qa-verifier`:** test hierarchy/assignment isolation, EULA integrity, email/reissue, replay/concurrency, one/multiple/zero assignment behavior, disable/revoke/logout, retired-flow denial, readiness ordering, secret leakage, and platform lifecycle matrices.

## Handoff log

### HO — 2026-07-28 20:55 (EDT)

- **From:** eng-manager
- **To:** specialist parallel slice (web / worker / hub / electron / mobile)
- **WO:** WO-20260728-store-setup-lifecycle
- **State entering handoff:** in_progress

#### Done
- Tech-lead approved `setup-v1` with amendments; contracts live in architecture/api/env/system-map.
- WO moved `in_review` → `in_progress` for MVP vertical-slice implementation.
- Todos: `setup-contracts` completing; `control-plane`, `worker-bootstrap`, `hub-identity`, `service-manager`, `setup-ui`, `client-approval`, `lifecycle-qa` assigned in parallel.

#### Not done
- Web still has WIP customer-login models (`OrganizationMembership`, `Account`, `recipientUserId`) — must be removed.
- Worker/Hub/Electron/Mobile setup-v1 features largely not started.
- service-manager package not created yet.
- Module commits/pushes and parent pointer update pending.

#### Decisions locked
- InternalAdmin-only Web login; Organization is tenant metadata.
- Setup key emailed once; Worker-only permanent credential.
- AppUser + UserAssignment for Electron/Mobile; pairing/LAN primary retired.
- service-manager at `store-desk-worker/packages/service-manager/`.

#### Next 3 actions
1. Rework Web control plane models/APIs; issue/redeem setup keys; AppUser/session APIs.
2. Worker vault/activation/bootstrap + service-manager CLI/adapters; Hub sessionToken auth.
3. Electron setup wizard + AppUser login; Mobile AppUser login; QA + commits/pushes.

#### Commands already run
- Cross-module `git status` on `develop`; inspected ControlPlane WIP and Hub v0 hello/agentKey.

### HO — 2026-07-28 20:03 (EDT)

- **From:** eng-manager
- **To:** tech-lead
- **WO:** WO-20260728-store-setup-lifecycle
- **State entering handoff:** in_review

#### Done

- Created the collaborative P0 master Work Order and integrated `setup-v1` contracts into architecture, API, environment, and system map docs.
- Replaced the planned shared `AGENT_KEY` client model with distinct activation, Worker, client, and relay-session credentials.

#### Not done

- No production code, installer, schema migration, deployment, or external plan-file changes.
- Cross-repository implementation slices and platform test matrix remain to be approved.

#### Decisions locked

- Worker credential is Worker-only; clients use approved client credentials and short-lived relay sessions.
- Local secret config uses AES-256-GCM with a unique installation key and OS access controls.
- StoreDesk Worker is the canonical Commander/API process on port 4310; local-first and no-inventory boundaries remain.

#### Files touched

- `docs/work-orders/WO-20260728-store-setup-lifecycle.md` — master delivery order and handoff.
- `docs/architecture.md` — lifecycle, trust, service, encryption, deployment, and rollout contract.
- `docs/api-contract.md` — activation, service-control, approval, relay, and error wire contracts.
- `docs/env-by-project.md` — credential ownership, secret storage, paths, services, and redaction.
- `docs/system-map.md` — target map, Commander migration, phases, recovery, and E2E gates.

#### Risks / watchouts

- Existing Hub v0 accepts the same `agentKey` for agent and client; it is incompatible with this v1 contract.
- Existing Commander code and secrets are still under Electron’s embedded server and must migrate before the single-service target is true.
- Installer repository/package placement and update-signing infrastructure are not yet selected.

#### Next 3 actions

1. Threat-model and approve or amend `setup-v1`, especially token hashing, relay-session issuance, and offline/suspension semantics.
2. Split implementation into dependency-ordered Web/Hub, service-manager/Worker, Electron/Mobile, and QA Work Orders.
3. Route approved contract changes to module owners, then QA for cross-platform E2E verification.

#### Commands already run

- `git status --short --branch` → `develop`, clean before edits.
- Markdown/diff checks are recorded in the final task report.
