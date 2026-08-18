# Plan de Ejecución (Fases de Desarrollo)

### Fase 1: Inicialización y Fundamentos ✅

#### Pre-requisitos Firebase Console (completar antes de codear)
> Estos pasos son obligatorios. Ver detalles completos en `2_Architecture.md §3`.

1. **Firebase Auth:** Habilitar **Email/Password** y **Google** en Sign-in methods.
2. **Firestore Database:** Crear la base de datos en modo Test. Aplicar reglas de dev (ver `2_Architecture.md §3.2`). Sin este paso, `getDoc`/`setDoc` fallan con `client is offline`.
3. **Variables de entorno:** Crear `.env.local` con las 7 variables `NEXT_PUBLIC_FIREBASE_*` (ver `2_Architecture.md §3.3`).

#### Pasos de implementación
4. Crear proyecto Next.js + Tailwind CSS + Framer Motion.
5. Inicializar SDK de Firebase con patrón singleton en `globalThis` (evita re-inicialización en HMR).
6. Implementar módulo de Autenticación:
   - Email/Password: `registerWithEmail`, `loginWithEmail`.
   - Google: `signInWithRedirect` + `getRedirectResult` (no `signInWithPopup` — incompatible con el header COOP de Next.js).
   - Persistencia: `browserLocalPersistence` (localStorage) en lugar de IndexedDB.
7. Configurar `next.config.ts` con header `Cross-Origin-Opener-Policy: same-origin-allow-popups`.
8. Maquetar el esqueleto del Dashboard de administración (sidebar desktop + bottom nav mobile).

---

### Fase 2: Gestión de Perfil y Motor Temático ✅

1. ✅ CRUD completo de la colección `users` en Firestore:
   - `updateUserProfile()`, `checkUsernameAvailable()`, `completeOnboarding()`.
   - Hook reactivo `useUserProfile()` con `onSnapshot`.
2. ✅ Flujo de Onboarding obligatorio (`/onboarding`):
   - Redirige a usuarios Google OAuth sin username elegido.
   - Verificación de disponibilidad de username en tiempo real.
   - `completeOnboarding()` → marca `hasCompletedOnboarding: true`.
3. ✅ Página de Edición de Perfil (`/dashboard/profile`):
   - Avatar: campo URL pública (no Firebase Storage — ver `2_Architecture.md §2.5`).
     Fuente por defecto: `photoURL` de Google Auth.
   - Edición de `displayName`, `username`, `bio`.
4. ✅ Motor Temático VIP — 4 temas predefinidos:
   - Obsidian (default), Midnight Blue, Forest, Rose Gold.
   - `ThemePicker` guarda en Firestore al instante (sin submit).
   - `LandingPreview` reactivo muestra la micro-landing en tiempo real.
5. ✅ Layout dividido desktop (formulario | preview sticky) / stacked mobile.

---

### Fase 3: Motor de Bloques Bento (CRUD)
1. Desarrollar CRUD completo de la colección `blocks` en Firestore.
2. Construir el gestor de grilla en el admin:
   - Agregar bloques estándar (link, vCard, Calendly, video).
   - Elegir tamaño de bloque (1x1, 2x1, 2x2).
   - Reordenar bloques con drag & drop.
3. Asegurar actualización en tiempo real entre el formulario y el Live Preview (`onSnapshot`).

---

### Fase 4: Vista Pública y Rich Links
1. Generar la ruta dinámica `/[username]` que consulte Firestore y renderice la Micro-Landing para visitantes.
2. Integrar bloques especiales: vCard, Calendly, Multimedia (ver `F01_Enlaces_Especiales.md`).
3. Incorporar animaciones de entrada con Framer Motion (springs tipo iOS).

---

### Fase 5: Analíticas y Despliegue
1. Implementar lógica de incremento de contadores (`views`, `clickCount`) con transacciones de Firestore.
2. Armar gráficos/tarjetas simples de métricas en el Dashboard.
3. **Reemplazar reglas Firestore de desarrollo** con reglas de producción granulares (ver `2_Architecture.md §4`).
4. Configurar variables de entorno en Vercel y hacer deploy final.