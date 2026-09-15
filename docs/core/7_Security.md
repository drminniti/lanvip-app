# Security & Permissions

**Proyecto:** Lanvip 

Este documento describe los mecanismos de seguridad de la aplicación.

### 1. Webhooks de MercadoPago (HMAC)
El endpoint `/api/webhooks/mercadopago` procesa notificaciones de pagos y suscripciones. Para prevenir que atacantes activen suscripciones falsas enviando un POST al endpoint, se valida la firma del webhook de MercadoPago:
- Se utiliza el `WebhookSignatureValidator` del SDK oficial de MercadoPago.
- Se lee el header `x-signature` y `x-request-id`, y el parámetro `data.id` del webhook.
- Se compara la firma generada usando HMAC SHA256 y la clave secreta `MP_WEBHOOK_SECRET` con la firma recibida en `x-signature`.
- Si no hay firma válida, la solicitud es rechazada (401).

### 2. Endpoints de Administración (Admin SDK)
Para operaciones masivas y sin restricción de reglas (como listar usuarios en el panel Admin):
- Se utiliza `/api/admin/users`.
- El endpoint valida el JWT de Firebase Auth enviado en el header `Authorization`.
- Con el UID validado, se busca el documento del usuario en Firestore (utilizando Admin SDK).
- Se verifica que el rol (`role`) del usuario sea `admin` o `superadmin`.
- Sólo en ese caso, se permite la respuesta de la operación (bypassing Firestore rules a través de Admin SDK).

### 3. Reglas de Firestore
Las reglas de seguridad de Firestore (ver `2_Architecture.md`) prohíben operaciones de lectura globales desde el cliente.
- `users`: Un usuario sólo puede escribir su propio documento. La lectura está abierta (`true`) para renderizar páginas públicas (`/username`).
- `blocks`: Lectura pública (`true`), escritura restringida al creador (`request.auth.uid == resource.data.userId`).

### 4. Cron Jobs
El cron job de downgrade (`/api/cron/downgrade-expired-vips`) se ejecuta diariamente a las 03:00 UTC desde la infraestructura de Vercel.
- Vercel envía automáticamente el header `Authorization: Bearer <CRON_SECRET>` en cada invocación.
- El endpoint valida ese header contra la variable de entorno `CRON_SECRET`. Sin ese header, retorna 401.
- El endpoint NO requiere un token de Firebase Auth porque está pensado para ser invocado exclusivamente por Vercel, no por usuarios.
- En desarrollo local (sin `CRON_SECRET`), el endpoint omite el chequeo y loggea una advertencia. En producción, `CRON_SECRET` siempre está seteada en Vercel.
- El cron escribe directamente a Firestore a través del Admin SDK, sin pasar por las reglas de seguridad públicas.
