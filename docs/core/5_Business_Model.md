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