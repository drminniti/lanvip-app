import { MercadoPagoConfig } from 'mercadopago';

// Validación estricta de entorno
if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO ERROR: MP_ACCESS_TOKEN is missing in environment variables. Por favor, revisa tu archivo .env.local');
}

/**
 * Cliente centralizado de Mercado Pago (SDK v2)
 * Se inicializa una única vez y se reutiliza en todas las rutas de API y Webhooks.
 */
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});
