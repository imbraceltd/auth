/**
 * Community (open-source) role provider.
 *
 * Stores users locally via any `StorageAdapter` (Postgres, MongoDB, MySQL, Memory, etc.).
 * Single-tenant model: one implicit "default" organization, two roles: `owner` and `member`.
 *
 * User management follows the n8n community model:
 * - First user to sign up becomes the owner (via `setupOwner()`).
 * - No public signup — all subsequent users must be invited by the owner.
 * - Invited users receive a token/link and set their password to activate.
 *
 * @packageDocumentation
 */
import { Storage, type StorageAdapter } from "../../storage/storage.js"
import type {
  RoleProvider,
  RoleProviderInput,
  ResolvedUserContext,
} from "../role-provider.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCAL_ROLES = ["owner", "member"] as const
export type LocalRole = (typeof LOCAL_ROLES)[number]

const DEFAULT_ORG_ID = "default"

/** Storage key prefixes — use distinct names that are NOT prefixes of each other */
const PREFIX_USER = "imbrace_user"
const PREFIX_USER_EMAIL = "imbrace_email_idx"
const PREFIX_INVITE = "imbrace_invite"

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface LocalUser {
  id: string
  email: string
  password_hash: string
  role: LocalRole
  status: "active" | "pending"
  invite_token?: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Password hashing (using Web Crypto API — no native deps)
// ---------------------------------------------------------------------------

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, salt)
  const hashHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, expectedHash] = stored.split(":")
  if (!saltHex || !expectedHash) return false
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
  )
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, salt)
  const hashHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return hashHex === expectedHash
}

