/**
 * Token Viewer Client
 *
 * Serves client.html and proxies /token to the issuer to avoid CORS issues.
 *
 * Run:
 *   bun client.ts
 *   Open http://localhost:8080
 */

const ISSUER = process.env.ISSUER_URL ?? "http://localhost:3100"
const PORT = 8080

const html = await Bun.file(import.meta.dir + "/client.html").text()

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // Serve client.html
    if (url.pathname === "/" || url.pathname === "/client.html") {
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      })
    }

    // Proxy token request to issuer
    if (url.pathname === "/token" && req.method === "POST") {
      const body = await req.text()
      const res = await fetch(`${ISSUER}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      })
      return new Response(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log(`Client running at http://localhost:${PORT}`)
console.log(`Proxying /token to ${ISSUER}`)
