# ============================================================
# AI Ecommerce Website Builder — Production Dockerfile
# Multi-stage build for GCP Cloud Run deployment
# ============================================================

# ── Stage 1: Install dependencies ────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ── Stage 2: Build the application ───────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Only secrets are passed as build args — config defaults are in code
ARG DATABASE_URL
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG CLAUDE_API_KEY
ARG DB_SCHEMA

ENV DATABASE_URL=${DATABASE_URL}
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV CLAUDE_API_KEY=${CLAUDE_API_KEY}
ENV DB_SCHEMA=${DB_SCHEMA}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Production runner ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Disable telemetry at runtime
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy the standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run uses PORT env var (default 8080)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
EXPOSE 8080

# Start the Next.js standalone server
CMD ["node", "server.js"]
