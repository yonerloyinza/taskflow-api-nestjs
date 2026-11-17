# Arquitectura y Despliegue — taskflow-api-nestjs

- **Stack:** Node.js 20 + TypeScript + NestJS + Prisma ORM
- **Estrategia de Despliegue:** Render (render.yaml) — Web Service nativo + Docker multi-etapa para portabilidad hacia AWS
- **Base de Datos Cloud Dual:** PostgreSQL estándar alternable entre InsForge Cloud y Supabase Cloud únicamente mediante variables de entorno (`DATABASE_URL` con pooling puerto 6543 para runtime, `DIRECT_URL` puerto 5432 para migraciones). Regla estricta: Prohibido instalar o importar SDKs propietarios (`@supabase/supabase-js`, `@insforge/sdk`); toda consulta debe pasar por Prisma.
- **Contrato API:** OpenAPI 3.1 compartido (`docs/openapi.yaml`) — rutas, DTOs, filtros (`status`, `priority`, `assignee`), paginación y formato de errores `ErrorResponse` respetados al 100%.
- **Resiliencia:** Endpoint `GET /health` verificando conexión real a PostgreSQL Cloud, reintentos con backoff exponencial al iniciar y Graceful Shutdown.
- **Límites de Recursos:** Optimizado para 512 MB RAM (Render Free Tier).
- **Prohibido:** Monorepos, SQLite, migraciones manuales sin Prisma.