import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { sendWelcomeEmail } from '@/lib/emails'

/**
 * POST /api/emails/welcome
 * 
 * Secure internal endpoint to trigger the Welcome Email.
 * Protected by Firebase Auth ID Token.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const uid = decodedToken.uid

    // Fetch user details from Firestore and Auth
    const userDoc = await getAdminDb().collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const username = userData?.username
    const displayName = userData?.displayName || 'Creador'

    // Evitar envíos duplicados
    if (userData?.welcomeEmailSent) {
      return NextResponse.json({ ok: true, message: 'Welcome email already sent' })
    }

    // Get email from Firebase Auth (not stored in Firestore by default)
    const userRecord = await getAdminAuth().getUser(uid)
    const email = userRecord.email

    if (!email || !username) {
      return NextResponse.json({ error: 'Missing email or username' }, { status: 400 })
    }

    // Fire and forget email sending
    await sendWelcomeEmail(email, displayName, username)

    // Mark as sent
    await getAdminDb().collection('users').doc(uid).update({ welcomeEmailSent: true })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[API] Error in /api/emails/welcome:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
