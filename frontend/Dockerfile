# ─────────────────────────────────────────────────────────────────
# Stage 1: builder — build the React SPA with Vite
# ─────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Cache dependencies layer separately
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source files
COPY index.html vite.config.js ./
COPY src/ ./src/
COPY .env.example ./.env.example

# VITE_BACKEND_URL is injected as a build argument — never hardcoded.
# In Jenkins: docker build --build-arg VITE_BACKEND_URL=https://api.example.com
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm run build

# ─────────────────────────────────────────────────────────────────
# Stage 2: runner — serve the built SPA via Nginx
# ─────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config and content
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy hardened Nginx config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx needs to write PID file; run as non-root with adjusted config
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
