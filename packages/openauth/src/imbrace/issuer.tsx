/**
 * Convenience wrapper to create an Imbrace-configured OpenAuth issuer.
 *
 * ```ts
 * import { createIssuer } from "@openauthjs/openauth/imbrace"
 * import { MemoryStorage } from "@openauthjs/openauth/storage/memory"
 * import { LocalRoleProvider } from "@openauthjs/openauth/imbrace/providers/local-role-provider"
 *
 * const storage = MemoryStorage()
 * export default createIssuer({
 *   roleProvider: new LocalRoleProvider({ storage }),
 *   storage,
 * })
 * ```
 *
 * @packageDocumentation
 */
/** @jsxImportSource hono/jsx */
import { issuer } from "../issuer.js"
import { StorageAdapter } from "../storage/storage.js"
import { Theme } from "../ui/theme.js"
import { imbraceSubjects } from "./subjects.js"
import type { ImbraceOrganization } from "./subjects.js"
import {
  createImbraceProvider,
  type ForgotPasswordConfig,
} from "./provider.js"
import type { SocialProviderButton } from "../ui/imbrace.js"
import {
  ImbraceSetupOwnerForm,
  ImbraceSetupOwnerSuccess,
  ImbraceAdminPanel,
  ImbraceInviteForm,
  ImbraceInviteSuccess,
  ImbraceInviteActivateForm,
  ImbraceInviteActivateSuccess,
} from "../ui/imbrace.js"
import type { Provider } from "../provider/provider.js"
import type { RoleProvider } from "./role-provider.js"
import { PlatformServiceRoleProvider } from "./providers/platform-service-role-provider.js"
import { LocalRoleProvider } from "./providers/local-role-provider.js"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { getCookie } from "hono/cookie"

// ---------------------------------------------------------------------------
// Enterprise claim extractors — extract tenant_id + groups from id_token
// ---------------------------------------------------------------------------

export interface EnterpriseClaimExtractor {
  getTenantId: (claims: Record<string, any>) => string | undefined
  getGroups: (claims: Record<string, any>) => string[]
}

export const AZURE_AD_CLAIMS: EnterpriseClaimExtractor = {
  getTenantId: (claims) => claims.tid,
  getGroups: (claims) => [...(claims.roles || []), ...(claims.groups || [])],
}

export const KEYCLOAK_CLAIMS: EnterpriseClaimExtractor = {
  getTenantId: (claims) => claims.iss,
  getGroups: (claims) => [
    ...(claims.realm_access?.roles || []),
    ...(claims.groups || []),
  ],
}

export const OKTA_CLAIMS: EnterpriseClaimExtractor = {
  getTenantId: (claims) => claims.iss,
  getGroups: (claims) => claims.groups || [],
}

export const GENERIC_OIDC_CLAIMS: EnterpriseClaimExtractor = {
  getTenantId: (claims) => claims.iss,
  getGroups: (claims) => claims.groups || [],
}

// ---------------------------------------------------------------------------
// Issuer input
// ---------------------------------------------------------------------------

