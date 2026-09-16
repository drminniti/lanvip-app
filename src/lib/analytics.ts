/**
 * analytics.ts — Client-side tracking helpers.
 *
 * All Firestore writes are now handled SERVER-SIDE via API routes:
 *   - /api/analytics/track  → page views (views counter + daily subcollection)
 *   - /api/analytics/click  → block clicks (clickCount + uniqueClicks)
 *
 * This is necessary because public visitors are unauthenticated, and Firestore
 * security rules require auth for writes on users/{uid} and blocks/{blockId}.
 * The Admin SDK in the API routes bypasses those rules securely.
 *
 * Client responsibilities:
 *   - sessionStorage deduplication (so each browser session counts once)
 *   - Calling the API fire-and-forget (never block navigation)
 *
 * See: docs/core/8_Analytics.md
 */

const SESSION_VIEW_PREFIX  = 'lanvip_view_'
const SESSION_CLICK_PREFIX = 'lanvip_clicked_profile_'

// ─── View tracking ────────────────────────────────────────────────────────────

/**
 * Tracks a page view for a public profile.
 *
 * MUST be called from a Client Component inside `useEffect` — never from a
 * Server Component. Uses sessionStorage to fire at most once per session.
 *
 * Delegates ALL Firestore writes to /api/analytics/track (Admin SDK):
 *   • users/{uid}.views              (cumulative — Free + VIP)
 *   • users/{uid}/analytics/{date}   (daily enriched — VIP)
 *
 * @param uid — Firestore UID of the profile owner.
 */
export async function trackPageView(uid: string): Promise<void> {
  if (typeof window === 'undefined') return

  const key = `${SESSION_VIEW_PREFIX}${uid}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')

  // Fire-and-forget — tracking failure must never break the page
  fetch('/api/analytics/track', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ uid }),
  }).catch(() => {})
}

// ─── Click tracking ───────────────────────────────────────────────────────────

/**
 * Tracks a click on a block tile.
 *
 * Increments clickCount on the block and (once per session) uniqueClicks on
 * the profile. Delegates ALL writes to /api/analytics/click (Admin SDK).
 *
 * Fire-and-forget: do NOT await this — it must not block navigation.
 *
 * @param blockId — Firestore ID of the block.
 * @param uid     — Firestore UID of the profile owner.
 */
export function incrementClickCount(blockId: string, uid: string): void {
  if (typeof window === 'undefined') return

  // Track unique profile click once per session
  const uniqueKey = `${SESSION_CLICK_PREFIX}${uid}`
  const isUniqueClick = !sessionStorage.getItem(uniqueKey)
  if (isUniqueClick) sessionStorage.setItem(uniqueKey, '1')

  fetch('/api/analytics/click', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ blockId, uid, isUniqueClick }),
  }).catch(() => {})
}
