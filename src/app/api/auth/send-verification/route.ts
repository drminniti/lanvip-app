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
    const originalLink = await auth.generateEmailVerificationLink(email)
    
    // Replace the default firebaseapp.com domain with our own domain
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const urlObj = new URL(originalLink)
    const customLink = `${origin}/action${urlObj.search}`
    
    // Use the displayName if provided, else use email part
    const displayName = name || email.split('@')[0]
    
    // Send it through our own Resend setup with the custom template
    await sendVerificationEmailTemplate(email, displayName, customLink)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error in send-verification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
