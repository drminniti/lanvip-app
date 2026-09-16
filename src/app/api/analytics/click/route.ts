import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * POST /api/analytics/click
 *
 * Server-side click tracker for PUBLIC visitors (no auth required).
 * Called fire-and-forget from PublicLanding via incrementClickCount().
 *
 * Replaces client-side Firestore writes for click tracking, since security
 * rules require auth for writes on blocks/{blockId} and users/{uid}.
 *
 * What it does:
 *   1. Increments blocks/{blockId}.clickCount
 *   2. Increments users/{uid}.uniqueClicks (profile-level unique click, deduped client-side)
 *
 * The client is responsible for sessionStorage deduplication — this route
 * does NOT deduplicate; it trusts the client's dedup logic.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const blockId: string | undefined = body?.blockId
    const uid:     string | undefined = body?.uid

    if (!blockId || !uid) {
      return NextResponse.json({ error: 'Missing blockId or uid' }, { status: 400 })
    }

    const db = getAdminDb()

    const writes: Promise<unknown>[] = [
      // Always increment the block click count
      db.collection('blocks').doc(blockId).update({
        clickCount: FieldValue.increment(1),
      }),
    ]

    // Only increment unique profile clicks once per session (client already deduped)
    if (body?.isUniqueClick === true) {
      writes.push(
        db.collection('users').doc(uid).update({
          uniqueClicks: FieldValue.increment(1),
        })
      )
    }

    await Promise.all(writes)


    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Analytics Click] Error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}
