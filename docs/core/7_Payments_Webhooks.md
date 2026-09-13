# Payments & Webhooks Architecture
**Proyecto:** Lanvip 

## 1. El Flujo de Compra (Checkout)
Lanvip utiliza el sistema de Suscripciones (PreApproval) de Mercado Pago para procesar cargos recurrentes.

1. **Front-End:** El usuario escoge "Mensual" o "Anual" en `<UpgradeModal />`. El componente `<PaymentBrick />` de Mercado Pago obtiene los datos de la tarjeta y genera de forma segura un `cardTokenId`.
2. **Back-End (Init):** El frontend llama a `POST /api/checkout`. 
   - La API valida el token JWT del usuario vía Firebase Admin.
   - Genera una suscripción `PreApproval` en Mercado Pago pasando el `cardTokenId` y, CRÍTICAMENTE, seteando el `external_reference` con el `uid` del usuario. 
   - Responde 200 OK. El frontend muestra éxito y recarga el panel.

## 2. El Flujo de Confirmación (Webhooks)
Mercado Pago no procesa el cobro real instantáneamente en el paso 1, sino que lo manda a la cola de procesamiento y avisa a los servidores de Lanvip asíncronamente a través de webhooks.

La ruta `/api/webhooks/mercadopago` escucha dos tipos principales de eventos:
- **`subscription_preapproval`**: Disparado cuando el contrato de la suscripción cambia de estado (ej: Creado, Autorizado, Cancelado).
- **`payment`**: Disparado cada vez que Mercado Pago realiza un cobro asociado a una suscripción (tanto la primera cuota como todas las renovaciones futuras).

### 2.1 La trampa de la doble-acreditación (El Problema Clásico)
En el primer mes de un usuario, Mercado Pago dispara **ambos** webhooks casi simultáneamente:
1. "Se creó el contrato de Suscripción".
2. "Se cobró la primera cuota del contrato".

Si nuestro sistema agregara 30 días ciegamente al recibir el primer webhook, y agregara otros 30 días al recibir el segundo, un usuario que pagó 1 mes recibiría 60 días de acceso VIP.

### 2.2 La Solución Lanvip: Lógica de Superposición (Idempotencia Inteligente)
Para asegurar precisión matemática sin importar el orden o el retraso de llegada de los webhooks, implementamos lo siguiente:

1. **Cuando llega `subscription_preapproval` (Approved/Authorized):**
   - Habilitamos el VIP cambiando el estado del usuario (`plan: 'vip'`, `isSubscriptionCancelled: false`).
   - Le otorgamos 30 días de acceso (o 365) a partir de HOY (o a partir de su fecha final si ya tenía).
   
2. **Cuando llega `payment` (Approved):**
   - El sistema calcula: _"Si este pago me otorga 30 días empezando desde la `fecha_de_cobro` (`date_approved`), ¿mi nueva fecha final es MAYOR a la fecha de expiración que ya tengo?"_
   - **Caso de 1ª Compra:** El preapproval webhook ya le otorgó "Hoy + 30", así que la cuenta del Payment ("Hoy + 30") **no supera** la fecha actual. Se ignora la suma (superposición detectada).
   - **Caso de Renovación (Mes 2):** El pago ocurre el día 30, otorgando días hasta el día 60. El día 60 supera la fecha final antigua (Día 30), por lo que se extiende el VIP exitosamente.
   - Adicionalmente, guardamos el `id` del pago en el array `processedPayments` del usuario para proteger contra re-intentos fallidos de red por parte de MercadoPago.

### 3. Cancelaciones y Downgrades
- Cuando Mercado Pago envía un estado `cancelled`, Lanvip actualiza `isSubscriptionCancelled: true`. El usuario **NO** pierde el acceso inmediatamente, sino que el dashboard le avisa que ha cancelado pero podrá seguir disfrutando de sus beneficios hasta la fecha de `subscriptionEndsAt`.
- Cuando ocurre un `refunded` o un rechazo total del contrato, el Webhook hace un downgrade duro, seteando `plan: 'free'` inmediatamente.
