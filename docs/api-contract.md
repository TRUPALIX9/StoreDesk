# StoreDesk API Contract

Base URL: `http://<host>:4310` (default port **4310**).

JSON request/response bodies unless noted. Errors return `{ "error": "message" }` with appropriate HTTP status.

## Contract versions and boundaries

- Existing local application routes remain under `/api/*`.
- Setup/control-plane HTTP uses `/api/v1/*`; Hub messages include `"version": 1`.
- Service-manager commands use privileged local IPC/CLI, not Worker `:4310` and never Hub relay.
- StoreDesk Worker is the only application API target. StoreDesk and StoreDesk Mobile never access MongoDB or Commander directly.
- `setup-v1` preserves local-first LAN operation on `0.0.0.0:4310`; it does not add inventory or stock APIs.

For v1 endpoints, errors use:

```json
{
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe operator-facing text",
    "correlationId": "corr_placeholder",
    "retryable": false
  }
}
```

No error, success body, log, telemetry event, or diagnostic response may echo a setup key, Worker/client credential, authorization header, Commander password, Mongo URI, installation key, or encrypted-config plaintext.

## Organization, setup key, and Worker credential v1

StoreDesk Web is an internal control-plane host. Only central StoreDesk support/admin operators authenticate to it. Organization contacts do not have cloud accounts, memberships, passwords, password-reset, or self-service APIs. Internal operator identity and role are retained only for admin authorization and audit.

`Organization` is a tenant/container with billing/contact metadata and owns `Subscription` and `Store` records. A `WorkerInstallation` belongs to one exact Organization and Store and consumes an eligible Subscription entitlement. Every retrieval, presence, sync, audit, diagnostics, and admin operation scopes and verifies the full `organizationId → storeId → workerInstallationId` chain. Client-supplied IDs are selectors, never authority.

Central admin Worker creation explicitly selects an existing Organization and Store/site, captures `workerName`, site contact email, useful store number/address metadata, generates an immutable `workerInstallationId`, and persists the three canonical IDs plus support display snapshots. Contact email is routing metadata only. Web sends the setup key to that contact; issuance/list responses expose delivery status and key ID only. The short-lived single-use setup key is Electron/Worker's only cloud-onboarding credential and is never a Worker credential.

### Issue or replace emailed setup key

| Method | Path | Caller | Result |
|--------|------|--------|--------|
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations` | central support/admin | Creates immutable installation ID from selected existing site, Worker name, contact email, subscription, store number/address snapshots |
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/setup-keys` | central support/admin | Revokes any unconsumed predecessor, creates one bound key, queues email, returns safe delivery metadata |
| GET | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/setup-keys/:keyId` | central support/admin | Safe status: `queued|sent|delivery_failed|consumed|expired|revoked` |
| DELETE | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/setup-keys/:keyId` | central support/admin | Revokes an unconsumed key |

Creation requires an existing `organizationId`, `storeId`, eligible `subscriptionId`, Worker display name, site contact email, delivery reason, and idempotency key. Store number/address are copied as support display snapshots while canonical IDs remain authoritative; snapshot changes never rebind an installation. The generated `workerInstallationId` is immutable. The setup-key record contains a public key ID and Argon2id hash of the secret, exact organization/store/installation/contact-email binding, TTL, bounded attempt counters, delivery metadata, and internal operator audit reference. Delivery failure is remediated by revoke/reissue, never by retrieving plaintext.

EULA/privacy/system acknowledgements are submitted only during setup-key redemption. There is no customer-authenticated EULA endpoint. Possession of the valid bound key authorizes onboarding for its exact selected site.

### Redeem setup key

`POST /api/v1/setup-keys/redeem`

```json
{
  "setupKey": "<key-id>.<one-time-secret>",
  "acknowledgements": {
    "eulaVersion": "2026-07",
    "eulaDocumentSha256": "<64-hex-placeholder>",
    "privacyVersion": "2026-07",
    "systemAcknowledgementVersion": "setup-v1",
    "contactEmail": "site-contact@example.invalid",
    "acceptedAt": "2030-01-01T00:00:00Z"
  },
  "installation": {
    "organizationId": "org_<id>",
    "storeId": "store_<id>",
    "workerInstallationId": "winst_<uuid>",
    "platform": "windows|macos|linux",
    "workerVersion": "1.2.3",
    "serviceManagerVersion": "1.2.3"
  }
}
```

