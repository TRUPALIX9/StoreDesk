# Analysis of Feature Flags & Roles Implementation

## Work Completed So Far

### 1. Centralized Page Registry
We extracted page configurations and feature flags from a scattered, hard-coded format into a single source of truth: `shared/pages-registry.ts`. This registry dictates all available pages across platforms:
- **12 Electron Pages** (e.g., `pos`, `products`, `vendors`)
- **10 Mobile Pages** (e.g., `mobilePos`, `mobileScanner`)
- Specific **Feature Flags** for individual pages (e.g., `enableRefunds` inside the `pos` page).
- Implemented an `alwaysEnabled: true` guard for core utility pages (`dashboard`, `settings`, `mobileDashboard`) to prevent accidental lockouts.
- Built a verification script to enforce synchronization between the shared registry and platform-specific configurations (`store-desk-web`, `store-desk-electron`, `store-desk-mobile`).

### 2. Organization-Wide Roles Web Editor
In `store-desk-web`, we completely revamped the Organization UI (`/admin/organizations/[orgId]`):
- **Master-Detail Layout**: Replaced the basic stacked list with a split layout. The left column acts as a role selector, and the right column manages platform-specific tabs (Desktop vs Mobile).
- **Nested Feature Toggles**: Users can toggle entire pages ON/OFF (except for `alwaysEnabled` core pages), and deeply toggle individual feature flags within enabled pages.
- **Organization Scoping**: Roles are now tied directly to the Organization entity (`org_admin`, `cashier`, `shift_supervisor`) rather than ad-hoc user creations, ensuring consistency across all stores under the same organization.

### 3. Client Integrations (In Progress via Subagents)
- **StoreDesk Worker**: Tasked to expose `GET /api/config/client` and `GET /api/mobile/config/client` endpoints to provide the feature flag state to local apps.
- **StoreDesk Electron**: Tasked to implement `useFeatureConfig` (React Query) and a `<FeatureGuard>` wrapper to conditionally render sidebar items and UI elements based on the worker's response.
- **StoreDesk Mobile**: Tasked to implement a `feature_config_provider` (Riverpod) and a `FeatureGuard` widget to hide unavailable screens/buttons.
- **Prisma Migrations**: Batch migrations converting Mongoose models to Prisma in `store-desk-worker` are ongoing.

---

## Logic Gaps & Architectural Missing Links

During this analysis, a critical gap in the data flow has been identified:

### Gap 1: Cloud-to-Edge Sync for Roles
**The Problem**: 
The `store-desk-web` application (Cloud) saves the Organization Roles and Feature Flags into the cloud MongoDB instance. However, `store-desk-worker` (Edge) runs on a local PC inside a convenience store and uses local SQLite. 
While we've instructed the worker to expose a `GET /api/config/client` endpoint serving local flags, there is currently no defined mechanism for how the worker *receives* these updated roles from the Cloud.

**The Solution**:
1. **License Sync Payload**: When a store connects to `store-desk-web` using its License Key (via `hubRelay.service` or startup check), the cloud must include the specific `RoleConfigEntry[]` for that organization in the response.
2. **Worker Persistence**: The worker must save this synced role configuration into its local SQLite database (e.g., in a `TenantStore` or `AppConfig` row).
3. **User Authentication Context**: When a user logs into Electron or Mobile, the login endpoint must identify their role (e.g., `cashier`) and return their specific feature flags in the JWT or session payload, OR the client app fetches the full role list from `GET /api/config/client` and filters based on the current user's `roleId`.

### Gap 2: User Role Assignment
**The Problem**:
We have defined the *Roles* (what a `cashier` can do), but we need to make sure the UI allows assigning these roles to *Users* (AppUsers).
In the Cloud Web Portal, under an Organization's "Users" tab, when creating a store employee, there must be a dropdown mapping them to one of the custom roles we just created (using the `roleId`).

**The Solution**:
Ensure the `store-desk-web` user creation form dynamically lists the `orgRoles` created in the Roles tab, so a user is assigned a valid `roleId` that the Edge Worker will recognize.

### Gap 3: Prisma Migrations vs Feature Flag Storage
**The Problem**:
If `store-desk-worker` is currently transitioning from Mongoose to Prisma, the local storage for `AppConfig` or `TenantStore` where these feature flags will live must be defined in `schema.prisma`. 
**The Solution**:
We must ensure `schema.prisma` in `store-desk-worker` has a JSON field to store the `OrganizationRoles` or `FeatureFlags` payload.

---

## Recommended Next Steps

1. **Update `schema.prisma`**: Add a `rolesConfig` (JSON) field to the relevant store/tenant model in `store-desk-worker/prisma/schema.prisma`.
2. **Bridge the Cloud-Edge Gap**: Modify the license validation or polling mechanism in `store-desk-worker` to download the `roles` array from `store-desk-web`.
3. **Verify Subagent Completion**: Wait for the Electron, Mobile, and Worker subagents to finish their local `<FeatureGuard>` implementations.
