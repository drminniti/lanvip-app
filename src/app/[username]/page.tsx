/**
 * Public Micro-Landing VIP — /[username]
 *
 * Server Component. Reads Firestore server-side (SSR) for:
 *  - SEO-ready HTML with correct title / Open Graph on first load
 *  - Instant rendering — no loading spinner visible to visitors
 *  - No auth required — public route
 *
 * Per 2_Architecture.md §2: public views prioritize Server Components for SEO.
 * Per Next.js 16: `params` is a Promise — must be awaited.
 */

import { notFound }                   from 'next/navigation'
import type { Metadata }              from 'next'
import { getPublicProfileByUsername } from '@/lib/auth'
import { getActiveBlocksByUserId }    from '@/lib/blocks'
import { PublicLanding }             from '@/components/public/PublicLanding'

type Params = { username: string }

// ─── SEO — dynamic metadata ───────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { username } = await params
  const profile = await getPublicProfileByUsername(username)

  if (!profile) {
    return { title: 'Perfil no encontrado | Lanvip' }
  }

  const title       = `${profile.displayName} | Lanvip`
  const description = profile.bio
    ? profile.bio
    : `Mirá la Micro-Landing VIP de ${profile.displayName} en Lanvip.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url:    `https://lanvip.app/${profile.username}`,
      type:   'profile',
      images: profile.avatarUrl
        ? [{ url: profile.avatarUrl, alt: `Foto de ${profile.displayName}` }]
        : [],
    },
    twitter: {
      card:        'summary',
      title,
      description,
      images:      profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UserPublicPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { username } = await params

  // Fetch profile — 404 if username doesn't exist
  const profile = await getPublicProfileByUsername(username)
  if (!profile) notFound()

  // Fetch active blocks (ordered by `order` asc)
  // Note: may require Firestore composite index — see 2_Architecture.md §3.3
  const blocks = await getActiveBlocksByUserId(profile.uid)

  return <PublicLanding profile={profile} blocks={blocks} />
}
