# iMBrace Auth Service

A self-hosted authentication server for the iMBrace platform, built on top of [OpenAuth](https://openauth.js.org) (MIT licensed).

Supports two deployment modes selected by the `PLATFORM_SERVICE_URL` environment variable:

| | Community (open-source) | Enterprise |
|---|---|---|
| **Activated when** | `PLATFORM_SERVICE_URL` **not set** | `PLATFORM_SERVICE_URL` **set** |
| **User management** | Built-in — stored locally | Delegated to platform service |
| **Roles** | `owner`, `member` | `owner`, `admin`, `technician`, `user` |
| **Organizations** | Single (`"default"`) | Multi-org |
| **JWT shape** | Identical | Identical |

---

## Running from source

**Requirements:** [Bun](https://bun.sh) >= 1.3

```bash
# 1. Install dependencies and build the core library
bun install
cd packages/openauth && bun run build && cd ../..

# 2. Configure environment
cp services/auth/.env.example services/auth/.env
# Edit services/auth/.env — set DATABASE_URL, SMTP, social providers as needed

# 3. Start the server
cd services/auth && bun --hot issuer.ts
```

The server listens on `http://localhost:3100` (or `PORT` from `.env`).

### First-time setup (community mode)

When `PLATFORM_SERVICE_URL` is not set, open the setup page to create the owner account:

```
http://localhost:3100/setup
```

Or via API:

```bash
curl -X POST http://localhost:3100/api/setup/owner \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123!"}'
```

---

## Building a Docker image

Always build from the **repo root** (required for monorepo workspace resolution):

```bash
docker build -f services/auth/Dockerfile -t imbrace-auth .
```

### Running the container

**Community mode** (no platform service — local user management):

```bash
docker run -d \
  -p 3100:3100 \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_URL="postgresql://user:password@host:5432/imbrace" \
  --name imbrace-auth \
  imbrace-auth
```

**With SMTP for invite emails:**

```bash
docker run -d \
  -p 3100:3100 \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_URL="postgresql://user:password@host:5432/imbrace" \
  -e SMTP_ADDRESS=smtp.mailgun.org \
  -e SMTP_PORT=587 \
  -e SMTP_USERNAME=postmaster@yourdomain.com \
  -e SMTP_PASSWORD=your-smtp-password \
  -e SMTP_SENDER=noreply@yourdomain.com \
  --name imbrace-auth \
  imbrace-auth
```

**Using an env file:**

```bash
docker run -d -p 3100:3100 --env-file services/auth/.env --name imbrace-auth imbrace-auth
```

---

## Community mode — routes

### Admin UI (server-rendered)

| Route | Auth | Purpose |
|---|---|---|
| `GET /setup` | — | Create owner account (first-time only) |
| `POST /setup` | — | Process owner setup form |
| `GET /admin/members` | Owner | Member management panel |
| `POST /admin/members` | Owner | Remove member / change role |
| `GET /admin/invite` | Owner | Invite new member form |
| `POST /admin/invite` | Owner | Send invite — shows copyable link |
| `GET /invite/:token` | — | Invited user sets password |
| `POST /invite/:token` | — | Activate account |

When no owner account exists, `/authorize` automatically redirects to `/setup`.

Owner authentication uses a JWT cookie (`admin_token`) set after login via `/admin/callback`.

### JSON API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/setup/status` | — | Check if owner has been created |
| `POST` | `/api/setup/owner` | — | Create first owner account (once only) |
| `GET` | `/api/members` | Owner JWT | List all members |
| `POST` | `/api/invite` | Owner JWT | Invite a new member |
| `GET` | `/api/invite/:token` | — | Validate invite token |
| `POST` | `/api/invite/:token/activate` | — | Set password and activate account |
| `DELETE` | `/api/members/:userId` | Owner JWT | Remove a member |
| `PATCH` | `/api/members/:userId/role` | Owner JWT | Change member role |

Owner JWT is passed via `Authorization: Bearer <token>` header or `admin_token` cookie.

---

## Environment variables

See [`services/auth/.env.example`](services/auth/.env.example) for the full list with descriptions.

Key variables:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `3100`) |
| `PLATFORM_SERVICE_URL` | No | Set for enterprise mode; omit for community |
| `DATABASE_TYPE` | No | `postgres`, `mongodb`, or `mysql` |
| `DATABASE_URL` | No | Connection string; omit to use in-memory storage |
| `SMTP_ADDRESS` | No | SMTP host — enables invite email sending |
| `SMTP_USERNAME` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `SMTP_SENDER` | No | From address for invite emails |
| `GOOGLE_CLIENT_ID` | No | Enables "Continue with Google" |
| `MS_CLIENT_ID` | No | Enables "Continue with Microsoft" |
| `AZURE_AD_CLIENT_ID` | No | Enables "Continue with Azure AD" |
| `KEYCLOAK_BASE_URL` | No | Enables "Continue with Keycloak" |

---

## License

MIT — see [LICENSE](LICENSE).

Based on [OpenAuth](https://github.com/toolbeam/openauth) © 2024 SST.
