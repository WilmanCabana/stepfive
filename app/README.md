# APP (`/app`) — Stepfive v3.0.0

Interfaz web del proyecto Stepfive. Es una SPA (React 18 + Vite + React Router) con autenticación RBAC y módulos para gestionar usuarios, roles, permisos, espacios recreativos y reservas contra la API backend.

## Rutas y navegación

| Pantalla | Ruta | Acceso | Descripción |
|----------|------|--------|-------------|
| Landing Page | `/` | Pública | Presenta Stepfive a clientes y propietarios; incluye espacios destacados y accesos a explorar/publicar. |
| Login / Registro | `/auth` | Pública | Inicio de sesión y registro. El registro también acepta `?mode=register`. |
| Términos de uso | `/terms` | Pública | Información sobre el uso de la plataforma y contacto comercial. |
| Privacidad | `/privacy` | Pública | Información de privacidad y tratamiento de datos. |
| Contacto | `/contact` | Pública | Canal de contacto del proyecto. |
| Discover | `/panel` | Protegida: `AccessDashboard` | Catálogo de espacios aprobados y filtros. |
| Mis reservas | `/panel/my-reservations` | Protegida: `ReadReservations` | Timeline y detalles de las reservas propias. |
| Mis espacios recreativos | `/panel/space-recreationals` | Protegida: `AccessSpaces` | Administración de espacios, sus imágenes/videos y calendario de reservas. |
| Usuarios | `/panel/users` | Protegida: `AccessUsers` | Gestión de usuarios. |
| Autorización | `/panel/authorization` | Protegida: `AccessAuthorization` | Gestión de roles y permisos. |

### Que ve el usuario

| Pantalla          | Ruta              | Permiso requerido      | Que hace                                                              |
|-------------------|-------------------|------------------------|-----------------------------------------------------------------------|
| **Landing Page**  | `/`               | Pública                 | Presenta la plataforma, destacados e información para clientes y propietarios |
| **Login/Registro**| `/auth`           | Pública                 | Formulario de login y wizard de registro (5 pasos, carga imagen a Firebase) |
| **Discover**      | `/panel`          | `AccessDashboard`       | Catálogo público de espacios aprobados, filtros y detalles visuales |
| **Mis espacios recreativos** | `/panel/space-recreationals` | `AccessSpaces` | Gestión en tarjetas/tabla, imágenes, video de presentación y reservas recibidas |
| **Mis reservas** | `/panel/my-reservations` | `ReadReservations` | Timeline de reservas propias y detalle del espacio y la reserva |
| **Usuarios**      | `/panel/users`    | `AccessUsers`           | Listado, autorizaciones, roles, detalles y eliminación |
| **Autorización**  | `/panel/authorization` | `AccessAuthorization` | CRUD de roles y consulta/asignación de permisos |

Funcionalidades transversales: tema claro/oscuro, deteccion de conexion offline, sidebar con navegacion filtrada por permisos, sesion persistida en `localStorage`.

## Experiencia de usuario y accesibilidad

La versión 3.0.0 aplica mejoras UX/UI a filtros, tarjetas, modales y jerarquía visual; también procura controles con etiquetas accesibles, navegación por teclado y contraste coherente con los temas claro y oscuro.

### Video y vista de detalles

En Discover, el detalle del espacio usa un diseño split-screen: reproductor de video a la izquierda y la información del espacio en una columna independiente con scroll a la derecha. En móvil, las columnas se apilan. Si no hay video, se muestra un placeholder. Los videos MP4 y WebM de hasta 20 MB se guardan en la carpeta `videos/` del bucket Supabase Storage `space-images`; las imágenes continúan usando su flujo existente.

### Landing Page y marca

La Landing Page se implementa en `src/modules/landing/LandingPage.jsx`; las páginas públicas de términos, privacidad y contacto están en `src/modules/public-pages/PublicPages.jsx`. El componente `src/core/components/Logo/Logo.jsx` renderiza el logo SVG de la cabeza de lobo y utiliza variables del tema para conservar contraste en modo claro/oscuro. El componente se comparte entre la Landing Page, el sidebar y otras superficies.

