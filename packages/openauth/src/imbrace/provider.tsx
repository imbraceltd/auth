/**
 * Custom Imbrace authentication provider.
 *
 * Supports:
 * - Email + password login (via RoleProvider)
 * - OTP (one-time password) flow (via PlatformServiceRoleProvider only)
 * - Social provider buttons (links to separately registered OAuth providers)
 * - Forgot / reset password flow (via PlatformServiceRoleProvider or external URL)
 *
 * @packageDocumentation
 */
/** @jsxImportSource hono/jsx */
import { Context } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { Provider } from "../provider/provider.js"
import type { ImbraceUserProperties } from "./subjects.js"
import type { RoleProvider } from "./role-provider.js"
import { PlatformServiceRoleProvider } from "./providers/platform-service-role-provider.js"
import { LocalRoleProvider } from "./providers/local-role-provider.js"
import {
  ImbraceLoginForm,
  ImbraceOtpEmailForm,
  ImbraceOtpVerifyForm,
  ImbraceForgotPasswordForm,
  ImbraceForgotPasswordSuccess,
  ImbraceResetPasswordForm,
  ImbraceResetPasswordSuccess,
  ImbraceSignupForm,
  ImbraceVerifyEmailForm,
  type SocialProviderButton,
  type ImbraceLoginFormProps,
} from "../ui/imbrace.js"

// ---------------------------------------------------------------------------
// Forgot / Reset password backend config
// ---------------------------------------------------------------------------

export interface ForgotPasswordConfig {
  /**
   * Full URL of the backend API endpoint that sends the reset email.
   * Called as: `GET {requestUrl}?email=...`
   *
   * @example "https://dev-app-api.imbrace.co/v1/login/forget"
   */
  requestUrl: string
  /**
   * Full URL of the backend API endpoint that resets the password.
   * Called as: `POST {resetUrl}` with JSON body `{ email, verify_code, password }`
   *
   * @example "https://dev-app-api.imbrace.co/v1/login/forget/reset"
   */
  resetUrl: string
  /**
   * Request timeout in milliseconds.
   * @default 10000
   */
  timeout?: number
}

async function callPlatformForgetPassword(
  config: ForgotPasswordConfig,
  email: string,
): Promise<{
  ok: boolean
  errorType?: "not_found" | "rate_limit" | "server_error"
}> {
  const timeout = config.timeout ?? 10_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const url = `${config.requestUrl}?email=${encodeURIComponent(email)}`
    const res = await fetch(url, { signal: controller.signal })
    if (res.ok) return { ok: true }

    if (res.status === 400) {
      const text = await res.text().catch(() => "")
      if (text.includes("limit")) return { ok: false, errorType: "rate_limit" }
      return { ok: false, errorType: "not_found" }
    }
    return { ok: false, errorType: "server_error" }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error(`[imbrace] forgetPassword timeout after ${timeout}ms`)
    } else {
      console.error("[imbrace] forgetPassword error:", err?.message)
    }
    return { ok: false, errorType: "server_error" }
  } finally {
    clearTimeout(timer)
  }
}

async function callPlatformResetPassword(
  config: ForgotPasswordConfig,
  params: { email: string; verify_code: string; password: string },
): Promise<{ ok: boolean; errorType?: "invalid_code" | "server_error" }> {
  const timeout = config.timeout ?? 10_000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(config.resetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    })
    if (res.ok) return { ok: true }
    if (res.status === 400) return { ok: false, errorType: "invalid_code" }
    return { ok: false, errorType: "server_error" }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error(`[imbrace] resetPassword timeout after ${timeout}ms`)
    } else {
      console.error("[imbrace] resetPassword error:", err?.message)
    }
    return { ok: false, errorType: "server_error" }
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------
// Imbrace provider factory
// ---------------------------------------------------------------------------

interface OtpSession {
  email: string
}

export interface ImbraceProviderConfig {
  roleProvider: RoleProvider
  socialProviders?: SocialProviderButton[]
  /**
   * Forgot password configuration. Omit to hide the "Forgot password?" link.
   * - `string` — URL to an external forgot password page (renders a link only).
   * - `ForgotPasswordConfig` — Internal flow with explicit URLs.
   */
  forgotPassword?: string | ForgotPasswordConfig
  /**
   * Sign up configuration.
   * - `true` — Internal flow (enterprise only, via PlatformServiceRoleProvider).
   * - `string` — External URL (renders a link only).
   * - `false` — Disabled (community mode uses invite flow).
   */
  signUp?: boolean | string
}

