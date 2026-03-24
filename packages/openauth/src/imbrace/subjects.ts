/**
 * Shared subject schema for Imbrace projects.
 *
 * Import this in both your issuer and client apps to get type-safe JWT payloads.
 *
 * ```ts
 * import { imbraceSubjects } from "@openauthjs/openauth/imbrace"
 * ```
 *
 * @packageDocumentation
 */
import { array, object, string } from "valibot"
import { createSubjects } from "../subject.js"

export const imbraceSubjects = createSubjects({
  user: object({
    email: string(),
    customer_id: string(),
    organizations: array(
      object({
        organization_id: string(),
        display_name: string(),
        role: string(),
      }),
    ),
  }),
})

export type ImbraceOrganization = {
  organization_id: string
  display_name: string
  role: string
}

export type ImbraceUserProperties = {
  email: string
  customer_id: string
  organizations: ImbraceOrganization[]
}
