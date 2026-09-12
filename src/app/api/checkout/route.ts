import { NextResponse } from 'next/server'
import { PreApproval } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'
import { adminAuth } from '@/lib/firebase-admin'
export async function POST(req: Request) {
  try {
    // 1. Validar la sesión del usuario a través del token de Firebase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
    }
    
    const idToken = authHeader.split('Bearer ')[1]
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (e: any) {
      console.error('Firebase Admin Auth Verification Failed:', e.message)
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }
    
    const userId = decodedToken.uid
    const userEmail = decodedToken.email || ''

    // 2. Parsear el body para obtener el planType y los datos del token
    const body = await req.json()
    const { planType, cardTokenId, payerEmail } = body
    
    if ((planType !== 'monthly' && planType !== 'annual') || !cardTokenId || !payerEmail) {
      return NextResponse.json({ error: 'Bad Request: Missing or invalid parameters' }, { status: 400 })
    }

    // 3. Obtener el ID del Plan de PreApproval de las variables de entorno
    const preapprovalPlanId = planType === 'monthly' 
      ? process.env.MP_MONTHLY_PLAN_ID 
      : process.env.MP_ANNUAL_PLAN_ID

    if (!preapprovalPlanId) {
      console.error(`Missing Plan ID in env vars for planType: ${planType}`)
      return NextResponse.json({ error: 'Internal Server Error: Plan ID not configured' }, { status: 500 })
    }

    // 4. Crear la Intención de Suscripción (PreApproval) inyectando el UID en external_reference
    const preApproval = new PreApproval(mpClient)
    
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

    // 5. Retornamos success (ya no hay init_point porque el pago se autorizó directo)
    return NextResponse.json({ success: true, subscription_id: subscription.id })

  } catch (error) {
    console.error('Error in /api/checkout:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}