export interface ImbraceIssuerInput {
  /**
   * Role provider — determines how users/roles are resolved.
   * - `PlatformServiceRoleProvider` for enterprise (delegates to external platform service)
   * - `LocalRoleProvider` for community/open-source (stores users locally)
   */
  roleProvider: RoleProvider
  /** Storage adapter (DynamoDB, Postgres, Memory, etc.). */
  storage: StorageAdapter
  /** Optional theme. Defaults to the globally set theme. */
  theme?: Theme
  /** Social provider buttons to display on the login form. */
  socialProviders?: SocialProviderButton[]
  /**
   * Forgot password configuration. Omit to hide the "Forgot password?" link.
   * - `true` — Internal flow, auto-derives URLs from platform service baseUrl + `/forget` and `/forget/reset`.
   *            Only works with `PlatformServiceRoleProvider`.
   * - `string` — URL to an external forgot password page (renders a link only).
   * - `ForgotPasswordConfig` — Internal flow with explicit URLs.
   */
  forgotPassword?: boolean | string | ForgotPasswordConfig
  /**
   * Sign up configuration.
   * - `true` — Internal flow (enterprise: platform service signup; community: disabled, use invite).
   * - `string` — External URL (renders a link only).
   */
  signUp?: boolean | string
  /**
   * Additional OAuth providers to register alongside the Imbrace provider.
   * The keys here should match `providerKey` in your social buttons.
   *
   * @example
   * ```ts
   * {
   *   extraProviders: {
   *     google: GoogleProvider({ ... }),
   *     microsoft: Oauth2Provider({ ... }),
   *   }
   * }
   * ```
   */
  extraProviders?: Record<string, Provider<any>>
  /**
   * Enterprise providers that use oidc_role_mapping.
   * Maps provider key to a claim extractor that knows how to
   * extract tenant_id and groups from the id_token claims.
   *
   * @example
   * ```ts
   * {
   *   enterpriseProviders: {
   *     "azure-ad": AZURE_AD_CLAIMS,
   *     "keycloak": KEYCLOAK_CLAIMS,
   *   }
   * }
   * ```
   */
  enterpriseProviders?: Record<string, EnterpriseClaimExtractor>
  /**
   * Optional callback to send an invite email when a member is invited (community mode).
   * If not provided, the invite link is shown in the admin UI for manual sharing.
   *
   * @example
   * ```ts
   * sendInviteEmail: async ({ to, inviteLink }) => {
   *   await transporter.sendMail({ to, subject: "You've been invited", text: inviteLink })
   * }
   * ```
   */
  sendInviteEmail?: (params: { to: string; inviteLink: string }) => Promise<void>
}

function decodeJwtPayload(token: string): Record<string, any> {
  const part = token.split(".")[1]
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"))
}

