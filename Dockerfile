# Multi-stage Dockerfile for taskflow-api-nestjs
# Optimized for 512 MB RAM (Render Free Tier) and portability to AWS

# ==========================================
# Stage 1: Base / Dependencies
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@latest-10

# ==========================================
# Stage 2: Builder
# ==========================================
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# ==========================================
# Stage 3: Production Dependencies
# ==========================================
FROM base AS prod-deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generated client
COPY prisma ./prisma/

# ==========================================
# Stage 4: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

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

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]