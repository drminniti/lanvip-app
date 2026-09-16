import { Resend } from 'resend'

// Validamos que exista la clave para no crashear en desarrollo si alguien se olvida de ponerla
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = 'Lanvip <noreply@lanvip.app>' // Reemplazar con dominio verificado en producción si es distinto

// ─── Diseño Base (Look & Feel) ────────────────────────────────────────────────

const styles = {
  container: 'background-color: #0A0A0A; color: #E0E0E0; font-family: "Inter", -apple-system, sans-serif; padding: 40px 20px; line-height: 1.6;',
  card: 'background-color: #141414; border: 1px solid #222; border-radius: 12px; padding: 32px; max-width: 500px; margin: 0 auto;',
  h1: 'color: #FFFFFF; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 24px;',
  p: 'font-size: 15px; color: #A3A3A3; margin-bottom: 20px;',
  strong: 'color: #FFFFFF; font-weight: 600;',
  button: 'display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 10px;',
  footer: 'text-align: center; font-size: 12px; color: #555; margin-top: 32px;'
}

function baseTemplate(content: string) {
  return `
    <div style="${styles.container}">
      <div style="${styles.card}">
        ${content}
      </div>
      <div style="${styles.footer}">
        Lanvip © ${new Date().getFullYear()} — Elevá tu presencia digital.
      </div>
    </div>
  `
}

// ─── Funciones de Envío ───────────────────────────────────────────────────────

/**
 * Envia el correo de bienvenida al registrarse (Alta Free).
 */
export async function sendWelcomeEmail(to: string, name: string, username: string) {
  if (!resend) return console.warn('[Emails] ⚠️ Resend API Key no configurada. Saltando envío de correo de Bienvenida.')

  const content = `
    <h1 style="${styles.h1}">Bienvenido a Lanvip ⚡️</h1>
    <p style="${styles.p}">Hola <strong style="${styles.strong}">${name}</strong>,</p>
    <p style="${styles.p}">Tu perfil público ya está activo y listo para ser configurado. Acabás de dar el primer paso para unificar todos tus enlaces y elevar tu presencia digital.</p>
    <p style="${styles.p}">Podés ver tu perfil en vivo o empezar a personalizarlo desde el panel de control:</p>
    <div style="margin-top: 20px;">
      <a href="https://lanvip.app/${username}" style="${styles.button}">Ver mi perfil</a>
      <a href="https://lanvip.app/dashboard" style="${styles.button} background-color: #333333; color: #FFFFFF; margin-left: 10px;">Configurar mi perfil</a>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Bienvenido a Lanvip ⚡️',
      html: baseTemplate(content),
    })
    console.log(`[Emails] ✅ Correo de Bienvenida enviado a ${to}`)
  } catch (error) {
    console.error(`[Emails] ❌ Error enviando correo de Bienvenida a ${to}:`, error)
  }
}

/**
 * Envia el correo de upgrade (Bienvenida VIP).
 */
export async function sendVipUpgradeEmail(to: string, name: string, isAnnual: boolean) {
  if (!resend) return console.warn('[Emails] ⚠️ Resend API Key no configurada. Saltando envío de correo VIP.')

  const planText = isAnnual ? 'Anual' : 'Mensual'
  
  const content = `
    <h1 style="${styles.h1}">¡Ya sos VIP! 💎</h1>
    <p style="${styles.p}">Hola <strong style="${styles.strong}">${name}</strong>,</p>
    <p style="${styles.p}">Tu suscripción <strong style="${styles.strong}">${planText}</strong> fue procesada con éxito. Ya tenés acceso a todas las funcionalidades premium de Lanvip:</p>
    <ul style="${styles.p} padding-left: 20px;">
      <li>Analíticas avanzadas en tiempo real.</li>
      <li>Temas y diseños exclusivos.</li>
      <li>Múltiples bloques personalizados.</li>
    </ul>
    <p style="${styles.p}">Entrá al dashboard para exprimir al máximo tu nuevo plan.</p>
    <a href="https://lanvip.app/dashboard" style="${styles.button}">Ir al Dashboard VIP</a>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '💎 Tu cuenta Lanvip ahora es VIP',
      html: baseTemplate(content),
    })
    console.log(`[Emails] ✅ Correo VIP enviado a ${to}`)
  } catch (error) {
    console.error(`[Emails] ❌ Error enviando correo VIP a ${to}:`, error)
  }
}

