import { notFound }                   from 'next/navigation'
import type { Metadata }              from 'next'
import { getPublicProfileByUsername } from '@/lib/auth'
import { getActiveBlocksByUserId }    from '@/lib/blocks'
import { incrementViewCount }         from '@/lib/analytics'
import { PublicLanding }             from '@/components/public/PublicLanding'
import type { UserProfile, Block }   from '@/types'

type Params = { username: string }

// ─── Serialization helpers ────────────────────────────────────────────────────
// Firestore Timestamp objects have toJSON() methods and cannot be passed
// from Server Components to Client Components. We convert them to ISO strings.

type Serialized<T> = Omit<T, 'createdAt'> & { createdAt?: string | null }

function serializeProfile(p: UserProfile): Serialized<UserProfile> {
  const { createdAt, ...rest } = p
  return {
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: (createdAt as any)?.toDate?.()?.toISOString() ?? null,
  }
}

function serializeBlocks(blocks: Block[]): Serialized<Block>[] {
  return blocks.map(({ createdAt, ...rest }) => ({
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: (createdAt as any)?.toDate?.()?.toISOString() ?? null,
  }))
}

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

  const profile = await getPublicProfileByUsername(username)
  if (!profile) notFound()

  // Fire-and-forget: increment views without blocking render
  void incrementViewCount(profile.uid)

  const blocks = await getActiveBlocksByUserId(profile.uid)

  // Serialize Timestamps → plain objects before crossing the Server→Client boundary
  const safeProfile = serializeProfile(profile)
  const safeBlocks  = serializeBlocks(blocks)

  return <PublicLanding profile={safeProfile as unknown as UserProfile} blocks={safeBlocks as unknown as Block[]} />
}
