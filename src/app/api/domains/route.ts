import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    try {
      decodedToken = await getAdminAuth().verifyIdToken(token)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { domain } = await req.json()
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Normalización del dominio (quitar protocolo, www, trailing slashes)
    const sanitizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^www\./, '')
    
    if (!sanitizedDomain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const db = getAdminDb()
    const usersCol = db.collection('users')
    const userRef = usersCol.doc(decodedToken.uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    // Solo permitimos usuarios con plan 'vip', 'lifetime' o administradores
    const isVip = userData?.plan === 'vip' || userData?.plan === 'lifetime' || userData?.role === 'admin' || userData?.role === 'superadmin'

    if (!isVip) {
      return NextResponse.json({ error: 'VIP required' }, { status: 403 })
    }

    // 2. Verificar Unicidad en la Base de Datos (Seguridad Anti-Hijacking)
    const existingDomainSnap = await usersCol.where('customDomain', '==', sanitizedDomain).limit(1).get()
    if (!existingDomainSnap.empty) {
      const existingDoc = existingDomainSnap.docs[0]
      if (existingDoc.id !== decodedToken.uid) {
        return NextResponse.json({ error: 'Este dominio ya está registrado por otro usuario en Lanvip.' }, { status: 400 })
      }
    }

    // 3. Fetch Vercel Env Vars
    const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
      console.warn('[Lanvip] VERCEL_API_TOKEN or VERCEL_PROJECT_ID not set. Mocking success.')
      // Update Firestore directly if Vercel is not configured (mock mode)
      await userRef.update({ customDomain: sanitizedDomain })
      return NextResponse.json({ success: true, mocked: true })
    }

    // 4. Call Vercel API to add the domain
    const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: sanitizedDomain })
    })

    const data = await response.json()

    // 400 means it might already exist or is invalid. Vercel returns `error: { code: '...' }`
    if (!response.ok) {
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'forbidden') {
        // Let's check if it actually belongs to OUR project already
        const checkRes = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${sanitizedDomain}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${VERCEL_API_TOKEN}` }
        })
        
        if (checkRes.ok) {
          // It's already in our project! This is fine, we just update Firestore.
          await userRef.update({ customDomain: sanitizedDomain })
          return NextResponse.json({ success: true, alreadyExists: true })
        }
        
        return NextResponse.json({ error: 'El dominio ya está en uso en otro proyecto o no se puede verificar.' }, { status: 400 })
      }
      console.error('[Lanvip] Vercel API error:', data.error)
      return NextResponse.json({ error: data.error?.message || 'Error al conectar en Vercel' }, { status: 400 })
    }

    // 5. Success in Vercel. Now update Firestore.
    await userRef.update({ customDomain: sanitizedDomain })

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('[Lanvip] API Domains Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    try {
      decodedToken = await getAdminAuth().verifyIdToken(token)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const rawDomain = searchParams.get('domain')
    if (!rawDomain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }
    const domain = rawDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^www\./, '')

    const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({ status: 'mocked', verified: true })
    }

    // Call Vercel API to get domain status
    const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      }
    })

    if (response.status === 404) {
      return NextResponse.json({ status: 'not_found', verified: false })
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Error fetching domain from Vercel' }, { status: response.status })
    }

    const data = await response.json()
    // Vercel returns { verified: boolean, ... }
    // When there is an error in configuration, usually `verified` is false and there might be `error` field or something similar.
    // However, if the domain is correctly pointing but pending verification, Vercel gives verified: false.
    // Let's just pass the Vercel response back to the client.
    return NextResponse.json({
      verified: data.verified,
      verification: data.verification,
      hasConflicts: data.error?.code === 'conflict' || false // Sometimes Vercel provides error obj
    })

  } catch (error: any) {
    console.error('[Lanvip] API Domains GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
