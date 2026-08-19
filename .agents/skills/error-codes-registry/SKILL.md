---
name: error-codes-registry
description: >-
  Strict rules for how to manage UI copy, error codes, and system alerts in the StoreDesk application. Use this skill whenever implementing a new feature, handling API errors, or rendering empty states in the UI.
---

# Error Codes & UI Message Registry — StoreDesk

This skill dictates the centralized approach to managing user-facing strings across the application. **You must never hardcode long string literals for errors, empty states, or alerts inside React components or Express controllers.**

## The Core Concept
We use a JSON/TS Registry system to map internal codes to localized user-facing titles, messages, and severities. This allows for:
1. Instant re-use of standard error responses.
2. Type-safe references preventing typos.
3. Separation of backend status from frontend presentation.

## Structure

### Frontend (`store-desk-electron/src/registry/messages.ts`)
The `MESSAGES` dictionary exports strict `AppMessage` objects.

```typescript
export interface AppMessage {
  code: string;
  title?: string;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

export const MESSAGES = {
  ERR_NETWORK_TIMEOUT: {
    code: "ERR_NETWORK_TIMEOUT",
    title: "Network Timeout",
    message: "The connection to the POS registry timed out. Please verify it is online.",
    severity: "error"
  }
} as const;
```

## Mandatory Rules for All Agents

### 1. No Inline UI Strings for Errors or Alerts
**BAD:**
```tsx
<Alert severity="error">Commander not configured. Please check your settings.</Alert>
```
**GOOD:**
```tsx
const msg = MESSAGES.ERR_CMD_OFFLINE;
<Alert severity={msg.severity}>{msg.message}</Alert>
```

### 2. Standardized API Error Payloads (Backend Server)
The `store-desk-worker` backend MUST NOT return plain text error strings (e.g., `res.status(400).send("Invalid barcode")`).
It MUST return a structured JSON payload containing a standard error code that the frontend can look up in the registry:
```json
{
  "error": true,
  "code": "ERR_INVALID_BARCODE",
  "details": "User inputted 1234 but format requires EAN13"
}
```

### 3. Creating New Messages
If you are building a new feature (e.g., Invoice Uploads) and need a new error message like "File too large", you MUST:
1. Open `src/registry/messages.ts` (or `uiCopy.ts`).
2. Add a new key: `ERR_FILE_TOO_LARGE`.
3. Fill out the `code`, `title`, `message`, and `severity`.
4. Reference `MESSAGES.ERR_FILE_TOO_LARGE` in your component.

### 4. Code Prefixes
- `ERR_` : For critical failures and exceptions (e.g., `ERR_MONGO_CONN_FAIL`).
- `WARN_` : For warnings (e.g., `WARN_CMD_OFFLINE`).
- `INFO_` : For neutral empty states or helper text (e.g., `INFO_NO_VENDORS`).
- `SUCC_` : For action confirmations (e.g., `SUCC_BACKUP_COMPLETE`).
