/**
 * Imbrace Auth Service — Entry Point
 *
 * Run:
 *   cp .env.example .env   # fill in your values
 *   bun --hot issuer.ts
 *
 * Then open:
 *   http://localhost:3000/authorize?client_id=test&response_type=code&redirect_uri=http://localhost:3000
 *
 * Mode:
 *   - Enterprise (set PLATFORM_SERVICE_URL): delegates to platform service
 *   - Community  (no PLATFORM_SERVICE_URL):  local user management (owner/member)
 */
import {
  createIssuer,
  PlatformServiceRoleProvider,
  LocalRoleProvider,
  GOOGLE_BUTTON,
  MICROSOFT_BUTTON,
  AZURE_AD_BUTTON,
  KEYCLOAK_BUTTON,
  AZURE_AD_CLAIMS,
  KEYCLOAK_CLAIMS,
} from "@imbrace/openauth/imbrace"
import nodemailer from "nodemailer"
import { GoogleProvider } from "@imbrace/openauth/provider/google"
import { MicrosoftProvider } from "@imbrace/openauth/provider/microsoft"
import { KeycloakProvider } from "@imbrace/openauth/provider/keycloak"
import { THEME_IMBRACE } from "@imbrace/openauth/ui/theme"
import { MemoryStorage } from "@imbrace/openauth/storage/memory"
import { PostgresStorage } from "@imbrace/openauth/storage/postgres"
import { MongoDBStorage } from "@imbrace/openauth/storage/mongodb"
import { MySQLStorage } from "@imbrace/openauth/storage/mysql"
import type { StorageAdapter } from "@imbrace/openauth/storage/storage"

function getStorage(): StorageAdapter {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return MemoryStorage({ persist: "./persist.json" })

  const dbType = process.env.DATABASE_TYPE
  switch (dbType) {
    case "postgres":
      return PostgresStorage({ connectionString: dbUrl, table: "openauth_data" })
    case "mongodb":
      return MongoDBStorage({ connectionString: dbUrl, database: process.env.DATABASE_NAME ?? "imbrace" })
    case "mysql":
      return MySQLStorage({ connectionString: dbUrl, table: "openauth_data" })
    default:
      throw new Error(
        `DATABASE_URL is set but DATABASE_TYPE is "${dbType ?? ""}" — must be "postgres", "mongodb", or "mysql".`,
      )
  }
}

const storage = getStorage()

// --- Email sender (optional — only if SMTP env vars are configured) ---
function makeSendInviteEmail() {
  const { SMTP_ADDRESS, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SENDER } = process.env
  if (!SMTP_ADDRESS || !SMTP_USERNAME || !SMTP_PASSWORD) return undefined

  const transporter = nodemailer.createTransport({
    host: SMTP_ADDRESS,
    port: parseInt(SMTP_PORT ?? "587", 10),
    secure: false, // STARTTLS
    auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
  })

  return async ({ to, inviteLink }: { to: string; inviteLink: string }) => {
    await transporter.sendMail({
      from: SMTP_SENDER ?? SMTP_USERNAME,
      to,
      subject: "You've been invited to iMBrace",
      text: `You have been invited to join iMBrace.\n\nClick the link below to set up your account:\n\n${inviteLink}\n\nThis link is single-use and will expire after you activate your account.`,
      html: `<p>You have been invited to join <strong>iMBrace</strong>.</p><p>Click the link below to set up your account:</p><p><a href="${inviteLink}">${inviteLink}</a></p><p style="color:#6b7280;font-size:12px">This link is single-use and will expire after you activate your account.</p>`,
    })
  }
}

// --- Role Provider ---
// Enterprise: set PLATFORM_SERVICE_URL to delegate to platform service
// Community:  leave unset for local user management (owner/member)
const platformServiceUrl = process.env.PLATFORM_SERVICE_URL

const roleProvider = platformServiceUrl
  ? new PlatformServiceRoleProvider({
      baseUrl: platformServiceUrl,
      timeout: 10_000,
    })
  : new LocalRoleProvider({ storage })

export default createIssuer({
  roleProvider,
  storage,
  theme: THEME_IMBRACE,
  sendInviteEmail: makeSendInviteEmail(),

  // Social provider buttons — these will show on the login form.
  // They only work if you also register the actual providers in extraProviders.
  socialProviders: [
    GOOGLE_BUTTON,
    MICROSOFT_BUTTON,
    AZURE_AD_BUTTON,
    KEYCLOAK_BUTTON,
  ],

  // Forgot password (enterprise: platform service, community: disabled)
  forgotPassword: true,

  // Signup — enterprise: platform service, community: auto-disabled (uses invite)
  signUp: true,

  // Social OAuth providers — only registered when credentials are provided.
  extraProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: GoogleProvider({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            scopes: ["openid", "email", "profile"],
          }),
        }
      : {}),
    ...(process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET
      ? {
          microsoft: MicrosoftProvider({
            tenant: "common",
            clientID: process.env.MS_CLIENT_ID,
            clientSecret: process.env.MS_CLIENT_SECRET,
            scopes: ["openid", "email", "profile"],
          }),
        }
      : {}),
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET
      ? {
          "azure-ad": MicrosoftProvider({
            tenant: process.env.AZURE_AD_TENANT || "organizations",
            clientID: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            scopes: ["openid", "email", "profile"],
          }),
        }
      : {}),
    ...(process.env.KEYCLOAK_BASE_URL && process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET
      ? {
          keycloak: KeycloakProvider({
            baseUrl: process.env.KEYCLOAK_BASE_URL,
            realm: process.env.KEYCLOAK_REALM || "master",
            clientID: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
            scopes: ["openid", "email", "profile"],
          }),
        }
      : {}),
  },

  // Enterprise providers — use oidc_role_mapping for group-based authorization
  enterpriseProviders: {
    ...(process.env.AZURE_AD_CLIENT_ID ? { "azure-ad": AZURE_AD_CLAIMS } : {}),
    ...(process.env.KEYCLOAK_BASE_URL ? { keycloak: KEYCLOAK_CLAIMS } : {}),
  },
})
