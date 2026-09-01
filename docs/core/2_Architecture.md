# Arquitectura y Stack Tecnológico

### 1. Stack Seleccionado
- **Frontend:** Next.js (App Router) + React.
- **Estilos:** Tailwind CSS.
- **Animaciones:** Framer Motion.
- **Base de Datos & Auth:** Firebase (Firestore para DB NoSQL, Auth para sesiones). **No se usa Firebase Storage** — ver §Media Strategy.
- **Hosting y CI/CD:** Vercel (con soporte para dominios personalizados a futuro).

### 2. Patrones de Arquitectura
- **Specification-Driven Development (SDD):** Código generado estrictamente sobre specs.
- **Componentes Server/Client:** Las vistas públicas priorizan Server Components (SSR/SSG) para SEO. El dashboard usa Client Components para interactividad.
- **Auth Strategy:** Firebase Auth con `signInWithPopup` + `browserPopupRedirectResolver` explícito. Las rutas `/login` y `/register` usan `COOP: unsafe-none` (en `next.config.ts`) para permitir la comunicación del popup cross-origin de Firebase. `signInWithRedirect` fue descartado porque en localhost los resultados se almacenan en sessionStorage de `firebaseapp.com`, inaccesible por Same-Origin Policy. La persistencia usa `browserLocalPersistence` (localStorage) para evitar conflictos de IndexedDB con HMR de Next.js.
- **Singleton Pattern:** Las instancias de Firebase (App, Auth, Firestore, Storage) se almacenan en `globalThis` para sobrevivir los re-renderizados del Hot Module Replacement sin re-inicializar el SDK.

### 2.5 Media Strategy (Avatar — MVP sin Storage)
Para mantener el plan gratuito estricto de Firebase, **no se usa Firebase Storage**.
- `avatarUrl` en Firestore es una URL pública de imagen (string).
- Fuente por defecto: `user.photoURL` de Google Auth (si existe).
- En la UI: campo de texto donde el usuario pega su URL pública de imagen.
- Validación: formato URL válido. No se valida el contenido de la imagen.
- Migración futura: cuando se habilite Storage en un plan pago, solo cambia
  el componente de upload; el campo `avatarUrl` en Firestore no cambia.


> ⚠️ Estos pasos deben completarse ANTES de ejecutar la aplicación. Sin ellos, la auth y la DB fallan silenciosamente.

#### 3.1 Authentication
1. Firebase Console → proyecto `lanvip-app` → **Authentication** → **Get started**.
2. Ir a **Sign-in method** y habilitar:
   - ✅ **Email/Password**
   - ✅ **Google** (configurar con email de soporte del proyecto)
3. Ir a **Settings → Authorized domains** y verificar que `localhost` está en la lista (viene por defecto).

#### 3.2 Firestore Database
1. Firebase Console → **Firestore Database** → **Create database**.
2. Seleccionar **modo Test** para desarrollo (o modo Production con reglas manuales).
3. Elegir la región más cercana (ej. `us-east1`).
4. Una vez creada, ir a la pestaña **Rules** y aplicar las siguientes reglas de desarrollo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fase 1-3 Development: cualquier usuario autenticado puede leer/escribir.
    // REEMPLAZAR en Fase 5 (producción) con reglas granulares.
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> ⚠️ Las reglas de Test mode expiran a las 30 días. Las reglas manuales de arriba no expiran.

#### 3.3 Índices Compuestos Requeridos
La query de bloques combina `where('userId')` + `orderBy('order')` en campos distintos.
Firestore exige un índice compuesto para esto — **debe crearse manualmente en Firebase Console**:

| Colección | Campo 1 | Campo 2 | Campo 3 | Estado |
|-----------|---------|---------|---------|--------|
| `blocks` | `userId` (Asc) | `order` (Asc) | — | ✅ Creado (Fase 3) |
| `blocks` | `isActive` (Asc) | `userId` (Asc) | `order` (Asc) | ✅ Creado (Fase 4) |

> Ir a Firebase Console → Firestore → Indexes → Add index si el proyecto se migra a un nuevo proyecto Firebase.


