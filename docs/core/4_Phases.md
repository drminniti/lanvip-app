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

### Fase 2: Gestión de Perfil y Motor Temático
1. Desarrollar CRUD completo de la colección `users` en Firestore.
2. Construir formulario de edición de perfil:
   - Subida de avatar a Firebase Storage.
   - Edición de `displayName`, `bio`, `username`.
3. Desarrollar el selector de "Temas VIP":
   - Paleta de colores con preview en tiempo real.
   - Toggle `cardStyle`: glass / solid / outlined.
   - Aplicación dinámica de variables CSS al Live Preview.

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