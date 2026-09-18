import { notFound }                   from 'next/navigation'
import type { Metadata }              from 'next'
import { getPublicProfileByCustomDomain, getActiveBlocksByUserId } from '@/lib/server/queries'
import { PublicLanding }             from '@/components/public/PublicLanding'
import type { UserProfile, Block }   from '@/types'

import { cookies } from 'next/headers'
import { PasswordPrompt }              from '@/components/profile/PasswordPrompt'

type Params = { domain: string }

export const dynamic = 'force-dynamic'

// ─── Serialization helpers ────────────────────────────────────────────────────
// Firestore Timestamp objects have toJSON() methods and cannot be passed
// from Server Components to Client Components. We convert them to ISO strings.

type Serialized<T> = Omit<T, 'createdAt'> & { createdAt?: string | null }

function serializeProfile(p: UserProfile): Serialized<UserProfile> {
  const { 
    createdAt,
    email,
    role,
    subscriptionEndsAt,
    subscriptionId,
    isSubscriptionCancelled,
    planNotification,
    profilePassword, // STRIP PASSWORD
    ...rest 
  } = p as any; // Cast to any to safely extract even if fields are technically missing from types sometimes

  return {
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: (createdAt as any)?.toDate?.()?.toISOString() ?? null,
  } as Serialized<UserProfile>
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
  const { domain } = await params
  const profile = await getPublicProfileByCustomDomain(domain)

  if (!profile) {
    return { title: 'Perfil no encontrado | Lanvip' }
  }

  const isVip = profile.plan === 'vip'
  
  const seoTitle = (isVip && profile.seoTitle) ? profile.seoTitle : profile.displayName
  const title = isVip ? { absolute: seoTitle } : seoTitle

  const ogImageTitle = seoTitle // Only the name or seo title for the OG image
  
  let description = profile.bio || `Mirá la Micro-Landing VIP de ${profile.displayName} en Lanvip.`
  if (isVip && profile.seoDescription) {
    description = profile.seoDescription
  }
    
  // Dynamic OG Image using the new endpoint
  const ogImageUrl = `https://lanvip.app/api/og?title=${encodeURIComponent(ogImageTitle)}${profile.avatarUrl ? `&image=${encodeURIComponent(profile.avatarUrl)}` : ''}`

  return {
    title,
    description,
    ...(profile.faviconUrl ? { icons: { icon: profile.faviconUrl } } : {}),
    openGraph: {
      title,
      description,
      url:    `https://${domain}`,
      type:   'profile',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Perfil de ${profile.displayName}`,
        }
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [ogImageUrl],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomDomainPublicPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { domain } = await params

  const profile = await getPublicProfileByCustomDomain(domain)
  if (!profile) notFound()

  // VIP Password Protection check
  if (profile.plan === 'vip' && profile.isPasswordProtected) {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(`lanvip_auth_${profile.uid}`)
    
    if (!authCookie || authCookie.value !== profile.profilePassword) {
      return <PasswordPrompt profileUid={profile.uid} />
    }
  }

  const blocks = await getActiveBlocksByUserId(profile.uid)

  // Serialize Timestamps → plain objects before crossing the Server→Client boundary
  const safeProfile = serializeProfile(profile)
  const safeBlocks  = serializeBlocks(blocks)

  return <PublicLanding profile={safeProfile as unknown as UserProfile} blocks={safeBlocks as unknown as Block[]} />
}
