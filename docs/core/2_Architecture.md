# Arquitectura y Stack Tecnológico

### 1. Stack Seleccionado
- **Frontend:** Next.js (App Router) + React.
- **Estilos:** Tailwind CSS.
- **Animaciones:** Framer Motion.
- **Base de Datos & Auth:** Firebase (Firestore para DB NoSQL, Storage para media, Auth para sesiones).
- **Hosting y CI/CD:** Vercel (con soporte para dominios personalizados a futuro).

### 2. Patrones de Arquitectura
- **Specification-Driven Development (SDD):** Código generado estrictamente sobre specs.
- **Componentes Server/Client:** Las vistas públicas priorizan Server Components (SSR/SSG) para SEO. El dashboard usa Client Components para interactividad.
- **Auth Strategy:** Firebase Auth con `signInWithPopup` + `browserPopupRedirectResolver` explícito. Las rutas `/login` y `/register` usan `COOP: unsafe-none` (en `next.config.ts`) para permitir la comunicación del popup cross-origin de Firebase. `signInWithRedirect` fue descartado porque en localhost los resultados se almacenan en sessionStorage de `firebaseapp.com`, inaccesible por Same-Origin Policy. La persistencia usa `browserLocalPersistence` (localStorage) para evitar conflictos de IndexedDB con HMR de Next.js.
- **Singleton Pattern:** Las instancias de Firebase (App, Auth, Firestore, Storage) se almacenan en `globalThis` para sobrevivir los re-renderizados del Hot Module Replacement sin re-inicializar el SDK.

### 3. Configuración de Firebase Console (Pre-requisitos obligatorios)

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
  id:       string,
  userId:   string,
  type:     string,            // 'link' | 'vcard' | 'calendly' | 'video' | ...
  content: {
    title:  string,
    url:    string,
    icon:   string,
    // campos adicionales según el type
  },
  layout: {
    spanSize: '1x1' | '2x1' | '2x2',
  },
  order:      number,
  clickCount: number,
  isActive:   boolean,
}
```

### 6. Flujo de Despliegue
- Repositorio GitHub conectado a Vercel para despliegues automáticos (`main` → Producción).
- Variables de entorno de producción deben configurarse en Vercel → Project → Settings → Environment Variables (mismas keys que `.env.local`).