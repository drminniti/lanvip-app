# Analíticas — Arquitectura y Schema

**Proyecto:** Lanvip

---

## 1. Visión General

El sistema de analíticas de Lanvip tiene dos capas:

| Capa | Qué trackea | Disponible para |
|---|---|---|
| **Contadores acumulados** (Firestore `users/{uid}`) | `views`, `uniqueClicks` | Free + VIP |
| **Serie temporal** (subcollección `analytics`) | Visitas diarias + país + dispositivo + referrer | VIP (visualización), todos (escritura) |

---

## 2. Captura de Datos (Client → Server)

### Flujo
```
Visitante entra al perfil público /username
   ↓
PublicLanding.tsx → useEffect → trackPageView(uid) (sessionStorage-deduplicado)
   ↓
En paralelo:
  1. Firestore client SDK → users/{uid}.views += 1    (acumulado, Free visible)
  2. fetch POST /api/analytics/track                   (enriquecido, VIP visible)
         ↓
    Server reads headers:
      x-vercel-ip-country → "AR"
      User-Agent          → ua-parser-js → "mobile"
      Referer             → normalizado → "instagram"
         ↓
    Firestore Admin SDK → users/{uid}/analytics/YYYY-MM-DD (merge: true, increment)
```

### ¿Por qué server-side para país/dispositivo/referrer?
El client-side no puede leer `x-vercel-ip-country` (header de Vercel, solo server).
El User-Agent en el cliente puede estar spoofed o ausente. El Referer puede ser bloqueado por políticas de privacidad del browser si se lee desde JS.

---

## 3. Schema Firestore

### Colección `users/{uid}/analytics` (subcollección)

**Documento ID:** `YYYY-MM-DD` (fecha en UTC, uno por día por usuario)

```typescript
{
  date:      string,                   // "2026-09-16" (= document ID)
  views:     number,                   // visitas del día (FieldValue.increment)
  countries: Record<string, number>,   // { "AR": 8, "US": 2, "Unknown": 1 }
  devices:   Record<string, number>,   // { "mobile": 7, "desktop": 4, "tablet": 1 }
  referrers: Record<string, number>,   // { "direct": 5, "instagram": 3, "google": 2 }
}
```

**Ventajas del diseño:**
- Un doc por día → máx ~365 docs/año/usuario → muy eficiente
- Doc ID = fecha → queries por rango de fechas en O(1)
- `FieldValue.increment()` es atómico → no hay race conditions con múltiples visitantes

---

## 4. Segmentación Free vs VIP

Los datos **siempre se escriben** para todos los usuarios (Free y VIP).
Esto garantiza que cuando un usuario Free sube a VIP, su historial ya está disponible.

La diferencia está solo en la **visualización** dentro del dashboard:

| Feature | Free | VIP |
|---|---|---|
| Visitas totales (acumulado) | ✅ | ✅ |
| Clics totales | ✅ | ✅ |
| Bloques activos | ✅ | ✅ |
| CTR Único | ✅ | ✅ |
| Gráfico de visitas (7/30 días) | 🔒 paywall | ✅ |
| Breakdown de dispositivos | 🔒 paywall | ✅ |
| Breakdown de países | 🔒 paywall | ✅ |
| Fuentes de tráfico (referrers) | 🔒 paywall | ✅ |

---

## 5. Componentes y Archivos

| Archivo | Rol |
|---|---|
| `src/lib/analytics.ts` | `trackPageView()` y `incrementClickCount()` — llamados desde client |
| `src/app/api/analytics/track/route.ts` | API Route que captura country/device/referrer server-side |
| `src/hooks/useAnalytics.ts` | Hook que lee la subcollección y devuelve datos formateados |
| `src/app/(dashboard)/dashboard/analytics/page.tsx` | Dashboard con KPIs (Free) + panel avanzado (VIP) |

---

## 6. País en Desarrollo Local

En local, el header `x-vercel-ip-country` no existe → el campo `countries` queda como `{ "Unknown": N }`. En producción (Vercel), el header se inyecta automáticamente con el país real del visitante sin configuración adicional.

---

## 7. Reglas de Firestore para la Subcollección

Las reglas actuales permiten `read/write` al dueño del documento. Para que el hook `useAnalytics` lea desde el cliente, las reglas deben permitir lectura al `uid` dueño:

```
match /users/{userId}/analytics/{docId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Solo escribe el Admin SDK (server-side)
}
```

> ⚠️ Agregar esta regla en Firebase Console → Firestore → Rules si se actualiza a reglas de producción granulares.
