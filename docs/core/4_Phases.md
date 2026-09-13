# Plan de Ejecución (Fases de Desarrollo)

### Fase 1: Inicialización y Fundamentos ✅
- [x] Configuración inicial Next.js + Tailwind + Framer Motion.
- [x] Integración de Firebase Auth (Email & Google).
- [x] Maquetado del esqueleto del Dashboard de administración.

### Fase 2: Gestión de Perfil y Motor Temático ✅
- [x] CRUD completo de la colección `users` en Firestore.
- [x] Flujo de Onboarding obligatorio (`/onboarding`).
- [x] Página de Edición de Perfil (`/dashboard/profile`).
- [x] Motor Temático VIP (Obsidian, Midnight Blue, Forest, Rose Gold).
- [x] Landing Preview reactivo en tiempo real.

### Fase 3: Motor de Bloques Bento (CRUD) ✅
- [x] CRUD completo de la colección `blocks` en Firestore.
- [x] Gestor de grilla en el admin (drag & drop).
- [x] Soporte nativo para bloques de tamaño `full` y `half`.
- [x] Live Preview de los bloques (`onSnapshot`).

### Fase 4: Vista Pública y Rich Links ✅
- [x] Ruta dinámica `/[username]` que renderiza la Micro-Landing para visitantes.
- [x] Integración de bloques especiales: Enlaces, Redes Sociales, vCard, Calendly.
- [x] Animaciones de entrada fluidas (springs).

### Fase 5: Suscripciones, Analíticas y Roles VIP (PRODUCCIÓN) ✅
- [x] Integración SDK Mercado Pago (Checkout UI - Payment Brick).
- [x] Rutas backend protegidas `/api/checkout` para crear Suscripciones.
- [x] Escucha y procesamiento de Webhooks con Lógica Idempotente para renovaciones.
- [x] Panel de Administración (CRM Interno) para gestión de usuarios, URLs y roles.
- [x] Muros de pago (Feature Flags) protegiendo funciones VIP en el dashboard.
- [x] Reglas estrictas de Firestore y protección contra dependencias ESM problemáticas.

### Fase 6: Refinamientos, Escala y B2B (HOJA DE RUTA FUTURA) 🚀
1. **Analíticas Avanzadas:** Historial de clics por tiempo y orígenes geográficos.
2. **Dominio Personalizado:** Permitir que usuarios VIP mapeen dominios propios.
3. **Planes Organizacionales (Teams):** Soporte multi-usuario gestionado por corporaciones.
4. **Nuevos Rich Links:** Bloques de Video (YouTube), Música (Spotify) y Galerías de imágenes.
5. **NFC / Hardware Phygital:** Vinculación de Tarjetas Físicas con los perfiles.