import { getAdminDb } from '@/lib/firebase-admin'
import type { UserProfile, Block } from '@/types'

/**
 * Looks up a user profile by their public username slug.
 * Used by the SSR public route /[username] — no auth required.
 * Returns null if no user with that username exists.
 * 
 * SECURITY: Uses Firebase Admin SDK to bypass Firestore read rules,
 * which securely protects the 'users' collection from public reads.
 */
export async function getPublicProfileByUsername(
  username: string,
): Promise<UserProfile | null> {
  const db = getAdminDb()
  const usersCol = db.collection('users')
  const snap = await usersCol.where('username', '==', username).limit(1).get()

  if (snap.empty) return null
  return snap.docs[0].data() as UserProfile
}

/**
 * One-shot fetch of all active blocks for a user, ordered by `order` asc.
 * Used by the public SSR route /[username] — no subscription needed.
 * 
 * SECURITY: Uses Firebase Admin SDK to ensure consistent server-side data fetching.
 */
export async function getActiveBlocksByUserId(userId: string): Promise<Block[]> {
  const db = getAdminDb()
  const snap = await db.collection('blocks')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .orderBy('order', 'asc')
    .get()
    
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Block))
}
