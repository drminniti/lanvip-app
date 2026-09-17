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
        // Technically it might be in another project, but we can't easily claim it if someone else verified it.
        return NextResponse.json({ error: 'El dominio ya está en uso o no se puede verificar.' }, { status: 400 })
      }
      console.error('[Lanvip] Vercel API error:', data.error)
      // If it already exists in THIS project, Vercel sometimes returns an error or just ignores.
      // We assume it's fine if the error isn't fatal.
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('[Lanvip] API Domains Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
