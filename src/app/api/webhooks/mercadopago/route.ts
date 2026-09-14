import { NextResponse } from 'next/server'
import { Payment, PreApproval, WebhookSignatureValidator, InvalidWebhookSignatureError } from 'mercadopago'
import { getMpClient } from '@/lib/mercadopago'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// ─── Webhook Signature Validation ─────────────────────────────────────────────
/**
 * Validates the HMAC-SHA256 signature that MercadoPago attaches to every
 * webhook request.
 *
 * MP sends:
 *   - Header  `x-signature`   : "ts=<timestamp>,v1=<hash>"
 *   - Header  `x-request-id`  : UUID
 *   - Query   `data.id`       : resource ID
 *
 * The validator builds `id:<data.id>;request-id:<x-req-id>;ts:<ts>;` and
 * compares the HMAC-SHA256 against `v1` using MP_WEBHOOK_SECRET.
 *
 * If MP_WEBHOOK_SECRET is not set (local dev without the variable), we log a
 * critical warning but allow the request through so development isn't blocked.
 * In production Vercel has the secret, so it always validates.
 *
 * See: docs/core/7_Security.md §Webhooks
 */
function validateMpSignature(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[Webhook] ⚠️ CRITICAL: MP_WEBHOOK_SECRET not set — skipping signature validation. Set it in Vercel env vars!')
    return true // allow in dev; production always has the secret
  }

  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
    })
    return true
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.error('[Webhook] ❌ Invalid signature — request rejected.')
    } else {
      console.error('[Webhook] ❌ Signature validation error:', err)
    }
    return false
  }
}

