# AGENTS.md — Gobernanza de taskflow-api-nestjs

## 1. Contexto del Repositorio
- **Proyecto:** `taskflow-api-nestjs`
- **Stack:** Node.js 22 + TypeScript + NestJS + Prisma ORM
- **Despliegue:** VPS AWS EC2 — Docker multi-etapa (node:22-slim + openssl) + Traefik HTTPS
- **Contrato Maestro:** `docs/openapi.yaml` (OpenAPI 3.1)
- **Ecosistema:** Polyrepo TaskFlow (backend NestJS, sin monorepo)
- **Variables de Entorno:** Cargadas desde `/opt/taskflow/.env.nestjs` en el VPS

## 2. Reglas de Ejecución (Human-in-the-Loop)
1. **Un solo paso a la vez:** Prohibido implementar múltiples pasos sin aprobación explícita.
2. **Plan Previo:** Antes de tocar archivos, muestra: objetivo, archivos exactos, comandos y mensaje de Conventional Commit.
3. **Auto-verificación:** Ejecuta linter, build y tests del paso antes de entregar y muestra la salida real.
4. **Parada obligatoria:** Detente tras verificar, indica al usuario cómo probarlo y espera su visto bueno.
5. **Commit Atómico:** Tras aprobación, actualiza `docs/03-roadmap.md` y `docs/04-ai-log.md`, y ejecuta `git add` + `git commit` con Conventional Commits.

## 3. Reglas Arquitectónicas
- **Contract-First:** Respeta al 100% las rutas, DTOs, filtros (`status`, `priority`, `assignee`), paginación y formato de errores de `docs/openapi.yaml`.
- **Vendor-Agnostic DB:** Cero SDKs propietarios de InsForge o Supabase; conexión pura vía `DATABASE_URL` (pooler puerto 6543) y `DIRECT_URL` (puerto 5432) para migraciones.
- **Health Check Obligatorio:** `GET /health` debe verificar conexión activa a PostgreSQL Cloud y escuchar en `0.0.0.0:3000`.
- **Despliegue VPS AWS:** Dockerfile multi-etapa (node:22-slim + openssl) → build: `npx prisma generate`, start: `npx prisma migrate deploy && node dist/main.js`. Traefik enruta HTTPS → puerto interno 3000 (sin exponer puertos en host).
- **CI/CD Local Build:** GitHub Actions (.github/workflows/deploy.yml) → SSH al VPS → `git pull` + `docker compose up -d --build --no-deps api-nestjs` + `docker image prune -f` en `/opt/taskflow`. Sin Docker Hub / ghcr.io.
- **Prohibido:** Monorepos, SQLite, SDKs propietarios (`@supabase/supabase-js`, `@insforge/sdk`), migraciones manuales sin Prisma, Render, SnapDeploy, registros Docker externos.