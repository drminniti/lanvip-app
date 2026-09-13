# Business & Monetization Architecture
**Proyecto:** Lanvip 

### 1. Visión de Negocio
Lanvip evolucionó de una herramienta de validación (Free) a un ecosistema SaaS premium (Freemium):
1. **Suscripción SaaS (VIP):** Usuarios particulares pueden mejorar sus perfiles desbloqueando características de conversión avanzadas (Temas premium, sin marca de agua, analíticas exhaustivas).
2. **Onboarding Consultivo (Sales):** A través del CRM interno, los administradores pueden otorgar pruebas VIP ("Trials" manuales temporales) a cuentas estratégicas para enamorarlas del servicio antes del cobro.
3. **Phygital y B2B (Futuro):** Venta cruzada de hardware (Tarjetas NFC) y flotas de usuarios manejados por empresas.

### 2. Estructura de Planes SaaS (Actual)
El sistema actual reconoce dos grandes estados a través de la propiedad `plan` en el documento del usuario:
- `plan: 'free'`: El usuario tiene acceso a su perfil base con marca de agua y temas estándar.
- `plan: 'vip'`: El usuario ha desbloqueado las funciones avanzadas. Su plan expira al finalizar `subscriptionEndsAt` o se auto-renueva si la suscripción de Mercado Pago es exitosa.

**Opciones de Venta (UI Checkouts):**
Los usuarios compran una de dos frecuencias dentro del plan VIP:
- **Mensual:** Facturación mes a mes. Agrega 30 días con cada renovación automática.
- **Anual:** Facturación completa anual, generalmente con descuento. Agrega 365 días con cada renovación.

### 3. Impacto en el Modelo de Datos (Firestore)
- `plan`: Campo central `'free' | 'vip'`.
- `planNotification`: Enum usado para mostrar alertas en el dashboard (ej. `'upgraded'`, `'downgraded'`, `'trial'`).
- `subscriptionEndsAt`: Timestamp nativo que determina cuándo el usuario pierde acceso VIP si MercadoPago no cobra la renovación a tiempo.
- `isSubscriptionCancelled`: Si el usuario interrumpió el cobro recurrente (pero retiene beneficios hasta `subscriptionEndsAt`).

### 4. Paneles de Seguridad (Feature Flags)
El front-end implementa "Feature Flags" reactivos (`isVipActive`):
- Los apartados "Temas", "Watermark", "Analíticas" comprueban el estatus `vip` e interponen un muro de pago ("Bloqueado") solicitando al usuario que mejore su plan con el componente `<UpgradeModal />`.
- El acceso administrativo (CRM) está gobernado por el middleware y Firebase context a través de `role: 'admin' | 'superadmin'`.