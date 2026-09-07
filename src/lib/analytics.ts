/**
 * analytics.ts — Firestore atomic counters for views and clicks.
 *
 * Uses Firestore `increment()` which is atomic by default — no race conditions
 * even with thousands of concurrent visitors.
 *
 * See 2_Architecture.md §5 for the data schema (views on users, clickCount on blocks).
 *
 * ── Architectural note on view tracking ──────────────────────────────────────
 * Views are tracked CLIENT-SIDE (not in SSR) for two reasons:
 *   1. SSR runs on every request, including bots, crawlers and Googlebot — this
 *      inflates counters with non-human traffic.
 *   2. Next.js may re-render the Server Component on hard reloads, double-
 *      counting legitimate users.
 *
 * Mitigation: `trackPageView()` is called from a `useEffect` in PublicLanding
 * and uses `sessionStorage` to count each uid exactly once per browser session.
 * This means:
 *   ✅ Bots that don't execute JS are not counted.
 *   ✅ Hard reloads / SSR re-renders don't inflate the count.
 *   ✅ The user is counted once per session (tab lifetime), which is the
 *      industry-standard definition of a unique session view.
 */

import { doc, updateDoc, increment } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// ─── View counter (client-only, sessionStorage-deduplicated) ──────────────────

const SESSION_KEY_PREFIX = 'lanvip_view_'

/**
 * Increments the `views` counter on a user's profile document.
 *
 * MUST be called from a Client Component (inside `useEffect`) — never from a
 * Server Component or `generateMetadata`. Uses sessionStorage to ensure the
 * counter is incremented at most once per browser session per profile.
 *
 * @param uid — Firestore UID of the profile owner.
 */
export async function trackPageView(uid: string): Promise<void> {
  // Guard: sessionStorage is only available in the browser
  if (typeof window === 'undefined') return

  const key = `${SESSION_KEY_PREFIX}${uid}`

  // Already counted this profile in this session → bail out
  if (sessionStorage.getItem(key)) return

  // Mark as counted before the async write to prevent race conditions on
  // concurrent calls (e.g. React StrictMode double-invoke in dev)
  sessionStorage.setItem(key, '1')

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
