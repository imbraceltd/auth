/**
 * Role provider interface for Imbrace auth.
 *
 * Two built-in implementations:
 * - `PlatformServiceRoleProvider` — enterprise, delegates to an external platform service
 * - `LocalRoleProvider` — community/open-source, stores users locally via StorageAdapter
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Resolved user context — returned by resolveUserRoles()
// ---------------------------------------------------------------------------

export interface ResolvedOrganization {
  organization_id: string
  display_name: string
  role: string
}

export interface ResolvedUserContext {
  user_id: string
  customer_id: string
  email: string
  organizations: ResolvedOrganization[]
}

// ---------------------------------------------------------------------------
// RoleProvider interface
// ---------------------------------------------------------------------------

export interface RoleProviderInput {
  /** User email (always available after credential verification). */
  email: string
  /** Login method: 'password', 'otp', 'google', 'azure-ad', etc. */
  providerType?: string
  /** Provider-specific data (e.g. social login payload with tenant_id, groups). */
  providerData?: unknown
}

export interface RoleProvider {
  /**
   * Resolve the authenticated user's identity and organization memberships.
   *
   * Called by the issuer after credential verification succeeds.
   * Returns `null` if the user is not found or not allowed to log in.
   */
  resolveUserRoles(input: RoleProviderInput): Promise<ResolvedUserContext | null>

  // --- Community user management (optional, only LocalRoleProvider implements) ---

  /** Check whether the initial owner account has been created. */
  isSetupComplete?(): Promise<boolean>

  /** Create the first owner account. Only succeeds when no users exist yet. */
  setupOwner?(email: string, password: string): Promise<void>

  /**
   * Invite a new user. Creates a pending record and returns an invite token.
   * The caller is responsible for delivering the token (email or copy-paste link).
   */
  inviteUser?(email: string, role: string): Promise<{ inviteToken: string }>

  /** Activate an invited user by setting their password. */
  activateUser?(inviteToken: string, password: string): Promise<void>

  /** List all users (for admin UI). */
  listUsers?(): Promise<
    Array<{
      id: string
      email: string
      role: string
      status: string
      created_at: string
    }>
  >

  /** Remove a user by ID. */
  removeUser?(userId: string): Promise<void>

  /** Change a user's role. */
  changeUserRole?(userId: string, newRole: string): Promise<void>
}
