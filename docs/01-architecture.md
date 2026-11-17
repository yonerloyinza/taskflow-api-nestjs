# Arquitectura y Despliegue — taskflow-api-nestjs

- **Stack:** Node.js 20 + TypeScript + NestJS + Prisma ORM
- **Estrategia de Despliegue:** Render (render.yaml)
- **Base de Datos Cloud Dual:** PostgreSQL estándar alternable entre InsForge Cloud y Supabase Cloud mediante variables de entorno (`DATABASE_URL` para pooler y `DIRECT_URL` para migraciones).
- **Resiliencia:** Endpoint `GET /health` verificando conexión real a PostgreSQL, reintentos con backoff exponencial al iniciar y Graceful Shutdown.
