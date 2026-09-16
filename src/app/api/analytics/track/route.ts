import { NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * POST /api/analytics/track
 *
 * Server-side analytics event tracker for PUBLIC visitors (no auth required).
 * Called fire-and-forget from PublicLanding via trackPageView().
 *
 * Replaces ALL client-side Firestore writes for view tracking, since Firestore
 * security rules require auth for writes on users/{uid}. Public visitors are
 * unauthenticated, so we use Admin SDK here to bypass those rules securely.
 *
 * What it does in one request:
 *   1. Increments users/{uid}.views (cumulative — visible to Free + VIP)
 *   2. Writes to users/{uid}/analytics/{YYYY-MM-DD} subcollection with:
 *      - views, country (x-vercel-ip-country), device (UA), referrer
 *
 * See: docs/core/8_Analytics.md
 */

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
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

    const country  = req.headers.get('x-vercel-ip-country') ?? 'Unknown'
    const ua       = req.headers.get('user-agent') ?? ''
    const referer  = req.headers.get('referer')
    const device   = parseDevice(ua)
    const referrer = parseReferrer(referer)
    const dateKey  = getTodayKey()

    const db       = getAdminDb()
    const userRef  = db.collection('users').doc(uid)
    const dailyRef = userRef.collection('analytics').doc(dateKey)

    // Run both writes in parallel: cumulative counter + daily subcollection
    await Promise.all([
      // 1. Cumulative views on user profile (Free + VIP visible)
      userRef.update({ views: FieldValue.increment(1) }),

      // 2. Daily enriched record (VIP visible)
      db.runTransaction(async (tx) => {
        const snap = await tx.get(dailyRef)
        if (!snap.exists) {
          tx.set(dailyRef, {
            date:                       dateKey,
            views:                      1,
            [`countries.${country}`]:   1,
            [`devices.${device}`]:      1,
            [`referrers.${referrer}`]:  1,
          })
        } else {
          tx.update(dailyRef, {
            views:                      FieldValue.increment(1),
            [`countries.${country}`]:   FieldValue.increment(1),
            [`devices.${device}`]:      FieldValue.increment(1),
            [`referrers.${referrer}`]:  FieldValue.increment(1),
          })
        }
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Analytics Track] Error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}
