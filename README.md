# TaskFlow API — NestJS Implementation

Backend API for the TaskFlow ecosystem built with **Node.js 22 + TypeScript + NestJS + Prisma ORM**, implementing the shared **OpenAPI 3.1 contract** (`docs/openapi.yaml`).

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- npm 10+
- PostgreSQL cloud database (InsForge or Supabase)

### Installation
```bash
# Clone and install
git clone https://github.com/yonerloyinza/taskflow-api-nestjs.git
cd taskflow-api-nestjs
npm ci

# Configure environment (choose one provider)
cp .env.insforge.example .env    # For InsForge
# OR
cp .env.supabase.example .env    # For Supabase

# Edit .env with your credentials
# DATABASE_URL (pooler port 6543) and DIRECT_URL (port 5432)

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

### Available Scripts
```bash
npm run build          # Compile TypeScript
npm run start:prod     # Run production build
npm run start:dev      # Development with hot reload
npm run lint           # Run oxlint
npm run test           # Unit tests (Vitest)
npm run test:e2e       # E2E tests (requires DB)
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Create & apply migrations (dev)
npm run prisma:deploy   # Apply migrations (prod)
```

---

## 🔧 Environment Configuration

### Dual Cloud Provider Support (Vendor-Agnostic)

This project connects to **PostgreSQL in the cloud** using only **Prisma ORM** — no proprietary SDKs. Switch providers by changing `.env`:

| Variable | InsForge | Supabase | Purpose |
|----------|----------|----------|---------|
| `DATABASE_URL` | `postgresql://...@POOLER-HOST.insforge.cloud:6543/...` | `postgresql://...@aws-0-region.pooler.supabase.com:6543/...` | Runtime connection (pooler) |
| `DIRECT_URL` | `postgresql://...@DIRECT-HOST.insforge.cloud:5432/...` | `postgresql://...@db.PROJECT_REF.supabase.co:5432/...` | Migrations (direct) |

### InsForge Setup
```bash
# 1. Login and link project
npx @insforge/cli login
npx @insforge/cli link

# 2. Get connection strings
npx @insforge/cli db connection-string

# 3. Update .env with real values
DATABASE_URL="postgresql://postgres:PASSWORD@APPKEY.region.database.insforge.app:6543/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@APPKEY.region.database.insforge.app:5432/dbname?sslmode=require"
```

### Supabase Setup
```bash
# 1. Create project at supabase.com
# 2. Get connection strings from Settings > Database
# 3. Update .env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require"
```

### Production Environment (VPS)
En el VPS AWS, las variables se cargan desde `/opt/taskflow/.env.nestjs` (no se usa `.env` local):
```bash
# En el VPS: /opt/taskflow/.env.nestjs
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.com
DATABASE_URL="postgresql://...:6543/...?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://...:5432/...?sslmode=require"
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (verifies DB connection) |
| `POST` | `/tasks` | Create task |
| `GET` | `/tasks` | List tasks (filters: `status`, `priority`, `assignee`; pagination: `page`, `limit`) |
| `GET` | `/tasks/:id` | Get task by UUID |
| `PATCH` | `/tasks/:id` | Partial update |
| `DELETE` | `/tasks/:id` | Delete task |

### Filters & Pagination (GET `/tasks`)
```
GET /tasks?status=pendiente&priority=alta&assignee=juan&page=1&limit=20
```

### Response Format
All responses follow the OpenAPI contract:
- **Success:** Data + meta (for pagination)
- **Error:** `{ statusCode, error, message, timestamp, path }`

---

## 🏗️ Architecture

- **Contract-First:** 100% compliance with `docs/openapi.yaml`
- **Vendor-Agnostic DB:** Pure Prisma, no `@supabase/supabase-js` or `@insforge/sdk`
- **Dual Connection:** `DATABASE_URL` (pooler 6543) + `DIRECT_URL` (5432)
- **Security:** Helmet, CORS, Rate Limiting (Throttler), Global ValidationPipe
- **Error Handling:** Global `HttpExceptionFilter` with standardized `ErrorResponse`

---

## 🐳 Deployment

### VPS AWS EC2 — Docker + Traefik (Producción)

**Arquitectura:**
```
Internet (HTTPS) → Traefik (TLS termination) → Docker Network → api-nestjs:3000
```

**Dockerfile** (`Dockerfile`):
- Multi-stage: base (node:22-slim + openssl) → builder → prod-deps → runner
- Non-root user, HEALTHCHECK, `npx prisma migrate deploy && node dist/main.js` on start
- Build: `npx prisma generate` | Start: `npx prisma migrate deploy && node dist/main.js`

**Traefik** termina TLS y enruta tráfico HTTPS al puerto interno 3000 del contenedor (sin exponer puertos en el host).

**Variables de entorno en VPS:** `/opt/taskflow/.env.nestjs`

### Desarrollo Local con Docker
```bash
# Build
docker build -t taskflow-api-nestjs .

# Run (requires DATABASE_URL and DIRECT_URL)
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e DIRECT_URL="..." \
  taskflow-api-nestjs
```

---

## 🧪 Testing

```bash
# Unit tests (mocked Prisma)
npm run test

# E2E tests (requires real DB)
npm run test:e2e
```

**Coverage:** 25 tests (10 unit + 13 e2e + 2 app)
- TasksService: CRUD, filters, pagination, NotFound
- TasksController: All endpoints, validation, error format
- Health check

---

## 🤖 CI/CD (GitHub Actions)

| Workflow | Trigger | Jobs |
|----------|---------|------|
| **Deploy** (`.github/workflows/deploy.yml`) | Push to main | SSH → VPS → `git pull` + `docker compose up -d --build --no-deps api-nestjs` + `docker image prune -f` |

**Required GitHub Secrets:**
- `VPS_SSH_PRIVATE_KEY` — Private key for SSH access to VPS
- `VPS_HOST` — VPS hostname or IP
- `VPS_USER` — SSH username (e.g., `ubuntu`)

**Flujo de despliegue:**
1. Push a `main` → GitHub Actions ejecuta `deploy.yml`
2. SSH al VPS AWS EC2
3. `cd /opt/taskflow && git pull origin main`
4. `docker compose up -d --build --no-deps api-nestjs` (build local en VPS)
5. `docker image prune -f` (limpieza de imágenes antiguas)
6. Health check vía Traefik HTTPS

**Sin Docker Hub / ghcr.io** — La imagen se construye directamente en el VPS.

---

## 📚 Documentation

- `docs/openapi.yaml` — OpenAPI 3.1 contract (source of truth)
- `docs/01-architecture.md` — Architecture & deployment
- `docs/03-roadmap.md` — Project roadmap
- `docs/04-ai-log.md` — AI development log

---

## ⚠️ Rules & Constraints

- **No monorepos** — Pure polyrepo
- **No SQLite** — PostgreSQL cloud only
- **No proprietary SDKs** — Prisma only
- **No manual migrations** — `prisma migrate` only
- **No Render / SnapDeploy / Docker Hub / ghcr.io** — VPS AWS + Traefik only
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`

---

## 📄 License

UNLICENSED — Private project within TaskFlow ecosystem.