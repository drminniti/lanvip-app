import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { sendPasswordResetEmailTemplate } from '@/lib/emails'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Falta email' }, { status: 400 })
    }

    const auth = getAdminAuth()
    
    // Check if user exists before generating link (admin SDK throws an error if user doesn't exist)
    try {
      await auth.getUserByEmail(email)
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        // Return success even if not found to prevent email enumeration, 
        // or return 404. Let's throw the error so frontend maps it correctly.
        throw e
      }
      throw e
    }

    // Generate the password reset link using Admin SDK
    const link = await auth.generatePasswordResetLink(email)
    
    // Send it through our own Resend setup with the custom template
    await sendPasswordResetEmailTemplate(email, link)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error in send-password-reset:', error)
    // Map backend error codes to frontend expected codes if needed
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'auth/user-not-found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