function getLanguage(c: Context): string {
  // 1. Query Param 'lang'
  const queryLang = c.req.query("lang")
  if (queryLang && ["en", "zh", "cn"].includes(queryLang)) {
    setCookie(c, "imbrace_lang", queryLang, { maxAge: 31536000, path: "/" })
    return queryLang
  }

  // 2. OIDC Standard 'ui_locales'
  const locales = c.req.query("ui_locales")
  if (locales) {
    const list = locales.split(" ")
    for (const l of list) {
      const code = l.split("-")[0].toLowerCase()
      if (code === "en") return "en"
      if (code === "cn") return "cn"
      if (code === "zh") {
        // Traditional (zh) if HK/TW/Hant/MO, or if just "zh"
        if (
          l.includes("HK") ||
          l.includes("TW") ||
          l.includes("Hant") ||
          l.includes("MO") ||
          l === "zh"
        )
          return "zh"
        return "cn"
      }
    }
  }

  // 3. Cookie
  const cookieLang = getCookie(c, "imbrace_lang")
  if (cookieLang && ["en", "zh", "cn"].includes(cookieLang)) {
    return cookieLang
  }

  // 4. Accept-Language Header
  const accept = c.req.header("Accept-Language") || ""
  if (
    accept.includes("zh-HK") ||
    accept.includes("zh-TW") ||
    accept.includes("zh-Hant")
  )
    return "zh"
  if (
    accept.includes("zh-CN") ||
    accept.includes("zh-Hans") ||
    accept.includes("zh")
  )
    return "cn"

  return "en"
}

function renderResponse(jsx: any): Response {
  return new Response(jsx.toString(), {
    headers: { "Content-Type": "text/html" },
  })
}

