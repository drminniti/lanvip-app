import { NextResponse } from 'next/server'
import { PreApproval } from 'mercadopago'
import { mpClient } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    // 1. Validar la sesión del usuario a través del token de Firebase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 })
    }
    
    const idToken = authHeader.split('Bearer ')[1]
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    
    // Verificamos el token usando Google Identity Toolkit (sin necesitar firebase-admin)
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    })
    
    const verifyData = await verifyRes.json()
    if (verifyData.error || !verifyData.users?.[0]) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }
    
    const userId = verifyData.users[0].localId
    const userEmail = verifyData.users[0].email

    // 2. Parsear el body para obtener el planType
    const body = await req.json()
    const { planType } = body
    
    if (planType !== 'monthly' && planType !== 'annual') {
      return NextResponse.json({ error: 'Bad Request: Invalid planType' }, { status: 400 })
    }

    // 3. Obtener el ID del Plan de PreApproval de las variables de entorno
    const preapprovalPlanId = planType === 'monthly' 
      ? process.env.MP_MONTHLY_PLAN_ID 
      : process.env.MP_ANNUAL_PLAN_ID

    if (!preapprovalPlanId) {
      console.error(`Missing Plan ID in env vars for planType: ${planType}`)
      return NextResponse.json({ error: 'Internal Server Error: Plan ID not configured' }, { status: 500 })
    }

    // 4. Crear la Intención de Suscripción (PreApproval)
    const preApproval = new PreApproval(mpClient)
    
    const subscription = await preApproval.create({
      body: {
        preapproval_plan_id: preapprovalPlanId,
        payer_email: userEmail,
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        external_reference: userId,
        reason: planType === 'monthly' ? 'Suscripción Mensual VIP - Lanvip' : 'Suscripción Anual VIP - Lanvip'
      }
    })

    // 5. Retornar el init_point para redirigir al checkout de Mercado Pago
    return NextResponse.json({ init_point: subscription.init_point })

  } catch (error) {
    console.error('Error in /api/checkout:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
