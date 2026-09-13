import { NextResponse } from 'next/server'

// Uncomment one at a time to test which one crashes the container
// import { getAdminDb } from '@/lib/firebase-admin'
// import { getMpClient } from '@/lib/mercadopago'

export async function GET() {
  let mpStatus = "unloaded"
  let fbStatus = "unloaded"

  try {
    const { MercadoPagoConfig } = await import('mercadopago')
    mpStatus = "loaded"
  } catch (e: any) {
    mpStatus = "error: " + e.message
  }

  try {
    const { getAuth } = await import('firebase-admin/auth')
    fbStatus = "loaded"
  } catch (e: any) {
    fbStatus = "error: " + e.message
  }

  return NextResponse.json({ 
    status: "ok", 
    mercadopago: mpStatus,
    firebaseAdmin: fbStatus,
    timestamp: new Date().toISOString() 
  })
}