Success (`201`, returned once):

```json
{
  "contractVersion": "setup-v1",
  "store": {
    "storeId": "SD-PLACEHOLDER",
    "organizationId": "org_<id>",
    "workerInstallationId": "winst_<uuid>",
    "status": "active"
  },
  "subscription": {
    "status": "active",
    "entitlementExpiresAt": "2030-01-01T00:00:00Z",
    "offlineGraceUntil": "2030-01-08T00:00:00Z"
  },
  "workerCredential": "<returned-once>",
  "workerCredentialId": "wcred_<id>",
  "hubUrl": "wss://hub.example.invalid/ws",
  "issuedAt": "2030-01-01T00:00:00Z"
}
```

Electron performs no cloud login. With no activated local Worker it goes directly to setup-key onboarding, accepts acknowledgements, then transfers the key and acknowledgement payload over authenticated protected local IPC to the Worker activation path and clears renderer/form state. Only StoreDesk Worker calls redemption over TLS. The service manager may broker protected handoff and seal-file ACL operations, but its IPC response and logs never contain the permanent credential.

Web atomically validates the setup-key hash, exact organization/store/installation/contact-email binding, subscription entitlement, current EULA/privacy/system versions and document hash, TTL/attempt budget, and installation identity before consuming the key, recording immutable acceptance/redemption audit, and creating one Worker credential. The server records redemption time independently. Same-installation retries with the same idempotency key return safe completion status, not the credential; concurrent or replayed redemption cannot mint another credential.

The Web/Atlas record stores the setup key and Worker credential only as approved hashes with credential IDs, expiry/status, and audit metadata. Worker seals the returned credential before reporting success; it must not persist in email after delivery requirements, installer arguments, shell history, plaintext `.env`, Electron UI/main state, Mobile storage, or logs.

Activation error codes:

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `ACTIVATION_REQUEST_INVALID` | Unsupported/malformed installation data |
| 401 | `SETUP_KEY_INVALID` | Key does not match; do not reveal whether an organization/store exists |
| 409 | `SETUP_KEY_CONSUMED` | Single-use key was already exchanged |
| 410 | `SETUP_KEY_EXPIRED` | Key expired or was revoked |
| 428 | `EULA_ACCEPTANCE_REQUIRED` | Current EULA/version acceptance is absent or context-mismatched |
| 409 | `INSTALLATION_ALREADY_BOUND` | Installation ID is already bound incompatibly |
| 402 | `SUBSCRIPTION_INACTIVE` | Organization/store has no eligible entitlement |
| 423 | `STORE_SUSPENDED` | Store cannot activate |
| 429 | `ACTIVATION_RATE_LIMITED` | Retry after the response delay/header |
| 503 | `ACTIVATION_UNAVAILABLE` | Temporary control-plane failure; retryable |

### Rotate or revoke Worker credential

| Method | Path | Caller | Result |
|--------|------|--------|--------|
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/worker-credentials/rotate` | central support/admin | Creates an audited rotation authorization/challenge; no credential is returned to the caller |
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/worker-credentials/complete-rotation` | currently authenticated Worker | Replacement returned once to Worker over TLS; optional bounded overlap with prior credential |
| DELETE | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/worker-credentials/:credentialId` | central support/admin | Revokes credential and active Worker relay sessions |

Rotation requires recent privileged reauthentication and an audit reason. The replacement is created/delivered only while the currently authenticated Worker proves installation possession and completes a short-lived, single-use rotation challenge; it is never returned to the initiating Web user or displayed to desktop/mobile clients. Emergency revocation may move the installation to `suspended`; failed rotation leaves the prior credential valid until the declared overlap expires.

### First bootstrap and readiness

| Method | Path | Caller | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/bootstrap` | Worker credential | Canonical IDs, support snapshots, entitlement/grace policy, protocol range, server time, credential status, and Hub metadata only |
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/bootstrap/complete` | Worker credential | Idempotently records exact IDs, bootstrap version, Hub handshake evidence, health summary, and completion time |
| GET | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/readiness` | central support/admin or Worker credential | Safe hierarchy-aware onboarding/readiness projection |

