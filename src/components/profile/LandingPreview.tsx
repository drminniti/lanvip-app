'use client'

import { motion } from 'framer-motion'
import { getThemeById, matchThemeId } from '@/lib/themes'
import type { UserProfile, Block, SpanSize } from '@/types'

// ─── Social brand colors ──────────────────────────────────────────────────────
const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  x:         '#888888',
  whatsapp:  '#25D366',
}

// ─── Bento tile ───────────────────────────────────────────────────────────────

function BentoTile({
  block,
  accent,
  index,
}: {
  block: Block
  accent: string
  index: number
}) {
  const span: Record<SpanSize, string> = {
    '1x1': 'col-span-1',
    '2x1': 'col-span-2',
    '1x2': 'col-span-1 row-span-2',
    '2x2': 'col-span-2',
  }

  const isSocial   = block.type === 'social'
  const platformKey = isSocial ? (block.content.icon ?? '') : ''
  const tileColor   = isSocial ? (SOCIAL_COLORS[platformKey] ?? accent) : accent
  const isLarge     = block.layout.spanSize === '2x2'

  const tileStyle = {
    height:         isLarge ? '8rem' : '3.5rem',
    background:     `${tileColor}14`,
    border:         `1px solid ${tileColor}33`,
    overflow:       'hidden',
    textDecoration: 'none',
    cursor:         block.content.url ? 'pointer' : 'default',
    position:       'relative' as const,
  }

  const tileClass = `${span[block.layout.spanSize]} rounded-xl flex items-center gap-2 px-3 transition-opacity hover:opacity-80`

  const inner = (
    <>
      {/* VIP Glow — solo en bloques 2x2 */}
      {isLarge && (
        <span
          aria-hidden="true"
          style={{
            position:    'absolute',
            top:         '-20%',
            right:       '-10%',
            width:       '60%',
            height:      '120%',
            background:  `radial-gradient(circle, ${tileColor}26 0%, transparent 70%)`,
            filter:      'blur(12px)',
            pointerEvents: 'none',
            zIndex:      0,
          }}
        />
      )}
      {/* Icon / emoji */}
      {block.content.icon && (
        <span className="text-base flex-shrink-0" style={{ position: 'relative', zIndex: 1 }}>
          {block.content.icon}
        </span>
      )}
      {/* Title */}
      <span
        className="text-xs font-semibold truncate"
        style={{ color: '#F5F5F5', position: 'relative', zIndex: 1 }}
      >
        {block.content.title}
      </span>
    </>
  )

  return (
    <motion.a
      href={block.content.url || undefined}
      target={block.content.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 260 }}
      whileTap={{ scale: 0.96 }}
      className={tileClass}
      style={tileStyle}
    >
      {inner}
    </motion.a>
  )
}

// ─── Placeholder tiles (no blocks yet) ───────────────────────────────────────

function PlaceholderGrid() {
  return (
    <div className="w-full grid grid-cols-2 gap-2 mt-2">
      {[1, 2, 3, 4].map(n => (
        <div
          key={n}
          className="h-14 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LandingPreviewProps {
  profile: UserProfile
  /** Optional blocks — if provided, replaces the placeholder grid. */
  blocks?: Block[]
}

/**
 * Scaled live preview of the user's public micro-landing.
 * Reflects theme, avatar, displayName, username, bio and Bento blocks in real time.
 */
export function LandingPreview({ profile, blocks }: LandingPreviewProps) {
  const themeId = matchThemeId(profile.themeSettings)
  const theme   = getThemeById(themeId)

  const bgGradient = `linear-gradient(135deg, ${profile.themeSettings.colors[0]} 0%, ${profile.themeSettings.colors[1]} 100%)`
  const accent      = theme?.accent ?? '#D4AF37'

  const activeBlocks = blocks?.filter(b => b.isActive) ?? []
  const hasBlocks    = activeBlocks.length > 0

  return (
    <div className="space-y-3">
      <p className="label-dark">Preview público</p>

      {/* Scaled preview container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: '1px solid #333333',
          background: '#0A0A0A',
          aspectRatio: '9/16',
          maxHeight: '560px',
        }}
      >
        {/* URL label */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#A3A3A3', backdropFilter: 'blur(8px)' }}
        >
          lanvip.app/{profile.username}
        </div>

        {/* Preview content */}
        <div
          className="absolute inset-0 flex flex-col items-center px-4 pt-12 pb-6 overflow-y-auto"
          style={{ background: bgGradient }}
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full overflow-hidden mb-3 flex-shrink-0"
            style={{
              border: `3px solid ${accent}`,
              boxShadow: `0 0 24px ${accent}44`,
            }}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `${accent}22`, color: accent }}
              >
                {profile.displayName?.[0] ? (
                  <span className="text-2xl font-bold">
                    {profile.displayName[0].toUpperCase()}
                  </span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10" style={{ opacity: 0.6 }}>
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>
            )}
          </motion.div>

          {/* Name */}
          <motion.h2
            key={profile.displayName}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-bold text-center mb-1"
            style={{ color: '#F5F5F5' }}
          >
            {profile.displayName || 'Tu nombre'}
          </motion.h2>

          {/* Bio */}
          {profile.bio && (
            <motion.p
              key={profile.bio}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center mb-4 leading-relaxed"
              style={{ color: '#A3A3A3', maxWidth: '85%' }}
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Bento grid — real blocks or placeholders */}
          <div className="w-full grid grid-cols-2 gap-2 mt-2">
            {hasBlocks ? (
              activeBlocks.map((block, i) => (
                <BentoTile key={block.id} block={block} accent={accent} index={i} />
              ))
            ) : (
              <PlaceholderGrid />
            )}
          </div>

          {/* Lanvip badge */}
          <div className="mt-auto pt-4">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Creado con <span style={{ color: accent, opacity: 0.6 }}>Lanvip</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
