import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

async function authenticateAndAuthorize(req: Request) {
  // 1. Validate Bearer token
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }
  const idToken = authHeader.split('Bearer ')[1]

  let decodedToken
  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken)
  } catch {
    throw new Error('Unauthorized: invalid token')
  }

  // 2. Verify admin role in Firestore
  const db = getAdminDb()
  const callerDoc = await db.collection('users').doc(decodedToken.uid).get()
  if (!callerDoc.exists) {
    throw new Error('Forbidden')
  }
  const callerRole = callerDoc.data()?.role
  if (callerRole !== 'admin' && callerRole !== 'superadmin') {
    throw new Error('Forbidden: admin role required')
  }

  return { uid: decodedToken.uid, db }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uid: string }> | { uid: string } }
) {
  try {
    const { db } = await authenticateAndAuthorize(req)
    // Await params if it's a promise (Next.js 15+ compatible)
    const resolvedParams = await params
    const targetUid = resolvedParams.uid

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }

    const auth = getAdminAuth()
    
    // 1. Get user document to find username
    const userDocRef = db.collection('users').doc(targetUid)
    const userDoc = await userDocRef.get()
    
    // If the user doesn't exist in Firestore, we still try to delete them from Auth
    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData?.username) {
        // 2. Free up the username
        await db.collection('reserved_usernames').doc(userData.username).delete()
      }
      
      // 3. Delete user document
      await userDocRef.delete()
      
      // Note: We don't cascade delete subcollections (like blocks) to save operations,
      // and they'll naturally become orphaned.
    }

    // 4. Delete user from Firebase Auth
    try {
      await auth.deleteUser(targetUid)
    } catch (authErr: any) {
      // If user doesn't exist in Auth, just ignore it and succeed
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr
      }
    }

    return NextResponse.json({ success: true, message: 'User deleted completely' })
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : error.message.includes('Forbidden') ? 403 : 500
    console.error('[Admin API DELETE User] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> | { uid: string } }
) {
  try {
    const { db } = await authenticateAndAuthorize(req)
    const resolvedParams = await params
    const targetUid = resolvedParams.uid

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }

    const body = await req.json()
    const action = body.action // 'ban' or 'unban'

    if (action !== 'ban' && action !== 'unban') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const auth = getAdminAuth()
    const isBanned = action === 'ban'

    // 1. Update Auth status
    try {
      await auth.updateUser(targetUid, { disabled: isBanned })
      if (isBanned) {
        // Force logout immediately
        await auth.revokeRefreshTokens(targetUid)
      }
    } catch (authErr: any) {
      if (authErr.code !== 'auth/user-not-found') {
        throw authErr
      }
    }

    // 2. Update Firestore document
    const userDocRef = db.collection('users').doc(targetUid)
    const userDoc = await userDocRef.get()
    
    if (userDoc.exists) {
      await userDocRef.update({ isBanned })
    }

    return NextResponse.json({ success: true, isBanned })
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : error.message.includes('Forbidden') ? 403 : 500
    console.error('[Admin API PATCH User] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status })
  }
}
