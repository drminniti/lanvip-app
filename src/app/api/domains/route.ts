import { NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

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

    // 2. Fetch Vercel Env Vars
    const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
      console.warn('[Lanvip] VERCEL_API_TOKEN or VERCEL_PROJECT_ID not set. Mocking success.')
      // If not configured, we just return success (fallback to manual Vercel dashboard setup)
      return NextResponse.json({ success: true, mocked: true })
    }

    // 3. Call Vercel API to add the domain
    const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: domain })
    })

    const data = await response.json()

    // 400 means it might already exist or is invalid. Vercel returns `error: { code: '...' }`
    if (!response.ok) {
      if (data.error?.code === 'domain_already_in_use' || data.error?.code === 'forbidden') {
        // Let's check if it actually belongs to OUR project already
        const checkRes = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${VERCEL_API_TOKEN}` }
        })
        
        if (checkRes.ok) {
          // It's already in our project! This is totally fine, just return success.
          return NextResponse.json({ success: true, alreadyExists: true })
        }
        
        // If it's not in our project, then it truly is taken by someone else
        return NextResponse.json({ error: 'El dominio ya está en uso en otro proyecto o no se puede verificar.' }, { status: 400 })
      }
      console.error('[Lanvip] Vercel API error:', data.error)
      return NextResponse.json({ error: data.error?.message || 'Error al conectar en Vercel' }, { status: 400 })
    }

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
    const domain = searchParams.get('domain')
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

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
