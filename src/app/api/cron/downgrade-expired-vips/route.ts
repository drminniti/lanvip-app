import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * GET /api/cron/downgrade-expired-vips
 *
 * Vercel Cron Job — runs daily at 03:00 UTC (00:00 ART).
 * Configured in vercel.json.
 *
 * What it does:
 *   1. Queries all Firestore users where plan === 'vip'.
 *   2. For each user:
 *      - No subscriptionEndsAt  → Lifetime VIP → SKIP (never touch)
 *      - subscriptionEndsAt > now → still active → SKIP
 *      - subscriptionEndsAt ≤ now → expired → downgrade to 'free'
 *   3. Returns a summary: { downgraded, skipped, errors, total }
 *
 * Security:
 *   Vercel sends `Authorization: Bearer <CRON_SECRET>` on every invocation.
 *   Without a valid secret this endpoint returns 401.
 *   The endpoint is also protected because Vercel only invokes it from
 *   their own infrastructure, but we keep the secret check as defence-in-depth.
 *
 * Retrocompatibility:
 *   Lifetime VIPs (users manually assigned without subscriptionEndsAt) are
 *   NEVER downgraded. This preserves all early-adopter manual grants.
 *
 * See: docs/core/5_Business_Model.md §Subscription Lifecycle
 *      docs/core/7_Security.md §Cron Jobs
 */
export async function GET(req: Request) {
  // ── 1. Auth guard ───────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  if (!cronSecret) {
    // Fail open in local dev so you can test without the var, but warn loudly.
    console.warn('[Cron] ⚠️ CRON_SECRET not set — running without auth guard (dev only)')
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron] ❌ Unauthorized cron invocation rejected.')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Query all VIP users ──────────────────────────────────────────────────
  const db = getAdminDb()
  const now = Timestamp.now()

  let vipSnapshot
  try {
    vipSnapshot = await db.collection('users').where('plan', '==', 'vip').get()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Cron] Failed to query users:', msg)
    return NextResponse.json({ error: 'DB query failed', detail: msg }, { status: 500 })
  }

  if (vipSnapshot.empty) {
    console.log('[Cron] No VIP users found. Nothing to do.')
    return NextResponse.json({ downgraded: 0, skipped: 0, errors: 0, total: 0 })
  }

  // ── 3. Classify and batch-write downgrades ─────────────────────────────────
  let downgraded = 0
  let skipped = 0
  let errors = 0
  const downgradedUids: string[] = []

  // Firestore batch supports max 500 operations per commit
  const BATCH_SIZE = 450
  let batch = db.batch()
  let opsInBatch = 0

  const flushBatch = async () => {
    if (opsInBatch === 0) return
    await batch.commit()
    batch = db.batch()
    opsInBatch = 0
  }

  for (const docSnap of vipSnapshot.docs) {
    const data = docSnap.data()
    const uid = docSnap.id

    // ── Lifetime VIP: no expiry date — NEVER downgrade ──────────────────────
    if (!data.subscriptionEndsAt) {
      skipped++
      continue
    }

    // ── Active subscription — SKIP ───────────────────────────────────────────
    const endsAt: Timestamp = data.subscriptionEndsAt
    if (endsAt.toMillis() > now.toMillis()) {
      skipped++
      continue
    }

    // ── Expired — downgrade ──────────────────────────────────────────────────
    try {
      const userRef = db.collection('users').doc(uid)
      batch.update(userRef, {
        plan: 'free',
        planNotification: 'downgraded',
        // Keep subscriptionId and subscriptionEndsAt for audit trail.
        // isSubscriptionCancelled stays as-is.
      })
      opsInBatch++
      downgraded++
      downgradedUids.push(uid)

      // Flush batch before hitting the 500-op limit
      if (opsInBatch >= BATCH_SIZE) {
        await flushBatch()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[Cron] Error scheduling downgrade for uid ${uid}:`, msg)
      errors++
    }
  }

  // Flush any remaining ops
  try {
    await flushBatch()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Cron] Error flushing final batch:', msg)
    errors++
  }

  const total = vipSnapshot.size
  const summary = { downgraded, skipped, errors, total }

  console.log('\n=== [Cron] downgrade-expired-vips ===')
  console.log(`  Total VIP users scanned : ${total}`)
  console.log(`  Downgraded to Free      : ${downgraded}`)
  console.log(`  Skipped (active/lifetime): ${skipped}`)
  console.log(`  Errors                  : ${errors}`)
  if (downgradedUids.length > 0) {
    console.log(`  Affected UIDs           : ${downgradedUids.join(', ')}`)
  }
  console.log('=====================================\n')

  return NextResponse.json(summary)
}
