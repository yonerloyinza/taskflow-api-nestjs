# TaskFlow API — NestJS Implementation

Backend API for the TaskFlow ecosystem built with **Node.js 20 + TypeScript + NestJS + Prisma ORM**, implementing the shared **OpenAPI 3.1 contract** (`docs/openapi.yaml`).

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
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

### Render (Native Web Service)
**`render.yaml`** configures:
- Build: `npm ci && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && node dist/main`
- Health check: `GET /health`

Required secrets in Render dashboard:
- `DATABASE_URL`
- `DIRECT_URL`

### Docker (Portable to AWS)
```bash
# Build
docker build -t taskflow-api-nestjs .

# Run (requires DATABASE_URL and DIRECT_URL)
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e DIRECT_URL="..." \
  taskflow-api-nestjs
```

**Dockerfile** optimized for 512 MB RAM:
- Multi-stage: base → builder → prod-deps → runner
- Non-root user, HEALTHCHECK, migrations on startup

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
| **CI** (`.github/workflows/ci.yml`) | Push/PR to main | Lint → TypeCheck → Unit Tests → Build → E2E (main only) |
| **CD** (`.github/workflows/cd.yml`) | Push to main | Deploy to Render via API |

Required GitHub secrets for CD:
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

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
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`

---

## 📄 License

UNLICENSED — Private project within TaskFlow ecosystem.