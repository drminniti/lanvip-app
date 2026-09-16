'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyAnalytics {
  date: string            // 'YYYY-MM-DD'
  views: number
  countries: Record<string, number>
  devices: Record<string, number>
  referrers: Record<string, number>
}

export interface AnalyticsSummary {
  /** Raw daily records ordered by date asc */
  daily: DailyAnalytics[]
  /** Total views in the selected period */
  totalViews: number
  /** Aggregated device breakdown */
  devices: { label: string; count: number; pct: number }[]
  /** Top countries (up to 5) */
  countries: { label: string; count: number; pct: number }[]
  /** Top referrers (up to 5) */
  referrers: { label: string; count: number; pct: number }[]
  loading: boolean
  error: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the last N days as 'YYYY-MM-DD' strings, ascending. */
function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

/** Aggregates a map field across all daily records into a sorted array. */
function aggregateMap(
  daily: DailyAnalytics[],
  field: keyof Pick<DailyAnalytics, 'devices' | 'countries' | 'referrers'>,
  topN = 5,
): { label: string; count: number; pct: number }[] {
  const agg: Record<string, number> = {}
  for (const day of daily) {
    const map = day[field] ?? {}
    for (const [k, v] of Object.entries(map)) {
      agg[k] = (agg[k] ?? 0) + v
    }
  }
  const total = Object.values(agg).reduce((s, v) => s + v, 0)
  return Object.entries(agg)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches time-series analytics from `users/{uid}/analytics` subcollection.
 *
 * @param uid    — Firestore UID of the profile owner. Pass null/undefined to skip.
 * @param days   — Period: 7 or 30. Defaults to 7.
 *
 * Data is read directly from Firestore client SDK (rules allow owner reads).
 * VIP gating is enforced in the UI layer — this hook fetches unconditionally
 * so data is ready immediately when a user upgrades.
 */
export function useAnalytics(uid: string | null | undefined, days: 7 | 30 = 7): AnalyticsSummary {
  const [daily, setDaily] = useState<DailyAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetch_() {
      setLoading(true)
      setError(null)
      try {
        const db = getFirebaseDb()
        const colRef = collection(db, 'users', uid!, 'analytics')
        const q = query(colRef, orderBy('date', 'desc'), limit(days))
        const snap = await getDocs(q)

        if (cancelled) return

        const fetched: DailyAnalytics[] = snap.docs.map(d => ({
          date:      d.data().date ?? d.id,
          views:     d.data().views ?? 0,
          countries: d.data().countries ?? {},
          devices:   d.data().devices ?? {},
          referrers: d.data().referrers ?? {},
        }))

        // Build a full date range padded with zeros for days with no data
        const dayKeys = lastNDays(days)
        const byDate  = Object.fromEntries(fetched.map(r => [r.date, r]))
        const padded  = dayKeys.map(k => byDate[k] ?? {
          date: k, views: 0, countries: {}, devices: {}, referrers: {},
        })

        setDaily(padded)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch_()
    return () => { cancelled = true }
  }, [uid, days])

  const totalViews = daily.reduce((s, d) => s + d.views, 0)

  return {
    daily,
    totalViews,
    devices:   aggregateMap(daily, 'devices'),
    countries: aggregateMap(daily, 'countries'),
    referrers: aggregateMap(daily, 'referrers'),
    loading,
    error,
  }
}
