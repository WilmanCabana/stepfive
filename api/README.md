# API (`/api`)

Servicio backend del proyecto Stepfive Inno Project. Expone una API REST para **identidad y control de acceso (IAM)**, gestión de espacios recreativos y reservas.

Construido con un **framework custom** sobre Express 5: decoradores para rutas (`@Controller`, `@Get`, `@Post`...), inyeccion de dependencias (`@Inject`), un ORM propio con sincronizacion automatica de esquema, y middleware de autorizacion basado en permisos.

### Entidades del sistema

| Entidad        | Tabla            | Proposito                                                     |
|----------------|------------------|---------------------------------------------------------------|
| `User`         | `Users`          | Cuenta y perfil (nombre, documento, contacto, imagen, flags)  |
| `Role`         | `Roles`          | Rol con nombre, alias, descripcion (ej: Admin, Guest, User)   |
| `Permission`   | `Permissions`    | Permiso granular con tipo (Access, Create, Read, Update, etc.) |
| `BlockedToken` | `BlockedTokens`  | Tokens JWT revocados (logout)                                  |

Relaciones: `UsersRoles` (M2M usuario-rol), `RolesPermissions` (M2M rol-permiso).

## Instalacion

```bash
cd api
pnpm install
cp .env.example .env   # edita con tus valores
```

## Variables de entorno (`.env`)

| Variable       | Descripcion                        | Ejemplo                        |
|----------------|------------------------------------|--------------------------------|
| `APP_NAME`     | Nombre de la app                   | `Stepfive Inno Project API`    |
| `VERSIONING`   | Prefijo de rutas                   | `/api/v1`                      |
| `PORT`         | Puerto del servidor                | `3000`                         |
| `DB_HOST`      | Host de PostgreSQL                 | `aws-0-[region].pooler.supabase.com` |
| `DB_PORT`      | Puerto de PostgreSQL               | `5432`                         |
| `DB_USER`      | Usuario de PostgreSQL              | `postgres.[your-project-ref]`  |
| `DB_PASSWORD`  | Contrasena de PostgreSQL           | `postgres`                     |
| `DB_NAME`      | Nombre de la base de datos         | `postgres`                     |
| `JWT_SECRET`   | Clave para firmar tokens JWT       | `mi_clave_secreta`             |
| `JWT_EXPIRES_IN`| Expiracion del token              | `30d`                          |

> **Nota:** La conexion usa el Session Pooler de Supabase (IPv4) en lugar de la conexion directa (IPv6), porque muchas redes no soportan IPv6.

## Base de datos: migraciones y seeders

### 1) Configurar Supabase

1. Crea un proyecto en Supabase.
2. Ve a **Settings → Database → Connection String**.
3. Selecciona **Session pooler** y copia los valores de conexion al archivo `.env`.

### 2) Migraciones (automaticas)

Al ejecutar `pnpm run dev`, el ORM sincroniza las tablas automaticamente. Veras en consola:

```
[ORM] ✔ Initializing Database...
[ORM] ✔ Migration completed
[ORM] ✔ Database ready
```

No hay comando `pnpm run migrate` separado; la sincronizacion ocurre cada vez que inicia el servidor.

### 3) Seed inicial (opcional)

Carga roles, permisos y sus asignaciones base. Ejecuta el contenido de `src/core/orm/database/scripts/init.sql` en el **SQL Editor** de Supabase.

Esto inserta los roles `Guest`, `User` y `Admin`, mas los permisos CRUD y los asigna al rol `Admin`.

## Endpoints de auth

**Base URL local:** `http://localhost:3000/api/v1`

### Rutas publicas (sin token)

#### `POST /auth/register`

Registra un nuevo usuario.

**Request:**

```json
{
  "name": "Juan Perez",
  "username": "juanperez",
  "documentType": "CC",
  "documentNumber": "123456789",
  "phoneNumber": "+573001234567",
  "email": "juan@example.com",
  "password": "MiPassword123!",
  "birthdate": "1995-06-15"
}
```

**Campos obligatorios:** `name`, `username`, `documentType`, `documentNumber`, `phoneNumber`, `email`, `password`.

**Validaciones importantes:**
- `username`: alfanumerico, entre 2 y 50 caracteres.
- `password`: minimo 8 caracteres, al menos una letra, un numero y un simbolo (`@$!%*?&`).
- `email`: formato valido.
- `birthdate`: formato `YYYY-MM-DD`.

