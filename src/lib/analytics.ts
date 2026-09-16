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

  // Fire both writes in parallel:
  //   1. Existing cumulative counter (Free + VIP — always visible)
  //   2. Server-side enriched event (country, device, referrer) → daily subcollection
  //      Written for ALL users so Free→VIP upgrades immediately see historical data.
  await Promise.all([
    updateDoc(ref, { views: increment(1) }),
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    }).catch(() => { /* fire-and-forget — tracking failure must never break the page */ }),
  ])
}


// ─── Click counter ────────────────────────────────────────────────────────────

const CLICK_SESSION_KEY_PREFIX = 'lanvip_clicked_profile_'

/**
 * Tracks a unique click on the profile level.
 * Called automatically by incrementClickCount.
 */
async function trackUniqueProfileClick(uid: string): Promise<void> {
  if (typeof window === 'undefined') return
  const key = `${CLICK_SESSION_KEY_PREFIX}${uid}`
  if (sessionStorage.getItem(key)) return

  sessionStorage.setItem(key, '1')
  const db  = getFirebaseDb()
  const ref = doc(db, 'users', uid)
  // Ensure uniqueClicks field exists and increments.
  await updateDoc(ref, { uniqueClicks: increment(1) }).catch(err => {
    console.error('Failed to update uniqueClicks:', err)
  })
}

/**
 * Increments the `clickCount` counter on a block document,
 * and also records a unique click at the profile level for CTR.
 * Called client-side from PublicLanding when a visitor clicks a tile.
 * Fire-and-forget: caller should not await this to avoid blocking navigation.
 */
export async function incrementClickCount(blockId: string, uid: string): Promise<void> {
  const db  = getFirebaseDb()
  const ref = doc(db, 'blocks', blockId)
  
  // Fire both updates in parallel without blocking each other
  Promise.all([
    updateDoc(ref, { clickCount: increment(1) }),
    trackUniqueProfileClick(uid)
  ]).catch(err => {
    console.error('Error incrementing clicks:', err)
  })
}
