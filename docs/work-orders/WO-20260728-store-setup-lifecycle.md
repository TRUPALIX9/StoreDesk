# WO-20260728-store-setup-lifecycle

- **Status:** in_review
- **Management:** collaborative
- **Priority:** P0
- **Requester:** user
- **Primary owner:** eng-manager
- **Reviewers:** tech-lead, qa-verifier
- **Modules:** store-desk-web | store-desk-cloud-backend | store-desk-worker | store-desk-electron | store-desk-mobile | docs

## Goal

Deliver one secure, supportable StoreDesk installation and activation lifecycle across the cloud control plane and the store PC. StoreDesk Web owns multi-organization accounts, users/memberships, subscriptions, store/installation registration, emailed setup keys, EULA audit, and approvals; StoreDesk Worker remains the local-first data and Commander boundary; a bundled service manager owns native service lifecycle, encrypted configuration, updates, rollback, and redacted diagnostics. Electron conditionally enters normal use or resumable onboarding. Worker completes its first control-plane bootstrap before Electron is ready or Mobile can pair. StoreDesk and StoreDesk Mobile use separate client credentials and never receive the store-scoped Worker credential.

## Phases

1. **Contract and threat review** — approve the v1 state, identity, credential, service-control, relay, path, and recovery contracts.
2. **Control plane** — implement account/subscription/store membership, one-time activation, credential rotation, approval, and relay-session issuance in StoreDesk Web and StoreDesk Cloud Hub.
3. **Store runtime** — bundle the service manager, encrypted configuration, native WinSW/launchd/systemd integration, Worker activation/rotation, health, and diagnostics.
4. **Canonical edge API** — migrate Commander and remaining embedded Electron API behavior into StoreDesk Worker; remove client dependence on Electron’s legacy embedded server.
5. **Clients and relay** — adopt desktop/mobile client tokens, approval UX, LAN fallback, and authorized Hub relay sessions.
6. **Release safety** — signed updates, staged rollout, automatic rollback, recovery tooling, and cross-platform E2E gates.

## Acceptance criteria

- [ ] A persisted, observable setup state machine implements `not_installed → installed → awaiting_activation → active → degraded → suspended → updating → rollback`, with reviewed transition guards, recovery paths, and no cloud outage blocking supported local operations.
- [ ] StoreDesk Web models `User ─< OrganizationMembership >─ Organization ─1 Account`, with Organization owning subscriptions/stores and Store owning Worker installations. Users may hold different roles across organizations; every request and audit record is tenant/store scoped and cross-organization references fail closed.
- [ ] StoreDesk Web issues a high-entropy, expiring, single-use setup key bound to organization/store/installation/subscription/recipient and sends it by email to an authorized organization user. Delivery/list APIs never reveal it; failure requires revoke/reissue; replay and concurrent redemption cannot mint duplicate Worker credentials.
- [ ] Before redemption, onboarding records OS/system and privacy/local-data acknowledgements plus immutable explicit EULA acceptance with published version, canonical document hash, user, organization/account, store/installation, timestamp, correlation, and audit metadata. Wrong/outdated EULA versions are rejected and superseding versions require reacceptance.
- [ ] StoreDesk Worker exchanges the setup key over TLS for a rotatable store-scoped Worker credential that is returned exactly once directly to Worker, sealed before success, redacted everywhere, and represented server-side only by an approved hash. Email, Web users/admin APIs, Electron, and Mobile never receive the permanent credential.
- [ ] StoreDesk and StoreDesk Mobile receive separate revocable client/device credentials after approval. Neither client, QR payloads, logs, diagnostics, Hub messages, nor renderer bundles can contain the Worker credential.
- [ ] Electron login conditionally attaches to an authorized active/bootstrapped Worker or launches resumable onboarding at the first incomplete checkpoint; UI state alone cannot declare readiness.
- [ ] Worker verifies Hub/subscription/protocol state and completes an idempotent control-metadata-only first bootstrap before Electron becomes ready. Mobile pairing/approval is rejected until that readiness gate passes.
- [ ] The installer includes `store-desk-worker/packages/service-manager/` and native service definitions for Windows/WinSW, macOS/launchd, and Linux/systemd; install, status, start, stop, restart, update, rollback, diagnostics, and recovery behavior match the v1 contract. Electron bundles only its signed artifact/typed IPC client.
- [ ] Local secret configuration is encrypted with AES-256-GCM under a unique installation key, protected by the OS keystore when available and restrictive SYSTEM/root ACLs otherwise; backup, corruption, key-loss, and reinstall behavior are tested.
- [ ] StoreDesk Web models organization/account ownership, subscription entitlement, multi-organization users/store memberships, roles, Worker installations, setup delivery, EULA acceptance, device approvals, suspension, and audit events; approval and entitlement checks gate remote relay without moving catalog, Commander, or invoice data into Atlas.
- [ ] Commander connectivity, Price Book, POS Reports, and Transactions move from `store-desk-electron/src/server` into canonical StoreDesk Worker services/routes, with Commander credentials stored only in encrypted Worker configuration and read-only behavior preserved unless a separately reviewed write contract is approved.
- [ ] StoreDesk Cloud Hub accepts only short-lived, audience-bound relay sessions for approved Worker or client principals, enforces store/role/request allowlists and correlation IDs, and never accepts a client presenting a Worker credential.
- [ ] Signed/versioned updates are staged, health-gated, and automatically rolled back to the last known-good release; rollback restores binaries/config schema compatibility without deleting store data.
- [ ] Redacted diagnostics include lifecycle state, versions, service status, database/Commander/Hub reachability, recent bounded logs, update history, and correlation IDs, with automated secret/PII leakage tests.
- [ ] E2E gates cover fresh install, activation replay/expiry, credential rotation/revocation, device approval/denial, LAN-only operation, Hub relay, suspension, degraded cloud/Commander states, update failure, rollback, reboot persistence, and uninstall/reinstall on all three desktop service platforms.
- [ ] All module CI checks pass at compatible pinned revisions; QA records installer/physical-device checks or explicitly documents unavailable platform coverage before this Work Order can be closed.