export function createImbraceProvider(
  config: ImbraceProviderConfig,
): Provider<ImbraceUserProperties> {
  const { roleProvider, socialProviders = [], forgotPassword, signUp } = config

  // Check if we have platform service (enterprise) capabilities
  const platformProvider =
    roleProvider instanceof PlatformServiceRoleProvider ? roleProvider : null
  const localProvider =
    roleProvider instanceof LocalRoleProvider ? roleProvider : null

  const signUpUrl =
    typeof signUp === "string" ? signUp : signUp === true ? "signup" : undefined

  // Resolve forgotPassword config
  const resolvedForgotPassword: ForgotPasswordConfig | string | undefined =
    typeof forgotPassword === "object"
      ? forgotPassword
      : typeof forgotPassword === "string"
        ? forgotPassword
        : undefined

  const forgotPasswordUrl =
    typeof resolvedForgotPassword === "string"
      ? resolvedForgotPassword
      : resolvedForgotPassword
        ? "forgot-password"
        : undefined

  const formProps: Omit<ImbraceLoginFormProps, "error"> = {
    social: socialProviders,
    forgotPasswordUrl,
    signUpUrl,
  }

  return {
    type: "imbrace",
    init(routes, ctx) {
      routes.get("/authorize", async (c) => {
        // Community mode: redirect to setup if owner not yet created
        if (localProvider) {
          const complete = await localProvider.isSetupComplete()
          if (!complete) {
            return c.redirect("/setup")
          }
        }

        const url = new URL(c.req.url)
        const langParam = url.searchParams.get("lang")
        const uiLocalesParam = url.searchParams.get("ui_locales")

        // If language passed in query, set cookie and redirect to "clean" URL
        if (langParam || uiLocalesParam) {
          const lang = getLanguage(c)
          url.searchParams.delete("lang")
          url.searchParams.delete("ui_locales")
          // Set cookie manually here since we are redirecting before getLanguage normally would
          setCookie(c, "imbrace_lang", lang, { maxAge: 31536000, path: "/" })
          return c.redirect(url.pathname + url.search)
        }

        const lang = getLanguage(c)
        const view = url.searchParams.get("view")
        const jsx =
          view === "otp" ? (
            <ImbraceOtpEmailForm lang={lang} />
          ) : (
            <ImbraceLoginForm {...formProps} lang={lang} />
          )
        return ctx.forward(c, renderResponse(jsx))
      })

      routes.post("/authorize", async (c) => {
        const lang = getLanguage(c)
        const fd = await c.req.formData()
        const action = fd.get("action")?.toString()

        // --- Email + Password login ---
        if (action === "login") {
          const email = fd.get("email")?.toString()?.toLowerCase()?.trim()
          const password = fd.get("password")?.toString()
          if (!email || !password) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceLoginForm
                  {...formProps}
                  lang={lang}
                  error="Email and password are required."
                />,
              ),
            )
          }

          const user = await roleProvider.resolveUserRoles({
            email,
            providerType: "password",
            providerData: { password },
          })
          if (!user) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceLoginForm
                  {...formProps}
                  lang={lang}
                  error="Invalid email or password."
                />,
              ),
            )
          }

          return ctx.success(c, {
            email: user.email,
            customer_id: user.customer_id,
            organizations: user.organizations,
          })
        }

        // --- Request OTP (enterprise only) ---
        if (action === "request_otp" || action === "request") {
          const email = fd.get("email")?.toString()?.toLowerCase()?.trim()
          if (!email) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpEmailForm
                  lang={lang}
                  error="Please enter a valid email."
                />,
              ),
            )
          }

          if (!platformProvider) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpEmailForm
                  lang={lang}
                  error="OTP login is not available in community mode."
                />,
              ),
            )
          }

          const ok = await platformProvider.callSendOtp(email)
          if (!ok) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpEmailForm
                  lang={lang}
                  error="Could not send OTP. Please try again."
                />,
              ),
            )
          }

          await ctx.set<OtpSession>(c, "imbrace_otp", 600, { email })
          return ctx.forward(
            c,
            renderResponse(<ImbraceOtpVerifyForm email={email} lang={lang} />),
          )
        }

        // --- Verify OTP (enterprise only) ---
        if (action === "verify_otp" || action === "verify") {
          const session = await ctx.get<OtpSession>(c, "imbrace_otp")
          if (!session?.email) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpEmailForm
                  lang={lang}
                  error="Session expired. Please start over."
                />,
              ),
            )
          }

          const otp = fd.get("otp")?.toString()?.trim()
          if (!otp) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpVerifyForm
                  email={session.email}
                  lang={lang}
                  error="Please enter the OTP."
                />,
              ),
            )
          }

          const user = await roleProvider.resolveUserRoles({
            email: session.email,
            providerType: "otp",
            providerData: { otp },
          })
          if (!user) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceOtpVerifyForm
                  email={session.email}
                  lang={lang}
                  error="Invalid or expired OTP."
                />,
              ),
            )
          }

          await ctx.unset(c, "imbrace_otp")
          return ctx.success(c, {
            email: user.email,
            customer_id: user.customer_id,
            organizations: user.organizations,
          })
        }

        // --- Fallback ---
        return ctx.forward(
          c,
          renderResponse(<ImbraceLoginForm {...formProps} lang={lang} />),
        )
      })

      // -----------------------------------------------------------------
      // Forgot / Reset password routes (only when config is provided)
      // -----------------------------------------------------------------
      if (
        typeof resolvedForgotPassword === "object" &&
        resolvedForgotPassword
      ) {
        const fpConfig = resolvedForgotPassword

        routes.get("/forgot-password", async (c) => {
          const lang = getLanguage(c)
          return ctx.forward(
            c,
            renderResponse(
              <ImbraceForgotPasswordForm signUpUrl={signUpUrl} lang={lang} />,
            ),
          )
        })

        routes.post("/forgot-password", async (c) => {
          const lang = getLanguage(c)
          const fd = await c.req.formData()
          const email = fd.get("email")?.toString()?.toLowerCase()?.trim()

          if (!email) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceForgotPasswordForm
                  error="Please enter a valid email."
                  signUpUrl={signUpUrl}
                  lang={lang}
                />,
              ),
            )
          }

          const result = await callPlatformForgetPassword(fpConfig, email)

          if (result.ok) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceForgotPasswordSuccess email={email} lang={lang} />,
              ),
            )
          }

          let errorMsg: string
          switch (result.errorType) {
            case "rate_limit":
              errorMsg =
                "Please wait 15 minutes before requesting another reset email."
              break
            case "not_found":
              errorMsg = "No account found with this email address."
              break
            default:
              errorMsg = "Something went wrong. Please try again later."
          }

          return ctx.forward(
            c,
            renderResponse(
              <ImbraceForgotPasswordForm
                error={errorMsg}
                signUpUrl={signUpUrl}
                lang={lang}
              />,
            ),
          )
        })

        routes.get("/reset-password", async (c) => {
          const lang = getLanguage(c)
          const url = new URL(c.req.url)
          const email = url.searchParams.get("email") ?? ""
          const verifyCode = url.searchParams.get("verify_code") ?? ""

          if (!email || !verifyCode) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceResetPasswordForm
                  email=""
                  verifyCode=""
                  error="Invalid or expired reset link."
                  lang={lang}
                />,
              ),
            )
          }

          return ctx.forward(
            c,
            renderResponse(
              <ImbraceResetPasswordForm
                email={email}
                verifyCode={verifyCode}
                lang={lang}
              />,
            ),
          )
        })

        routes.post("/reset-password", async (c) => {
          const lang = getLanguage(c)
          const fd = await c.req.formData()
          const email = fd.get("email")?.toString()
          const verifyCode = fd.get("verify_code")?.toString()
          const password = fd.get("password")?.toString()

          if (!email || !verifyCode) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceResetPasswordForm
                  email=""
                  verifyCode=""
                  error="Invalid reset link."
                  lang={lang}
                />,
              ),
            )
          }

          if (!password || password.length < 6) {
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceResetPasswordForm
                  email={email}
                  verifyCode={verifyCode}
                  error="Password must be at least 6 characters."
                  lang={lang}
                />,
              ),
            )
          }

          const result = await callPlatformResetPassword(fpConfig, {
            email,
            verify_code: verifyCode,
            password,
          })

          if (result.ok) {
            return ctx.forward(
              c,
              renderResponse(<ImbraceResetPasswordSuccess lang={lang} />),
            )
          }

          const errorMsg =
            result.errorType === "invalid_code"
              ? "Invalid or expired reset link. Please request a new one."
              : "Something went wrong. Please try again later."

          return ctx.forward(
            c,
            renderResponse(
              <ImbraceResetPasswordForm
                email={email}
                verifyCode={verifyCode}
                error={errorMsg}
                lang={lang}
              />,
            ),
          )
        })
      }

      // -----------------------------------------------------------------
      // Sign up flow (enterprise only — community uses invite)
      // -----------------------------------------------------------------
      if (signUp === true && platformProvider) {
        routes.get("/signup", async (c) => {
          const lang = getLanguage(c)
          return ctx.forward(
            c,
            renderResponse(<ImbraceSignupForm lang={lang} />),
          )
        })

        routes.post("/signup", async (c) => {
          const lang = getLanguage(c)
          const fd = await c.req.formData()
          const action = fd.get("action")?.toString()

          if (action === "signup") {
            const email = fd.get("email")?.toString()?.toLowerCase()?.trim()
            const password = fd.get("password")?.toString()

            if (!email || !password) {
              return ctx.forward(
                c,
                renderResponse(
                  <ImbraceSignupForm
                    error="Email and password are required."
                    lang={lang}
                  />,
                ),
              )
            }

            const ok = await platformProvider.callSignup({
              email,
              password,
            })
            if (!ok) {
              return ctx.forward(
                c,
                renderResponse(
                  <ImbraceSignupForm
                    error="Provided email already in use. Please use a different one or log in."
                    lang={lang}
                  />,
                ),
              )
            }

            return ctx.forward(
              c,
              renderResponse(
                <ImbraceVerifyEmailForm email={email} lang={lang} />,
              ),
            )
          }

          if (action === "resend_verification") {
            const email = fd.get("email")?.toString()
            if (email) {
              await platformProvider.callResendVerification(email)
            }
            return ctx.forward(
              c,
              renderResponse(
                <ImbraceVerifyEmailForm email={email || ""} lang={lang} />,
              ),
            )
          }

          if (action === "verify_email") {
            const email = fd.get("email")?.toString()
            if (!email) {
              return ctx.forward(
                c,
                renderResponse(
                  <ImbraceSignupForm error="Invalid session." lang={lang} />,
                ),
              )
            }

            const user = await platformProvider.callCheckVerification(email)
            if (!user) {
              return ctx.forward(
                c,
                renderResponse(
                  <ImbraceVerifyEmailForm
                    email={email}
                    lang={lang}
                    error="Email not verified yet. Please click the link in your email."
                  />,
                ),
              )
            }

            return ctx.success(c, {
              email: user.email,
              customer_id: user.customer_id,
              organizations: user.organizations,
            })
          }

          return ctx.forward(
            c,
            renderResponse(<ImbraceSignupForm lang={lang} />),
          )
        })
      }
    },
  }
}