/**
 * Envia el correo de downgrade cuando expira la suscripción VIP.
 */
export async function sendVipDowngradeEmail(to: string, name: string) {
  if (!resend) return console.warn('[Emails] ⚠️ Resend API Key no configurada. Saltando envío de correo de Downgrade.')

  const content = `
    <h1 style="${styles.h1}">Tu suscripción VIP expiró ⏳</h1>
    <p style="${styles.p}">Hola <strong style="${styles.strong}">${name}</strong>,</p>
    <p style="${styles.p}">Te avisamos que el tiempo de tu suscripción VIP ha llegado a su fin y tu cuenta volvió al plan Free.</p>
    <p style="${styles.p}">No te preocupes, <strong>tu perfil público sigue activo</strong> y tus enlaces básicos siguen funcionando. Sin embargo, las funcionalidades avanzadas (como analíticas detalladas y temas exclusivos) han sido pausadas.</p>
    <p style="${styles.p}">Si querés volver a activar todos tus beneficios, podés renovar tu plan en cualquier momento desde el dashboard.</p>
    <a href="https://lanvip.app/dashboard" style="${styles.button}">Renovar VIP</a>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Tu suscripción VIP ha expirado',
      html: baseTemplate(content),
    })
    console.log(`[Emails] ✅ Correo de Downgrade enviado a ${to}`)
  } catch (error) {
    console.error(`[Emails] ❌ Error enviando correo de Downgrade a ${to}:`, error)
  }
}

/**
 * Envia el correo de verificación de cuenta personalizado.
 */
export async function sendVerificationEmailTemplate(to: string, name: string, link: string) {
  if (!resend) return console.warn('[Emails] ⚠️ Resend API Key no configurada. Saltando envío de correo de Verificación.')

  const content = `
    <h1 style="${styles.h1}">Verificá tu email</h1>
    <p style="${styles.p}">Hola <strong style="${styles.strong}">${name}</strong>,</p>
    <p style="${styles.p}">Gracias por unirte a Lanvip. Ya casi terminamos. Hacé clic en el siguiente botón para verificar tu dirección de correo electrónico y acceder al panel:</p>
    <div style="margin-top: 30px; margin-bottom: 30px; text-align: left;">
      <a href="${link}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Verificar mi cuenta</a>
    </div>
    <p style="${styles.p} font-size: 13px;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
    <p style="font-size: 13px; color: #D4AF37; word-break: break-all; margin-bottom: 20px;"><a href="${link}" style="color: #D4AF37; text-decoration: underline;">${link}</a></p>
    <p style="${styles.p} font-size: 13px; margin-bottom: 0;">Si no pediste crear una cuenta, podés ignorar este correo de forma segura.</p>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verificá tu cuenta en Lanvip',
      html: baseTemplate(content),
    })
    console.log(`[Emails] ✅ Correo de Verificación enviado a ${to}`)
  } catch (error) {
    console.error(`[Emails] ❌ Error enviando correo de Verificación a ${to}:`, error)
  }
}

/**
 * Envia el correo de reseteo de contraseña personalizado.
 */
export async function sendPasswordResetEmailTemplate(to: string, link: string) {
  if (!resend) return console.warn('[Emails] ⚠️ Resend API Key no configurada. Saltando envío de correo de Reseteo de Contraseña.')

  const content = `
    <h1 style="${styles.h1}">Recuperar contraseña</h1>
    <p style="${styles.p}">Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lanvip.</p>
    <p style="${styles.p}">Hacé clic en el siguiente botón para elegir una nueva contraseña:</p>
    <div style="margin-top: 30px; margin-bottom: 30px; text-align: left;">
      <a href="${link}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Restablecer mi contraseña</a>
    </div>
    <p style="${styles.p} font-size: 13px;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
    <p style="font-size: 13px; color: #D4AF37; word-break: break-all; margin-bottom: 20px;"><a href="${link}" style="color: #D4AF37; text-decoration: underline;">${link}</a></p>
    <p style="${styles.p} font-size: 13px; margin-bottom: 0;">Si no fuiste vos quien solicitó esto, podés ignorar este correo y tu contraseña seguirá siendo la misma.</p>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Restablecé tu contraseña de Lanvip',
      html: baseTemplate(content),
    })
    console.log(`[Emails] ✅ Correo de Reseteo enviado a ${to}`)
  } catch (error) {
    console.error(`[Emails] ❌ Error enviando correo de Reseteo a ${to}:`, error)
  }
}
