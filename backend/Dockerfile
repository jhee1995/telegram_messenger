# ─────────────────────────────────────────────────────────────────
# Stage 1: deps — install production dependencies only
# ─────────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# ─────────────────────────────────────────────────────────────────
# Stage 2: runner — lean production image (no dev tools)
# ─────────────────────────────────────────────────────────────────
FROM node:18-alpine AS runner

# Security: create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/ ./src/
COPY package.json ./

# All env vars are injected at runtime via docker-compose / Jenkins secrets.
# No COPY of .env — secrets are NEVER baked into the image.

# Drop to non-root
USER appuser

EXPOSE 3001

# Health check calls the /health endpoint (no external tooling required)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health | grep -q '"status":"ok"' || exit 1

CMD ["node", "src/server.js"]
