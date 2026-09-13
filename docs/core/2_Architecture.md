# Arquitectura y Stack Tecnológico

### 1. Stack Seleccionado
- **Frontend:** Next.js 14+ (App Router) + React.
- **Estilos:** Tailwind CSS.
- **Animaciones:** Framer Motion.
- **Pagos & Subscripciones:** SDK de Mercado Pago (Client `PaymentBrick` y Server `PreApproval` & Webhooks).
- **Base de Datos & Auth:** Firebase (Firestore para DB NoSQL, Auth para sesiones). **No se usa Firebase Storage** — ver §Media Strategy.
- **Hosting y CI/CD:** Vercel.

### 2. Patrones de Arquitectura
- **Componentes Server/Client:** Las vistas públicas priorizan Server Components (SSR/SSG) para SEO. El dashboard usa Client Components para interactividad.
- **Auth Strategy:** Firebase Auth con `signInWithPopup` + `browserPopupRedirectResolver` explícito. Las rutas `/login` y `/register` usan `COOP: unsafe-none` (en `next.config.ts`) para permitir la comunicación del popup cross-origin de Firebase.
- **Admin Bypass & Webhooks:** La app utiliza `firebase-admin` versión `^11.11.1` en entornos server-side (API Routes) para interactuar con Firestore evadiendo reglas de seguridad de cliente. 
  > ⚠️ **Nota Crítica de ESM:** Nunca actualizar `firebase-admin` a la versión `12` o `14` en este proyecto sin verificar el problema de `ERR_REQUIRE_ESM` en Vercel, ya que versiones superiores instalan `jose` como ES Module, provocando que Node.js colapse silenciosamente en producción con un error 500 vacío.

### 2.5 Media Strategy (Avatar — MVP sin Storage)
Para mantener el plan gratuito estricto de Firebase, **no se usa Firebase Storage**.
- `avatarUrl` en Firestore es una URL pública de imagen (string).
- Fuente por defecto: `user.photoURL` de Google Auth (si existe).
- En la UI: campo de texto donde el usuario pega su URL pública de imagen.
- Validación: formato URL válido. No se valida el contenido de la imagen.

### 3. Configuración Inicial & Reglas
> ⚠️ Estos pasos ya fueron completados para el entorno de producción actual.

#### 3.1 Índices Compuestos Requeridos
La query de bloques combina `where('userId')` + `orderBy('order')` en campos distintos.
Firestore exige un índice compuesto para esto:
| Colección | Campo 1 | Campo 2 | Campo 3 | Estado |
|-----------|---------|---------|---------|--------|
| `blocks` | `userId` (Asc) | `order` (Asc) | — | ✅ Creado |
| `blocks` | `isActive` (Asc) | `userId` (Asc) | `order` (Asc) | ✅ Creado |

#### 3.2 Variables de entorno (`.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

NEXT_PUBLIC_APP_URL=https://www.lanvip.app
MP_ACCESS_TOKEN=...
NEXT_PUBLIC_MP_PUBLIC_KEY=...
MP_WEBHOOK_SECRET=...
MP_MONTHLY_PLAN_ID=...
MP_ANNUAL_PLAN_ID=...
NEXT_PUBLIC_PRICE_MONTHLY=5.000
NEXT_PUBLIC_PRICE_ANNUAL=50.000

FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

### 4. Reglas de Seguridad Firestore — Producción (Vivas)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Lectura pública
      allow read: if true;
      // Escritura bloqueada por defecto a nivel de cliente para proteger campos sensibles (plan, roles).
      // Solo el Admin SDK (vía endpoints /api/) puede escribir roles y planes.
      // El cliente solo puede editar su propio username, bio, avatar y theme a través del frontend.
      allow write: if request.auth != null && request.auth.uid == userId 
                   && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'plan', 'subscriptionEndsAt', 'processedPayments']);
    }
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /blocks/{blockId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Esquema de Datos Firestore (Data Model)

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
    themeId:   string,
    hideWatermark: boolean,
  },
  views:          number,
  plan:           'free' | 'vip',
  planNotification: 'upgraded' | 'downgraded' | 'trial',
  role:           'user' | 'admin' | 'superadmin',
  subscriptionId: string, // ID de la PreApproval de MercadoPago
  subscriptionEndsAt: Timestamp,
  isSubscriptionCancelled: boolean,
  processedPayments: string[], // Idempotencia de webhooks
  hasCompletedOnboarding: boolean,
  createdAt:      Timestamp,
}
```

**Colección `blocks`** (modelo Bento)
```typescript
{
  id:          string,
  userId:      string,
  type:        'link' | 'social' | 'vcard' | 'calendly' | 'divider' | 'section_title',
  content: {
    title:       string,
    url:         string?,
    icon:        string?,         
    description: string?,        
    phone?:      string,
    email?:      string,
    company?:    string,
    jobTitle?:   string,
  },
  width:       'full' | 'half',
  isFeatured:  boolean,          // Aplica brillo VIP
  order:       number,
  clickCount:  number,
  isActive:    boolean,
}
```

**Colección `usernames`** (Registry)
```typescript
{
  uid: string // El documento tiene como ID el nombre de usuario (ej. 'pepe')
}
```

### 6. Arquitectura de API de Pagos
La arquitectura se divide en dos endpoints server-side para proteger los tokens:
- `POST /api/checkout`: Recibe el Token de Tarjeta del frontend, valida la identidad del usuario contra Firebase Admin y crea el `PreApproval` en Mercado Pago, atando el `external_reference` al `uid` del usuario.
- `POST /api/webhooks/mercadopago`: Escucha eventos de `subscription_preapproval` y `payment`. Utiliza la "lógica de superposición idempotente" (Overlap Logic) para evitar acreditaciones dobles de fechas y extender la membresía VIP con base en los pagos exitosos.