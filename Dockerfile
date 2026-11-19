# Multi-stage Dockerfile for taskflow-api-nestjs
# Optimized for VPS AWS EC2 with Traefik — node:22-slim + openssl

# ==========================================
# Stage 1: Base / Dependencies
# ==========================================
FROM node:22-slim AS base
WORKDIR /app

# Install openssl for Prisma (required for native query engine)
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# ==========================================
# Stage 2: Builder
# ==========================================
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# ==========================================
# Stage 3: Production Dependencies
# ==========================================
FROM base AS prod-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generate client (prod runtime needs generated client)
COPY prisma ./prisma/
RUN npx prisma generate

# ==========================================
# Stage 4: Runner (Production)
# ==========================================
FROM node:22-slim AS runner
WORKDIR /app

# Install openssl for Prisma runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --gid 1001 --system nodejs && \
    adduser --uid 1001 --system --ingroup nodejs nestjs

# Copy production dependencies
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy Prisma schema and migrations
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy package.json for version info
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose port (internal only, Traefik routes to this)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]