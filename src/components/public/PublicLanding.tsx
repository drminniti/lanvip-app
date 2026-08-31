'use client'

import { motion } from 'framer-motion'
import { getThemeById, matchThemeId } from '@/lib/themes'
import { incrementClickCount } from '@/lib/analytics'
import type { UserProfile, Block, SpanSize } from '@/types'

// ─── Social brand colors ──────────────────────────────────────────────────────
const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  x:         '#888888',
  whatsapp:  '#25D366',
}

// ─── Span mapping (retains spanSize for row-span support) ─────────────────────
const SPAN_CLASS: Record<SpanSize, string> = {
  '1x1': 'col-span-1',
  '2x1': 'col-span-2',
  '1x2': 'col-span-1 row-span-2',
  '2x2': 'col-span-2',
}

// ─── Individual Bento tile ────────────────────────────────────────────────────
/**
 * Layout rules (3_UX_UI.md §Bento Grid):
 *   - isFeatured=true  → col-span-2, generous padding, description shown.
 *   - isFeatured=false → col-span-1, compact horizontal row.
 *   - All tiles: .bento-tile glassmorphism, VIP glow on hover, spring scale.
 *   - Heights: content-driven via padding — no fixed heights.
 */
function BentoTile({
  block,
  accent,
  index,
}: {
  block: Block
  accent: string
  index: number
}) {
  const isSocial    = block.type === 'social'
  const platformKey = isSocial ? (block.content.icon ?? '') : ''
  const tileColor   = isSocial ? (SOCIAL_COLORS[platformKey] ?? accent) : accent

  // isFeatured drives the grid span; fallback to spanSize for legacy blocks
  const isFeatured  = block.isFeatured ?? (block.layout.spanSize !== '1x1')
  const colClass    = isFeatured
    ? 'col-span-2'
    : SPAN_CLASS[block.layout.spanSize] ?? 'col-span-1'

  return (
    <motion.a
      href={block.content.url || undefined}
      target={block.content.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        type: 'spring',
        stiffness: 260,
        damping: 22,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        if (block.content.url) void incrementClickCount(block.id)
      }}
      className={`${colClass} bento-tile flex items-center gap-3 px-4 py-4`}
      style={{
        textDecoration: 'none',
        cursor:         block.content.url ? 'pointer' : 'default',
        borderColor:    `${tileColor}28`,
      }}
      aria-label={block.content.title}
    >
      {/* VIP Glow — fades in on hover; slightly visible for featured tiles */}
      <motion.span
        aria-hidden="true"
        initial={{ opacity: isFeatured ? 0.4 : 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position:      'absolute',
          top:           '-20%',
          right:         '-10%',
          width:         '65%',
          height:        '140%',
          background:    `radial-gradient(circle, ${tileColor}28 0%, transparent 70%)`,
          filter:        'blur(18px)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* Icon */}
      {block.content.icon && (
        <span
          className="text-xl flex-shrink-0 leading-none"
          aria-hidden="true"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {block.content.icon}
        </span>
      )}

      {/* Text group — title + optional description */}
      <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#F0F0F0' }}>
          {block.content.title}
        </p>
        {block.content.description && (
          <p
            className="text-xs mt-0.5 leading-snug"
            style={{ color: 'rgba(163,163,163,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {block.content.description}
          </p>
        )}
      </div>

      {/* External link chevron */}
      {block.content.url && (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 ml-auto opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: tileColor, position: 'relative', zIndex: 1 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </motion.a>
  )
}

// ─── Main Public Landing ──────────────────────────────────────────────────────

interface PublicLandingProps {
  profile: UserProfile
  blocks:  Block[]
}

/**
 * Full-page public Micro-Landing VIP.
 * Rendered by the SSR route /[username].
 * Applies the user's chosen VIP theme, avatar, bio and Bento grid.
 *
 * Grid rules (3_UX_UI.md §Bento Grid Adaptativo):
 *   - block.isFeatured = true  → col-span-2 (highlighted link with description)
 *   - block.isFeatured = false → col-span-1 (compact tile)
 *   - Heights: content-driven via py-4 padding — no fixed heights.
 */
export function PublicLanding({ profile, blocks }: PublicLandingProps) {
  const themeId = matchThemeId(profile.themeSettings)
  const theme   = getThemeById(themeId)
  const accent  = theme?.accent ?? '#D4AF37'

  const bg = profile.themeSettings.bgType === 'solid'
    ? profile.themeSettings.colors[0]
    : `linear-gradient(145deg, ${profile.themeSettings.colors[0]} 0%, ${profile.themeSettings.colors[1] ?? profile.themeSettings.colors[0]} 100%)`

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{ background: bg }}
    >
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center gap-6">

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{
              border:    `3px solid ${accent}`,
              boxShadow: `0 0 32px ${accent}55, 0 0 64px ${accent}22`,
            }}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`Foto de ${profile.displayName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ background: `${accent}22`, color: accent }}
              >
                {profile.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 0 1px ${accent}33` }}
          />
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 260 }}
          className="text-center"
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#F5F5F5' }}
          >
            {profile.displayName}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: `${accent}99` }}>
            @{profile.username}
          </p>
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
            className="text-sm text-center leading-relaxed max-w-xs"
            style={{ color: '#A3A3A3' }}
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Bento grid */}
        {blocks.length > 0 && (
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            {blocks.map((block, i) => (
              <BentoTile key={block.id} block={block} accent={accent} index={i} />
            ))}
          </div>
        )}

        {/* Lanvip badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-1.5"
        >
          <a
            href="/"
            className="text-xs flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
          >
            <span>Creado con</span>
            <span style={{ color: `${accent}66`, fontWeight: 600 }}>Lanvip</span>
          </a>
        </motion.div>

      </div>
    </main>
  )
}