export function createIssuer(input: ImbraceIssuerInput) {
  const {
    roleProvider,
    storage,
    theme,
    socialProviders = [],
    forgotPassword,
    signUp,
    extraProviders = {},
    enterpriseProviders = {},
    sendInviteEmail,
  } = input

  // Resolve forgotPassword: `true` only works with PlatformServiceRoleProvider
  let resolvedForgotPassword: string | ForgotPasswordConfig | undefined
  if (
    forgotPassword === true &&
    roleProvider instanceof PlatformServiceRoleProvider
  ) {
    resolvedForgotPassword = {
      requestUrl: `${roleProvider.config.baseUrl}/forget`,
      resetUrl: `${roleProvider.config.baseUrl}/forget/reset`,
      timeout: roleProvider.config.timeout,
    }
  } else if (forgotPassword === true) {
    // Community mode: `true` not supported without platform service
    resolvedForgotPassword = undefined
  } else if (typeof forgotPassword === "string" || typeof forgotPassword === "object") {
    resolvedForgotPassword = forgotPassword || undefined
  }

  // Community mode: disable public signup (use invite flow instead)
  const resolvedSignUp =
    roleProvider instanceof LocalRoleProvider ? false : signUp

  // Only show social buttons whose provider is actually registered
  const activeSocialProviders = socialProviders.filter(
    (btn) => !btn.providerKey || btn.providerKey in extraProviders,
  )

  const app = issuer({
    subjects: imbraceSubjects,
    storage,
    theme,
    providers: {
      imbrace: createImbraceProvider({
        roleProvider,
        socialProviders: activeSocialProviders,
        forgotPassword: resolvedForgotPassword,
        signUp: resolvedSignUp,
      }),
      ...extraProviders,
    },
    allow: async () => true,
    success: async (ctx, value) => {
      if (value.provider === "imbrace") {
        // Imbrace provider already resolved the user via roleProvider
        return ctx.subject("user", {
          email: value.email,
          customer_id: value.customer_id,
          organizations: value.organizations,
        })
      }

      // Social provider (google, microsoft, ...): decode the id_token locally
      // (no re-verification needed — token came directly from provider over HTTPS),
      // then resolve via roleProvider.
      const socialValue = value as any
      const idToken = socialValue.tokenset?.raw?.id_token
      if (!idToken) {
        throw new Error(
          `Provider "${value.provider}" did not return an id_token. ` +
            `Ensure the provider requests the "openid" scope.`,
        )
      }

      const claims = decodeJwtPayload(idToken)
      // Azure AD uses "preferred_username" or "upn" instead of "email"
      const email =
        claims.email ?? claims.preferred_username ?? claims.upn
      console.log("[imbrace] OAuth flow success, decoded claims:", {
        email,
        name: claims.name,
        sub: claims.sub,
      })

      // Build provider data for roleProvider
      let providerData: Record<string, unknown> = {
        name: claims.name,
        provider_id: claims.sub,
      }

      const extractor = enterpriseProviders[value.provider]
      if (extractor) {
        // Enterprise provider: include tenant_id + groups for oidc_role_mapping
        providerData = {
          ...providerData,
          provider_type: value.provider,
          tenant_id: extractor.getTenantId(claims),
          groups: extractor.getGroups(claims),
        }
      }

      const user = await roleProvider.resolveUserRoles({
        email,
        providerType: value.provider,
        providerData,
      })

      if (!user) {
        throw new Error(
          `Social login with "${value.provider}" failed: user not found or not authorized.`,
        )
      }

      return ctx.subject("user", {
        email: user.email,
        customer_id: user.customer_id,
        organizations: user.organizations,
      })
    },
  })

  // Root-level redirect so the backend's verify endpoint
  // (which redirects to /reset-password?...) lands on /imbrace/reset-password
  if (
    resolvedForgotPassword &&
    typeof resolvedForgotPassword !== "string"
  ) {
    app.get("/reset-password", (c) => {
      const url = new URL(c.req.url)
      return c.redirect(`/imbrace/reset-password${url.search}`)
    })
  }

  // ---------------------------------------------------------------------------
  // Community API routes — only mounted when using LocalRoleProvider
  // ---------------------------------------------------------------------------
  if (roleProvider instanceof LocalRoleProvider) {
    mountCommunityRoutes(app, roleProvider, sendInviteEmail)
  }

  return app
}

// ---------------------------------------------------------------------------
// Community routes — JWT-protected admin + public setup/invite activation
// ---------------------------------------------------------------------------

function getLanguageFromRequest(c: any): string {
  const cookieLang = getCookie(c, "imbrace_lang")
  if (cookieLang && ["en", "zh", "cn"].includes(cookieLang)) return cookieLang
  const accept = c.req.header("Accept-Language") || ""
  if (accept.includes("zh-HK") || accept.includes("zh-TW") || accept.includes("zh-Hant")) return "zh"
  if (accept.includes("zh-CN") || accept.includes("zh-Hans") || accept.includes("zh")) return "cn"
  return "en"
}

function renderHtml(jsx: any): Response {
  return new Response(jsx.toString(), {
    headers: { "Content-Type": "text/html" },
  })
}

/** Build /authorize redirect URL with proper full redirect_uri */
function authorizeRedirect(c: any, nextPath: string = "/admin/members"): string {
  const origin = new URL(c.req.url).origin
  // Always go through /admin/callback which exchanges code → sets cookie → redirects to nextPath
  // next is a plain path like "/admin/members" — no extra encoding needed
  const redirectUri = encodeURIComponent(`${origin}/admin/callback?next=${nextPath}`)
  return `/authorize?client_id=admin&response_type=code&redirect_uri=${redirectUri}`
}

/**
 * Verify a Bearer JWT and extract the user payload.
 * Returns null if verification fails (no token, invalid, not owner).
 */
