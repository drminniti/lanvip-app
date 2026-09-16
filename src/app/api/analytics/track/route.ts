import { NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * POST /api/analytics/track
 *
 * Server-side analytics event tracker. Called client-side (fire-and-forget)
 * from PublicLanding on every unique page view.
 *
 * What it captures (server-side only — unavailable to client JS reliably):
 *   - Country  → Vercel injects `x-vercel-ip-country` header automatically.
 *               Falls back to 'Unknown' in local dev (header not present).
 *   - Device   → User-Agent parsed with ua-parser-js.
 *   - Referrer → `Referer` header from browser.
 *
 * Storage: `users/{uid}/analytics/{YYYY-MM-DD}` (one doc per day per user).
 * Uses `merge: true` + `FieldValue.increment()` — atomic, no race conditions.
 *
 * Privacy:
 *   - No IP addresses are stored.
 *   - No personal data is stored.
 *   - Country is aggregated (a map field), not tied to individual visitors.
 *
 * Data is ALWAYS written regardless of the user's plan (Free or VIP).
 * The plan only gates the DISPLAY in the dashboard — this ensures Free users
 * who upgrade to VIP immediately see their historical data.
 *
 * See: docs/core/8_Analytics.md
 */

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

function parseDevice(ua: string): 'mobile' | 'desktop' | 'tablet' {
  const parser = new UAParser(ua)
  const type = parser.getDevice().type
  if (type === 'mobile') return 'mobile'
  if (type === 'tablet') return 'tablet'
  return 'desktop'
}

function parseReferrer(referer: string | null): string {
  if (!referer) return 'direct'
  try {
    const url = new URL(referer)
    const hostname = url.hostname.replace(/^www\./, '')
    // Normalize common referrers to readable labels
    if (hostname.includes('instagram')) return 'instagram'
    if (hostname.includes('facebook') || hostname.includes('fb.')) return 'facebook'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'x'
    if (hostname.includes('linkedin')) return 'linkedin'
    if (hostname.includes('tiktok')) return 'tiktok'
    if (hostname.includes('whatsapp')) return 'whatsapp'
    if (hostname.includes('google')) return 'google'
    if (hostname.includes('lanvip')) return 'direct' // self-referral
    return hostname // e.g. "reddit.com", "t.me"
  } catch {
    return 'direct'
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const uid: string | undefined = body?.uid

    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }

    // ── Extract enrichment signals ──────────────────────────────────────────
    const country  = req.headers.get('x-vercel-ip-country') ?? 'Unknown'
    const ua       = req.headers.get('user-agent') ?? ''
    const referer  = req.headers.get('referer')
    const device   = parseDevice(ua)
    const referrer = parseReferrer(referer)
    const dateKey  = getTodayKey()

    // ── Write to daily analytics subcollection ──────────────────────────────
    const db      = getAdminDb()
    const docRef  = db.collection('users').doc(uid).collection('analytics').doc(dateKey)

    await docRef.set(
      {
        date:    dateKey,
        views:   FieldValue.increment(1),
        [`countries.${country}`]: FieldValue.increment(1),
        [`devices.${device}`]:    FieldValue.increment(1),
        [`referrers.${referrer}`]: FieldValue.increment(1),
      },
      { merge: true }
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Analytics Track] Error:', msg)
    // Return 200 anyway — we never want a tracking failure to interrupt the user experience
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}