Bootstrap/presence payloads report the exact three IDs and support snapshots but never contain local catalog, Commander, invoice, or vendor-price data. `ready=true` requires setup-key redemption, current EULA acceptance, sealed Worker credential, entitlement verification, compatible Hub handshake, and successful first bootstrap. App-user session issuance for the assignment returns `409 WORKER_BOOTSTRAP_INCOMPLETE` until ready.

## Store lifecycle and diagnostics projection

These Worker routes are safe projections for approved local clients; they cannot perform privileged service changes:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/setup/v1/status` | Setup state, versions, entitlement freshness, dependency summaries, and last transition correlation ID |
| POST | `/api/setup/v1/activation` | Submits a setup key and EULA acceptance reference to the local activation service; body is write-only and response never echoes either |
| GET | `/api/diagnostics/v1/summary` | Redacted Worker/database/Commander/Hub health for an authorized desktop user |
| POST | `/api/diagnostics/v1/bundle` | Ask service manager to create a bounded redacted bundle; returns job metadata/path handle, not secrets |

Remote relay may access diagnostics summary only with explicit `diagnostics:read`; privileged activation, bundle creation, service control, config, update, and rollback routes are never relayable.

## Privileged service-manager CLI/IPC v1

CLI executable: `storedesk-service`. JSON mode emits `contractVersion`, `command`, `ok`, `state`, `correlationId`, and a safe `error` when needed.

```txt
storedesk-service install
storedesk-service uninstall
storedesk-service status [--json]
storedesk-service start|stop|restart worker
storedesk-service activate --setup-key-stdin
storedesk-service config validate
storedesk-service update check|stage|apply [--version <semver>]
storedesk-service rollback [--to <semver>]
storedesk-service diagnostics collect [--output <path>]
storedesk-service recovery status|reactivate
```

Rules:

- Setup-key input is stdin/OS-protected IPC only, never a positional argument.
- IPC is a Windows named pipe or root-owned Unix domain socket with peer identity checks and SYSTEM/root/admin ACLs.
- Destructive uninstall, rollback, or recovery requires local elevation and confirmation/noninteractive policy.
- Update accepts only a signed manifest, pinned signing identity, compatible schema range, and matching artifact digest.
- Diagnostic bundles contain lifecycle/version/service/dependency/update summaries and bounded logs after redaction. Secret-pattern tests must fail bundle creation if redaction cannot be guaranteed.
- CLI exit codes: `0` success, `2` invalid input, `3` authorization/elevation required, `4` invalid lifecycle transition, `5` dependency unavailable, `6` health gate failed/rollback started, `7` recovery required.

## Organizations, app users, assignments, and client sessions v1

Control-plane product entities are Organization, Subscription, Store, WorkerInstallation, SetupKey, EulaAcceptance, AppUser, UserAssignment, ClientDevice, ClientSession, and AuditEvent. StoreContact fields are routing/display metadata on the appropriate site/installation records, not login principals. `InternalAdmin` support/admin identities authenticate only to Web admin. `AppUser` identities authenticate only from Electron/Mobile and cannot access Web admin or customer self-service/password-reset portals.

Web admin and diagnostic UI/API always present the hierarchy `Organization → Store/site → WorkerInstallation`, including immutable canonical IDs and useful Worker/store/contact/address snapshots. Lookup by a Worker ID still verifies and returns its parent IDs; no flat unscoped Worker list, presence, sync, audit, diagnostic, rotation, or approval operation is permitted.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/admin/app-users` | Central admin provisions an Electron/Mobile app account by email and queues a one-time app enrollment credential; no Web-admin access |
| POST | `/api/v1/admin/app-users/:appUserId/assignments` | Central admin grants role/scopes for one exact Organization → Store → WorkerInstallation |
| DELETE | `/api/v1/admin/app-users/:appUserId/assignments/:assignmentId` | Revokes assignment, refresh credentials, and active Hub sessions |
| POST | `/api/v1/app-auth/enroll` | Electron/Mobile consumes one-time emailed app enrollment credential and establishes app authentication; never creates a Web session |
| POST | `/api/v1/app-auth/login` | AppUser login from Electron/Mobile; returns safe authorized assignment summaries only |
| POST | `/api/v1/app-auth/sessions` | Issues a short-lived audience/role/assignment/device-scoped Hub session for one granted ready assignment |
| POST | `/api/v1/app-auth/refresh` | Rotates refresh credential and rechecks user, assignment, device, installation, and subscription status |
| POST | `/api/v1/app-auth/logout` | Revokes current refresh credential/session and clears device session state |
| POST | `/api/v1/admin/app-users/:appUserId/disable` | Disables app account and revokes all refresh credentials/sessions |
| POST | `/api/v1/admin/app-users/:appUserId/reissue-enrollment` | Central admin revokes prior enrollment/recovery material and emails a replacement; no self-service reset |
| DELETE | `/api/v1/admin/client-devices/:deviceId` | Revokes a device and all of its sessions |
| GET | `/api/v1/admin/organizations/:organizationId/stores/:storeId/worker-installations/:workerInstallationId/sessions` | Hierarchy-scoped safe session/device audit |