> **Nota:** Existen componentes listos pero **aun sin usar** en las vistas: mapas (`MapPicker` con Leaflet), graficos (Recharts), y exportacion a Excel (`exceljs`). Estan disponibles en `src/core/` para futuros modulos.

## Instalacion y servidor de desarrollo

```bash
cd app
pnpm install
pnpm run dev
```

Abre `http://localhost:5173`. Debería cargar la Landing Page pública; el login y el registro están en `/auth`.

## Variables de entorno

El frontend usa variables con prefijo `VITE_*` (archivo `.env` en la raiz de `app/`):

| Variable              | Descripcion                                    | Ejemplo                              |
|-----------------------|------------------------------------------------|--------------------------------------|
| `VITE_IS_DEV_MODE`    | Alterna entre dev y prod (`true` o `false`)    | `true`                               |
| `VITE_API_URL_DEV`    | URL de la API en desarrollo                    | `http://localhost:3000/api/v1`       |
| `VITE_API_URL_PROD`   | URL de la API en produccion                    | `https://mi-backend.onrender.com/api/v1` |
| `VITE_SUPABASE_URL`  | URL del proyecto Supabase para imágenes de espacios | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anon/public de Supabase                | `<anon-key>` |

El codigo lee estas variables via `import.meta.env.VITE_*` y elige la URL segun `VITE_IS_DEV_MODE`. En produccion se debe configurar `VITE_IS_DEV_MODE=false`.

### Firebase (requerido para subida de imagenes)

El registro de usuarios sube la imagen de perfil a Firebase Storage. La configuracion esta en:

**`src/core/config/firebase.config.mjs`**

Si el proyecto de Firebase cambia, actualiza las credenciales en ese archivo.

### Supabase Storage (imágenes y videos de espacios)

La portada y la galería se suben a Supabase Storage mediante `src/core/utils/uploadImage.mjs`; el video de presentación usa `src/core/utils/uploadFile.mjs`. Crea un bucket público llamado `space-images`, permite los MIME `image/png`, `image/jpeg`, `image/webp`, `video/mp4` y `video/webm`, y configura un límite de al menos 20 MB. El video se almacena bajo `videos/`; las imágenes, bajo `spaces/`. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `app/.env`. Las imágenes de perfil del registro siguen usando Firebase.

## Espacios y reservas

- **Discover (`/panel`)** muestra los espacios aprobados con tarjetas de imágenes destacadas; permite filtrar por tipo, buscar por nombre y ordenar por precio. Al seleccionar un espacio, muestra el video a la izquierda y los detalles con scroll independiente a la derecha (en móvil, apilados). El catálogo de API usa el endpoint público `GET /spaces/discover`; la página dentro del panel requiere `AccessDashboard`.
- **Mis espacios recreativos (`/panel/space-recreationals`)** permite gestionar espacios en tarjetas o tabla. Su tercera pestaña, **Reservas**, presenta el calendario y las reservas recibidas para los espacios del propietario.
- **Mis reservas (`/panel/my-reservations`)** presenta las reservas propias en un timeline. Al seleccionar una, abre el detalle completo del espacio junto con los datos de esa reserva.
- Para reservar, el usuario elige franjas disponibles y confirma con el método PSE. No hay pasarela de pago real: la API registra la reserva como pagada manualmente y genera una referencia `manual-*`.

Los permisos y el esquema de reservas se preparan ejecutando `api/src/core/orm/database/scripts/init-spaces.sql` y luego `api/src/core/orm/database/scripts/init-reservations.sql` en el SQL Editor de Supabase.

## Integracion de auth

### AuthContext y useAuth

La autenticacion se gestiona con un Context (`src/core/contexts/AuthContext.jsx`).

`AuthProvider` envuelve la app en `src/main.jsx` y expone todo a traves del hook `useAuth()`:

```jsx
import { useAuth } from '../core/contexts/AuthContext'

function MiComponente() {
  const { session, user, signIn, signUp, signOut, hasAuthorities } = useAuth()
}
```