**Response `201`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Juan Perez",
  "username": "juanperez",
  "email": "juan@example.com",
  "documentType": "CC",
  "documentNumber": "123456789",
  "phoneNumber": "+573001234567",
  "birthdate": "1995-06-15T00:00:00.000Z",
  "isAuthorized": true,
  "isOnline": false,
  "status": "Created",
  "createdAt": "2026-04-13T22:00:00.000Z"
}
```

---

#### `POST /auth/login`

Inicia sesion. Devuelve un JWT en el body y como cookie HTTP-only `accessToken`.

**Request:**

```json
{
  "username": "juanperez",
  "password": "MiPassword123!"
}
```

**Response `201`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Perez",
    "username": "juanperez",
    "email": "juan@example.com",
    "isOnline": true,
    "lastLogin": "2026-04-13T22:00:00.000Z",
    "roles": ["Guest"],
    "permissions": []
  }
}
```

### Rutas protegidas (requieren header `Authorization: <token>`)

#### Sesion y cuenta

| Metodo  | Ruta             | Descripcion                          |
|---------|------------------|--------------------------------------|
| `POST`  | `/auth/logout`   | Cierra sesion e invalida el token    |
| `GET`   | `/auth/me`       | Datos del usuario autenticado        |
| `PATCH` | `/auth/modify`   | Modifica datos del usuario           |
| `PATCH` | `/auth/reset`    | Cambia contrasena                    |
| `GET`   | `/auth/session`  | Info de sesion actual                |
| `GET`   | `/auth/session/roles` | Roles del usuario actual        |
| `GET`   | `/auth/session/permissions` | Permisos del usuario actual |

#### `PATCH /auth/reset` — ejemplo

```json
{
  "oldPassword": "MiPassword123!",
  "newPassword": "NuevaPassword456!"
}
```

#### CRUD de usuarios (requiere permisos `ReadUsers`, `CreateUsers`, etc.)

| Metodo   | Ruta                    | Descripcion                  |
|----------|-------------------------|------------------------------|
| `GET`    | `/auth/users`           | Listar usuarios              |
| `GET`    | `/auth/users/:username` | Obtener por username         |
| `POST`   | `/auth/users`           | Crear usuario                |
| `PUT`    | `/auth/users/:username` | Actualizar usuario           |
| `DELETE` | `/auth/users/:username` | Eliminar usuario (soft)      |
| `POST`   | `/auth/authorize/:username`   | Autorizar usuario     |
| `POST`   | `/auth/disauthorize/:username`| Desautorizar usuario  |

#### CRUD de roles (requiere permisos `ReadRoles`, `CreateRoles`, etc.)

| Metodo   | Ruta                             | Descripcion                  |
|----------|----------------------------------|------------------------------|
| `GET`    | `/auth/roles`                    | Listar roles                 |
| `POST`   | `/auth/roles`                    | Crear rol                    |
| `GET`    | `/auth/roles/:name`              | Obtener por nombre           |
| `PUT`    | `/auth/roles/:name`              | Actualizar rol               |
| `DELETE` | `/auth/roles/:name`              | Eliminar rol                 |
| `PATCH`  | `/auth/activate/roles/:name`     | Activar rol                  |
| `PATCH`  | `/auth/deactivate/roles/:name`   | Desactivar rol               |
| `POST`   | `/auth/assign/roles`             | Asignar roles a usuario      |
| `POST`   | `/auth/revoke/roles`             | Revocar roles de usuario     |
| `POST`   | `/auth/check/roles`              | Verificar roles de usuario   |

#### CRUD de permisos (requiere permisos `ReadPermissions`, `CreatePermissions`, etc.)

| Metodo   | Ruta                              | Descripcion                     |
|----------|-----------------------------------|---------------------------------|
| `GET`    | `/auth/permissions`               | Listar permisos                 |
| `POST`   | `/auth/permissions`               | Crear permiso                   |
| `GET`    | `/auth/permissions/:name`         | Obtener por nombre              |
| `PUT`    | `/auth/permissions/:name`         | Actualizar permiso              |
| `DELETE` | `/auth/permissions/:name`         | Eliminar permiso                |
| `POST`   | `/auth/assign/permissions`        | Asignar permisos a rol          |
| `POST`   | `/auth/revoke/permissions`        | Revocar permisos de rol         |
| `POST`   | `/auth/check/permissions`         | Verificar permisos de rol       |

## Módulos de espacios y reservas

### `SpaceRecreational`

Gestiona espacios de tipo `synthetic_field` (cancha sintética) y `event_hall` (salón de eventos). La entidad `SpaceRecreational` se persiste en `SpaceRecreationals`; el módulo incluye DTO, controller, service, repository y validaciones de horario, capacidad y reservas.

Base: `/spaces`

