import { NextResponse } from 'next/server'

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

    // 4. Armamos el link directo al checkout de suscripción de MP
    // Mercado Pago no permite generar init_points dinámicos para suscripciones sin el token de la tarjeta,
    // así que usamos el enlace de redirección directa inyectando el email.
    const init_point = `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=${preapprovalPlanId}&payer_email=${encodeURIComponent(userEmail)}`

    // 5. Retornar el init_point para redirigir
    return NextResponse.json({ init_point })

  } catch (error) {
    console.error('Error in /api/checkout:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}