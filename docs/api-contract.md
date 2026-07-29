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

StoreDesk Web is the control-plane host. `User` is a global identity; authorization is always resolved through an active `OrganizationMembership` and optional store scope. `Organization` owns its `Account`, `Subscription` records, `Store` records, and `WorkerInstallation` records. Every route below verifies that all referenced records have the same `organizationId`; IDs in request bodies are selectors, not authority.

An authorized support/admin workflow creates the organization/account/subscription/store and issues one setup key for one intended Worker installation. Web sends that key to an authorized organization user through the configured email provider. Issuance/list responses expose delivery status and key ID only, never the secret. Email contains a short-lived single-use setup key, not a Worker credential.

### Issue or replace emailed setup key

| Method | Path | Caller | Result |
|--------|------|--------|--------|
| POST | `/api/v1/organizations/:organizationId/stores/:storeId/worker-installations` | authorized support/organization admin | Reserves an installation under an eligible subscription |
| POST | `/api/v1/worker-installations/:installationId/setup-keys` | authorized support/organization admin | Revokes any unconsumed predecessor, creates one key, queues email, returns safe delivery metadata |
| GET | `/api/v1/worker-installations/:installationId/setup-keys/:keyId` | authorized support/organization admin | Safe status: `queued|sent|delivery_failed|consumed|expired|revoked` |
| DELETE | `/api/v1/worker-installations/:installationId/setup-keys/:keyId` | authorized support/organization admin | Revokes an unconsumed key |

Issuance requires recipient user ID, eligible subscription ID, delivery reason, and an idempotency key. The recipient must have an active membership in the same organization. The stored record contains a public key ID and Argon2id hash of the secret, tenant/store/installation/recipient binding, TTL, bounded attempt counters, delivery metadata, and audit references. A delivery failure is remediated by revoke/reissue, never by retrieving plaintext.

### Record EULA acceptance

`POST /api/v1/organizations/:organizationId/eula-acceptances`

The caller must be an authenticated user with setup authority for the selected organization/store. Request includes the published `eulaVersion`, canonical-document SHA-256, account/store/installation context, and explicit acceptance. Success returns an immutable `eulaAcceptanceId`. The server obtains accepted timestamp, user identity, correlation ID, and safe source metadata itself. Acceptance is rejected if the version/hash is not currently published. EULA audit rows cannot be updated or deleted through product APIs.

### Redeem setup key

`POST /api/v1/setup-keys/redeem`

```json
{
  "setupKey": "<key-id>.<one-time-secret>",
  "eulaAcceptanceId": "eula_<id>",
  "installation": {
    "installationId": "inst_<uuid>",
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
    "accountId": "acct_<id>",
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

Only StoreDesk Worker calls redemption over TLS. Electron accepts the emailed key in its onboarding UI, immediately transfers it over authenticated protected local IPC to the Worker activation path, clears renderer/form state, and never receives the redemption response. The service manager may broker that protected handoff and seal-file ACL operation, but its IPC response and logs never contain the permanent credential. Web atomically validates membership/EULA, tenant/store/subscription entitlement, setup-key binding/TTL/attempt budget, and installation identity before consuming the key and creating one Worker credential. Same-installation retries with the same idempotency key return safe completion status, not the credential; concurrent or replayed redemption cannot mint another credential.

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
| 402 | `SUBSCRIPTION_INACTIVE` | Account has no eligible entitlement |
| 423 | `STORE_SUSPENDED` | Store cannot activate |
| 429 | `ACTIVATION_RATE_LIMITED` | Retry after the response delay/header |
| 503 | `ACTIVATION_UNAVAILABLE` | Temporary control-plane failure; retryable |

### Rotate or revoke Worker credential

| Method | Path | Caller | Result |
|--------|------|--------|--------|
| POST | `/api/v1/stores/:storeId/worker-credentials/rotate` | authorized owner/admin | Creates an audited rotation authorization/challenge; no credential is returned to the caller |
| POST | `/api/v1/worker-installations/:installationId/worker-credentials/complete-rotation` | currently authenticated Worker | Replacement returned once to Worker over TLS; optional bounded overlap with prior credential |
| DELETE | `/api/v1/stores/:storeId/worker-credentials/:credentialId` | authorized owner/admin | Revokes credential and active Worker relay sessions |

Rotation requires recent privileged reauthentication and an audit reason. The replacement is created/delivered only while the currently authenticated Worker proves installation possession and completes a short-lived, single-use rotation challenge; it is never returned to the initiating Web user or displayed to desktop/mobile clients. Emergency revocation may move the installation to `suspended`; failed rotation leaves the prior credential valid until the declared overlap expires.

### First bootstrap and readiness

| Method | Path | Caller | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/worker-installations/:installationId/bootstrap` | Worker credential | Organization/store identity, entitlement/grace policy, protocol range, server time, credential status, and Hub metadata only |
| POST | `/api/v1/worker-installations/:installationId/bootstrap/complete` | Worker credential | Idempotently records bootstrap version, Hub handshake evidence, health summary, and completion time |
| GET | `/api/v1/worker-installations/:installationId/readiness` | authorized organization user or Worker | Safe onboarding/readiness projection |

