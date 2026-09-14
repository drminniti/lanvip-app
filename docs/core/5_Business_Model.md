# Business & Monetization Architecture
**Proyecto:** Lanvip 

### 1. Visión de Negocio
Lanvip evolucionará de una herramienta gratuita (MVP de validación) a un modelo de ingresos de tres niveles:
1. **Suscripción SaaS (Pro):** B2C para profesionales independientes.
2. **High-Ticket Phygital (Setup VIP):** Venta de hardware (Tarjetas NFC) + Software.
3. **Enterprise B2B (Lanvip Teams):** Flotas de perfiles controladas centralizadamente por corporaciones.

### 2. Impacto en el Modelo de Datos (Future-Proofing)
El agente debe estructurar la base de datos en Firestore para soportar esta lógica de escalabilidad, añadiendo los siguientes campos desde el MVP:

**Actualización Colección `users`:**
- `planId`: Enum `['free', 'pro', 'team_member', 'team_admin']`. (Por defecto: `free`).
- `organizationId`: Referencia nula por defecto, utilizada en el futuro para agrupar usuarios B2B.
- `isNfcEnabled`: Booleano para trackear si el usuario adquirió el Setup VIP físico.

**Nueva Colección `organizations` (Preparación B2B):**
- `{ id, name, adminUid, brandingSettings: { forceLogo, forceColors }, activeLicenses, maxLicenses }`

### 3. Reglas de Negocio en la Interfaz (UI)
- **Feature Flags (Muros de Pago visuales):** El panel de administración debe estar preparado para renderizar un candado 🔒 o una etiqueta "PRO" en funcionalidades premium (ej. Analíticas Avanzadas, Dominio Personalizado). Al hacer tap, se debe mostrar un modal de "Próximamente / Upgrade" para validar la intención de pago de los early adopters.
- **Onboarding:** El flujo de registro debe ser extremadamente simple para facilitar el "Onboarding Consultivo" manual que se hará con los primeros usuarios.

### 4. Seguridad de Rutas y Roles
- Implementar un middleware robusto en Next.js que valide el `planId` del usuario antes de permitir el acceso a rutas protegidas o configuraciones avanzadas del dashboard.

### 5. Lógica de Expiración (Suscripciones)
Para gestionar la transición entre VIP y Free de manera retrocompatible y robusta:
- **Lifetime VIPs (Fase temprana):** Usuarios con `plan === 'vip'` pero sin `subscriptionEndsAt`. Mantienen el acceso VIP de manera indefinida.
- **VIP Activo:** Usuarios con `plan === 'vip'` y un `subscriptionEndsAt` en el futuro.
- **VIP Expirado:** Si un usuario cancela o el pago falla, la fecha `subscriptionEndsAt` pasará, pero su campo `plan` podría seguir siendo `'vip'` hasta que un proceso (ej. un cron job de downgrade) lo pase a `'free'`. El sistema (`useSubscription`) calcula dinámicamente si el plan expiró basándose en la fecha actual y revoca el acceso VIP en la UI inmediatamente, mostrando además banners de renovación.