#### 3.3 Variables de entorno (`.env.local`)
Copiar las credenciales desde Firebase Console → Project Settings → General → Your apps:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```
> El prefijo `NEXT_PUBLIC_` es obligatorio para que las variables sean accesibles en el cliente (browser). Sin él, el SDK de Firebase en el cliente no recibe las credenciales.

### 4. Reglas de Seguridad Firestore — Fase 5 (Producción)
Reemplazar las reglas de desarrollo con las siguientes antes del deploy final:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Perfiles públicos: lectura abierta, escritura solo del dueño
    match /users/{userId} {
      allow read:  if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Bloques Bento: lectura pública, escritura solo del dueño del bloque
    match /blocks/{blockId} {
      allow read:  if true;
      allow write: if request.auth != null
                   && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Esquema de Datos Firestore

**Colección `users`**
```typescript
{
  uid:            string,
  username:       string,       // URL slug: lanvip.app/{username}
  displayName:    string,
  bio:            string,
  avatarUrl:      string,
  themeSettings: {
    bgType:    'mesh' | 'solid' | 'gradient',
    colors:    string[],
    cardStyle: 'glass' | 'solid' | 'outlined',
    darkMode:  boolean,
  },
  views:          number,
  planId:         'free' | 'pro' | 'enterprise',
  organizationId: string | null,
  isNfcEnabled:   boolean,
  createdAt:      Timestamp,
}
```

**Colección `blocks`** (modelo Bento — reemplaza listas de links)
```typescript
{
  id:          string,
  userId:      string,
  type:        string,           // 'link' | 'social' | 'vcard' | 'calendly' | ...
  content: {
    title:       string,
    url:         string,
    icon:        string,         // emoji elegido por el usuario
    description: string?,        // subtítulo opcional bajo el título
    thumbnailUrl: string?,
    embedId:     string?,        // para YouTube / Spotify
  },
  layout: {
    spanSize: '1x1' | '2x1' | '2x2',  // reservado para uso futuro / row-span
  },
  isFeatured:  boolean,          // true → col-span-2 (ancho completo de grilla)
  order:       number,
  clickCount:  number,
  isActive:    boolean,
}
```

> **Regla de grilla:** `isFeatured` es el campo canónico que controla el span horizontal del bloque.
> `layout.spanSize` queda como legado para soporte de row-span futuro y migración de datos viejos.

> **CRUD de bloques:** `addBlock()` crea, `updateBlockContent()` edita solo campos de usuario (`content` + `isFeatured`), `reorderBlocks()` persiste el orden, `deleteBlock()` elimina. `id`, `order`, `userId`, `clickCount` y `createdAt` nunca se tocan en el flujo de edición.

> **Tipos de bloque y campos especiales:** Ver [`F01_Enlaces_Especiales.md`](./F01_Enlaces_Especiales.md) para el esquema completo por tipo (`link`, `social`, `vcard`, `calendly`) y la hoja de ruta de tipos futuros.
> Campos vCard en `BlockContent`: `phone?`, `email?`, `company?`, `jobTitle?` — opcionales, `undefined` para otros tipos.

### 6. Guía de Despliegue en Vercel (Fase 5)

> Esta guía documenta el proceso completo de deploy. El repositorio GitHub ya está conectado a Vercel para CI/CD automático (`main` → Producción).

#### Paso 1 — Importar el proyecto en Vercel
1. Ir a [vercel.com/new](https://vercel.com/new) e iniciar sesión con tu cuenta GitHub.
2. Hacer clic en **"Import"** sobre el repo `drminniti/lanvip-app`.
3. Framework: Next.js (detectado automáticamente).
4. Root Directory: `.` (raíz del repo).
5. **No hacer clic en Deploy todavía** — primero configurar las variables de entorno.

#### Paso 2 — Variables de entorno en Vercel
En la pantalla de configuración del proyecto (o en Settings → Environment Variables), agregar **todas** las variables de `.env.local`:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Desde Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Desde Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `lanvip-app` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Desde Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Desde Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Desde Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Desde Firebase Console → Project Settings |

> ⚠️ Asegurarse de seleccionar los tres entornos: **Production**, **Preview** y **Development**.

#### Paso 3 — Primer deploy
Hacer clic en **Deploy**. Vercel construirá y desplegará la app. El primer deploy toma ~2 minutos.

#### Paso 4 — Agregar dominio de producción a Firebase Auth
Una vez que Vercel asigna la URL de producción (ej. `lanvip-app.vercel.app` o dominio propio):
1. Ir a Firebase Console → Authentication → Settings → **Authorized domains**.
2. Agregar el dominio de Vercel (ej. `lanvip-app.vercel.app`).
3. Si tenés dominio propio (ej. `lanvip.app`), agregarlo también.

> Sin este paso, el login con Google fallará en producción.

#### Paso 5 — Verificar Firestore rules y dominio en COOP header
En `next.config.ts`, el header COOP `unsafe-none` solo aplica a `/login` y `/register`.
No requiere cambios para Vercel.

#### Paso 6 — Checklist post-deploy ✅
- [ ] `https://tu-dominio.vercel.app/login` — login con email y Google funciona
- [ ] `https://tu-dominio.vercel.app/tu-username` — landing pública visible sin login
- [ ] Visitar la landing pública → verificar que `views` incrementa en Firestore Console
- [ ] Hacer clic en un bloque → verificar que `clickCount` incrementa
- [ ] `/dashboard/analytics` → métricas visibles en el dashboard

#### CI/CD continuo
A partir del primer deploy, **cada merge a `main` en GitHub triggerea un re-deploy automático** en Vercel. No se requiere ninguna acción manual para futuros releases.