Login with one active assignment auto-selects it. Multiple assignments return only authorized hierarchy/display snapshots and require an explicit `assignmentId` selection; arbitrary Worker IDs are rejected. Zero assignments, disabled user/device, revoked assignment, suspended subscription, or non-ready Worker returns a stable denial/offline status without leaking other tenants.

AppUser enrollment credentials are distinct from Worker setup keys and bind only the intended AppUser email/device enrollment. They are high-entropy, short-lived, single-use, hashed at rest, redacted, rate-limited, and cannot redeem a Worker or access Web admin. Password/account recovery is central-admin reissue into Electron/Mobile, not a customer Web password-reset portal.

QR/6-digit pairing, manual LAN URL entry, manual Worker IDs, and pairing approval endpoints are retired target behavior. Emergency local recovery, if implemented, is disabled by default, elevated, audited, and outside onboarding.

Relay-session exchange response:

```json
{
  "contractVersion": "setup-v1",
  "sessionToken": "<short-lived-signed-token>",
  "expiresAt": "2030-01-01T00:05:00Z",
  "hubUrl": "wss://hub.example.invalid/ws",
  "organizationId": "org_<id>",
  "storeId": "SD-PLACEHOLDER",
  "workerInstallationId": "winst_<uuid>",
  "assignmentId": "assign_<id>",
  "role": "app_user",
  "scopes": ["relay:request"]
}
```

Session issuance and Hub/Worker relay independently enforce AppUser, UserAssignment, Organization, Store, WorkerInstallation, role, scopes, audience, device, subscription, expiry, and revocation. Disable/revoke/logout closes active sessions and invalidates refresh credentials. Connectivity loss produces explicit offline messaging and never broadens assignment or silently falls back to unauthenticated LAN. Suspension never deletes local data.

## StoreDesk Cloud Hub relay v1

The Hub no longer accepts `agentKey` in a client `hello`. Both roles present a short-lived relay session whose audience is StoreDesk Cloud Hub; organization, store, Worker installation, assignment, role, scopes, and device are signed claims, not caller-controlled authority.

```json
{"version":1,"type":"hello","sessionToken":"<short-lived-token>"}
{"version":1,"type":"welcome","sessionId":"hs_<id>","organizationId":"org_<id>","storeId":"SD-PLACEHOLDER","workerInstallationId":"winst_<uuid>","assignmentId":"assign_<id>","role":"app_user","expiresAt":"2030-01-01T00:05:00Z"}
```

Client request:

```json
{
  "version": 1,
  "type": "relay.request",
  "id": "req_<uuid>",
  "method": "GET",
  "path": "/api/health",
  "query": {},
  "body": null
}
```

Worker response:

```json
{
  "version": 1,
  "type": "relay.response",
  "id": "req_<uuid>",
  "ok": true,
  "status": 200,
  "body": {},
  "correlationId": "corr_<uuid>"
}
```

