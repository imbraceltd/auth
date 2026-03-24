# ── Build stage ───────────────────────────────────────────────────────────────
FROM oven/bun:1.3.3 AS builder
WORKDIR /app

# Workspace root
COPY package.json bun.lockb ./

# Core library
COPY packages/openauth/package.json packages/openauth/
COPY packages/openauth/src          packages/openauth/src
COPY packages/openauth/script       packages/openauth/script
COPY packages/openauth/tsconfig.json packages/openauth/

# Auth service
COPY services/auth/package.json services/auth/
COPY services/auth/issuer.ts    services/auth/

RUN bun install
RUN cd packages/openauth && bun run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM oven/bun:1.3.3-slim AS runner
WORKDIR /app

COPY --from=builder /app/package.json        ./
COPY --from=builder /app/bun.lockb           ./
COPY --from=builder /app/packages/openauth   packages/openauth/
COPY --from=builder /app/services/auth       services/auth/

# Install production deps only
RUN bun install --production

WORKDIR /app/services/auth

ENV PORT=3100
EXPOSE 3100

CMD ["bun", "issuer.ts"]
