'use client'

import { useDashboard } from '@/context/DashboardContext'
import type { UserProfile } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves a Firestore Timestamp, plain Date, or raw seconds object to a Date.
 * Handles all three shapes that can come from Firestore client vs Admin SDK.
 */
function toDate(value: UserProfile['subscriptionEndsAt']): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  // Firestore Timestamp has .toDate()
  if (typeof (value as any).toDate === 'function') return (value as any).toDate()
  // Raw {seconds, nanoseconds} from serialized SSR
  if (typeof (value as any).seconds === 'number') {
    return new Date((value as any).seconds * 1000)
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSubscriptionResult {
  /** True only if the user has an active VIP plan that has not expired. */
  isVip: boolean
  /**
   * True if the Firestore document says plan='vip' but subscriptionEndsAt is
   * in the past. Used to show an "your plan expired" nudge in the UI without
   * waiting for the server-side cron to formally downgrade the plan field.
   */
  isVipExpired: boolean
  /**
   * Number of days remaining until the subscription expires.
   * null  → user is Lifetime VIP (no expiry date) or not VIP at all.
   * 0     → expires today.
   * < 0   → already expired (mirrors isVipExpired).
   */
  daysUntilExpiry: number | null
  /** Raw plan field from Firestore ('free' | 'vip'). */
  plan: string
  loading: boolean
}

/**
 * Single source of truth for VIP status across the dashboard.
 *
 * Retrocompatibility rules:
 *   - plan !== 'vip'                            → isVip = false (always)
 *   - plan === 'vip' && no subscriptionEndsAt   → isVip = true  (Lifetime / manual grant)
 *   - plan === 'vip' && subscriptionEndsAt past → isVip = false, isVipExpired = true
 *   - plan === 'vip' && subscriptionEndsAt future → isVip = true
 *
 * See: docs/core/5_Business_Model.md §Expiry Logic
 */
export function useSubscription(): UseSubscriptionResult {
  const { profile, loading } = useDashboard()

  const plan = profile?.plan ?? 'free'

  if (plan !== 'vip') {
    return { isVip: false, isVipExpired: false, daysUntilExpiry: null, plan, loading }
  }

  // plan === 'vip' — now check expiry
  const endsAt = toDate(profile?.subscriptionEndsAt ?? null)

  // Lifetime VIP: no expiry date set
  if (!endsAt) {
    return { isVip: true, isVipExpired: false, daysUntilExpiry: null, plan, loading }
  }

  const now = new Date()
  const msRemaining = endsAt.getTime() - now.getTime()
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24))

  if (msRemaining <= 0) {
    // Expired — plan field in Firestore still says 'vip' but date is past
    return { isVip: false, isVipExpired: true, daysUntilExpiry: daysRemaining, plan, loading }
  }

  return { isVip: true, isVipExpired: false, daysUntilExpiry: daysRemaining, plan, loading }
}
