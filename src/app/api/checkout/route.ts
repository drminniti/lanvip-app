import { NextResponse } from 'next/server'
import { PreApproval } from 'mercadopago'
import { getMpClient } from '@/lib/mercadopago'
import { getAdminAuth } from '@/lib/firebase-admin'
export async function POST(req: Request) {
  try {
    // 1. Validar la sesión del usuario a través del token de Firebase
    console.log('[DEBUG] Step 1: Getting auth header')
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 400 })
    }
    
    console.log('[DEBUG] Step 2: Splitting token')
    const idToken = authHeader.split('Bearer ')[1]
    
    let decodedToken;
    try {
      console.log('[DEBUG] Step 3: Verifying Firebase Token')
      decodedToken = await getAdminAuth().verifyIdToken(idToken)
      console.log('[DEBUG] Step 4: Token verified successfully')
    } catch (e: any) {
      console.error('Firebase Admin Auth Verification Failed:', e.message)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 400 })
    }
    
    const userId = decodedToken.uid
    const userEmail = decodedToken.email || ''

    // 2. Parsear el body
    console.log('[DEBUG] Step 5: Parsing body')
    const body = await req.json()
    console.log('[DEBUG] Step 6: Body parsed:', JSON.stringify(body))
    const { planType, cardTokenId, payerEmail } = body
    
    if ((planType !== 'monthly' && planType !== 'annual') || !cardTokenId || !payerEmail) {
      return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 })
    }

    // 3. Obtener el ID del Plan
    console.log('[DEBUG] Step 7: Getting Plan ID')
    const preapprovalPlanId = planType === 'monthly' 
      ? process.env.MP_MONTHLY_PLAN_ID 
      : process.env.MP_ANNUAL_PLAN_ID

    console.log('[DEBUG] Step 8: Plan ID is:', preapprovalPlanId)
    if (!preapprovalPlanId) {
      return new Response(JSON.stringify({ error: 'Plan ID not configured' }), { status: 400 })
    }

    // 4. Crear la Intención de Suscripción (PreApproval)
    console.log('[DEBUG] Step 9: Initializing PreApproval Client')
    const preApproval = new PreApproval(getMpClient())
    
    console.log('[DEBUG] Step 10: Calling preApproval.create()')
    
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
    
    console.log('[DEBUG] Step 11: preApproval.create() success:', subscription.id)

    // 5. Retornamos success
    return NextResponse.json({ success: true, subscription_id: subscription.id })

  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('Error in /api/checkout:', errorMsg)
    // Force a JSON string return using standard Response to completely avoid NextResponse weirdness
    // Return 400 instead of 500 to prevent Vercel from intercepting the error and stripping the body
    return new Response(JSON.stringify({ error: 'Checkout Error', details: errorMsg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}