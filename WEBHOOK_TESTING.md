# Guía de Testing Local para Webhooks de Mercado Pago

Para probar la integración de Mercado Pago en tu entorno local (localhost), necesitamos exponer tu servidor local a Internet para que Mercado Pago pueda enviarle las notificaciones (Webhooks). Para esto usaremos **ngrok**.

### 1. Iniciar tu Servidor Local
Asegúrate de que tu aplicación Next.js esté corriendo en el puerto 3000.
```bash
npm run dev
```

### 2. Exponer el Puerto con Ngrok
Abre una nueva terminal e inicia ngrok apuntando al puerto 3000:
```bash
ngrok http 3000
```
Copia la URL pública generada (ejemplo: `https://a1b2c3d4.ngrok.app`).

### 3. Configurar Mercado Pago
1. Ve a tu panel de desarrolladores en Mercado Pago: [Tus Integraciones](https://www.mercadopago.com.ar/developers/panel/applications)
2. Selecciona tu aplicación (o crea una nueva).
3. En el menú lateral, haz clic en **Webhooks** (o "Notificaciones Webhook").
4. En **URL de producción** (o de prueba), pega tu URL de ngrok y añádele el path de nuestra API:
   `https://<TU-URL-DE-NGROK>/api/webhooks/mercadopago`
5. En la sección **Eventos**, asegúrate de marcar:
   - `Pagos` (payments)
   - `Suscripciones` (subscription_preapproval)
6. Guarda los cambios. Al guardar, Mercado Pago te revelará una **Clave Secreta** para validar las firmas. Cópiala.

### 4. Configurar Variables de Entorno Locales
1. Abre tu archivo `.env.local` en este proyecto.
2. Añade o actualiza la variable del secreto que acabas de copiar:
   `MP_WEBHOOK_SECRET="tu_clave_secreta_aqui"`
3. ¡Muy importante! Reinicia tu servidor local de Next.js (`npm run dev`) para que tome el nuevo `.env.local`.

### 5. Probar el Flujo
1. Entra a tu dashboard local, haz clic en **Hazte VIP**.
2. Completa el flujo de pago con las [Tarjetas de Prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards).
3. Mira la terminal de tu servidor Next.js. Deberías ver el log estructurado:
   ```text
   ✅ WEBHOOK RECIBIDO Y VALIDADO (MERCADO PAGO)
   - TIPO:   payment
   - UID:    <tu-user-id>
   - PLAN:   Suscripción Mensual VIP - Lanvip
   - ESTADO: approved
   ```

Una vez que veas este log, habrás confirmado que la comunicación Bidireccional funciona perfectamente y de manera segura (validando firmas criptográficas).
