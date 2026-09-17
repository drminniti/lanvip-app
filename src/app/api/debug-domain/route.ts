import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const hostname = req.headers.get('host') || 'NO_HOST'
    const cleanHostname = hostname.split(':')[0].replace(/^www\./, '')
    
    const db = getAdminDb()
    const usersCol = db.collection('users')
    
    // Check specific custom domain
    const snap = await usersCol.where('customDomain', '==', cleanHostname).limit(1).get()
    const domainMatch = !snap.empty ? snap.docs[0].data() : null

    // Check damian's user specifically
    const damianUserSnap = await usersCol.where('username', '==', 'damian').limit(1).get()
    const damianUser = !damianUserSnap.empty ? damianUserSnap.docs[0].data() : null

    const drmSnap = await usersCol.where('username', '==', 'drm').limit(1).get()
    const drmUser = !drmSnap.empty ? drmSnap.docs[0].data() : null

    return NextResponse.json({
      success: true,
      headers: {
        host: hostname,
        cleanHostname
      },
      url: req.url,
      matchFound: !snap.empty,
      domainMatch: domainMatch ? { username: domainMatch.username, customDomain: domainMatch.customDomain } : null,
      damianUser: damianUser ? { username: damianUser.username, customDomain: damianUser.customDomain } : null,
      drmUser: drmUser ? { username: drmUser.username, customDomain: drmUser.customDomain } : null,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 })
  }
}
