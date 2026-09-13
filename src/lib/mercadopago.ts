import { MercadoPagoConfig } from 'mercadopago';

/**
 * Cliente centralizado de Mercado Pago (SDK v2)
 * Usamos una función para evitar crashes del módulo si falta la variable.
 */
export const getMpClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO ERROR: MP_ACCESS_TOKEN is missing in environment variables. Por favor, revisa tu configuración.');
  }

  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
      timeout: 5000,
    }
  });
};
