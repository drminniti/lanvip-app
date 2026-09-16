import { NextResponse } from 'next/server'
import { PreApproval } from 'mercadopago'
import { getMpClient } from '@/lib/mercadopago'
import { getAdminAuth } from '@/lib/firebase-admin'
import { createClient } from 'redis'
import { translateMPError } from '@/lib/mercadopago-errors'

// Inicializamos el cliente estándar de Redis si existe la URL
let redisClient: ReturnType<typeof createClient> | null = null
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL })
  redisClient.connect().catch(console.error)
}

export async function POST(req: Request) {
  try {
    // 0. Rate Limiting (por IP) usando Redis estándar (Fixed Window)
    if (redisClient && redisClient.isReady) {
      const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
      const windowKey = `ratelimit:checkout:${ip}`
      
      const requests = await redisClient.incr(windowKey)
      if (requests === 1) {
        // Si es el primero, expiramos la key en 60 segundos
        await redisClient.expire(windowKey, 60)
      }
      
      if (requests > 5) {
        return new Response(JSON.stringify({ error: 'Demasiados intentos. Por favor espera un minuto.' }), { status: 429 })
      }
    }
    // 1. Validar la sesión del usuario a través del token de Firebase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 400 })
    }
    
    const idToken = authHeader.split('Bearer ')[1]
    
    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      console.error('Firebase Admin Auth Verification Failed:', msg)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 400 })
    }
    
    const userId = decodedToken.uid
    const userEmail = decodedToken.email || ''

    // 2. Parsear el body
    const body = await req.json()
    const { planType, cardTokenId, payerEmail } = body
    
    if ((planType !== 'monthly' && planType !== 'annual') || !cardTokenId || !payerEmail) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 })
    }

    // 3. Obtener el ID del Plan
    const preapprovalPlanId = planType === 'monthly' 
      ? process.env.MP_MONTHLY_PLAN_ID 
      : process.env.MP_ANNUAL_PLAN_ID

    if (!preapprovalPlanId) {
      return new Response(JSON.stringify({ error: 'Plan ID not configured' }), { status: 400 })
    }

    // 4. Crear la Intención de Suscripción (PreApproval)
    const preApproval = new PreApproval(getMpClient())
    
    const subscription = await preApproval.create({
      body: {
        preapproval_plan_id: preapprovalPlanId,
        payer_email: payerEmail,
        card_token_id: cardTokenId,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        external_reference: userId, // Este es el truco real: atamos la suscripción al ID del usuario
        status: 'authorized',
        reason: planType === 'monthly' ? 'Suscripción Mensual VIP - Lanvip' : 'Suscripción Anual VIP - Lanvip'
      }
    })

    // 5. Retornamos success
    return NextResponse.json({ success: true, subscription_id: subscription.id })

  } catch (error: any) {
    let errorMsg = 'Unknown error'
    if (error && error.message) {
      errorMsg = typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
    } else if (error && typeof error === 'object') {
      errorMsg = JSON.stringify(error)
    } else {
      errorMsg = String(error)
    }
    
    // Si es un error de la API de MercadoPago, suele venir en error.cause o error.response
    if (error?.cause) {
       errorMsg += ` | Cause: ${JSON.stringify(error.cause)}`
    }
    if (error?.response) {
       errorMsg += ` | Response: ${JSON.stringify(error.response)}`
    }
    
    console.error('Error in /api/checkout:', errorMsg)
    
    // Traducimos el error original para el cliente
    const localizedMessage = translateMPError(error)

    // Force a JSON string return using standard Response to completely avoid NextResponse weirdness
    // Return 400 instead of 500 to prevent Vercel from intercepting the error and stripping the body
    return new Response(JSON.stringify({ 
      error: 'Checkout Error', 
      details: errorMsg,
      localizedMessage // Enviamos el mensaje traducido al cliente
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}