# Roadmap — taskflow-api-nestjs

- [x] **Paso 0 — Aclaración de contexto:** Verificar variables de entorno y puertos locales.
- [x] **Paso 1 — Estructura Base e Infraestructura:** Scaffolding NestJS, TypeScript estricto, seguridad (CORS, Helmet, Rate Limit).
- [x] **Paso 2 — Persistencia y Migraciones Duales:** Prisma ORM + modelo Task, dual connection (`DATABASE_URL` pooler 6543, `DIRECT_URL` 5432), migración aplicada a InsForge Cloud.
- [x] **Paso 3 — Implementación del Contrato (`docs/openapi.yaml`):** Endpoints CRUD Tasks, filtros (`status`, `priority`, `assignee`), paginación, manejo errores `ErrorResponse`, `GET /health` con verificación DB en `0.0.0.0:3000`.
- [x] **Paso 4 — Testing:** Suite unitarias (TasksService) + integración (TasksController) con Vitest/Supertest, 25 tests passing.
- [x] **Paso 5a — Documentación y Docker:** AGENTS.md actualizado, docs/01-architecture.md, Dockerfile multi-etapa (node:22-slim + openssl) para VPS AWS + Traefik.
- [x] **Paso 5b — CI/CD VPS:** GitHub Actions deploy.yml → SSH → `git pull` + `docker compose up -d --build --no-deps api-nestjs` + `docker image prune -f` en `/opt/taskflow`. Variables en `/opt/taskflow/.env.nestjs`. Sin Render, sin registros Docker externos.