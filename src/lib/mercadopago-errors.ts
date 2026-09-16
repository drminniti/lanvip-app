/**
 * Utility to translate MercadoPago API error messages and codes into
 * clear, user-friendly Spanish messages.
 */

export function translateMPError(errorData: any): string {
  // Convertimos el error a un string en minúsculas para facilitar la búsqueda
  const errorString = typeof errorData === 'string' 
    ? errorData.toLowerCase() 
    : JSON.stringify(errorData).toLowerCase()

  // 1. Errores específicos de Tokens
  if (errorString.includes('card token was used') || errorString.includes('used card token')) {
    return 'El código de la tarjeta caducó. Por favor, actualiza la página y vuelve a intentarlo.'
  }

  if (errorString.includes('card_token_id is required') || errorString.includes('invalid card_token_id')) {
    return 'La tarjeta no es válida o faltan datos. Por favor, vuelve a ingresarla.'
  }

  // 2. Errores de Validación de Tarjeta
  if (errorString.includes('cc_rejected_bad_filled_security_code') || errorString.includes('invalid security_code')) {
    return 'Revisa el código de seguridad (CVV).'
  }

  if (errorString.includes('cc_rejected_bad_filled_date') || errorString.includes('invalid expiration_month') || errorString.includes('invalid expiration_year')) {
    return 'Revisa la fecha de vencimiento.'
  }

  if (errorString.includes('cc_rejected_bad_filled_card_number') || errorString.includes('invalid card_number')) {
    return 'Revisa el número de la tarjeta.'
  }

  if (errorString.includes('cc_rejected_bad_filled_other')) {
    return 'Revisa los datos ingresados de la tarjeta.'
  }

  // 3. Rechazos del Banco / Emisor
  if (errorString.includes('cc_rejected_insufficient_amount')) {
    return 'Tu tarjeta no tiene fondos suficientes.'
  }

  if (errorString.includes('cc_rejected_call_for_authorize')) {
    return 'Debes autorizar el pago llamando a tu banco o tarjeta.'
  }

  if (errorString.includes('cc_rejected_high_risk')) {
    return 'Tu pago fue rechazado por seguridad. Intenta con otra tarjeta.'
  }

  if (errorString.includes('cc_rejected_max_attempts')) {
    return 'Llegaste al límite de intentos. Intenta con otra tarjeta.'
  }

  if (errorString.includes('cc_rejected_duplicated_payment')) {
    return 'Ya hiciste un pago por ese valor. Usa otra tarjeta u otro medio de pago.'
  }

  if (errorString.includes('cc_rejected_card_disabled')) {
    return 'Llama a tu tarjeta para activarla o usa otro medio de pago.'
  }

  if (errorString.includes('cc_rejected_invalid_installments')) {
    return 'Tu tarjeta no permite esta cantidad de cuotas.'
  }

  if (errorString.includes('cc_rejected_blacklisted')) {
    return 'No pudimos procesar tu pago. Intenta con otra tarjeta.'
  }

  // Errores de Checkout / Internos
  if (errorString.includes('unauthorized') || errorString.includes('token')) {
    return 'Tu sesión expiró o es inválida. Refresca la página.'
  }

  // Fallback genérico si no coincide con ninguno conocido
  return 'No pudimos procesar el pago. Por favor, revisa tus datos o intenta con otra tarjeta.'
}