function generateId(): string {
  return crypto.randomUUID()
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface LocalRoleProviderOptions {
  /** StorageAdapter instance — same one used for token storage. */
  storage: StorageAdapter
  /**
   * Display name for the implicit default organization.
   * @default "Default"
   */
  defaultOrgDisplayName?: string
}

// ---------------------------------------------------------------------------
// LocalRoleProvider
// ---------------------------------------------------------------------------

export class LocalRoleProvider implements RoleProvider {
  private readonly storage: StorageAdapter
  private readonly orgDisplayName: string

  constructor(options: LocalRoleProviderOptions) {
    this.storage = options.storage
    this.orgDisplayName = options.defaultOrgDisplayName ?? "Default"
  }

  // --- RoleProvider interface ---

  async resolveUserRoles(
    input: RoleProviderInput,
  ): Promise<ResolvedUserContext | null> {
    const { email, providerData } = input

    const user = await this.getUserByEmail(email)
    if (!user) return null
    if (user.status !== "active") return null

    // For password login, verify the password
    const password = (providerData as any)?.password
    if (password) {
      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) return null
    }

    return this.toUserContext(user)
  }

  async isSetupComplete(): Promise<boolean> {
    // Check if any user exists by scanning the prefix
    for await (const _ of Storage.scan(this.storage, [PREFIX_USER])) {
      return true
    }
    return false
  }

  async setupOwner(email: string, password: string): Promise<void> {
    const alreadySetup = await this.isSetupComplete()
    if (alreadySetup) {
      throw new Error("Setup already complete. Owner account already exists.")
    }

    const existing = await this.getUserByEmail(email)
    if (existing) {
      throw new Error("A user with this email already exists.")
    }

    const id = generateId()
    const passwordHash = await hashPassword(password)
    const user: LocalUser = {
      id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: "owner",
      status: "active",
      created_at: new Date().toISOString(),
    }

    await this.saveUser(user)
  }

  async inviteUser(
    email: string,
    role: string,
  ): Promise<{ inviteToken: string }> {
    const normalizedEmail = email.toLowerCase().trim()
    const validRole = this.validateRole(role)

    const existing = await this.getUserByEmail(normalizedEmail)
    if (existing) {
      throw new Error("A user with this email already exists.")
    }

    const id = generateId()
    const inviteToken = generateToken()
    const user: LocalUser = {
      id,
      email: normalizedEmail,
      password_hash: "",
      role: validRole,
      status: "pending",
      invite_token: inviteToken,
      created_at: new Date().toISOString(),
    }

    await this.saveUser(user)

    // Store invite token → user ID mapping for fast lookup
    await Storage.set(this.storage, [PREFIX_INVITE, inviteToken], { userId: id })

    return { inviteToken }
  }

  async activateUser(inviteToken: string, password: string): Promise<void> {
    const mapping = await Storage.get<{ userId: string }>(this.storage, [
      PREFIX_INVITE,
      inviteToken,
    ])
    if (!mapping) {
      throw new Error("Invalid or expired invite token.")
    }

    const user = await this.getUserById(mapping.userId)
    if (!user) {
      throw new Error("User not found.")
    }
    if (user.status !== "pending") {
      throw new Error("User account is already active.")
    }

    user.password_hash = await hashPassword(password)
    user.status = "active"
    delete user.invite_token

    await this.saveUser(user)

    // Clean up invite token mapping
    await Storage.remove(this.storage, [PREFIX_INVITE, inviteToken])
  }

  async listUsers(): Promise<
    Array<{
      id: string
      email: string
      role: string
      status: string
      created_at: string
    }>
  > {
    const users: Array<{
      id: string
      email: string
      role: string
      status: string
      created_at: string
    }> = []

    for await (const [, value] of Storage.scan<LocalUser>(this.storage, [
      PREFIX_USER,
    ])) {
      users.push({
        id: value.id,
        email: value.email,
        role: value.role,
        status: value.status,
        created_at: value.created_at,
      })
    }

    return users.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  }

  async removeUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new Error("User not found.")
    }

    // Prevent removing the last owner
    if (user.role === "owner") {
      const owners = await this.countByRole("owner")
      if (owners <= 1) {
        throw new Error(
          "Cannot remove the last owner. Transfer ownership first.",
        )
      }
    }

    // Clean up invite token if exists
    if (user.invite_token) {
      await Storage.remove(this.storage, [PREFIX_INVITE, user.invite_token])
    }

    // Remove email index
    await Storage.remove(this.storage, [PREFIX_USER_EMAIL, user.email])
    // Remove user record
    await Storage.remove(this.storage, [PREFIX_USER, userId])
  }

  async changeUserRole(userId: string, newRole: string): Promise<void> {
    const validRole = this.validateRole(newRole)
    const user = await this.getUserById(userId)
    if (!user) {
      throw new Error("User not found.")
    }

    // Prevent demoting the last owner
    if (user.role === "owner" && validRole !== "owner") {
      const owners = await this.countByRole("owner")
      if (owners <= 1) {
        throw new Error(
          "Cannot demote the last owner. Promote another user first.",
        )
      }
    }

    user.role = validRole
    await this.saveUser(user)
  }

  // --- Internal helpers ---

  private toUserContext(user: LocalUser): ResolvedUserContext {
    return {
      user_id: user.id,
      email: user.email,
      customer_id: user.id,
      organizations: [
        {
          organization_id: DEFAULT_ORG_ID,
          display_name: this.orgDisplayName,
          role: user.role,
        },
      ],
    }
  }

  private validateRole(role: string): LocalRole {
    if (!LOCAL_ROLES.includes(role as LocalRole)) {
      throw new Error(
        `Invalid role "${role}". Must be one of: ${LOCAL_ROLES.join(", ")}`,
      )
    }
    return role as LocalRole
  }

  private async getUserById(id: string): Promise<LocalUser | null> {
    const data = await Storage.get<LocalUser>(this.storage, [PREFIX_USER, id])
    return data ?? null
  }

  private async getUserByEmail(email: string): Promise<LocalUser | null> {
    const normalized = email.toLowerCase().trim()
    const mapping = await Storage.get<{ userId: string }>(this.storage, [
      PREFIX_USER_EMAIL,
      normalized,
    ])
    if (!mapping) return null
    return this.getUserById(mapping.userId)
  }

  private async saveUser(user: LocalUser): Promise<void> {
    // Store user record
    await Storage.set(this.storage, [PREFIX_USER, user.id], user)
    // Store email → user ID index
    await Storage.set(this.storage, [PREFIX_USER_EMAIL, user.email], {
      userId: user.id,
    })
  }

  private async countByRole(role: LocalRole): Promise<number> {
    let count = 0
    for await (const [, value] of Storage.scan<LocalUser>(this.storage, [
      PREFIX_USER,
    ])) {
      if (value.role === role) count++
    }
    return count
  }
}