## Out of scope

- Inventory quantities, stock movements, reorder levels, warehouse locations, or any inventory model/API.
- Direct StoreDesk Mobile or StoreDesk access to MongoDB or Commander.
- Uploading local catalog, Commander payloads, invoice files, or vendor-price history to Atlas.
- Redis or multi-instance Hub room scaling in Phase 0–1.
- Commander write-back, unattended configuration reset, or destructive data rollback.

## Touch list (expected)

- `store-desk-web/` — account, subscription, membership, activation, rotation, approval, and relay-session control plane.
- `store-desk-cloud-backend/` — v1 principal authentication, relay authorization, presence, expiry, and audit-safe protocol.
- `store-desk-worker/` — activation client, credential vault, client token issuance, canonical Commander services, health, and relay agent.
- `store-desk-electron/` — setup/approval/status UX and removal of embedded-server dependencies.
- `store-desk-mobile/` — approved client credential lifecycle, secure storage, LAN/Hub transport.
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
- StoreDesk Worker remains on `0.0.0.0:4310` for supported LAN mode. Cloud control-plane loss may degrade activation/relay/update checks but must not move local store data to the cloud.
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

- Replaced the single-account model with Organization tenant boundaries, global Users, scoped OrganizationMemberships, organization-owned Account/Subscriptions/Stores, and store-owned WorkerInstallations.
- Replaced Web-displayed activation codes with recipient-bound, emailed, expiring, single-use setup keys and fail-closed delivery/reissue/audit rules.
- Added immutable OS/privacy acknowledgement and EULA acceptance audit with version and canonical document hash.
- Made Worker the only recipient/holder of the permanent credential, including a Worker-completed rotation challenge rather than returning rotations to an admin.
- Added Electron's conditional normal/onboarding entry and resumable checkpoints.
- Added idempotent metadata-only first bootstrap/readiness and made Mobile pairing strictly subsequent to Worker readiness.
- Added atomic/idempotent redemption, tenant-reference checks, email-log suppression, and cross-tenant/replay/concurrency test requirements.

Implementation handoff:

- **To `backend-server`:** implement Worker activation/config/bootstrap and the Worker-owned service-manager package/CLI/adapters; preserve port `4310`, local-first data, and Worker-only credential handling.
- **To StoreDesk Web/Cloud Hub implementers:** implement tenant-scoped entities/authz, email setup-key delivery, EULA/audit, entitlement/install limits, Worker-only rotation completion, and audience-bound relay sessions.
- **To `frontend-electron`:** implement only the typed conditional onboarding/status/IPC client after backend contracts land; never persist setup keys or Worker credentials.
- **To `mobile-buddy`:** gate pairing on Worker readiness and use device/client credentials only.
- **To `qa-verifier`:** test tenant isolation, EULA integrity, email/reissue, key replay/concurrency, readiness ordering, secret leakage, and platform lifecycle matrices before closure.

## Handoff log

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
