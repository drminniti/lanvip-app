# Product Requirements Document (PRD)
## Proyecto: Lanvip (Mobile First VIP Micro-Landing)

### 1. Visión del Producto
Crear una plataforma escalable y segura que permita a profesionales y empresas desplegar una "Micro-Landing VIP" altamente personalizable, con foco en la conversión (Lead Generation) y una experiencia de usuario de primera clase.

### 2. Casos de Uso Principales
- **Visitante / Cliente Potencial:** Accede a `lanvip.app/usuario`, experimenta una interfaz premium tipo Bento Box, y puede agendar reuniones, descargar un contacto nativo o consumir multimedia sin fricción.
- **Usuario Estándar (Free):** Gestiona su perfil público, configura su landing básica y su grilla de contenidos.
- **Usuario Premium (VIP):** Adquiere una suscripción para acceder a funcionalidades exclusivas como temas premium, analíticas avanzadas y eliminación de la marca de agua.
- **Administrador (Superadmin/Admin):** Accede a un CRM interno para gestionar usuarios, asignar membresías manuales (trials), liberar nombres de usuario y monitorizar la plataforma.

### 3. Funcionalidades Core (Implementadas)
1. **Página Pública (Vista del Visitante):**
   - Perfil centralizado: Avatar HD, Título profesional y Biografía.
   - Grilla Bento: Distribución dinámica de enlaces y módulos (bloques cuadrados o rectangulares `full`/`half`).
   - Soporte para enlaces estándar, bloques de estructura y "Rich Links" (vCard, Calendly, Redes Sociales).
2. **Panel de Usuario (Dashboard):**
   - Autenticación segura gestionada por Firebase.
   - Interfaz de previsualización en vivo (Live Preview) al estilo editor visual.
   - CRUD completo de bloques (Crear, Editar, Eliminar, Reordenar drag & drop).
   - Motor de personalización de temas y colores VIP.
   - Módulo de Suscripciones (Checkout con Mercado Pago y auto-renovaciones).
3. **Analíticas y CRM:**
   - Tracking de visualizaciones de la landing y clics por cada bloque.
   - Panel de Administración (Backoffice) exclusivo para roles `admin` y `superadmin`.

### 4. Requisitos No Funcionales
- **Mobile First Real:** Pensado primero para uso táctil en smartphones, escalando de manera responsiva a desktop.
- **Rendimiento:** Tiempos de carga ultrarrápidos, apoyado en SSR/SSG de Next.js App Router.
- **Seguridad:** Arquitectura server-less con Firebase Firestore protegido mediante Reglas de Producción granulares y validación estricta de Webhooks.