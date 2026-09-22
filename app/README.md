# APP (`/app`)

Interfaz web del proyecto Stepfive. Es una SPA (React 18 + Vite + React Router) que funciona como **consola de administracion RBAC**: permite gestionar usuarios, roles y permisos contra la API backend.

### Que ve el usuario

| Pantalla          | Ruta              | Permiso requerido      | Que hace                                                              |
|-------------------|-------------------|------------------------|-----------------------------------------------------------------------|
| **Login/Registro**| `/auth`           | Publica                | Formulario de login y wizard de registro (5 pasos, carga imagen a Firebase) |
| **Dashboard**     | `/`               | `AccessDashboard`      | Saludo con nombre del usuario y fecha actual                          |
| **Usuarios**      | `/users`          | `AccessUsers`          | Listado en tarjetas o tabla, autorizar/desautorizar, asignar roles, ver detalles, eliminar |
| **Autorizacion**  | `/authorization`  | `AccessAuthorization`  | CRUD de roles (crear, editar, activar/desactivar, asignar permisos) y consulta de permisos |

Funcionalidades transversales: tema claro/oscuro, deteccion de conexion offline, sidebar con navegacion filtrada por permisos, sesion persistida en `localStorage`.

> **Nota:** Existen componentes listos pero **aun sin usar** en las vistas: mapas (`MapPicker` con Leaflet), graficos (Recharts), y exportacion a Excel (`exceljs`). Estan disponibles en `src/core/` para futuros modulos.

## Instalacion y servidor de desarrollo

```bash
cd app
pnpm install
pnpm run dev
```

Abre `http://localhost:5173`. Deberia cargar la pantalla de login.

## Variables de entorno

El frontend usa variables con prefijo `VITE_*` (archivo `.env` en la raiz de `app/`):

| Variable              | Descripcion                                    | Ejemplo                              |
|-----------------------|------------------------------------------------|--------------------------------------|
| `VITE_IS_DEV_MODE`    | Alterna entre dev y prod (`true` o `false`)    | `true`                               |
| `VITE_API_URL_DEV`    | URL de la API en desarrollo                    | `http://localhost:3000/api/v1`       |
| `VITE_API_URL_PROD`   | URL de la API en produccion                    | `https://mi-backend.onrender.com/api/v1` |

El codigo lee estas variables via `import.meta.env.VITE_*` y elige la URL segun `VITE_IS_DEV_MODE`. En produccion se debe configurar `VITE_IS_DEV_MODE=false`.

### Firebase (requerido para subida de imagenes)

El registro de usuarios sube la imagen de perfil a Firebase Storage. La configuracion esta en:

**`src/core/config/firebase.config.mjs`**

Si el proyecto de Firebase cambia, actualiza las credenciales en ese archivo.

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
│   ├── config/               # Configuracion de API via variables de entorno .env y Firebase
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
│       ├── pages/                # Dashboard, Users, Authorization
│       ├── components/           # UserCard, UsersTable, RoleCard, RoleForm, Permissions...
│       └── services/             # AuthRequester (cliente HTTP para endpoints de auth)
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
