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
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())
}

function parseDevice(ua: string): 'mobile' | 'desktop' | 'tablet' {
  const parser = new UAParser(ua)
  const type = parser.getDevice().type
  if (type === 'mobile') return 'mobile'
  if (type === 'tablet') return 'tablet'
  return 'desktop'
}

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase()
  const bots = [
    'bot', 'spider', 'crawler', 'preview', 'facebookexternalhit',
    'whatsapp/', 'skypeuripreview', 'slackbot', 'twitterbot', 'headlesschrome'
  ]
  return bots.some(b => lower.includes(b))
}

function parseReferrer(referer: string | null, ua: string): string {
  const uaLower = ua.toLowerCase()
  
  // 1. Try User-Agent first for in-app browsers (they often drop the Referer header)
  if (uaLower.includes('instagram')) return 'instagram'
  if (uaLower.includes('fbav') || uaLower.includes('fban')) return 'facebook'
  if (uaLower.includes('tiktok')) return 'tiktok'
  
  // Note: WhatsApp usually opens links in the system browser, dropping the referer.
  // We can't reliably detect it if the UA is just regular Safari/Chrome.
  // But if it *does* include whatsapp (and isn't the scraper), we catch it here.
  if (uaLower.includes('whatsapp') && !uaLower.includes('whatsapp/')) return 'whatsapp'

  // 2. Fallback to the Referer header
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

    const ua = req.headers.get('user-agent') ?? ''
    
    // Abort tracking if it's a known bot/crawler to prevent skewing analytics
    // (e.g., link preview scrapers from Meta/WhatsApp that evaluate JS)
    if (isBot(ua)) {
      return NextResponse.json({ ok: true, note: 'ignored-bot' })
    }

    const country  = req.headers.get('x-vercel-ip-country') ?? 'Unknown'
    const referer  = req.headers.get('referer')
    const device   = parseDevice(ua)
    const referrer = parseReferrer(referer, ua)
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
