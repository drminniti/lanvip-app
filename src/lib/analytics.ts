/**
 * analytics.ts — Firestore atomic counters for views and clicks.
 *
 * Uses Firestore `increment()` which is atomic by default — no race conditions
 * even with thousands of concurrent visitors.
 *
 * See 2_Architecture.md §5 for the data schema (views on users, clickCount on blocks).
 */

import { doc, updateDoc, increment } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// ─── View counter ─────────────────────────────────────────────────────────────

/**
 * Increments the `views` counter on a user's profile document.
 * Called server-side from the public /[username] route on each visit.
 * Fire-and-forget: caller should not await this to avoid blocking render.
 */
export async function incrementViewCount(uid: string): Promise<void> {
  const db  = getFirebaseDb()
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { views: increment(1) })
}

// ─── Click counter ────────────────────────────────────────────────────────────

/**
 * Increments the `clickCount` counter on a block document.
 * Called client-side from PublicLanding when a visitor clicks a tile.
 * Fire-and-forget: caller should not await this to avoid blocking navigation.
 */
export async function incrementClickCount(blockId: string): Promise<void> {
  const db  = getFirebaseDb()
  const ref = doc(db, 'blocks', blockId)
  await updateDoc(ref, { clickCount: increment(1) })
}
