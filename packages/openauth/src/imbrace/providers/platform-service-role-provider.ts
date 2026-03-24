/**
 * Enterprise role provider that delegates to an external platform service.
 *
 * This is the default for production/enterprise deployments where a separate
 * platform-service manages users, organizations, and roles.
 *
 * @packageDocumentation
 */
import type {
  RoleProvider,
  RoleProviderInput,
  ResolvedUserContext,
} from "../role-provider.js"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface PlatformServiceConfig {
  /** Base URL of the platform user service (e.g. "http://localhost:3001"). */
  baseUrl: string
  /** Override default API paths. */
  paths?: {
    /** @default "/authenticate" */
    authenticate?: string
    /** @default "/_signin_email_request" */
    sendOtp?: string
    /** @default "/signup" */
    signup?: string
    /** @default "/signup/resend" */
    resendVerification?: string
    /** @default "/signup/verify" */
    checkVerification?: string
  }
  /**
   * Request timeout in milliseconds.
   * @default 10000
   */
  timeout?: number
}

// ---------------------------------------------------------------------------
// PlatformServiceRoleProvider
// ---------------------------------------------------------------------------

export class PlatformServiceRoleProvider implements RoleProvider {
  constructor(public readonly config: PlatformServiceConfig) {}

  async resolveUserRoles(
    input: RoleProviderInput,
  ): Promise<ResolvedUserContext | null> {
    const { email, providerType, providerData } = input

    let payload: Record<string, unknown>

    if (providerType && providerType !== "password" && providerType !== "otp") {
      // Social / enterprise provider
      payload = {
        provider_type: providerType,
        email,
        ...(providerData as Record<string, unknown>),
      }
    } else if (providerType === "otp") {
      // OTP login
      payload = { email, otp: (providerData as any)?.otp }
    } else {
      // Email + password
      payload = { email, password: (providerData as any)?.password }
    }

    return this.callAuthenticate(payload)
  }

  // --- Platform API helpers (public so provider.tsx can reuse them) ---

  async callAuthenticate(
    payload: Record<string, unknown>,
  ): Promise<ResolvedUserContext | null> {
    const path = this.config.paths?.authenticate ?? "/authenticate"
    const timeout = this.config.timeout ?? 10_000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const url = `${this.config.baseUrl}${path}`
      console.log("[imbrace] POST", url, JSON.stringify(payload))
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      console.log("[imbrace] Platform HTTP status:", res.status)
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.log("[imbrace] Platform error body:", body)
        return null
      }
      const data = (await res.json()) as any
      return {
        user_id: data.user_id ?? data.userId ?? "",
        email: data.email ?? (payload.email as string),
        customer_id: data.customerId ?? data.customer_id ?? "",
        organizations: (data.organizations ?? []).map((org: any) => ({
          organization_id: org.organization_id,
          display_name: org.display_name,
          role: org.role ?? "",
        })),
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.error(
          `[imbrace] Platform authenticate timeout after ${timeout}ms`,
        )
      } else {
        console.error("[imbrace] Platform authenticate error:", err?.message)
      }
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  async callSendOtp(email: string): Promise<boolean> {
    const path = this.config.paths?.sendOtp ?? "/_signin_email_request"
    const timeout = this.config.timeout ?? 10_000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      })
      return res.ok
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.error(`[imbrace] Platform sendOtp timeout after ${timeout}ms`)
      } else {
        console.error("[imbrace] Platform sendOtp error:", err?.message)
      }
      return false
    } finally {
      clearTimeout(timer)
    }
  }

  async callSignup(payload: {
    email: string
    password?: string
  }): Promise<boolean> {
    const path = this.config.paths?.signup ?? "/signup"
    const timeout = this.config.timeout ?? 10_000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      return res.status === 200 || res.status === 201
    } catch (err: any) {
      console.error("[imbrace] Platform signup error:", err?.message)
      return false
    } finally {
      clearTimeout(timer)
    }
  }

  async callResendVerification(email: string): Promise<boolean> {
    const path = this.config.paths?.resendVerification ?? "/signup/resend"
    const timeout = this.config.timeout ?? 10_000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      })
      return res.ok
    } catch (err: any) {
      console.error(
        "[imbrace] Platform resendVerification error:",
        err?.message,
      )
      return false
    } finally {
      clearTimeout(timer)
    }
  }

  async callCheckVerification(
    email: string,
  ): Promise<ResolvedUserContext | null> {
    const path = this.config.paths?.checkVerification ?? "/signup/verify"
    const timeout = this.config.timeout ?? 10_000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(
        `${this.config.baseUrl}${path}?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      )
      if (!res.ok) return null
      const data = (await res.json()) as any
      return {
        user_id: data.user_id ?? data.userId ?? "",
        email: data.email ?? email,
        customer_id: data.customerId ?? data.customer_id ?? "",
        organizations: (data.organizations ?? []).map((org: any) => ({
          organization_id: org.organization_id,
          display_name: org.display_name,
          role: org.role ?? "",
        })),
      }
    } catch (err: any) {
      console.error(
        "[imbrace] Platform checkVerification error:",
        err?.message,
      )
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}