async function verifyOwnerJwt(
  c: any,
): Promise<{
  userId: string
  email: string
  organizations: ImbraceOrganization[]
} | null> {
  const auth = c.req.header("Authorization") || ""
  const cookieToken = getCookie(c, "admin_token")
  const token = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : cookieToken || null
  if (!token) return null

  try {
    // Use the internal port for JWKS fetch and issuer verification so this works
    // correctly behind a reverse proxy or Docker port mapping.
    // The JWT's "iss" claim is always the internal origin (what the server knows itself as).
    const port = process.env.PORT || "3100"
    const issuerUrl = `http://localhost:${port}`

    const jwksUrl = new URL(`${issuerUrl}/.well-known/jwks.json`)
    const jwks = createRemoteJWKSet(jwksUrl as any)
    const result = await jwtVerify<{
      mode: string
      type: string
      properties: {
        email: string
        customer_id: string
        organizations: ImbraceOrganization[]
      }
    }>(token, jwks, { issuer: issuerUrl })

    if (result.payload.mode !== "access" || result.payload.type !== "user") {
      return null
    }

    const { email, customer_id, organizations } = result.payload.properties
    // Check if user has owner role in any org
    const isOwner = organizations.some((org) => org.role === "owner")
    if (!isOwner) return null

    return { userId: customer_id, email, organizations }
  } catch (err: any) {
    console.error("[imbrace] JWT verification failed:", err?.message)
    return null
  }
}