export async function POST(req: Request) {
  try {
    let body: any = {}
    try {
        body = await req.json()
    } catch (e) {
        // Fallback if body is empty or invalid
    }

    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams)
    
    const type = body.type || queryParams.type || queryParams.topic
    const dataId = body.data?.id || queryParams['data.id'] || queryParams.id

    if (!dataId) {
      return NextResponse.json({ status: 'success' }, { status: 200 })
    }

    // ── Signature validation (P0-A) ───────────────────────────────────────────
    if (!validateMpSignature(req, String(dataId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let uid = ''
    let status = ''
    let planType = ''

    // 1. Obtener los detalles reales de la API (Fuente de la verdad)
    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      const subscriptionData = await mpResponse.json()
      
      status = subscriptionData.status || ''
      planType = subscriptionData.reason || 'Unknown'
      uid = subscriptionData.external_reference || ''

      console.log('\n=============================================')
      console.log('✅ WEBHOOK RECIBIDO Y VALIDADO (MERCADO PAGO)')
      console.log(`- TIPO:   ${type}`)
      console.log(`- UID:    ${uid}`)
      console.log(`- PLAN:   ${planType}`)
      console.log(`- ESTADO: ${status}`)
      console.log('=============================================\n')

      // 2. Lógica de Actualización en Base de Datos por UID (Segura)
      if (uid) {
        const userRef = getAdminDb().collection('users').doc(uid)
        
        if (status === 'approved' || status === 'authorized') {
          await getAdminDb().runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef)
            if (!userDoc.exists) return

            const userData = userDoc.data()
            const isAnnual = planType.toLowerCase().includes('anual') || subscriptionData.preapproval_plan_id === process.env.MP_ANNUAL_PLAN_ID
            const daysToAdd = isAnnual ? 365 : 30
            
            let endsAt = new Date()
            if (userData?.subscriptionEndsAt) {
               const currentEndsAt = userData.subscriptionEndsAt.toDate ? userData.subscriptionEndsAt.toDate() : new Date(userData.subscriptionEndsAt)
               // Solo extendemos si la fecha actual es mayor a hoy, para no arrastrar fechas vencidas
               if (currentEndsAt > new Date()) {
                  endsAt = currentEndsAt
               }
            }
            endsAt.setDate(endsAt.getDate() + daysToAdd)

            // Usamos la nomenclatura correcta (plan: 'vip')
            transaction.update(userRef, {
              plan: 'vip',
              planNotification: 'upgraded',
              subscriptionId: dataId,
              isSubscriptionCancelled: false,
              subscriptionEndsAt: endsAt
            })
            
            console.log(`✅ User ${uid} upgraded to VIP (${isAnnual ? 'Annual' : 'Monthly'}) - Date stacked.`)
          })
        } else if (status === 'cancelled') {
          // MP fires cancelled when user manually cancels or all retries fail.
          // We DO NOT downgrade them immediately so they can enjoy their remaining days.
          await userRef.update({
            isSubscriptionCancelled: true
          })
          console.log(`⚠️ User ${uid} subscription cancelled but retains VIP until end date.`)
        } else if (status === 'rejected' || status === 'refunded') {
          // If a payment is refunded, or preapproval explicitly rejected before payment
          await userRef.update({
            plan: 'free',
            planNotification: 'downgraded',
            isSubscriptionCancelled: true
          })
          console.log(`❌ User ${uid} downgraded to Free (Status: ${status})`)
        }
      } else {
        console.log(`⚠️ No external_reference (uid) found for transaction ${dataId}.`)
      }
    } else if (type === 'payment') {
      const paymentClient = new Payment(getMpClient())
      const paymentData = await paymentClient.get({ id: dataId })
      
      status = paymentData.status || ''
      planType = paymentData.description || 'Unknown'
      uid = paymentData.external_reference || ''

      console.log('\n=============================================')
      console.log('🔄 WEBHOOK DE RENOVACIÓN (MERCADO PAGO)')
      console.log(`- TIPO:   ${type}`)
      console.log(`- UID:    ${uid}`)
      console.log(`- ESTADO: ${status}`)
      console.log('=============================================\n')

      if (uid && status === 'approved') {
        const userRef = getAdminDb().collection('users').doc(uid)
        
        await getAdminDb().runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef)
          if (!userDoc.exists) return

          const userData = userDoc.data()
          const processedPayments = userData?.processedPayments || []

          // Idempotency check: if payment already processed, do nothing
          if (processedPayments.includes(dataId)) {
            console.log(`⚠️ Payment ${dataId} already processed for user ${uid}. Skipping.`)
            return
          }

          const isAnnual = planType.toLowerCase().includes('anual')
          const daysToAdd = isAnnual ? 365 : 30
          
          let endsAt = new Date()
          if (userData?.subscriptionEndsAt) {
             const currentEndsAt = userData.subscriptionEndsAt.toDate ? userData.subscriptionEndsAt.toDate() : new Date(userData.subscriptionEndsAt)
             
             const paymentDate = paymentData.date_approved ? new Date(paymentData.date_approved) : new Date()
             const grantedUntil = new Date(paymentDate)
             grantedUntil.setDate(grantedUntil.getDate() + daysToAdd)
             
             // Si el pago otorga más tiempo del que ya tiene, lo extendemos
             if (grantedUntil > currentEndsAt) {
                endsAt = grantedUntil
             } else {
                console.log(`⚠️ Payment ${dataId} time overlaps with current subscription. No extra time added.`)
                endsAt = currentEndsAt
             }
          } else {
             const paymentDate = paymentData.date_approved ? new Date(paymentData.date_approved) : new Date()
             endsAt = new Date(paymentDate)
             endsAt.setDate(endsAt.getDate() + daysToAdd)
          }

          transaction.update(userRef, {
            subscriptionEndsAt: endsAt,
            processedPayments: FieldValue.arrayUnion(dataId),
            isSubscriptionCancelled: false
          })
          console.log(`✅ User ${uid} subscription renewed. Added ${daysToAdd} days.`)
        })
      }
    }

    // 3. Devolver 200 OK rápido
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Webhook] Unhandled Error:`, msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}