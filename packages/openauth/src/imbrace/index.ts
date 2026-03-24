/**
 * Imbrace module for OpenAuth.
 *
 * ```ts
 * import { createIssuer, imbraceSubjects, GOOGLE_BUTTON } from "@openauthjs/openauth/imbrace"
 * ```
 *
 * @packageDocumentation
 */
export {
  createIssuer,
  type ImbraceIssuerInput,
  type EnterpriseClaimExtractor,
  AZURE_AD_CLAIMS,
  KEYCLOAK_CLAIMS,
  OKTA_CLAIMS,
  GENERIC_OIDC_CLAIMS,
} from "./issuer.js"
export {
  imbraceSubjects,
  type ImbraceUserProperties,
  type ImbraceOrganization,
} from "./subjects.js"
export {
  createImbraceProvider,
  type ImbraceProviderConfig,
  type ForgotPasswordConfig,
} from "./provider.js"
export {
  type RoleProvider,
  type RoleProviderInput,
  type ResolvedUserContext,
  type ResolvedOrganization,
} from "./role-provider.js"
export {
  PlatformServiceRoleProvider,
  type PlatformServiceConfig,
} from "./providers/platform-service-role-provider.js"
export {
  LocalRoleProvider,
  type LocalRoleProviderOptions,
  type LocalRole,
} from "./providers/local-role-provider.js"
export {
  GOOGLE_BUTTON,
  MICROSOFT_BUTTON,
  AZURE_AD_BUTTON,
  KEYCLOAK_BUTTON,
  OKTA_BUTTON,
  AUTHENTIK_BUTTON,
  type SocialProviderButton,
  ImbracePasswordUI,
  type ImbracePasswordUIOptions,
  ImbraceSetupOwnerForm,
  ImbraceSetupOwnerSuccess,
  ImbraceAdminPanel,
  type AdminMember,
  ImbraceInviteForm,
  ImbraceInviteSuccess,
  ImbraceInviteActivateForm,
  ImbraceInviteActivateSuccess,
} from "../ui/imbrace.js"
