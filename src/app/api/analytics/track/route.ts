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
 * Uses a transaction to handle both new (initialize) and existing (increment) docs.
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
    if (hostname.includes('instagram')) return 'instagram'
    if (hostname.includes('facebook') || hostname.includes('fb.')) return 'facebook'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'x'
    if (hostname.includes('linkedin')) return 'linkedin'
    if (hostname.includes('tiktok')) return 'tiktok'
    if (hostname.includes('whatsapp')) return 'whatsapp'
    if (hostname.includes('google')) return 'google'
    if (hostname.includes('lanvip')) return 'direct'
    return hostname
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
    // Use a transaction to handle both "new doc" (initialize with 1) and
    // "existing doc" (increment). This is more reliable than set+merge+increment
    // which can behave differently across Firestore Admin SDK versions.
    const db     = getAdminDb()
    const docRef = db.collection('users').doc(uid).collection('analytics').doc(dateKey)

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef)

      if (!snap.exists) {
        // First event of the day — create the document
        tx.set(docRef, {
          date:                       dateKey,
          views:                      1,
          [`countries.${country}`]:   1,
          [`devices.${device}`]:      1,
          [`referrers.${referrer}`]:  1,
        })
      } else {
        // Document already exists — increment all counters
        tx.update(docRef, {
          views:                      FieldValue.increment(1),
          [`countries.${country}`]:   FieldValue.increment(1),
          [`devices.${device}`]:      FieldValue.increment(1),
          [`referrers.${referrer}`]:  FieldValue.increment(1),
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Analytics Track] Error:', msg)
    // Return 200 anyway — tracking failure must never break the user experience
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}
