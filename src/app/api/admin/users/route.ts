import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

/**
 * GET /api/admin/users
 *
 * Returns the full list of users for the admin panel.
 *
 * Security:
 *   1. Validates Firebase ID token from Authorization header.
 *   2. Checks that the caller has role 'admin' or 'superadmin' in Firestore.
 *   3. Uses Admin SDK (bypasses Firestore security rules) to query all users.
 *
 * The client-side approach in admin/page.tsx was querying users via the
 * Firebase JS SDK which is subject to Firestore security rules. A collection
 * query fails if ANY document doesn't satisfy the rule, so the admin was
 * silently receiving an empty result set.
 *
 * See: docs/core/2_Architecture.md §Admin Endpoints
 */
export async function GET(req: Request) {
  try {
    // 1. Validate Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const idToken = authHeader.split('Bearer ')[1]

    let decodedToken
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken)
    } catch {
      return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 })
    }

    // 2. Verify admin role in Firestore
    const db = getAdminDb()
    const callerDoc = await db.collection('users').doc(decodedToken.uid).get()
    if (!callerDoc.exists) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const callerRole = callerDoc.data()?.role
    if (callerRole !== 'admin' && callerRole !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 })
    }

    // 3. Fetch all users via Admin SDK (bypasses Firestore rules)
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get()

    const users = snapshot.docs.map(doc => {
      const data = doc.data()

      // Serialize Timestamps to ISO strings — plain objects are JSON-safe
      const serialize = (val: any) => {
        if (!val) return null
        if (typeof val.toDate === 'function') return val.toDate().toISOString()
        if (typeof val.seconds === 'number') return new Date(val.seconds * 1000).toISOString()
        return val
      }

      return {
        ...data,
        createdAt:           serialize(data.createdAt),
        subscriptionEndsAt:  serialize(data.subscriptionEndsAt),
      }
    })

    return NextResponse.json({ users })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Admin API] Error fetching users:', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
