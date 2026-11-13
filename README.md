# Clínica Turnos API

API REST para gestionar pacientes, médicos, especialidades, disponibilidad y turnos médicos.

El proyecto está construido con NestJS, PostgreSQL, Prisma y JWT. Incluye validación de DTOs, autorización por roles, Swagger, seed de datos y tests unitarios y e2e.

## Requisitos

- Node.js 24 o compatible.
- npm.
- Docker Desktop.

## Instalación

```bash
npm install
copy .env.example .env
```

Si usás PowerShell y `copy` no funciona, podés crear `.env` manualmente a partir de `.env.example`.

## Base de datos

El proyecto usa PostgreSQL dentro de Docker. El puerto externo es `5433` para evitar conflictos con instalaciones locales de PostgreSQL.

```bash
docker compose up -d db
npx prisma migrate deploy
npm run db:seed
```

Para revisar los datos:

```bash
npx prisma studio
```

La seed crea estos usuarios de desarrollo:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@clinica.local` | `Password123!` |
| Doctor | `doctor@clinica.local` | `Password123!` |
| Patient | `patient@clinica.local` | `Password123!` |

## Ejecutar la API

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api/v1`.

La documentación Swagger está disponible en:

`http://localhost:3000/api/v1/docs`

## Tests

```bash
# Tests unitarios
npm test

# Tests e2e contra PostgreSQL
npm run test:e2e

# Cobertura
npm run test:cov
```

Los tests e2e necesitan PostgreSQL levantado y las migraciones aplicadas.

## Arquitectura principal

- `auth`: registro, login, JWT, guards y roles.
- `users`: administración de usuarios.
- `patients-profiles`: perfiles de pacientes.
- `doctors-profiles`: perfiles médicos.
- `specialties`: especialidades médicas.
- `doctors-specialties`: relación entre médicos y especialidades.
- `schedules-blocks`: disponibilidad médica.
- `appointments`: reserva, reprogramación, cancelación y estados de turnos.
- `prisma`: conexión y cliente de base de datos.

## Roles

- `ADMIN`: administra usuarios, médicos, especialidades y turnos.
- `DOCTOR`: gestiona su disponibilidad y sus turnos.
- `PATIENT`: gestiona su perfil y sus reservas.

## Variables de entorno

No subas `.env` al repositorio. Usá `.env.example` como plantilla y configurá valores seguros para cada entorno.
