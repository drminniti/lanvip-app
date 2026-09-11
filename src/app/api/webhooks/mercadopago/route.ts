import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { Payment, PreApproval } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || url.searchParams.get('topic')
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id')

    // 1. Validación de seguridad con X-Signature
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')
    const secret = process.env.MP_WEBHOOK_SECRET

    if (secret && xSignature && xRequestId && dataId) {
      const parts = xSignature.split(',')
      let ts = ''
      let hash = ''

      parts.forEach(part => {
        const [key, value] = part.split('=')
        if (key && value) {
          const trimmedKey = key.trim()
          if (trimmedKey === 'ts') ts = value.trim()
          if (trimmedKey === 'v1') hash = value.trim()
        }
      })

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
      const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

      if (hmac !== hash) {
        console.error('Invalid Mercado Pago Webhook Signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    } else {
      console.warn('Webhook received without signature or secret validation skipped. Ensure MP_WEBHOOK_SECRET is set.')
    }

    if (!dataId) {
      return NextResponse.json({ error: 'Missing data id' }, { status: 400 })
    }

    let uid = ''
    let status = ''
    let planType = ''

    // 2. Obtener los detalles reales de la API (Fuente de la verdad)
    if (type === 'payment') {
      const paymentClient = new Payment(mpClient)
      const payment = await paymentClient.get({ id: dataId })
      
      uid = payment.external_reference || ''
      status = payment.status || ''
      planType = payment.description || 'Unknown' // Reason/Description
      
    } else if (type === 'subscription_preapproval') {
      const preApprovalClient = new PreApproval(mpClient)
      const preApproval = await preApprovalClient.get({ id: dataId })
      
      uid = preApproval.external_reference || ''
      status = preApproval.status || ''
      planType = preApproval.reason || 'Unknown'
    } else {
      // Ignorar otros tipos de eventos silenciosamente (ej. test)
      return NextResponse.json({ received: true })
    }

    // 3. Log de la transacción procesada con éxito (Paso intermedio)
    console.log('\n=============================================')
    console.log('✅ WEBHOOK RECIBIDO Y VALIDADO (MERCADO PAGO)')
    console.log('---------------------------------------------')
    console.log(`- TIPO:   ${type}`)
    console.log(`- UID:    ${uid}`)
    console.log(`- PLAN:   ${planType}`)
    console.log(`- ESTADO: ${status}`)
    console.log('=============================================\n')

    // Responder 200 rápido para que MP no reintente
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Siempre 200 si es un fallo nuestro temporal para evitar reintentos infinitos,
    // o 500 dependiendo de si queremos que MP reintente. Lo estándar es 200 si ya fue logged.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
