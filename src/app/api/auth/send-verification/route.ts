import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { sendVerificationEmailTemplate } from '@/lib/emails'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Falta email' }, { status: 400 })
    }

    const auth = getAdminAuth()
    
    // Generate the email verification link using Admin SDK
    const link = await auth.generateEmailVerificationLink(email)
    
    // Use the displayName if provided, else use email part
    const displayName = name || email.split('@')[0]
    
    // Send it through our own Resend setup with the custom template
    await sendVerificationEmailTemplate(email, displayName, link)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error in send-verification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
