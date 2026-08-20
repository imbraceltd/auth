# Imbrace Auth Service

Production OAuth 2.0 authorization server using `@imbrace/openauth` that delegates authentication to an external platform-service.

## Features

- Email + password login
- OTP (one-time password) login
- Forgot / reset password flow (proxies to backend API)
- Social provider buttons (Google, Microsoft, Azure AD) — configurable
- PostgreSQL / MongoDB / MySQL storage (falls back to in-memory if not configured)
- Token Viewer client for inspecting JWTs

## Prerequisites

- [Bun](https://bun.sh) v1+
- A running platform-service with authentication endpoints
- PostgreSQL, MongoDB, or MySQL (optional, for persistent storage)

## Quick Start (Development)

```bash
# 1. Install dependencies (from repo root)
bun install

# 2. Build the openauth package
cd packages/openauth && bun run build && cd ../..

# 3. Configure environment
cd services/auth
cp .env.example .env
# Edit .env with your values

# 4. Start the issuer
bun --hot issuer.ts
```

The issuer runs at **http://localhost:3100**.

### Test the login flow

Open in your browser:

```
http://localhost:3100/authorize?client_id=test&response_type=code&redirect_uri=http://localhost:3100
```

After login, copy the `code` from the redirect URL and exchange it:

```bash
curl -s -X POST http://localhost:3100/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_CODE&client_id=test&redirect_uri=http://localhost:3100" | jq .
```

### Token Viewer Client

A browser-based tool to inspect access tokens:

```bash
# In a separate terminal
bun client.ts
```

Open **http://localhost:8080**, click **Login**, and the client will exchange the authorization code and display the decoded JWT.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLATFORM_SERVICE_URL` | Base URL of the platform-service login API | `http://localhost:3001` |
| `DATABASE_TYPE` | Storage backend: `postgres`, `mongodb`, or `mysql` | _(required if DATABASE_URL is set)_ |
| `DATABASE_URL` | Database connection string | _(falls back to MemoryStorage)_ |
| `DATABASE_NAME` | MongoDB database name | `imbrace` |
| `PORT` | HTTP server port | `3100` |

## Forgot Password

Set `forgotPassword: true` in the issuer config to enable the built-in forgot/reset password flow. This uses the same `PLATFORM_SERVICE_URL` base and calls:

- `GET {baseUrl}/forget?email=...` — sends the reset email
- `POST {baseUrl}/forget/reset` — resets the password

The backend's `APP_URL` config must point to the auth-service URL so the email verify link redirects correctly.

## Deploy with Docker

Build and run from the **repository root** (monorepo context is required):

```bash
# Build
docker build -f services/auth/Dockerfile -t imbrace-auth .

# Run with env file
docker run -d -p 3100:3100 --env-file services/auth/.env imbrace-auth

# Or pass env vars directly
docker run -d -p 3100:3100 \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_URL="postgresql://user:pass@host.docker.internal:5432/mydb" \
  -e PLATFORM_SERVICE_URL="https://your-platform-service/api/v1/backend/login" \
  imbrace-auth
```

The container exposes port **3100** by default (set via `ENV PORT=3100` in the Dockerfile).

> **Note:** Inside Docker, `localhost` refers to the container itself.
> - **macOS/Windows:** Use `host.docker.internal` to reach services on the host machine.
> - **Linux:** Add `--add-host=host.docker.internal:host-gateway` or use `--network host`.

### Docker Compose (recommended for local multi-service setup)

```yaml
services:
  auth:
    build:
      context: .
      dockerfile: services/auth/Dockerfile
    env_file: services/auth/.env
    ports:
      - "3100:3100"
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
```

With Docker Compose, set `DATABASE_URL` using the service name:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/
```

## Storage

| Storage | When to use |
|---------|-------------|
| `MemoryStorage` | Development only. Data is lost on restart (unless `persist` is set). |
| `PostgresStorage` | Production. Table is auto-created on first request. |
| `MongoDBStorage` | Alternative. Set `DATABASE_TYPE=mongodb`. |
| `MySQLStorage` | Alternative. Set `DATABASE_TYPE=mysql`. |

## Using `@imbrace/openauth`

The core library lives in `packages/openauth/`. Build it and consume it from the workspace, or publish it to a registry of your choice.

### Build

```bash
cd packages/openauth
bun install
bun run build
```

### Import in issuer (server-side)

```ts
import { createIssuer } from "@imbrace/openauth/imbrace"
```

### Import in client (frontend)

```ts
import { createClient } from "@imbrace/openauth/client"
import { imbraceSubjects } from "@imbrace/openauth/imbrace/subjects"
```

## Project Structure

```
services/auth/
  issuer.ts       # Auth server entry point
  client.ts       # Token Viewer server (dev tool)
  client.html     # Token Viewer UI
  test-verify.ts  # Token verification script
  Dockerfile      # Docker deployment
  .env.example    # Environment template
  package.json    # @imbrace/auth-service
```
