# Arquitectura y Despliegue — taskflow-api-nestjs

- **Stack:** Node.js 22 + TypeScript + NestJS + Prisma ORM
- **Estrategia de Despliegue:** VPS AWS EC2 — Docker multi-etapa (node:22-slim + openssl) + Traefik HTTPS
- **Base de Datos Cloud Dual:** PostgreSQL gestionado en la nube, alternable entre InsForge Cloud y Supabase Cloud únicamente mediante variables de entorno (`DATABASE_URL` con pooling puerto 6543 para runtime, `DIRECT_URL` puerto 5432 para migraciones) cargadas desde `/opt/taskflow/.env.nestjs` en el VPS. Regla estricta: Prohibido instalar o importar SDKs propietarios (`@supabase/supabase-js`, `@insforge/sdk`); toda persistencia debe pasar por Prisma.
- **Contrato API:** OpenAPI 3.1 compartido (`docs/openapi.yaml`) — rutas, DTOs, filtros (`status`, `priority`, `assignee`), paginación y formato de errores `ErrorResponse` respetados al 100%.
- **Health Check:** `GET /health` verificando conexión activa a PostgreSQL Cloud, escuchando en `0.0.0.0:3000`.
- **Red:** Traefik termina TLS y enruta HTTPS → puerto interno 3000 del contenedor (sin exponer puertos en el host).
- **CI/CD:** GitHub Actions (.github/workflows/deploy.yml) → SSH al VPS → `git pull` + `docker compose up -d --build --no-deps api-nestjs` + `docker image prune -f` en `/opt/taskflow`. Build local en VPS, sin Docker Hub / ghcr.io.
- **Prohibido:** Monorepos, SQLite, migraciones manuales sin Prisma, Render, SnapDeploy, registros Docker externos.