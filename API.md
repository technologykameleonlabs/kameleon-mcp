# Kameleon Platform — tRPC API Reference

Comprehensive reference for the Kameleon Platform API. All tRPC procedures are accessible through the batch endpoint at `/trpc`. Non-tRPC HTTP endpoints are documented separately.

---

## Table of Contents

- [Authentication & Headers](#authentication--headers)
- [Middleware / Procedure Types](#middleware--procedure-types)
- [Non-tRPC HTTP Endpoints](#non-trpc-http-endpoints)
- [Router Reference](#router-reference)
  - [auth](#auth)
  - [tenant](#tenant)
  - [membership](#membership)
  - [rbac](#rbac)
  - [modules](#modules)
  - [audit](#audit)
  - [health](#health)
  - [jobs](#jobs)
  - [passwordReset](#passwordreset)
  - [mfa](#mfa)
  - [oauth](#oauth)
  - [billing](#billing)
  - [adminBilling](#adminbilling)
  - [superadmin](#superadmin)
  - [tenantSettings](#tenantsettings)
  - [userGroups](#usergroups)
  - [userPreferences](#userpreferences)
  - [contacts](#contacts)
  - [masterdata](#masterdata)
  - [backup](#backup)
  - [profile](#profile)
  - [projects](#projects)
  - [workItems](#workitems)
  - [timeEntries](#timeentries)
  - [financials](#financials)
  - [workflows](#workflows)

---

## Authentication & Headers

| Header | Purpose |
|---|---|
| `Authorization: Bearer {token}` | Session token (also read from `kameleon-session` cookie) |
| `X-Tenant-Slug` | Tenant context when subdomain resolution is unavailable |
| `X-Request-Id` | Optional request tracing ID |

Sessions are created by `auth.login` or `mfa.verifyLoginToken` and returned as a token string. The API also reads the `kameleon-session` cookie.

---

## Middleware / Procedure Types

| Procedure | Requires Tenant | Requires Auth | Extra |
|---|---|---|---|
| `publicProcedure` | No | No | Base procedure, no restrictions |
| `tenantProcedure` | **Yes** | No | Tenant resolved from subdomain or `X-Tenant-Slug` |
| `authedProcedure` | **Yes** | **Yes** | Extends `tenantProcedure` |
| `permissionProcedure(key, scope?)` | **Yes** | **Yes** | Extends `authedProcedure`; checks permission key with scope (`all` / `own` / `team`) |
| `superAdminProcedure` | No | **Yes** | Extends `publicProcedure`; verifies user is in `SuperAdmin` table |

---

## Non-tRPC HTTP Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Liveness check — returns status, timestamp, uptime |
| `GET` | `/health/ready` | None | Readiness check — verifies DB connectivity |
| `GET` | `/metrics` | None | Prometheus metrics |
| `GET` | `/api/backup/download/:id` | Session + SuperAdmin | Download a backup file |
| `GET` | `/auth/callback/google` | None | Google OAuth callback redirect |
| `POST` | `/api/webhooks/stripe` | Stripe signature | Stripe webhook handler (raw body) |

---

## Router Reference

### auth

Source: `apps/api/src/routers/auth.ts`

#### `auth.login`
- **Type:** mutation
- **Auth:** publicProcedure (rate-limited)
- **Input:** `{ email: string, password: string }`
- **Description:** Authenticate with email/password. Returns session token or MFA challenge if MFA is enabled.

#### `auth.logout`
- **Type:** mutation
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Invalidate current session and clear server-side caches.

#### `auth.getCurrentUser`
- **Type:** query
- **Auth:** publicProcedure (throws UNAUTHORIZED if not authenticated)
- **Input:** none
- **Description:** Return the current user with memberships, SuperAdmin status, and tenant info.

#### `auth.acceptInvitation`
- **Type:** mutation
- **Auth:** publicProcedure
- **Input:** `{ token: string (uuid), password: string (min 8) }`
- **Description:** Accept a membership invitation, set password, activate membership, create session.

#### `auth.checkSession`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Check if the current session is valid. Returns `{ valid: boolean, user: User | null }`.

---

### tenant

Source: `apps/api/src/routers/tenant.ts`

#### `tenant.create`
- **Type:** mutation
- **Auth:** publicProcedure (requires `TENANT_CREATION_API_KEY` in input)
- **Input:** `{ apiKey: string, slug: string (2-63, lowercase alphanumeric + hyphens), name: string (1-255), adminEmail: string, adminName: string (1-255), adminPassword: string (min 8) }`
- **Description:** Create a new tenant with admin user, Admin role, default subscription, and platform module.

#### `tenant.getCurrent`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** Return current tenant info including subscription and enabled modules.

#### `tenant.listMyTenants`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** List all tenants the current user belongs to (stub — returns empty array).

#### `tenant.updateTenantInfo`
- **Type:** mutation
- **Auth:** authedProcedure (requires `platform.tenant.settings.edit` permission)
- **Input:** `{ name?: string (1-255), slug?: string (2-63) }`
- **Description:** Update the tenant's name and/or slug.

#### `tenant.checkTenantAvailability`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** `{ name?: string (1-255), slug?: string (2-63) }`
- **Description:** Check if a tenant name or slug is available (case-insensitive).

---

### membership

Source: `apps/api/src/routers/membership.ts`

#### `membership.invite`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ email: string, name: string (1-255), roleId?: string (uuid) }`
- **Description:** Invite a user to the tenant. Creates user if needed, sends invitation email, checks subscription user limit.

#### `membership.list`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ status?: MembershipStatus, limit?: number (1-100, default 50), offset?: number (default 0) }`
- **Description:** List memberships with pagination and optional status filter.

#### `membership.updateStatus`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ membershipId: string (uuid), status: MembershipStatus }`
- **Description:** Update a membership's status (activate, suspend, reactivate).

#### `membership.assignRole`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ membershipId: string (uuid), roleId: string (uuid) }`
- **Description:** Assign a role to a membership.

#### `membership.setMemberPassword`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ userId: string (uuid), newPassword: string (min 8) }`
- **Description:** Admin password reset for a tenant member.

---

### rbac

Source: `apps/api/src/routers/rbac.ts`

#### `rbac.createRole`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.role.create`)
- **Input:** `{ name: string (1-100), description?: string (max 500) }`
- **Description:** Create a new custom role in the tenant.

#### `rbac.updateRole`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.role.manage`)
- **Input:** `{ roleId: string (uuid), name?: string (1-100), description?: string (max 500) }`
- **Description:** Update a role's name/description. Cannot modify system roles.

#### `rbac.deleteRole`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.role.delete`)
- **Input:** `{ roleId: string (uuid) }`
- **Description:** Delete a role. Cannot delete system roles.

#### `rbac.listRoles`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** List all roles in the tenant with assigned permissions.

#### `rbac.getRole`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** `{ roleId: string (uuid) }`
- **Description:** Get a specific role by ID with assigned permissions.

#### `rbac.assignPermissions`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.role.manage`)
- **Input:** `{ roleId: string (uuid), permissions: Array<{ permissionId: string (uuid), scope: 'all' | 'own' | 'team' }> }`
- **Description:** Assign permissions to a role (replaces existing).

#### `rbac.listPermissions`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** List all permissions in the platform catalog.

#### `rbac.getPermissionDefinitions`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return static permission definitions from the RBAC service.

#### `rbac.getMyPermissions`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return the current user's effective permissions (action, UI, field) and SuperAdmin status.

---

### modules

Source: `apps/api/src/routers/modules.ts`

#### `modules.listAvailable`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** List all platform modules with enabled status, filtered by plan's allowed modules.

#### `modules.listEnabled`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** List only enabled modules for the tenant.

#### `modules.getNavigationModules`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Get modules formatted for the navigation menu.

#### `modules.enable`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.module.manage`)
- **Input:** `{ moduleKey: string }`
- **Description:** Enable a module for the tenant. Validates against plan's allowed modules.

#### `modules.disable`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.module.manage`)
- **Input:** `{ moduleKey: string }`
- **Description:** Disable a module for the tenant. Core modules cannot be disabled.

#### `modules.isEnabled`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** `{ moduleKey: string }`
- **Description:** Check if a specific module is enabled.

#### `modules.getSubscription`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return the tenant's subscription details (plan, limits, usage, allowed modules, renewal date).

#### `modules.getPlans`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return all available subscription plans.

---

### audit

Source: `apps/api/src/routers/audit.ts`

#### `audit.list`
- **Type:** query
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ page?: number (default 1), pageSize?: number (1-100, default 25), filters?: { action?: string, entityType?: string, entityId?: string, userId?: string, dateFrom?: Date, dateTo?: Date } }`
- **Description:** List audit logs with pagination and filters for the current tenant.

#### `audit.get`
- **Type:** query
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ logId: string (uuid) }`
- **Description:** Get a single audit log entry by ID.

#### `audit.getActions`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return available audit log action types for filter dropdowns.

#### `audit.getEntityTypes`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return available audit log entity types for filter dropdowns.

#### `audit.exportCsv`
- **Type:** query
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ filters?: { action?: string, entityType?: string, entityId?: string, userId?: string, dateFrom?: Date, dateTo?: Date }, maxRows?: number (1-10000, default 1000) }`
- **Description:** Export audit logs as CSV string.

---

### health

Source: `apps/api/src/routers/health.ts`

#### `health.live`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Liveness probe — returns `{ status: 'ok' }`.

#### `health.ready`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Readiness probe — checks database connectivity.

#### `health.check`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Health check returning overall status (healthy/degraded/unhealthy) with component checks.

#### `health.detailed`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Detailed health check with all service components, system metrics, and environment config.

#### `health.ping`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Ultra-lightweight ping — returns `{ pong: true, timestamp: number }`.

#### `health.maintenanceStatus`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Return maintenance mode status and globally disabled modules.

---

### jobs

Source: `apps/api/src/routers/jobs.ts`

#### `jobs.getStatus`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** `{ queueName: string, jobId: string }`
- **Description:** Get status of a BullMQ job (progress, attempts, timestamps, failure reason).

#### `jobs.getQueueStats`
- **Type:** query
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ queueName: string }`
- **Description:** Get statistics for a BullMQ queue (waiting, active, completed, failed, delayed).

#### `jobs.listQueues`
- **Type:** query
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** none
- **Description:** List all known queues with stats.

#### `jobs.retryJob`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ queueName: string, jobId: string }`
- **Description:** Retry a failed BullMQ job.

#### `jobs.toggleQueue`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.audit.view`)
- **Input:** `{ queueName: string, paused: boolean }`
- **Description:** Pause or resume a BullMQ queue.

---

### passwordReset

Source: `apps/api/src/routers/password-reset.ts`

#### `passwordReset.requestReset`
- **Type:** mutation
- **Auth:** publicProcedure (rate-limited)
- **Input:** `{ email: string }`
- **Description:** Request a password reset email. Always returns success to prevent email enumeration.

#### `passwordReset.validateToken`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** `{ token: string }`
- **Description:** Validate a password reset token (exists, unused, not expired).

#### `passwordReset.resetPassword`
- **Type:** mutation
- **Auth:** publicProcedure
- **Input:** `{ token: string, newPassword: string (min 8) }`
- **Description:** Reset password using a valid token.

#### `passwordReset.changePassword`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ currentPassword: string, newPassword: string (min 8) }`
- **Description:** Change password for the authenticated user (requires current password).

---

### mfa

Source: `apps/api/src/routers/mfa.ts`

#### `mfa.setup`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Generate a new TOTP secret and QR code for MFA setup.

#### `mfa.activate`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ token: string (6-digit) }`
- **Description:** Validate TOTP token and activate MFA. Returns backup codes.

#### `mfa.disable`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ token: string (6-digit) }`
- **Description:** Disable MFA after verifying current TOTP token.

#### `mfa.status`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return MFA enabled status and tenant MFA policy.

#### `mfa.regenerateBackupCodes`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ token: string (6-digit) }`
- **Description:** Generate new backup codes (invalidates old ones) after verifying TOTP.

#### `mfa.verifyLoginToken`
- **Type:** mutation
- **Auth:** publicProcedure (rate-limited)
- **Input:** `{ userId: string (uuid), token: string (6-8 chars), useBackupCode?: boolean }`
- **Description:** Verify MFA token during login and create a session.

---

### oauth

Source: `apps/api/src/routers/oauth.ts`

#### `oauth.getGoogleAuthUrl`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** `{ redirectTo?: string }`
- **Description:** Return the Google OAuth authorization URL.

#### `oauth.isGoogleConfigured`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Check if Google OAuth is configured on the platform.

#### `oauth.handleGoogleCallback`
- **Type:** mutation
- **Auth:** publicProcedure
- **Input:** `{ code: string, state?: string }`
- **Description:** Exchange Google OAuth code for tokens and create/link user account.

---

### billing

Source: `apps/api/src/routers/billing.ts`

#### `billing.isEnabled`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** Check if Stripe billing is enabled.

#### `billing.getPlans`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** Return all active subscription plans with pricing.

#### `billing.getSubscription`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** Return the current tenant's subscription details.

#### `billing.createCheckout`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.tenant.settings.edit`)
- **Input:** `{ planKey: string, interval?: 'monthly' | 'yearly' (default 'monthly') }`
- **Description:** Create a Stripe checkout session for plan upgrade.

#### `billing.createPortalSession`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.tenant.settings.edit`)
- **Input:** none
- **Description:** Create a Stripe customer portal session.

---

### adminBilling

Source: `apps/api/src/routers/admin-billing.ts`

#### `adminBilling.getPlans`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** List all subscription plans (including inactive).

#### `adminBilling.createPlan`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ key: string (min 3), name: string (min 2), description?: string, priceMonthly: number (min 0), priceYearly: number (min 0), maxUsers: number (int, min 1), maxProjects: number (int, min 1), features?: any }`
- **Description:** Create a subscription plan with Stripe product and prices.

#### `adminBilling.updatePlan`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid), name?: string, description?: string, isActive?: boolean, sortOrder?: number }`
- **Description:** Update plan metadata.

---

### superadmin

Source: `apps/api/src/routers/superadmin.ts`

#### Platform Settings

##### `superadmin.getPlatformSettings`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Retrieve all platform-wide settings.

##### `superadmin.updatePlatformSettings`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ settings: Array<{ key: string, value: string, description?: string }> }`
- **Description:** Update platform settings with audit logging.

#### Subscription Plans

##### `superadmin.listSubscriptionPlans`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** List all subscription plans.

##### `superadmin.getSubscriptionPlans`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Alias for `listSubscriptionPlans` (frontend compatibility).

##### `superadmin.createSubscriptionPlan`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ key: string (1-50), name: string (1-100), description?: string, priceMonthly?: number, priceYearly?: number, maxUsers: number, maxProjects: number, allowedModules: string[], features?: Record<string, any>, isActive?: boolean, sortOrder?: number }`
- **Description:** Create a new subscription plan with audit logging.

##### `superadmin.updateSubscriptionPlan`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ planId: string (uuid), name?: string (1-100), description?: string, priceMonthly?: number, priceYearly?: number, maxUsers?: number, maxProjects?: number, allowedModules?: string[], features?: Record<string, any>, isActive?: boolean, sortOrder?: number }`
- **Description:** Update a subscription plan with before/after audit logging.

##### `superadmin.deleteSubscriptionPlan`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ planId: string (uuid) }`
- **Description:** Delete a subscription plan.

#### Tenants

##### `superadmin.listAllTenants`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number (default 1), pageSize?: number (1-500, default 25), search?: string, planId?: string (uuid), status?: 'active' | 'deactivated' | 'archived', includeInactive?: boolean }`
- **Description:** List all tenants with pagination, search, and filtering.

##### `superadmin.getTenants`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number, pageSize?: number, search?: string, planId?: string (uuid), status?: string, includeInactive?: boolean }` (entire input optional)
- **Description:** Alias for `listAllTenants` (frontend compatibility).

##### `superadmin.getTenantDetails`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Get detailed tenant info including memberships, modules, settings, subscription.

##### `superadmin.createTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ name: string (1-255), slug: string (1-63, lowercase alphanumeric + hyphens), adminName: string (1-255), adminEmail: string, adminPassword: string (min 8), planId: string (uuid) }`
- **Description:** Create a tenant with admin user and audit logging.

##### `superadmin.updateTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name?: string, slug?: string, mfaRequired?: boolean, mfaEnforced?: boolean, planId?: string (uuid), status?: 'active' | 'deactivated' | 'archived', adminName?: string, adminEmail?: string }`
- **Description:** Update tenant properties and/or admin user.

##### `superadmin.deleteTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Delete a tenant.

##### `superadmin.setTenantStatus`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), status: 'active' | 'deactivated' | 'archived' }`
- **Description:** Set a tenant's status.

##### `superadmin.listTenants`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number, pageSize?: number, search?: string, planId?: string (uuid), status?: string, includeInactive?: boolean }`
- **Description:** Alias for `listAllTenants` (used by logs page for tenant filtering).

#### Dashboard & Identity

##### `superadmin.isSuperAdmin`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Check if current user is a SuperAdmin. Returns `{ isSuperAdmin: boolean }` without throwing.

##### `superadmin.getDashboard`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get platform-wide dashboard statistics.

#### User Management

##### `superadmin.listAllUsers`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number (default 1), pageSize?: number (1-100, default 25), search?: string, isSuperAdmin?: boolean, hasMfa?: boolean, hasMemberships?: boolean, tenantId?: string (uuid) }`
- **Description:** List all users across all tenants with filters.

##### `superadmin.getUserDetails`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid) }`
- **Description:** Get detailed user information.

##### `superadmin.updateUser`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), name?: string, email?: string, isSuperAdmin?: boolean }`
- **Description:** Update user info and/or SuperAdmin status.

##### `superadmin.setUserStatus`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), status: 'active' | 'suspended' }`
- **Description:** Set a user's status.

##### `superadmin.deleteUser`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid) }`
- **Description:** Permanently delete a user.

##### `superadmin.setUserPassword`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), newPassword: string (min 8) }`
- **Description:** Reset any user's password (bcrypt hashed).

#### Membership Management

##### `superadmin.assignUserToTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), tenantId: string (uuid), roleId: string (uuid) }`
- **Description:** Assign a user to a tenant with a role.

##### `superadmin.removeUserFromTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), tenantId: string (uuid) }`
- **Description:** Remove a user from a tenant (soft removal).

##### `superadmin.deleteMembership`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), tenantId: string (uuid) }`
- **Description:** Hard-delete a membership record.

##### `superadmin.updateUserRole`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ userId: string (uuid), tenantId: string (uuid), roleId: string (uuid) }`
- **Description:** Update a user's role within a tenant.

##### `superadmin.inviteToTenant`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ email: string, name: string (1-255), tenantId: string (uuid), roleId?: string (uuid) }`
- **Description:** Invite a user to a tenant; creates user if needed.

#### Tenant Roles

##### `superadmin.getTenantRoles`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Get all roles for a tenant.

##### `superadmin.getTenantRolesWithPermissions`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Get all roles with their assigned permissions.

##### `superadmin.createTenantRole`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name: string (1-100), description?: string (max 500) }`
- **Description:** Create a role within a tenant.

##### `superadmin.updateTenantRole`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), roleId: string (uuid), name?: string (1-100), description?: string (max 500) }`
- **Description:** Update a tenant role.

##### `superadmin.deleteTenantRole`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), roleId: string (uuid) }`
- **Description:** Delete a role from a tenant.

##### `superadmin.assignPermissionsToRole`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), roleId: string (uuid), permissions: Array<{ permissionId: string (uuid), scope: 'all' | 'own' | 'team' }> }`
- **Description:** Assign permissions to a tenant role.

#### Audit Logs

##### `superadmin.listAllLogs`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number (default 1), pageSize?: number (1-100, default 25), filters?: { action?: string, entityType?: string, tenantId?: string (uuid), userId?: string (uuid), dateFrom?: Date, dateTo?: Date } }`
- **Description:** List audit logs across all tenants with pagination and filters.

##### `superadmin.getLogActions`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get distinct audit log action types.

##### `superadmin.getLogEntityTypes`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get distinct audit log entity types.

#### Permissions

##### `superadmin.listAllPermissions`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** List all permissions from the platform catalog.

##### `superadmin.getPermissionStats`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get permission usage statistics across all tenants.

#### Platform Modules

##### `superadmin.listPlatformModules`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** List all platform modules with status.

##### `superadmin.updatePlatformModule`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ moduleKey: string, enabled?: boolean, status?: string }`
- **Description:** Enable/disable a platform module.

##### `superadmin.isModuleEnabled`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ moduleKey: string }`
- **Description:** Check if a module is enabled at the platform level.

#### Maintenance Mode

##### `superadmin.getMaintenanceMode`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get maintenance mode status.

##### `superadmin.setMaintenanceMode`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ enabled: boolean, message?: string }`
- **Description:** Toggle platform maintenance mode.

#### User Groups (Tenant-scoped)

##### `superadmin.listTenantGroups`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** List all user groups for a tenant.

##### `superadmin.getTenantGroup`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid) }`
- **Description:** Get group details with members and roles.

##### `superadmin.createTenantGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name: string (1-100), description?: string (max 500), color?: string (#RRGGBB) }`
- **Description:** Create a user group within a tenant.

##### `superadmin.updateTenantGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid), name?: string (1-100), description?: string (max 500), color?: string (#RRGGBB) }`
- **Description:** Update a group's name, description, or color.

##### `superadmin.deleteTenantGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid) }`
- **Description:** Delete a user group.

##### `superadmin.getTenantMembers`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Get all members of a tenant (for group member assignment UI).

##### `superadmin.addMembersToGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid), userIds: string[] (uuid) }`
- **Description:** Add users to a group.

##### `superadmin.removeMembersFromGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid), userIds: string[] (uuid) }`
- **Description:** Remove users from a group.

##### `superadmin.assignRolesToTenantGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid), roleIds: string[] (uuid) }`
- **Description:** Assign roles to a group (all members inherit these roles).

##### `superadmin.removeRolesFromTenantGroup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), groupId: string (uuid), roleIds: string[] (uuid) }`
- **Description:** Remove role assignments from a group.

#### Stripe Configuration

##### `superadmin.getStripeSettings`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get Stripe settings with secrets masked.

##### `superadmin.updateStripeSettings`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ secretKey?: string, publishableKey?: string, webhookSecret?: string }`
- **Description:** Update Stripe API keys and webhook secret.

##### `superadmin.testStripeConnection`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Test Stripe connection with a live API call.

#### Admin Permissions Repair

##### `superadmin.repairTenantAdminPermissions`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Repair Admin role permissions for a tenant.

##### `superadmin.repairAllTenantsAdminPermissions`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Bulk repair Admin role permissions across all tenants.

##### `superadmin.repairTenantMemberPermissions`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid) }`
- **Description:** Repair Member role with project permissions for a tenant.

##### `superadmin.repairAllTenantsMemberPermissions`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Bulk repair Member role permissions across all tenants.

---

### tenantSettings

Source: `apps/api/src/routers/tenant-settings.ts`

#### `tenantSettings.getTenantSettings`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return the current tenant's settings (branding, configuration).

#### `tenantSettings.updateTenantSettings`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.tenant.settings.edit`)
- **Input:** `{ logoUrl?: string (url), faviconUrl?: string (url), primaryColor?: string (hex), secondaryColor?: string (hex), description?: string, timezone?: string, dateFormat?: string, timeFormat?: string, allowSelfSignup?: boolean, requireEmailVerification?: boolean, customFields?: Record<string, any> }`
- **Description:** Update tenant branding and configuration.

---

### userGroups

Source: `apps/api/src/routers/user-groups.ts`

#### `userGroups.listGroups`
- **Type:** query
- **Auth:** permissionProcedure(`platform.group.view`)
- **Input:** none
- **Description:** List all user groups in the tenant.

#### `userGroups.getGroup`
- **Type:** query
- **Auth:** permissionProcedure(`platform.group.view`)
- **Input:** `{ groupId: string (uuid) }`
- **Description:** Get a group with members and role assignments.

#### `userGroups.createGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.create`)
- **Input:** `{ name: string (1-100), description?: string (max 500), color?: string (hex) }`
- **Description:** Create a new user group.

#### `userGroups.updateGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.edit`)
- **Input:** `{ groupId: string (uuid), name?: string (1-100), description?: string (max 500), color?: string (hex) }`
- **Description:** Update a group's name, description, or color.

#### `userGroups.deleteGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.delete`)
- **Input:** `{ groupId: string (uuid) }`
- **Description:** Delete a user group.

#### `userGroups.addUsersToGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.assign_users`)
- **Input:** `{ groupId: string (uuid), userIds: string[] (uuid, min 1) }`
- **Description:** Add users to a group.

#### `userGroups.removeUsersFromGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.assign_users`)
- **Input:** `{ groupId: string (uuid), userIds: string[] (uuid, min 1) }`
- **Description:** Remove users from a group.

#### `userGroups.assignRolesToGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.assign_roles`)
- **Input:** `{ groupId: string (uuid), roleIds: string[] (uuid, min 1) }`
- **Description:** Assign roles to a group.

#### `userGroups.removeRolesFromGroup`
- **Type:** mutation
- **Auth:** permissionProcedure(`platform.group.assign_roles`)
- **Input:** `{ groupId: string (uuid), roleIds: string[] (uuid, min 1) }`
- **Description:** Remove role assignments from a group.

---

### userPreferences

Source: `apps/api/src/routers/user-preferences.ts`

#### `userPreferences.getMyPreferences`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Return the authenticated user's personal preferences.

#### `userPreferences.updateMyPreferences`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ theme?: 'light' | 'dark' | 'system', locale?: string (2-10 chars), emailNotifications?: boolean, pushNotifications?: boolean, compactMode?: boolean, sidebarOpen?: boolean, customPrefs?: Record<string, any> }`
- **Description:** Update personal preferences.

---

### contacts

Source: `apps/api/src/routers/contacts.ts`

#### `contacts.create`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.create`)
- **Input:** `{ name: string (1-255), displayName?: string, type?: 'individual' | 'company', parentId?: string (uuid), email?: string, phone?: string, mobile?: string, website?: string, street?: string, street2?: string, city?: string, state?: string, zip?: string, country?: string, taxId?: string, jobTitle?: string, department?: string, internalNote?: string, avatarUrl?: string }`
- **Description:** Create a new contact.

#### `contacts.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid), name?: string, displayName?: string, type?: 'individual' | 'company', parentId?: string | null, email?: string, phone?: string, mobile?: string, website?: string, street?: string, street2?: string, city?: string, state?: string, zip?: string, country?: string, taxId?: string, jobTitle?: string, department?: string, internalNote?: string, avatarUrl?: string, isActive?: boolean }`
- **Description:** Update a contact.

#### `contacts.archive`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid) }`
- **Description:** Archive (soft-delete) a contact.

#### `contacts.restore`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid) }`
- **Description:** Restore an archived contact.

#### `contacts.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.delete`)
- **Input:** `{ contactId: string (uuid) }`
- **Description:** Permanently delete a contact.

#### `contacts.getById`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ contactId: string (uuid) }`
- **Description:** Get a contact by ID.

#### `contacts.list`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ type?: 'individual' | 'company', isActive?: boolean, tagIds?: string[] (uuid), parentId?: string (uuid) | null, search?: string, limit?: number (1-100, default 50), offset?: number (default 0) }`
- **Description:** List contacts with filters and pagination.

#### Contact Tags

##### `contacts.tags.list`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** List all contact tags.

##### `contacts.tags.create`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.tag.manage`)
- **Input:** `{ name: string (1-50), color?: string (hex) }`
- **Description:** Create a contact tag.

##### `contacts.tags.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.tag.manage`)
- **Input:** `{ tagId: string (uuid), name: string (1-50), color?: string (hex) }`
- **Description:** Update a contact tag.

##### `contacts.tags.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.tag.manage`)
- **Input:** `{ tagId: string (uuid) }`
- **Description:** Delete a contact tag.

##### `contacts.tags.assign`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid), tagId: string (uuid) }`
- **Description:** Assign a tag to a contact.

##### `contacts.tags.remove`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid), tagId: string (uuid) }`
- **Description:** Remove a tag from a contact.

#### Contact Addresses

##### `contacts.addresses.add`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid), type: 'invoice' | 'delivery' | 'other', label?: string, street?: string, street2?: string, city?: string, state?: string, zip?: string, country?: string, isDefault?: boolean }`
- **Description:** Add an address to a contact.

##### `contacts.addresses.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ addressId: string (uuid), contactId: string (uuid), type?: 'invoice' | 'delivery' | 'other', label?: string, street?: string, street2?: string, city?: string, state?: string, zip?: string, country?: string, isDefault?: boolean }`
- **Description:** Update a contact address.

##### `contacts.addresses.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ addressId: string (uuid), contactId: string (uuid) }`
- **Description:** Delete a contact address.

#### Contact Notes

##### `contacts.notes.list`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ contactId: string (uuid) }`
- **Description:** List notes for a contact.

##### `contacts.notes.add`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ contactId: string (uuid), content: string, isPinned?: boolean }`
- **Description:** Add a note to a contact.

##### `contacts.notes.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ noteId: string (uuid), contactId: string (uuid), content?: string, isPinned?: boolean }`
- **Description:** Update a contact note.

##### `contacts.notes.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`contacts.contact.edit`)
- **Input:** `{ noteId: string (uuid), contactId: string (uuid) }`
- **Description:** Delete a contact note.

---

### masterdata

Source: `apps/api/src/routers/masterdata.ts`

> All procedures in this router use `superAdminProcedure` (except `listActiveCurrencies` which uses `publicProcedure`). This router provides cross-tenant data management for SuperAdmins.

#### Currencies

##### `masterdata.listActiveCurrencies`
- **Type:** query
- **Auth:** publicProcedure
- **Input:** none
- **Description:** Return all active currencies (for dropdowns).

##### `masterdata.listCurrencies`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number, pageSize?: number (1-100), search?: string, includeInactive?: boolean, sortBy?: 'code' | 'name' | 'createdAt', sortOrder?: 'asc' | 'desc' }`
- **Description:** List currencies with pagination and search.

##### `masterdata.getCurrency`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get a currency by ID.

##### `masterdata.createCurrency`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ code: string (3 chars), name: string (1-100), symbol: string (1-10), symbolBefore?: boolean, decimalPlaces?: number (0-6), rounding?: number, isActive?: boolean }`
- **Description:** Create a currency.

##### `masterdata.updateCurrency`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid), code?: string (3), name?: string, symbol?: string, symbolBefore?: boolean, decimalPlaces?: number, rounding?: number, isActive?: boolean }`
- **Description:** Update a currency.

##### `masterdata.deleteCurrency`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Delete a currency.

#### Countries

##### `masterdata.listCountries`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number, pageSize?: number (1-100), search?: string, includeInactive?: boolean, sortBy?: 'code' | 'name' | 'createdAt', sortOrder?: 'asc' | 'desc' }`
- **Description:** List countries with pagination.

##### `masterdata.getCountry`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get a country by ID.

##### `masterdata.createCountry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ code: string (2), code3?: string (3), name: string (1-100), phoneCode?: string, currencyId?: string (uuid), addressFormat?: string, vatLabel?: string, isActive?: boolean }`
- **Description:** Create a country.

##### `masterdata.updateCountry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid), code?: string (2), code3?: string (3), name?: string, phoneCode?: string, currencyId?: string (uuid), addressFormat?: string, vatLabel?: string, isActive?: boolean }`
- **Description:** Update a country.

##### `masterdata.deleteCountry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Delete a country.

##### `masterdata.listCountryStates`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ countryId: string (uuid), includeInactive?: boolean }`
- **Description:** List states/provinces for a country.

##### `masterdata.createCountryState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ countryId: string (uuid), code: string (1-10), name: string (1-100), isActive?: boolean }`
- **Description:** Create a state/province.

##### `masterdata.updateCountryState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid), code?: string (1-10), name?: string (1-100), isActive?: boolean }`
- **Description:** Update a state/province.

##### `masterdata.deleteCountryState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Delete a state/province.

#### Seed Data

##### `masterdata.seedCurrencies`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Seed default currencies.

##### `masterdata.seedCountries`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Seed default countries.

##### `masterdata.seedAll`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Seed both currencies and countries.

#### Cross-Tenant: Contacts

##### `masterdata.listTenantContacts`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), page?: number, pageSize?: number, search?: string, type?: 'individual' | 'company', includeInactive?: boolean }`
- **Description:** List contacts for a specific tenant.

##### `masterdata.getTenantContact`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), contactId: string (uuid) }`
- **Description:** Get a contact with related data for a tenant.

##### `masterdata.createTenantContact`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name: string (1-255), type?: 'individual' | 'company', email?: string, phone?: string, mobile?: string, city?: string, country?: string, parentId?: string (uuid) }`
- **Description:** Create a contact in a specific tenant.

##### `masterdata.updateTenantContact`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), contactId: string (uuid), name?: string, type?: string, email?: string, phone?: string, mobile?: string, city?: string, country?: string, isActive?: boolean }`
- **Description:** Update a tenant contact.

##### `masterdata.deleteTenantContact`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), contactId: string (uuid) }`
- **Description:** Delete a tenant contact.

#### Cross-Tenant: Projects

##### `masterdata.listTenantProjects`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), page?: number, pageSize?: number, search?: string, includeArchived?: boolean }`
- **Description:** List projects for a tenant.

##### `masterdata.createTenantProject`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name: string (1-255), description?: string, codePrefix: string (1-10), currency?: string (3), startDate?: string, endDate?: string }`
- **Description:** Create a project in a tenant.

##### `masterdata.updateTenantProject`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), name?: string, description?: string, status?: 'active' | 'on_hold' | 'completed' | 'archived', currency?: string, startDate?: string | null, endDate?: string | null }`
- **Description:** Update a tenant project.

##### `masterdata.deleteTenantProject`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** Delete a tenant project.

##### `masterdata.listProjectMembers`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** List project members with user details.

##### `masterdata.addProjectMember`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), userId: string (uuid), roleId?: string (uuid) }`
- **Description:** Add a member to a project.

##### `masterdata.removeProjectMember`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), memberId: string (uuid) }`
- **Description:** Remove a member from a project.

##### `masterdata.listProjectContainers`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** List containers for a project.

##### `masterdata.createTenantContainer`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), containerType: 'phase' | 'stage' | 'epic' | 'sprint' | 'board_column' | 'milestone' | 'custom', name: string (1-255), description?: string, startPlan?: string, endPlan?: string, parentId?: string (uuid) }`
- **Description:** Create a container for a project.

##### `masterdata.updateTenantContainer`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), containerId: string (uuid), name?: string, description?: string | null, startPlan?: string | null, endPlan?: string | null, isClosed?: boolean }`
- **Description:** Update a container.

##### `masterdata.deleteTenantContainer`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), containerId: string (uuid) }`
- **Description:** Delete a container.

#### Cross-Tenant: Time Entries

##### `masterdata.listTenantTimeEntries`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), page?: number, pageSize?: number, status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked', projectId?: string (uuid) }`
- **Description:** List time entries for a tenant.

##### `masterdata.createTenantTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), userId: string (uuid), workItemId?: string (uuid), date: string, durationMinutes: number (min 1), description?: string, isBillable?: boolean }`
- **Description:** Create a time entry in a tenant.

##### `masterdata.updateTenantTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), timeEntryId: string (uuid), projectId?: string (uuid), workItemId?: string (uuid) | null, date?: string, durationMinutes?: number, description?: string, isBillable?: boolean, status?: string }`
- **Description:** Update a tenant time entry.

##### `masterdata.deleteTenantTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), timeEntryId: string (uuid) }`
- **Description:** Delete a tenant time entry.

##### `masterdata.listTenantUsers`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), search?: string }`
- **Description:** List active users of a tenant.

#### Cross-Tenant: Work Items

##### `masterdata.listTenantWorkItems`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId?: string (uuid), page?: number (default 1), pageSize?: number (1-100, default 25), search?: string }`
- **Description:** List work items with full details.

##### `masterdata.listProjectWorkItems`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), search?: string }`
- **Description:** List work items for a project (compact format).

##### `masterdata.createTenantWorkItem`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), typeId: string (uuid), title: string (1-500), description?: string, priority?: number (1-5, default 2), assigneeId?: string (uuid), containerId?: string (uuid), estimateMinutes?: number, dueDate?: string }`
- **Description:** Create a work item with auto-generated key and initial workflow state.

##### `masterdata.updateTenantWorkItem`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), title?: string, description?: string | null, typeId?: string (uuid), priority?: number, stateId?: string (uuid), assigneeId?: string (uuid) | null, containerId?: string (uuid) | null, estimateMinutes?: number | null, dueDate?: string | null }`
- **Description:** Update a work item.

##### `masterdata.deleteTenantWorkItem`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** Delete a work item.

##### `masterdata.getWorkItemDetails`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** Get full work item details with relationships.

##### `masterdata.updateWorkItem`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), title?: string, description?: string | null, typeId?: string (uuid), stateId?: string (uuid), priority?: number, assigneeId?: string (uuid) | null, containerId?: string (uuid) | null, estimateMinutes?: number | null, dueDate?: string | null }`
- **Description:** Update a work item (alternative endpoint).

##### `masterdata.searchProjectWorkItems`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), search: string, excludeIds?: string[] (uuid) }`
- **Description:** Search work items by key/title (max 10 results, for linking UI).

##### `masterdata.listWorkItemTasks`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List subtasks for a work item.

##### `masterdata.createWorkItemTask`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), title: string (1-500) }`
- **Description:** Create a subtask.

##### `masterdata.updateWorkItemTask`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), taskId: string (uuid), title?: string, isDone?: boolean }`
- **Description:** Update a subtask.

##### `masterdata.deleteWorkItemTask`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), taskId: string (uuid) }`
- **Description:** Delete a subtask.

##### `masterdata.listProjectWorkflowStates`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** Get workflow states for a project.

##### `masterdata.listTenantMethodologies`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), includeSystem?: boolean }`
- **Description:** List methodologies for a tenant.

##### `masterdata.listTenantWorkItemTypes`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), includeSystem?: boolean }`
- **Description:** List work item types for a tenant.

##### `masterdata.listWorkflowStates`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workflowId: string (uuid) }`
- **Description:** List states for a workflow.

##### `masterdata.listWorkItemComments`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List comments on a work item.

##### `masterdata.createWorkItemComment`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), authorId: string (uuid), content: string }`
- **Description:** Add a comment to a work item.

##### `masterdata.deleteWorkItemComment`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), commentId: string (uuid) }`
- **Description:** Delete a comment.

##### `masterdata.listWorkItemTimeEntries`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List time entries for a work item.

##### `masterdata.createWorkItemTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), workItemId: string (uuid), userId: string (uuid), date: string, durationMinutes: number (min 1), description?: string, isBillable?: boolean }`
- **Description:** Create a time entry for a work item.

##### `masterdata.updateTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), entryId: string (uuid), durationMinutes?: number, description?: string | null, isBillable?: boolean, status?: string }`
- **Description:** Update a time entry.

##### `masterdata.deleteTimeEntry`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), entryId: string (uuid) }`
- **Description:** Delete a time entry.

##### `masterdata.listWorkItemAttachments`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List attachments on a work item.

##### `masterdata.createWorkItemAttachment`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), uploaderId: string (uuid), fileName: string, fileSize: number, mimeType: string, storageKey: string, thumbnailKey?: string }`
- **Description:** Create an attachment record.

##### `masterdata.deleteWorkItemAttachment`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), attachmentId: string (uuid) }`
- **Description:** Delete an attachment.

##### `masterdata.listWorkItemLinks`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List links for a work item.

##### `masterdata.createWorkItemLink`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), fromItemId: string (uuid), toItemId: string (uuid), linkType: 'blocks' | 'is_blocked' | 'relates_to' | 'duplicates' | 'parent_of' | 'child_of' }`
- **Description:** Create a link between work items.

##### `masterdata.deleteWorkItemLink`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), linkId: string (uuid) }`
- **Description:** Delete a work item link.

##### `masterdata.listTenantCustomFields`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), scope?: string }`
- **Description:** List custom field definitions.

##### `masterdata.listWorkItemCustomValues`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List custom field values for a work item.

##### `masterdata.updateWorkItemCustomValue`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid), definitionId: string (uuid), value: any }`
- **Description:** Upsert a custom field value.

#### Cross-Tenant: Financials

##### `masterdata.listFinancialCategories`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), activeOnly?: boolean }`
- **Description:** List financial categories for a tenant.

##### `masterdata.createFinancialCategory`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), name: string (1-100), code: string (max 20), direction: 'expense' | 'revenue' }`
- **Description:** Create a financial category.

##### `masterdata.listWorkItemFinancials`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** List financial entries for a work item.

##### `masterdata.createWorkItemFinancial`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), workItemId: string (uuid), direction: 'expense' | 'revenue', bucket: 'budget' | 'plan' | 'committed' | 'actual', amount: number, date: string, description?: string, categoryId?: string (uuid), vendorName?: string }`
- **Description:** Create a financial entry for a work item.

##### `masterdata.deleteWorkItemFinancial`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), entryId: string (uuid) }`
- **Description:** Delete a financial entry.

##### `masterdata.getWorkItemFinancialSummary`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), workItemId: string (uuid) }`
- **Description:** Get aggregated financial summary for a work item.

##### `masterdata.listProjectFinancials`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** List financial entries for a project.

##### `masterdata.createProjectFinancial`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid), direction: 'expense' | 'revenue', bucket: 'budget' | 'plan' | 'committed' | 'actual', amount: number, date: string, description?: string, categoryId?: string (uuid), vendorName?: string }`
- **Description:** Create a project-level financial entry.

##### `masterdata.deleteProjectFinancial`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), entryId: string (uuid) }`
- **Description:** Delete a project financial entry.

##### `masterdata.getProjectFinancialSummary`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ tenantId: string (uuid), projectId: string (uuid) }`
- **Description:** Get aggregated financial summary for a project.

#### Global Workflows

##### `masterdata.listGlobalWorkflows`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ includeSystem?: boolean, includeTenantSpecific?: boolean, tenantId?: string (uuid) }`
- **Description:** List global workflows with states and transitions.

##### `masterdata.getGlobalWorkflow`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid) }`
- **Description:** Get a workflow with states, transitions, and work item types.

##### `masterdata.createGlobalWorkflow`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ name: string (1-100), description?: string (max 500), isSystem?: boolean }`
- **Description:** Create a global workflow.

##### `masterdata.updateGlobalWorkflow`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid), name?: string (1-100), description?: string | null }`
- **Description:** Update a global workflow.

##### `masterdata.deleteGlobalWorkflow`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid) }`
- **Description:** Delete a global workflow (blocked if system or in use).

##### `masterdata.addGlobalWorkflowState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid), name: string (1-50), category: 'open' | 'in_progress' | 'done' | 'cancelled', isInitial?: boolean, isTerminal?: boolean, color?: string }`
- **Description:** Add a state to a workflow with auto-transitions.

##### `masterdata.updateGlobalWorkflowState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ stateId: string (uuid), name?: string (1-50), category?: 'open' | 'in_progress' | 'done' | 'cancelled', isInitial?: boolean, isTerminal?: boolean, color?: string | null }`
- **Description:** Update a workflow state.

##### `masterdata.deleteGlobalWorkflowState`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ stateId: string (uuid) }`
- **Description:** Delete a workflow state (blocked if in use).

##### `masterdata.reorderGlobalWorkflowStates`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid), stateIds: string[] (uuid) }`
- **Description:** Reorder workflow states.

##### `masterdata.generateAllGlobalTransitions`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ workflowId: string (uuid) }`
- **Description:** Regenerate all bidirectional transitions.

#### Global Work Item Types

##### `masterdata.listGlobalWorkItemTypes`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ includeSystem?: boolean, includeTenantSpecific?: boolean, tenantId?: string (uuid) }`
- **Description:** List global work item types.

##### `masterdata.createGlobalWorkItemType`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ name: string (1-100), icon?: string, color?: string, workflowId?: string (uuid), isSystem?: boolean }`
- **Description:** Create a global work item type.

##### `masterdata.updateGlobalWorkItemType`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ typeId: string (uuid), name?: string, icon?: string | null, color?: string | null, workflowId?: string (uuid) | null }`
- **Description:** Update a global work item type.

##### `masterdata.deleteGlobalWorkItemType`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ typeId: string (uuid) }`
- **Description:** Delete a global work item type (blocked if system or in use).

---

### backup

Source: `apps/api/src/routers/backup.ts`

> All procedures use `superAdminProcedure`.

#### `backup.list`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ page?: number (min 1), pageSize?: number (1-100), status?: 'pending' | 'running' | 'completed' | 'failed' }`
- **Description:** List backup jobs with pagination and status filter.

#### `backup.getById`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get a backup record by ID.

#### `backup.create`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Create a manual database backup.

#### `backup.delete`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Delete a backup record.

#### `backup.getDownloadInfo`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get download URL and filename for a completed backup.

#### `backup.getSchedule`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get backup schedule configuration.

#### `backup.updateSchedule`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ enabled: boolean, cronExpression: string (9-100 chars), retentionDays: number (1-365) }`
- **Description:** Update backup schedule (cron, retention, enabled flag).

#### `backup.getSchedulePresets`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get available schedule presets.

#### `backup.runCleanup`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ retentionDays?: number (1-365) }`
- **Description:** Trigger retention cleanup of old backups.

#### `backup.getStats`
- **Type:** query
- **Auth:** superAdminProcedure
- **Input:** none
- **Description:** Get backup statistics (counts, size, last backup date).

#### `backup.verify`
- **Type:** mutation
- **Auth:** superAdminProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Verify backup integrity via SHA-256 checksum.

---

### profile

Source: `apps/api/src/routers/profile.ts`

#### `profile.getMyProfile`
- **Type:** query
- **Auth:** authedProcedure
- **Input:** none
- **Description:** Get the current user's profile.

#### `profile.updateMyProfile`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ name?: string (1-255), avatarUrl?: string (url, nullable), bio?: string (nullable), phone?: string (nullable), mobile?: string (nullable), jobTitle?: string (nullable), department?: string (nullable), company?: string (nullable), location?: string (nullable), city?: string (nullable), country?: string (nullable), timezone?: string (nullable), birthDate?: string (datetime, nullable), gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' (nullable), languages?: string[], skills?: string[], linkedinUrl?: string (nullable), twitterUrl?: string (nullable), githubUrl?: string (nullable), websiteUrl?: string (nullable) }`
- **Description:** Update the current user's profile.

#### `profile.updateMyAvatar`
- **Type:** mutation
- **Auth:** authedProcedure
- **Input:** `{ avatarUrl: string (url, nullable) }`
- **Description:** Update the current user's avatar URL.

---

### projects

Source: `apps/api/src/routers/projects.ts`

#### `projects.create`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.create`)
- **Input:** `{ name: string (1-255), description?: string, codePrefix: string (2-10, letters only), methodologyId?: string (uuid), currency?: string (3 chars, default 'USD'), timezone?: string (default 'UTC'), startDate?: date, endDate?: date }`
- **Description:** Create a new project.

#### `projects.list`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ search?: string, methodologyId?: string (uuid), includeArchived?: boolean, limit?: number (1-100, default 25), offset?: number (default 0) }`
- **Description:** List projects with pagination. Non-admin users see only their projects.

#### `projects.getById`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Get a project by ID.

#### `projects.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.edit`)
- **Input:** `{ projectId: string (uuid), name?: string, description?: string, methodologyId?: string (uuid), currency?: string, timezone?: string, startDate?: date, endDate?: date }`
- **Description:** Update project details.

#### `projects.archive`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.archive`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Archive a project.

#### `projects.restore`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.archive`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Restore an archived project.

#### `projects.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.delete`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Permanently delete a project.

#### `projects.addMember`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.members.manage`)
- **Input:** `{ projectId: string (uuid), userId: string (uuid), roleId?: string (uuid) }`
- **Description:** Add a member to a project.

#### `projects.removeMember`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.members.manage`)
- **Input:** `{ projectId: string (uuid), userId: string (uuid) }`
- **Description:** Remove a member from a project.

#### `projects.listMembers`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** List project members.

#### `projects.createContainer`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.container.create`)
- **Input:** `{ projectId: string (uuid), parentId?: string (uuid), containerType: 'phase' | 'stage' | 'epic' | 'sprint' | 'board_column' | 'milestone' | 'custom', name: string (1-255), description?: string, startPlan?: date, endPlan?: date }`
- **Description:** Create a container (phase, sprint, epic, etc.) in a project.

#### `projects.listContainers`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid), containerType?: string, parentId?: string (uuid), isClosed?: boolean }`
- **Description:** List containers with optional filters.

#### `projects.getContainerTree`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Get the hierarchical container tree.

#### `projects.updateContainer`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.container.edit`)
- **Input:** `{ containerId: string (uuid), name?: string, description?: string, isClosed?: boolean, startPlan?: date, endPlan?: date, startActual?: date, endActual?: date }`
- **Description:** Update a container.

#### `projects.closeContainer`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.container.edit`)
- **Input:** `{ containerId: string (uuid) }`
- **Description:** Close a container.

#### `projects.reorderContainers`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.container.edit`)
- **Input:** `{ projectId: string (uuid), containerIds: string[] (uuid) }`
- **Description:** Reorder containers.

#### `projects.deleteContainer`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.container.delete`)
- **Input:** `{ containerId: string (uuid) }`
- **Description:** Delete a container.

#### `projects.togglePin`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Toggle project pin status for the current user.

#### `projects.changeColor`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.edit`)
- **Input:** `{ projectId: string (uuid), color: string (#RRGGBB) }`
- **Description:** Change a project's display color.

#### `projects.duplicate`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.create`)
- **Input:** `{ projectId: string (uuid), newName: string (1-255), newCodePrefix: string (2-10, letters only) }`
- **Description:** Duplicate a project (copies settings, not work items).

#### `projects.recordAccess`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Record a project access event for "Recently Accessed" tracking.

#### `projects.listEnhanced`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ search?: string, includeArchived?: boolean, dateFrom?: date, dateTo?: date, sortBy?: 'newest' | 'oldest' | 'name' | 'lastAccessed' }`
- **Description:** List projects with enhanced sections (recent, pinned, all) including task stats.

#### `projects.getStats`
- **Type:** query
- **Auth:** permissionProcedure(`projects.project.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Get project statistics (tasks, completion, overdue).

---

### workItems

Source: `apps/api/src/routers/work-items.ts`

#### `workItems.create`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.create`, `own`)
- **Input:** `{ projectId: string (uuid), typeId: string (uuid), stateId?: string (uuid), containerId?: string (uuid), parentId?: string (uuid), title: string (1-500), description?: string, priority?: number (0-10, default 0), severity?: number (0-10), assigneeId?: string (uuid), reporterId?: string (uuid), estimateMinutes?: number, dueDate?: date, startPlan?: date, endPlan?: date, meetingUrl?: string (url) }`
- **Description:** Create a work item (ticket/task).

#### `workItems.list`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ projectId: string (uuid), containerId?: string (uuid), typeId?: string (uuid), stateId?: string (uuid), assigneeId?: string (uuid), search?: string, includeArchived?: boolean, limit?: number (1-100, default 50), offset?: number (default 0) }`
- **Description:** List work items with filters.

#### `workItems.getById`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Get a work item by ID.

#### `workItems.myAssignedItems`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ limit?: number (1-20, default 5) }`
- **Description:** Get work items assigned to the current user across all projects.

#### `workItems.getByKey`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ key: string, projectId: string (uuid) }`
- **Description:** Get a work item by key (e.g., "PROJ-123").

#### `workItems.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ workItemId: string (uuid), title?: string, description?: string, typeId?: string (uuid), stateId?: string (uuid), priority?: number, severity?: number, containerId?: string (uuid), assigneeId?: string (uuid), estimateMinutes?: number, dueDate?: date, startPlan?: date, endPlan?: date, startReal?: date, endReal?: date, meetingUrl?: string (url) }`
- **Description:** Update a work item.

#### `workItems.transition`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.transition`, `own`)
- **Input:** `{ workItemId: string (uuid), toStateId: string (uuid) }`
- **Description:** Transition a work item to a new workflow state.

#### `workItems.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.delete`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Permanently delete a work item.

#### `workItems.archive`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.delete`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Archive a work item.

#### `workItems.restore`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Restore an archived work item.

#### Subtasks

##### `workItems.addTask`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ workItemId: string (uuid), title: string (1-500), assigneeId?: string (uuid), dueDate?: date }`
- **Description:** Add a subtask to a work item.

##### `workItems.toggleTask`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ taskId: string (uuid), isDone: boolean }`
- **Description:** Toggle subtask completion.

##### `workItems.removeTask`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ taskId: string (uuid) }`
- **Description:** Remove a subtask.

##### `workItems.listTasks`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List subtasks for a work item.

#### Links

##### `workItems.addLink`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ fromWorkItemId: string (uuid), toWorkItemId: string (uuid), linkType: 'blocks' | 'is_blocked' | 'relates_to' | 'duplicates' | 'parent_of' | 'child_of' }`
- **Description:** Create a dependency link between work items.

##### `workItems.removeLink`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ linkId: string (uuid) }`
- **Description:** Remove a link.

##### `workItems.listLinks`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List links for a work item.

##### `workItems.searchWorkItems`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ projectId: string (uuid), search: string, excludeIds?: string[] (uuid) }`
- **Description:** Search work items by title/key (max 10 results, for linking UI).

#### Watchers

##### `workItems.addWatcher`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid), userId: string (uuid) }`
- **Description:** Add a user as a watcher.

##### `workItems.removeWatcher`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid), userId: string (uuid) }`
- **Description:** Remove a watcher.

##### `workItems.listWatchers`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List watchers.

##### `workItems.watch`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Watch a work item (current user).

##### `workItems.unwatch`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Unwatch a work item (current user).

#### Workflow

##### `workItems.getProjectWorkflowConfig`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Get workflow config (types, states, transitions) for a project.

#### Comments

##### `workItems.listComments`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List comments on a work item.

##### `workItems.addComment`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ workItemId: string (uuid), content: string (1-5000) }`
- **Description:** Add a comment.

##### `workItems.deleteComment`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ commentId: string (uuid) }`
- **Description:** Delete a comment.

#### Attachments

##### `workItems.listAttachments`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List attachments.

##### `workItems.addAttachment`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ workItemId: string (uuid), fileName: string, fileSize?: number, mimeType?: string, storageKey: string }`
- **Description:** Add an attachment record.

##### `workItems.deleteAttachment`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ attachmentId: string (uuid) }`
- **Description:** Delete an attachment.

#### Financials

##### `workItems.listFinancials`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** List financial entries for a work item.

##### `workItems.addFinancial`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ projectId: string (uuid), workItemId: string (uuid), direction: 'expense' | 'revenue', bucket: 'budget' | 'plan' | 'committed' | 'actual', amount: number, date: string, description?: string, vendorName?: string }`
- **Description:** Add a financial entry.

##### `workItems.deleteFinancial`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.workitem.edit`, `own`)
- **Input:** `{ entryId: string (uuid) }`
- **Description:** Delete a financial entry.

##### `workItems.getFinancialSummary`
- **Type:** query
- **Auth:** permissionProcedure(`projects.workitem.view`, `own`)
- **Input:** `{ workItemId: string (uuid) }`
- **Description:** Get aggregated financial summary for a work item.

---

### timeEntries

Source: `apps/api/src/routers/time-entries.ts`

#### `timeEntries.create`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.create`, `own`)
- **Input:** `{ projectId: string (uuid), workItemId?: string (uuid), taskId?: string (uuid), userId?: string (uuid), description?: string, date: date, startTime?: date, endTime?: date, durationMinutes: number (min 1), isBillable?: boolean }`
- **Description:** Create a time entry.

#### `timeEntries.list`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.view`, `own`)
- **Input:** `{ projectId?: string (uuid), workItemId?: string (uuid), userId?: string (uuid), status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked', dateFrom?: date, dateTo?: date, limit?: number (1-100, default 50), offset?: number (default 0) }`
- **Description:** List time entries with filters.

#### `timeEntries.getById`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.view`, `own`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Get a time entry by ID.

#### `timeEntries.myEntries`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.view`, `own`)
- **Input:** `{ dateFrom?: date, dateTo?: date }`
- **Description:** Get time entries for the current user.

#### `timeEntries.update`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.edit`, `own`)
- **Input:** `{ timeEntryId: string (uuid), description?: string, date?: date, startTime?: date, endTime?: date, durationMinutes?: number (min 1), isBillable?: boolean }`
- **Description:** Update a time entry.

#### `timeEntries.delete`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.edit`, `own`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Delete a time entry.

#### `timeEntries.submit`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.submit`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Submit a draft time entry for approval.

#### `timeEntries.approve`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.approve`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Approve a submitted time entry.

#### `timeEntries.reject`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.approve`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Reject a submitted time entry.

#### `timeEntries.resubmit`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.timeentry.submit`)
- **Input:** `{ timeEntryId: string (uuid) }`
- **Description:** Resubmit a rejected time entry.

#### `timeEntries.pendingApproval`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.approve`)
- **Input:** `{ projectId?: string (uuid) }`
- **Description:** List time entries pending approval.

#### `timeEntries.projectSummary`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.view`, `own`)
- **Input:** `{ projectId: string (uuid), workItemId?: string (uuid), userId?: string (uuid) }`
- **Description:** Get time tracking summary for a project.

#### `timeEntries.export`
- **Type:** query
- **Auth:** permissionProcedure(`projects.timeentry.approve`)
- **Input:** `{ projectId: string (uuid), userId?: string (uuid), status?: string[], dateFrom?: date, dateTo?: date }`
- **Description:** Export time entries for a project.

---

### financials

Source: `apps/api/src/routers/financials.ts`

#### `financials.createEntry`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.create`)
- **Input:** `{ projectId: string (uuid), categoryId?: string (uuid), direction: 'expense' | 'revenue', bucket: 'budget' | 'plan' | 'committed' | 'actual', amount: number (min 0), currency: string (3 chars), date: date, description?: string, externalRef?: string, vendorName?: string }`
- **Description:** Create a financial entry.

#### `financials.listEntries`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ projectId?: string (uuid), categoryId?: string (uuid), direction?: 'expense' | 'revenue', bucket?: string, status?: 'draft' | 'pending' | 'approved' | 'paid', dateFrom?: date, dateTo?: date, limit?: number (1-100, default 50), offset?: number (default 0) }`
- **Description:** List financial entries with filters.

#### `financials.getEntry`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ entryId: string (uuid) }`
- **Description:** Get a financial entry by ID.

#### `financials.updateEntry`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.edit`)
- **Input:** `{ entryId: string (uuid), categoryId?: string (uuid), amount?: number (min 0), date?: date, description?: string, externalRef?: string, vendorName?: string }`
- **Description:** Update a financial entry.

#### `financials.approveEntry`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.approve`)
- **Input:** `{ entryId: string (uuid) }`
- **Description:** Approve a financial entry.

#### `financials.markPaid`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.approve`)
- **Input:** `{ entryId: string (uuid) }`
- **Description:** Mark a financial entry as paid.

#### `financials.deleteEntry`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.edit`)
- **Input:** `{ entryId: string (uuid) }`
- **Description:** Delete a financial entry.

#### `financials.createCategory`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.edit`)
- **Input:** `{ name: string (1-100), code: string (max 20), direction: 'expense' | 'revenue' }`
- **Description:** Create a financial category.

#### `financials.listCategories`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ activeOnly?: boolean }`
- **Description:** List financial categories.

#### `financials.updateCategory`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.edit`)
- **Input:** `{ categoryId: string (uuid), name?: string, code?: string }`
- **Description:** Update a financial category.

#### `financials.deactivateCategory`
- **Type:** mutation
- **Auth:** permissionProcedure(`projects.financial.edit`)
- **Input:** `{ categoryId: string (uuid) }`
- **Description:** Deactivate a financial category.

#### `financials.projectSummary`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ projectId: string (uuid) }`
- **Description:** Get aggregated financial summary for a project.

#### `financials.byCategory`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ projectId: string (uuid), bucket?: 'budget' | 'plan' | 'committed' | 'actual' (default 'actual') }`
- **Description:** Get financials grouped by category.

#### `financials.byMonth`
- **Type:** query
- **Auth:** permissionProcedure(`projects.financial.view`)
- **Input:** `{ projectId: string (uuid), year: number (2000-2100) }`
- **Description:** Get financials grouped by month.

---

### workflows

Source: `apps/api/src/routers/workflows.ts`

#### `workflows.list`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ includeSystem?: boolean }`
- **Description:** List all workflows for the tenant.

#### `workflows.getById`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get a workflow with states and transitions.

#### `workflows.create`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ name: string (1-100), description?: string (max 500) }`
- **Description:** Create a workflow.

#### `workflows.update`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ id: string (uuid), name?: string (1-100), description?: string (max 500) }`
- **Description:** Update a workflow.

#### `workflows.delete`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Delete a workflow.

#### `workflows.duplicate`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid), newName: string (1-100) }`
- **Description:** Duplicate a workflow (copies states and transitions).

#### `workflows.addState`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid), name: string (1-100), category: 'open' | 'in_progress' | 'done' | 'cancelled', orderIndex?: number, isInitial?: boolean, isTerminal?: boolean, color?: string (max 7) }`
- **Description:** Add a state to a workflow.

#### `workflows.updateState`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ stateId: string (uuid), name?: string (1-100), category?: 'open' | 'in_progress' | 'done' | 'cancelled', orderIndex?: number, isInitial?: boolean, isTerminal?: boolean, color?: string (max 7) }`
- **Description:** Update a workflow state.

#### `workflows.deleteState`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ stateId: string (uuid) }`
- **Description:** Delete a workflow state.

#### `workflows.addTransition`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid), fromStateId: string (uuid), toStateId: string (uuid), name?: string (max 100), conditions?: Record<string, unknown>, hooks?: Record<string, unknown>, permissionKey?: string (max 100) }`
- **Description:** Add a transition between states.

#### `workflows.deleteTransition`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ transitionId: string (uuid) }`
- **Description:** Delete a transition.

#### `workflows.generateAllTransitions`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid) }`
- **Description:** Auto-generate transitions between all states.

#### `workflows.syncTransitions`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid) }`
- **Description:** Sync transitions to match current states.

#### `workflows.reorderStates`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ workflowId: string (uuid), stateIds: string[] (uuid) }`
- **Description:** Reorder workflow states.

#### `workflows.listMethodologies`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** List methodologies for the tenant.

#### `workflows.getMethodology`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** `{ id: string (uuid) }`
- **Description:** Get a methodology by ID.

#### `workflows.duplicateMethodology`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ methodologyId: string (uuid), newName: string (1-100) }`
- **Description:** Duplicate a methodology for customization.

#### `workflows.listWorkItemTypes`
- **Type:** query
- **Auth:** tenantProcedure
- **Input:** none
- **Description:** List work item types for the tenant.

#### `workflows.createWorkItemType`
- **Type:** mutation
- **Auth:** tenantProcedure
- **Input:** `{ name: string (1-100), icon?: string (max 50), color?: string (max 7), workflowId?: string (uuid) }`
- **Description:** Create a work item type.

---

*Generated from source code in `apps/api/src/routers/`. Last updated: 2026-03-04.*
