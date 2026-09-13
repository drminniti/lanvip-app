import { NextResponse } from 'next/server'
import { PreApproval } from 'mercadopago'
import { getMpClient } from '@/lib/mercadopago'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    // 1. Validate Firebase token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 })
    }
    
    const idToken = authHeader.split('Bearer ')[1]
    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken)
    } catch (e: any) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }
    
    const userId = decodedToken.uid

    // 2. Fetch user profile from DB
    const userRef = getAdminDb().collection('users').doc(userId)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const subscriptionId = userData?.subscriptionId

    if (!subscriptionId) {
      // Si fue otorgado manualmente (Admin) sin MP, simplemente lo cancelamos localmente
      await userRef.update({
        isSubscriptionCancelled: true
      })
      return NextResponse.json({ success: true, message: 'Local subscription cancelled' })
    }

    // 3. Cancel subscription in Mercado Pago
    const preApproval = new PreApproval(getMpClient())
    try {
      await preApproval.update({
        id: subscriptionId,
        body: {
          status: 'cancelled'
        }
      })
    } catch (mpError: any) {
      console.warn('MP Error cancelling subscription (might already be cancelled):', mpError.message)
      // Continuamos con la cancelación local incluso si MP falla, para asegurar que la UI se actualice
    }

    // 4. Update user profile to reflect cancellation
    await userRef.update({
      isSubscriptionCancelled: true
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error cancelling subscription:', error?.message || String(error))
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