Hub and Worker enforce message size/rate limits, store and role isolation, unique request IDs, expiry/revocation, method/path/scope allowlists, and response correlation. Worker proxies only to loopback `127.0.0.1:4310`; it blocks service control, activation, config, update, rollback, raw diagnostics bundles, filesystem paths, and non-`/api/` targets. Hub relays opaque bounded payloads and stores no catalog, Commander, invoice, MongoDB, authorization header, or credential body.

WebSocket close codes: `4400` malformed/version mismatch, `4401` invalid/expired session, `4403` role/scope/store denied, `4409` duplicate principal/session conflict, `4429` rate limit, `4503` room/agent temporarily unavailable.

## General

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server and database mode |
| GET | `/api/server-info` | Version, port, local URLs |

## Products

| Method | Path |
|--------|------|
| GET | `/api/products` |
| POST | `/api/products` |
| GET | `/api/products/:id` |
| PUT | `/api/products/:id` |
| DELETE | `/api/products/:id` |
| GET | `/api/products/search?q=` |

## Variants

| Method | Path |
|--------|------|
| GET | `/api/variants` |
| POST | `/api/variants` |
| GET | `/api/variants/:id` |
| PUT | `/api/variants/:id` |
| DELETE | `/api/variants/:id` |
| GET | `/api/variants/by-code/:code` |
| GET | `/api/variants/:id/barcode` |

## Vendors

| Method | Path |
|--------|------|
| GET | `/api/vendors` |
| POST | `/api/vendors` |
| GET | `/api/vendors/:id` |
| PUT | `/api/vendors/:id` |
| DELETE | `/api/vendors/:id` |

## Vendor prices

Alias: `/api/prices` mirrors `/api/vendor-prices`.

| Method | Path |
|--------|------|
| GET | `/api/vendor-prices` |
| POST | `/api/vendor-prices` |
| GET | `/api/vendor-prices/:id` |
| PUT | `/api/vendor-prices/:id` |
| DELETE | `/api/vendor-prices/:id` |
| GET | `/api/vendor-prices/by-variant/:variantId` |
| GET | `/api/vendor-prices/best/:variantId` |
| GET | `/api/vendor-prices/history/:variantId` |

## Invoices

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/invoices/upload` | multipart file |
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/:id` | Get invoice |
| POST | `/api/invoices/:id/extract` | Start extraction |
| GET | `/api/invoices/:id/items` | List review rows |
| PUT | `/api/invoice-items/:id` | Update one review row |
| POST | `/api/invoices/:id/confirm-prices` | Confirm reviewed prices |

## Review queue

| Method | Path |
|--------|------|
| GET | `/api/review-queue` |

## Pricing (planned)

| Method | Path |
|--------|------|
| GET | `/api/pricing-rules` |
| POST | `/api/pricing-rules` |
| PUT | `/api/pricing-rules/:id` |
| DELETE | `/api/pricing-rules/:id` |
| POST | `/api/pricing/calculate` |
| GET | `/api/pricing/suggestion/:variantId` |

## Mobile application routes

| Method | Path |
|--------|------|
| GET | `/api/mobile/health` |
| GET | `/api/mobile/products/by-code/:code` |
| GET | `/api/mobile/products/search?q=` |
| GET | `/api/mobile/products/:productId` |
| GET | `/api/mobile/variants/:variantId` |
| GET | `/api/mobile/variants/:variantId/barcode` |
| GET | `/api/mobile/vendor-prices/:variantId` |
| GET | `/api/mobile/vendor-prices/:variantId/best` |
| GET | `/api/mobile/pricing/suggestion/:variantId` |
| GET | `/api/mobile/vendors` |
| POST | `/api/mobile/invoices/upload` | _(legacy — Worker may still expose; current Flutter client does not use)_ |
| GET | `/api/mobile/invoices/:invoiceId/status` | _(legacy — unused by current Flutter client)_ |
| GET | `/api/mobile/review-queue` |

These routes are reachable only through an assignment-scoped Hub session issued by `/api/v1/app-auth/*`. The legacy `/api/mobile/pair/request` and `/api/mobile/pair/confirm` routes are retired from the target contract and must not be used by new Electron/Mobile flows.

## Invoice confirm rule

`POST /api/invoices/:id/confirm-prices` creates **VendorPrice** records only. It must not create or update inventory.
