/**
 * Quick script to verify an access token issued by the Imbrace issuer.
 *
 * Usage:
 *   bun test-verify.ts <access_token>
 *
 * Example:
 *   bun test-verify.ts eyJhbGciOiJSUzI1NiJ9...
 */
import { createClient } from "@imbrace/openauth/client"
import { imbraceSubjects } from "@imbrace/openauth/imbrace"

const ISSUER_URL = process.env.ISSUER_URL ?? "http://localhost:3000"

const client = createClient({
  clientID: "test-verify-script",
  issuer: ISSUER_URL,
})

const accessToken = process.argv[2]
if (!accessToken) {
  console.error("Usage: bun test-verify.ts <access_token>")
  process.exit(1)
}

const result = await client.verify(imbraceSubjects, accessToken)

if (result.err) {
  console.error("Token invalid:", result.err.message)
  process.exit(1)
}

console.log("Token valid!")
console.log(JSON.stringify(result.subject.properties, null, 2))