Bootstrap payloads never contain local catalog, Commander, invoice, or vendor-price data. `ready=true` requires setup-key redemption, current EULA acceptance, sealed Worker credential, entitlement verification, compatible Hub handshake, and successful first bootstrap. Device approval and Mobile pairing endpoints return `409 WORKER_BOOTSTRAP_INCOMPLETE` until ready.

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
storedesk-service activate --code-stdin
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

## Organizations, accounts, users, subscriptions, and device approval v1

Control-plane entities are Organization, Account, User, OrganizationMembership, Subscription, Store, WorkerInstallation, SetupKey, EulaAcceptance, DeviceApproval, and AuditEvent. An organization owns one v1 account and may own multiple subscriptions/stores/installations; a user may hold different roles in multiple organizations. Roles are `owner`, `organization_admin`, `store_admin`, and `member`; store-admin authority is limited to assigned stores. Only an appropriately scoped owner/admin can approve/revoke a remote device or authorize Worker credential rotation.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/stores/:storeId/device-approvals` | Register a pending device request; rate-limited, proof-of-possession required |
| GET | `/api/v1/stores/:storeId/device-approvals` | List safe device metadata and status for owner/admin |
| POST | `/api/v1/stores/:storeId/device-approvals/:id/approve` | Approve scopes/expiry for one installation-bound device |
| POST | `/api/v1/stores/:storeId/device-approvals/:id/deny` | Deny a pending request |
| DELETE | `/api/v1/stores/:storeId/device-approvals/:id` | Revoke approval and relay refresh/session credentials |
| POST | `/api/v1/relay-sessions/exchange` | Exchange an approved client or Worker credential for a short-lived Hub relay session |

Approval statuses: `pending`, `approved`, `denied`, `revoked`, `expired`. Safe metadata includes device name/type, installation ID, requested/approved scopes, created/expiry times, and public-key fingerprint where used. It excludes plaintext credentials and raw hardware identifiers.

These endpoints require the installation readiness gate. Mobile pairing is ordered strictly after Worker activation, Hub verification, and first bootstrap; a QR generated before readiness must not contain a usable pairing grant.

Relay-session exchange response:

```json
{
  "contractVersion": "setup-v1",
  "sessionToken": "<short-lived-signed-token>",
  "expiresAt": "2030-01-01T00:05:00Z",
  "hubUrl": "wss://hub.example.invalid/ws",
  "storeId": "SD-PLACEHOLDER",
  "role": "agent|client",
  "scopes": ["relay:request"]
}
```

Subscription/store suspension denies new relay sessions and closes existing sessions. Local behavior follows the last verified entitlement/grace policy and remains audit-visible; suspension never deletes local data.

## StoreDesk Cloud Hub relay v1

The Hub no longer accepts `agentKey` in a client `hello`. Both roles present a short-lived relay session whose audience is StoreDesk Cloud Hub; role and store are claims, not caller-controlled authority.

```json
{"version":1,"type":"hello","sessionToken":"<short-lived-token>"}
{"version":1,"type":"welcome","sessionId":"hs_<id>","storeId":"SD-PLACEHOLDER","role":"client","expiresAt":"2030-01-01T00:05:00Z"}
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

## Mobile (separate device Bearer token after approval/pairing)

| Method | Path |
|--------|------|
| GET | `/api/mobile/health` |
| POST | `/api/mobile/pair/request` |
| POST | `/api/mobile/pair/confirm` |
| GET | `/api/mobile/products/by-code/:code` |
| GET | `/api/mobile/products/search?q=` |
| GET | `/api/mobile/products/:productId` |
| GET | `/api/mobile/variants/:variantId` |
| GET | `/api/mobile/variants/:variantId/barcode` |
| GET | `/api/mobile/vendor-prices/:variantId` |
| GET | `/api/mobile/vendor-prices/:variantId/best` |
| GET | `/api/mobile/pricing/suggestion/:variantId` |
| GET | `/api/mobile/vendors` |
| POST | `/api/mobile/invoices/upload` |
| GET | `/api/mobile/invoices/:invoiceId/status` |
| GET | `/api/mobile/review-queue` |

## Invoice confirm rule

`POST /api/invoices/:id/confirm-prices` creates **VendorPrice** records only. It must not create or update inventory.