function mountCommunityRoutes(
  app: any,
  roleProvider: LocalRoleProvider,
  sendInviteEmail?: (params: { to: string; inviteLink: string }) => Promise<void>,
) {
  // =========================================================================
  // OAuth callback — exchanges code for token, sets cookie, redirects
  // =========================================================================

  app.get("/admin/callback", async (c: any) => {
    const url = new URL(c.req.url)
    const code = url.searchParams.get("code")
    const next = url.searchParams.get("next") || "/admin/members"

    if (!code) {
      return c.redirect(authorizeRedirect(c))
    }

    try {
      // Use the public origin for redirect_uri (must match what was registered),
      // but use an internal localhost URL for the actual token fetch so it works
      // correctly even behind a reverse proxy or port mapping.
      const origin = url.origin
      const port = process.env.PORT || "3100"
      const internalBase = `http://localhost:${port}`
      const tokenRes = await fetch(`${internalBase}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "admin",
          code,
          // redirect_uri must match exactly what was registered in /authorize
          redirect_uri: `${origin}/admin/callback?next=${next}`,
        }).toString(),
      })

      if (!tokenRes.ok) {
        console.error("[imbrace] Token exchange failed:", await tokenRes.text())
        return c.redirect(authorizeRedirect(c))
      }

      const tokens = (await tokenRes.json()) as { access_token: string; refresh_token?: string }

      // Set admin_token cookie (httpOnly, 30 days)
      const headers = new Headers()
      headers.append("Set-Cookie", `admin_token=${tokens.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`)
      if (tokens.refresh_token) {
        headers.append("Set-Cookie", `admin_refresh=${tokens.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`)
      }
      headers.set("Location", next)
      return new Response(null, { status: 302, headers })
    } catch (err: any) {
      console.error("[imbrace] Callback error:", err?.message)
      return c.redirect(authorizeRedirect(c))
    }
  })

  // =========================================================================
  // Public routes — no auth required
  // =========================================================================

  // GET /api/setup/status — check if initial owner has been created
  app.get("/api/setup/status", async (c: any) => {
    const complete = await roleProvider.isSetupComplete()
    return c.json({ complete })
  })

  // POST /api/setup/owner — create the first owner account (JSON API)
  app.post("/api/setup/owner", async (c: any) => {
    try {
      const body = await c.req.json()
      const { email, password } = body
      if (!email || !password) {
        return c.json({ error: "Email and password are required." }, 400)
      }
      if (password.length < 6) {
        return c.json(
          { error: "Password must be at least 6 characters." },
          400,
        )
      }
      await roleProvider.setupOwner(email, password)
      return c.json({ ok: true }, 201)
    } catch (err: any) {
      return c.json({ error: err.message }, 400)
    }
  })

  // --- Setup owner UI routes ---
  app.get("/setup", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const complete = await roleProvider.isSetupComplete()
    if (complete) {
      return c.redirect(authorizeRedirect(c))
    }
    return renderHtml(<ImbraceSetupOwnerForm lang={lang} />)
  })

  app.post("/setup", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const fd = await c.req.formData()
    const action = fd.get("action")?.toString()

    if (action === "setup_owner") {
      const email = fd.get("email")?.toString()?.toLowerCase()?.trim()
      const password = fd.get("password")?.toString()

      if (!email || !password) {
        return renderHtml(
          <ImbraceSetupOwnerForm error="Email and password are required." lang={lang} />,
        )
      }
      if (password.length < 6) {
        return renderHtml(
          <ImbraceSetupOwnerForm error="Password must be at least 6 characters." lang={lang} />,
        )
      }

      try {
        await roleProvider.setupOwner(email, password)
        return renderHtml(<ImbraceSetupOwnerSuccess lang={lang} />)
      } catch (err: any) {
        return renderHtml(
          <ImbraceSetupOwnerForm error={err.message} lang={lang} />,
        )
      }
    }

    return renderHtml(<ImbraceSetupOwnerForm lang={lang} />)
  })

  // --- Invite activation UI routes (public — invited user sets password) ---
  app.get("/invite/:token", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const token = c.req.param("token")
    return renderHtml(<ImbraceInviteActivateForm token={token} lang={lang} />)
  })

  app.post("/invite/:token", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const token = c.req.param("token")
    const fd = await c.req.formData()
    const password = fd.get("password")?.toString()

    if (!password) {
      return renderHtml(
        <ImbraceInviteActivateForm
          token={token}
          error="Password is required."
          lang={lang}
        />,
      )
    }
    if (password.length < 6) {
      return renderHtml(
        <ImbraceInviteActivateForm
          token={token}
          error="Password must be at least 6 characters."
          lang={lang}
        />,
      )
    }

    try {
      await roleProvider.activateUser(token, password)
      return renderHtml(<ImbraceInviteActivateSuccess lang={lang} />)
    } catch (err: any) {
      return renderHtml(
        <ImbraceInviteActivateForm
          token={token}
          error={err.message}
          lang={lang}
        />,
      )
    }
  })

  // --- JSON API for invite validation/activation (backwards compat) ---
  app.get("/api/invite/:token", async (c: any) => {
    const token = c.req.param("token")
    return c.json({ valid: true, token })
  })

  app.post("/api/invite/:token/activate", async (c: any) => {
    try {
      const token = c.req.param("token")
      const body = await c.req.json()
      const { password } = body
      if (!password) {
        return c.json({ error: "Password is required." }, 400)
      }
      if (password.length < 6) {
        return c.json(
          { error: "Password must be at least 6 characters." },
          400,
        )
      }
      await roleProvider.activateUser(token, password)
      return c.json({ ok: true })
    } catch (err: any) {
      return c.json({ error: err.message }, 400)
    }
  })

  // =========================================================================
  // Protected routes — require owner JWT
  // =========================================================================

  // --- Admin panel UI routes ---
  app.get("/admin/members", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.redirect(authorizeRedirect(c, "/admin/members"))
    }

    const users = await roleProvider.listUsers()
    return renderHtml(
      <ImbraceAdminPanel
        members={users}
        currentUserId={owner.userId}
        lang={lang}
      />,
    )
  })

  app.post("/admin/members", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.redirect(authorizeRedirect(c, "/admin/members"))
    }

    const fd = await c.req.formData()
    const action = fd.get("action")?.toString()
    const userId = fd.get("userId")?.toString()

    let error: string | undefined
    let success: string | undefined

    try {
      if (action === "remove" && userId) {
        await roleProvider.removeUser(userId)
        success = "Member removed successfully."
      } else if (action === "change_role" && userId) {
        const role = fd.get("role")?.toString()
        if (role) {
          await roleProvider.changeUserRole(userId, role)
          success = "Role updated successfully."
        }
      }
    } catch (err: any) {
      error = err.message
    }

    const users = await roleProvider.listUsers()
    return renderHtml(
      <ImbraceAdminPanel
        members={users}
        currentUserId={owner.userId}
        error={error}
        success={success}
        lang={lang}
      />,
    )
  })

  // --- Invite form UI routes (owner only) ---
  app.get("/admin/invite", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.redirect(authorizeRedirect(c, "/admin/invite"))
    }
    return renderHtml(<ImbraceInviteForm lang={lang} />)
  })

  app.post("/admin/invite", async (c: any) => {
    const lang = getLanguageFromRequest(c)
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.redirect(authorizeRedirect(c, "/admin/invite"))
    }

    const fd = await c.req.formData()
    const email = fd.get("email")?.toString()?.toLowerCase()?.trim()

    if (!email) {
      return renderHtml(<ImbraceInviteForm error="Email is required." lang={lang} />)
    }

    try {
      const { inviteToken } = await roleProvider.inviteUser(email, "member")
      const baseUrl = new URL(c.req.url).origin
      const inviteLink = `${baseUrl}/invite/${inviteToken}`

      if (sendInviteEmail) {
        try {
          await sendInviteEmail({ to: email, inviteLink })
        } catch (mailErr: any) {
          console.error("[imbrace] Failed to send invite email:", mailErr?.message)
          // Fall through — still show success with link so owner can share manually
        }
      }

      const emailSent = !!sendInviteEmail
      return renderHtml(<ImbraceInviteSuccess inviteLink={inviteLink} lang={lang} emailSent={emailSent} emailTo={email} />)
    } catch (err: any) {
      return renderHtml(<ImbraceInviteForm error={err.message} lang={lang} />)
    }
  })

  // --- JSON API routes (protected — require owner JWT) ---
  app.get("/api/members", async (c: any) => {
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.json({ error: "Unauthorized. Owner access required." }, 401)
    }
    const users = await roleProvider.listUsers()
    return c.json({ members: users })
  })

  app.post("/api/invite", async (c: any) => {
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.json({ error: "Unauthorized. Owner access required." }, 401)
    }
    try {
      const body = await c.req.json()
      const email = body.email
      if (!email) {
        return c.json({ error: "Email is required." }, 400)
      }
      const { inviteToken } = await roleProvider.inviteUser(email, "member")
      const baseUrl = new URL(c.req.url).origin
      const inviteLink = `${baseUrl}/invite/${inviteToken}`
      return c.json({ inviteToken, inviteLink }, 201)
    } catch (err: any) {
      return c.json({ error: err.message }, 400)
    }
  })

  app.delete("/api/members/:userId", async (c: any) => {
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.json({ error: "Unauthorized. Owner access required." }, 401)
    }
    try {
      const userId = c.req.param("userId")
      await roleProvider.removeUser(userId)
      return c.json({ ok: true })
    } catch (err: any) {
      return c.json({ error: err.message }, 400)
    }
  })

  app.patch("/api/members/:userId/role", async (c: any) => {
    const owner = await verifyOwnerJwt(c)
    if (!owner) {
      return c.json({ error: "Unauthorized. Owner access required." }, 401)
    }
    try {
      const userId = c.req.param("userId")
      const body = await c.req.json()
      const { role } = body
      if (!role) {
        return c.json({ error: "Role is required." }, 400)
      }
      await roleProvider.changeUserRole(userId, role)
      return c.json({ ok: true })
    } catch (err: any) {
      return c.json({ error: err.message }, 400)
    }
  })
}