| Método | Endpoint | Acceso requerido |
|--------|----------|------------------|
| `GET` | `/spaces/discover` | Público; devuelve espacios aprobados |
| `GET` | `/spaces/` | `ReadSpaces` |
| `GET` | `/spaces/me` | `ReadSpaces` |
| `GET` | `/spaces/:id` | `ReadSpaces` |
| `POST` | `/spaces/` | `CreateSpaces` |
| `PUT` | `/spaces/:id` | `UpdateSpaces` |
| `DELETE` | `/spaces/:id` | `DeleteSpaces` |
| `PATCH` | `/spaces/:id/verify` | `VerifySpaces` |

Los permisos del módulo se definen en `src/spaces/constants/authorities.ts`; `init-spaces.sql` los registra en la base de datos.

### `Reservation`

Gestiona disponibilidad, creación y consulta de reservas. La entidad `Reservation` se persiste en `Reservations` y se relaciona con `SpaceRecreational` y `User`. PSE queda registrado como método, pero todavía no hay pasarela real: al crear la reserva, el backend la marca pagada manualmente.

Base: `/reservations`

| Método | Endpoint | Acceso requerido |
|--------|----------|------------------|
| `POST` | `/reservations/` | `CreateReservations` |
| `GET` | `/reservations/me` | `ReadReservations` |
| `GET` | `/reservations/spaces/me` | `ReadReservations` |
| `GET` | `/reservations/space/:spaceId/availability` | `ReadReservations` |
| `GET` | `/reservations/space/:spaceId` | `ReadReservations`; propietario del espacio o Admin |
| `PATCH` | `/reservations/:id/cancel` | `CancelReservations` |
| `PATCH` | `/reservations/:id/confirm` | `ReadReservations`; el service exige Admin |

El módulo registra `ReadReservations`, `CreateReservations`, `CancelReservations`, `ReadOwnSpaceReservations` y `AccessReservations`. Las rutas usan las protecciones indicadas en la tabla; la consulta de reservas por espacio verifica además que el usuario sea el propietario o Admin.

### Scripts SQL de módulos

Inicia la API una vez para que el ORM sincronice las tablas. Después, ejecuta los scripts desde el SQL Editor de Supabase; si necesitas cargar los roles y permisos base, ejecuta primero `src/core/orm/database/scripts/init.sql`:

1. `src/core/orm/database/scripts/init-spaces.sql` registra los permisos de espacios.
2. `src/core/orm/database/scripts/init-reservations.sql` crea la tabla e índices de reservas, la restricción contra franjas solapadas y los permisos del módulo.

La tabla `SpaceRecreationals` se sincroniza al iniciar la API mediante el ORM.

## Arquitectura

```
src/
├── core/                    # Framework custom
│   ├── config/              # APP_NAME, PORT, VERSIONING
│   ├── container/           # Contenedor de DI (singleton, reflect-metadata)
│   ├── decorators/          # @Controller, @Get, @Post, @Inject, @Permissions, @Public...
│   ├── errors/              # Errores HTTP (HandleableError)
│   ├── handlers/            # RouteHandler: wraps auth + permissions check
│   ├── metadata/            # Reflect metadata keys
│   ├── middlewares/         # AuthMiddleware (JWT), ErrorMiddleware
│   ├── orm/                 # ORM custom: @Entity, @Column, @Id, relaciones, Database.sync()
│   ├── router/              # CoreRouter: auto-descubre controladores en src/
│   └── utils/               # Validator (required, email, strongPassword, etc.)
│
├── auth/                    # Modulo de identidad y acceso
│   ├── constants/           # Constantes de permisos y roles
│   ├── controllers/         # Auth, Authentication, Authorization, User, Role, Permission
│   ├── dtos/                # UserDTO (excluye password)
│   ├── entities/            # User, Role, Permission, BlockedToken
│   ├── repositories/        # Acceso a datos por entidad
│   └── services/            # Logica de negocio por entidad
├── spaces/                  # Espacios recreativos
│   ├── constants/           # Tipos, defaults y permisos
│   ├── controllers/         # Endpoints /spaces
│   ├── dtos/                # SpaceRecreationalDTO
│   ├── entities/            # SpaceRecreational
│   ├── repositories/        # Persistencia de espacios
│   └── services/            # Gestión, Discover y validaciones
└── reservations/            # Reservas y disponibilidad
    ├── controllers/         # Endpoints /reservations
    ├── dtos/                # ReservationDTO
    ├── entities/            # Reservation
    ├── repositories/        # Consultas de reservas
    └── services/            # Disponibilidad y reglas de reserva
```

## Scripts

| Comando         | Descripcion                         |
|-----------------|-------------------------------------|
| `pnpm run dev`   | Desarrollo con hot-reload (tsx)     |
| `pnpm run build` | Compila TypeScript a `dist/`        |
| `pnpm start`     | Ejecuta build de produccion         |