| Propiedad         | Tipo       | Descripcion                                                    |
|-------------------|------------|----------------------------------------------------------------|
| `session`         | `object`   | `{ token, user }` o `null` si no hay sesion                   |
| `user`            | `object`   | Atajo a `session.user` (objeto vacio `{}` si no hay sesion)    |
| `signIn()`        | `function` | `await signIn({ username, password })` — retorna session o null|
| `signUp()`        | `function` | `await signUp(userData)` — retorna `true` o `false`            |
| `signOut()`       | `function` | Cierra sesion, limpia localStorage y estado                    |
| `hasAuthorities()`| `function` | Verifica roles y permisos (ver abajo)                          |

**La sesion se persiste en `localStorage`** bajo la key `session`. Al recargar la pagina, `AuthProvider` revalida el token contra `GET /auth/session` automaticamente.

### Ejemplo — Login

```jsx
const { signIn } = useAuth()

const handleLogin = async () => {
  const session = await signIn({ username: 'juanperez', password: 'MiPassword123!' })
  if (session) {
    // redirigir al panel
  }
}
```

### Proteger rutas con ProtectedRoute

El componente `ProtectedRoute` (`src/core/components/ProtectedRoute/ProtectedRoute.jsx`) verifica sesion y autoridades. Si no hay sesion, redirige a `/auth`. Si no tiene permisos, muestra la pagina `Unauthorized`.

```jsx
import ProtectedRoute from '../core/components/ProtectedRoute/ProtectedRoute'

<Route
  path="/panel"
  element={
    <ProtectedRoute authorities={{ roles: ['Admin'], permissions: ['AccessDashboard'] }}>
      <PanelLayout />
    </ProtectedRoute>
  }
/>
```

### Verificar roles/permisos manualmente

```jsx
const { session, hasAuthorities } = useAuth()

if (hasAuthorities(session, { roles: ['Admin'], permissions: ['CreateUsers'] })) {
  // mostrar boton de crear usuario
}
```

`hasAuthorities` retorna `true` si el usuario tiene **al menos uno** de los roles indicados **y todos** los permisos indicados.

## Estructura del proyecto

```
src/
├── core/                     # Codigo compartido
│   ├── components/           # ProtectedRoute, ConnectionWrapper, MapPicker, Table, TabGroup...
│   ├── config/               # Configuracion de API, Supabase y Firebase
│   ├── contexts/             # AuthContext, ThemeContext, NotificationContext
│   ├── hooks/                # useForm, useLoad, useSync, etc.
│   ├── lib/                  # Notify (notificaciones toast)
│   ├── pages/                # NotFound, Unauthorized, Offline, Policies, Help
│   ├── services/             # Service (fetch wrapper), Requester (HTTP base)
│   ├── styles/               # CSS globales
│   └── utils/                # exportData (Excel), novato (charts helper)
│
├── modules/
│   ├── auth/                 # Login y registro
│   │   ├── Authentication.jsx    # Vista principal (/auth)
│   │   ├── LoginForm.jsx         # Formulario de login
│   │   └── RegisterForm.jsx      # Wizard de registro (5 pasos)
│   └── panel/                # Panel de administracion
│       ├── config/               # panel.config.jsx (menu, rutas, permisos)
│       ├── layouts/              # PanelLayout (sidebar + outlet)
│       ├── pages/                # Discover, Spaces, MyReservations, Users, Authorization
│       ├── components/           # Espacios: SpaceRecreationalForm/Detail; reservas: ReservationBooking, ReservationCalendar, SpaceReservations
│       └── services/             # Requesters de auth, espacios recreativos y reservas
│
└── main.jsx                  # Entry point, rutas, providers
```

## Scripts

| Comando           | Descripcion                   |
|-------------------|-------------------------------|
| `pnpm run dev`     | Desarrollo local con HMR      |
| `pnpm run build`   | Build de produccion           |
| `pnpm run preview` | Preview del build             |
| `pnpm run lint`    | ESLint                        |
