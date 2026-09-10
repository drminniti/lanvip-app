'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getThemeById, matchThemeId } from '@/lib/themes'
import { getAutoContrastTextColor } from '@/lib/colorUtils'
import { trackPageView, incrementClickCount } from '@/lib/analytics'
import { downloadVCard } from '@/lib/vcard'
import { LanvipLogo } from '@/components/ui/LanvipLogo'
import type { UserProfile, Block, SpanSize } from '@/types'
import { FaInstagram, FaLinkedin, FaXTwitter, FaWhatsapp, FaYoutube, FaTiktok, FaFacebook } from 'react-icons/fa6'

// ─── Social brand colors ──────────────────────────────────────────────────────
const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  x:         '#888888',
  whatsapp:  '#25D366',
  youtube:   '#FF0000',
  tiktok:    '#000000', // or an accent like #FF0050
  facebook:  '#1877F2',
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
  profileDisplayName,
}: {
  block:              Block
  accent:             string
  index:              number
  profileDisplayName: string
}) {
  const isSocial    = block.type === 'social'
  const isVCard     = block.type === 'vcard'
  const isCalendly  = block.type === 'calendly'
  const isYouTube   = block.type === 'youtube'
  const platformKey = isSocial ? (block.content.icon ?? '') : ''
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)

  // Color per type
  const tileColor = isVCard
    ? '#22c55e'
    : isCalendly
      ? '#0069FF'
      : isYouTube
        ? '#ef4444'
        : isSocial
          ? (SOCIAL_COLORS[platformKey] ?? accent)
          : accent

  // Sprint 2: col-span driven by block.width; fallback for legacy Firestore docs that
  // don't have this field yet (block.isFeatured ? 'full' : 'half').
  const blockWidth = block.width ?? (block.isFeatured ? 'full' : 'half')
  const colClass   = blockWidth === 'full' ? 'col-span-2' : 'col-span-1'
  // isFeatured now controls ONLY the gold glow/border, not column span.
  const isFeatured = block.isFeatured ?? false

  // ── vCard tile — fires download, no navigation ────────────────────────────
  if (isVCard) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          downloadVCard(block.content, profileDisplayName)
          void incrementClickCount(block.id)
        }}
        className={`${colClass} bento-tile flex items-center gap-3 px-4 py-4 w-full text-left`}
        style={{ borderColor: `${tileColor}35`, cursor: 'pointer' }}
        aria-label={`Descargar contacto: ${block.content.title}`}
      >
        {/* Glow */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: isFeatured ? 0.55 : 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '65%', height: '140%',
            background: `radial-gradient(circle, ${tileColor}30 0%, transparent 70%)`,
            filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
          }}
        />
        {/* Icon */}
        {block.content.icon && (
          <span className="text-xl flex-shrink-0 leading-none" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
            {block.content.icon}
          </span>
        )}
        {/* Text */}
        <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--theme-text, #F0F0F0)' }}>
            {block.content.title}
          </p>
          {block.content.description && (
            <p className="text-xs mt-0.5 truncate opacity-80" style={{ color: 'var(--theme-text, #A3A3A3)' }}>
              {block.content.description}
            </p>
          )}
        </div>
        {/* Download badge */}
        <span
          className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: `${tileColor}18`, color: tileColor, position: 'relative', zIndex: 1 }}
          aria-hidden="true"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          VCF
        </span>
      </motion.button>
    )
  }

  // ── Calendly tile — link with calendar badge ──────────────────────────────
  if (isCalendly) {
    return (
      <motion.a
        href={block.content.url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => void incrementClickCount(block.id)}
        className={`${colClass} bento-tile flex items-center gap-3 px-4 py-4`}
        style={{ textDecoration: 'none', borderColor: `${tileColor}35`, cursor: 'pointer' }}
        aria-label={block.content.title}
      >
        {/* Glow */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: isFeatured ? 0.55 : 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '65%', height: '140%',
            background: `radial-gradient(circle, ${tileColor}28 0%, transparent 70%)`,
            filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
          }}
        />
        {/* Calendar icon */}
        <span className="text-xl flex-shrink-0 leading-none" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>📅</span>
        {/* Text */}
        <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--theme-text, #F0F0F0)' }}>
            {block.content.title}
          </p>
          {block.content.description && (
            <p className="text-xs mt-0.5 truncate opacity-80" style={{ color: 'var(--theme-text, #A3A3A3)' }}>
              {block.content.description}
            </p>
          )}
        </div>
        {/* Agendar badge */}
        <span
          className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: `${tileColor}18`, color: tileColor, position: 'relative', zIndex: 1 }}
          aria-hidden="true"
        >
          Agendar
        </span>
      </motion.a>
    )
  }

  // ── YouTube tile — embedded iframe or lightbox ─────────────────────────
  if (isYouTube) {
    const embedId = block.content.embedId
    const autoplay = block.content.autoplay ?? false
    const displayMode = block.content.displayMode ?? (blockWidth === 'full' ? 'player' : 'button')

    if (displayMode === 'player') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, boxShadow: isFeatured ? `0 0 12px ${accent}26` : 'none' }}
          transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
          className="col-span-2 bento-tile overflow-hidden relative"
          style={{ borderColor: isFeatured ? `${accent}73` : `rgba(255,255,255,0.08)`, padding: 0 }}
        >
          {/* Glow for featured full-width youtube block */}
          {isFeatured && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                boxShadow: `inset 0 0 20px ${accent}22`,
                pointerEvents: 'none', zIndex: 1,
              }}
            />
          )}
          {autoplay || isPlaying ? (
            <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${embedId}?autoplay=1${autoplay && !isPlaying ? '&mute=1' : ''}&modestbranding=1`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          ) : (
            <div 
              className="w-full relative cursor-pointer group" 
              style={{ paddingTop: '56.25%' }}
              onClick={() => {
                flushSync(() => {
                  setIsPlaying(true)
                })
                void incrementClickCount(block.id)
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`}
                alt={block.content.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center z-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                  <FaYoutube className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )
    }

    // Button mode (Full or Half Width)
    return (
      <>
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, boxShadow: isFeatured ? `0 0 12px ${accent}26` : 'none' }}
          transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.02, boxShadow: isFeatured ? `0 0 24px ${accent}66` : 'none' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setShowLightbox(true)
            void incrementClickCount(block.id)
          }}
          className={`${colClass} bento-tile flex items-center gap-3 px-4 py-4 w-full text-left`}
          style={{ borderColor: isFeatured ? `${accent}73` : `rgba(239,68,68,0.28)`, cursor: 'pointer' }}
        >
          {/* Glow */}
          <motion.span
            aria-hidden="true"
            initial={{ opacity: isFeatured ? 0.55 : 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', top: '-20%', right: '-10%',
              width: '65%', height: '140%',
              background: `radial-gradient(circle, ${tileColor}28 0%, transparent 70%)`,
              filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
            }}
          />
          {/* Icon */}
          <span className="text-xl flex-shrink-0 leading-none flex items-center justify-center text-red-500" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
            <FaYoutube className="w-5 h-5" />
          </span>
          {/* Text */}
          <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--theme-text, #F0F0F0)' }}>
              {block.content.title || 'Video de YouTube'}
            </p>
            {block.content.description && (
              <p className="text-xs mt-0.5 truncate opacity-80" style={{ color: 'var(--theme-text, #A3A3A3)' }}>
                {block.content.description}
              </p>
            )}
          </div>
        </motion.button>
        {/* Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" 
              onClick={() => setShowLightbox(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-4xl relative" 
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowLightbox(false)}
                  className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  aria-label="Cerrar video"
                >
                  ✕
                </button>
                <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${embedId}?autoplay=1&modestbranding=1`}
                    className="absolute top-0 left-0 w-full h-full bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Default tile (link / social) ──────────────────────────────────────────
  return (
    <motion.a
      href={block.content.url || undefined}
      target={block.content.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isFeatured ? `0 0 12px ${accent}26` : 'none'
      }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: isFeatured ? `0 0 24px ${accent}66` : 'none'
      }}
      whileTap={{ scale: 0.96 }}
      onClick={() => { if (block.content.url) void incrementClickCount(block.id) }}
      className={`${colClass} bento-tile flex items-center gap-3 px-4 py-4`}
      style={{
        textDecoration: 'none',
        cursor:         block.content.url ? 'pointer' : 'default',
        borderColor:    isFeatured ? `${accent}73` : `${tileColor}28`,
      }}
      aria-label={block.content.title}
    >

      {/* Icon */}
      {block.content.icon && (
        <span className="text-xl flex-shrink-0 leading-none flex items-center justify-center" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
          {block.type === 'social' ? (
            (() => {
              const s = block.content.icon
              if (s === 'instagram') return <FaInstagram className="w-5 h-5" />
              if (s === 'linkedin')  return <FaLinkedin className="w-5 h-5" />
              if (s === 'x')         return <FaXTwitter className="w-5 h-5" />
              if (s === 'whatsapp')  return <FaWhatsapp className="w-5 h-5" />
              if (s === 'youtube')   return <FaYoutube className="w-5 h-5" />
              if (s === 'tiktok')    return <FaTiktok className="w-5 h-5" />
              if (s === 'facebook')  return <FaFacebook className="w-5 h-5" />
              return s
            })()
          ) : (
            block.content.icon
          )}
        </span>
      )}

      {/* Text group */}
      <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
        <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--theme-text, #F0F0F0)' }}>
          {block.content.title}
        </p>
        {block.content.description && (
          <p className="text-xs mt-0.5 leading-snug opacity-80" style={{ color: 'var(--theme-text, #A3A3A3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {block.content.description}
          </p>
        )}
      </div>
      {/* External link chevron */}
      {block.content.url && (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0 ml-auto opacity-40"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          aria-hidden="true" style={{ color: tileColor, position: 'relative', zIndex: 1 }}
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
  const isCustomTheme = themeId === 'custom'
  const customColors = profile.themeSettings.customColors
  
  const theme = isCustomTheme ? undefined : getThemeById(themeId)
  
  const accent = isCustomTheme
    ? (customColors?.accent ?? '#D4AF37')
    : (theme?.accent ?? '#D4AF37')

  // ── Track page view (client-side, sessionStorage-deduplicated) ─────────────
  // useRef prevents a double-fire in React StrictMode dev (which intentionally
  // mounts → unmounts → remounts each component to expose side-effect bugs).
  const tracked = useRef(false)
  useEffect(() => {
    // Record page view on load
    if (!tracked.current) {
      tracked.current = true
      void trackPageView(profile.uid)
    }
    // Force scroll to top on mount
    window.scrollTo(0, 0)
  }, [profile.uid])

  // Custom logic for background
  let bg = ''
  if (isCustomTheme) {
    const bg1 = customColors?.background ?? '#0a0a0a'
    const bg2 = customColors?.gradientColor ?? '#1a1a1a'
    const useGradient = customColors?.useGradient ?? false
    bg = useGradient ? `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)` : bg1
  } else {
    bg = profile.themeSettings.bgType === 'solid'
      ? profile.themeSettings.colors[0]
      : `linear-gradient(145deg, ${profile.themeSettings.colors[0]} 0%, ${profile.themeSettings.colors[1] ?? profile.themeSettings.colors[0]} 100%)`
  }

  // Custom logic for text color
  let textColor = isCustomTheme ? (customColors?.textColor ?? '#ffffff') : (theme?.textColor ?? '#F0F0F0')
  if (isCustomTheme && (customColors?.autoContrast ?? true)) {
    const baseBg = customColors?.background ?? '#0a0a0a'
    textColor = getAutoContrastTextColor(baseBg)
  }

  const useTexture = isCustomTheme && (customColors?.useTexture ?? false)

  const isImageBg = profile.themeSettings.background?.type === 'image' && !!profile.themeSettings.background?.url
  const bgUrl = profile.themeSettings.background?.url
  const overlayOpacity = (profile.themeSettings.background?.overlayOpacity ?? 50) / 100

  const bgEffect = theme?.settings?.bgEffect
  const isDark = profile.themeSettings.darkMode
  const blendMode = isDark ? 'mix-blend-screen' : 'mix-blend-multiply'

  const renderBgEffect = () => {
    if (bgEffect === 'aurora') {
      return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full ${blendMode} filter blur-[80px] opacity-40`}
            style={{ background: accent }}
            animate={{ x: [0, 50, -30, 0], y: [0, 30, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className={`absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full ${blendMode} filter blur-[100px] opacity-30`}
            style={{ background: theme?.settings.colors[1] ?? accent }}
            animate={{ x: [0, -50, 30, 0], y: [0, -30, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )
    }
    if (bgEffect === 'grid-motion') {
      return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-end justify-center" style={{ perspective: '1000px', background: theme?.settings.colors[0] ?? '#000' }}>
          <motion.div
            className="w-[200vw] h-[150vh] origin-bottom"
            style={{
              backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              rotateX: '60deg',
            }}
            animate={{ backgroundPositionY: ['0px', '50px'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme?.settings.colors[0]} 40%, transparent 100%)` }} />
        </div>
      )
    }
    if (bgEffect === 'floating-orbs') {
      return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${blendMode} filter blur-[60px]`}
              style={{
                background: i % 2 === 0 ? accent : (theme?.settings.colors[1] ?? accent),
                width: `${(i * 5) + 15}vw`,
                height: `${(i * 5) + 15}vw`,
                left: `${(i * 15)}%`,
                top: `${(i * 15)}%`,
                opacity: isDark ? 0.4 : 0.6
              }}
              animate={{ y: [0, -60, 0], x: [0, 40, 0] }}
              transition={{ duration: (i * 2) + 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )
    }
    if (bgEffect === 'bauhaus-shapes') {
      const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><circle cx="200" cy="200" r="150" fill="${accent}" opacity="0.15" /><rect x="500" y="100" width="200" height="200" fill="#E2725B" opacity="0.1" transform="rotate(45 600 200)" /><path d="M100 600 L300 600 L200 400 Z" fill="#4A9EFF" opacity="0.1" /><circle cx="650" cy="650" r="100" fill="transparent" stroke="${accent}" stroke-width="20" opacity="0.2" /></svg>`)
      return (
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,${svg}")`,
            backgroundSize: '800px 800px',

            backgroundPosition: 'center',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      )
    }
    return null
  }

  return (
    <div 
      className="absolute inset-0 overflow-hidden w-full h-full"
      style={{ 
        '--theme-bg': isCustomTheme ? bg : undefined,
        '--theme-accent': isCustomTheme ? accent : undefined,
        '--theme-text': textColor,
      } as React.CSSProperties}
    >
      {/* Capa de Fondo (Capa 0) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {!isImageBg && (
          <div className="absolute inset-0" style={{ background: bg }} />
        )}
        {useTexture && !isImageBg && !bgEffect && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              opacity: 0.15,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        {isImageBg && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${bgUrl})` }} 
            />
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: overlayOpacity }} 
            />
          </>
        )}
        {renderBgEffect()}
      </div>

      {/* Capa de Contenido (Capa 10) */}
      <main className="absolute inset-0 z-10 overflow-y-auto">
        <div className="w-full h-full flex flex-col items-center">
          <div className="w-full max-w-md mx-auto px-4 py-12 pb-24 flex flex-col items-center gap-6">

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
            style={{ color: 'var(--theme-text, #F5F5F5)' }}
          >
            {profile.displayName}
          </h1>
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
            className="text-sm text-center leading-relaxed max-w-xs"
            style={{ color: 'var(--theme-text, #A3A3A3)' }}
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Bento grid */}
        {blocks.length > 0 && (
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            {blocks.map((block, i) => {
              // ── Structural blocks ────────────────────────────────────────────
              // Non-interactive, always col-span-2, no hover/click/cursor.
              if (block.type === 'divider') {
                return (
                  <div key={block.id} className="col-span-2 flex items-center gap-3 py-1" aria-hidden="true">
                    <div className="flex-1 h-px opacity-20" style={{ background: 'var(--theme-text, #F0F0F0)' }} />
                    {block.content.title && (
                      <span
                        className="text-xs uppercase tracking-widest flex-shrink-0"
                        style={{ color: 'var(--theme-text, #F0F0F0)', opacity: 0.5, fontSize: '0.6rem' }}
                      >
                        {block.content.title}
                      </span>
                    )}
                    <div className="flex-1 h-px opacity-20" style={{ background: 'var(--theme-text, #F0F0F0)' }} />
                  </div>
                )
              }

              if (block.type === 'section_title') {
                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="col-span-2 px-1 pt-3 pb-0.5"
                    aria-label={block.content.title}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--theme-text, #FFFFFF)', opacity: 0.7, letterSpacing: '0.12em' }}
                    >
                      {block.content.title}
                    </p>
                  </motion.div>
                )
              }

              // ── Interactive tiles ─────────────────────────────────────────────
              return (
                <BentoTile
                  key={block.id}
                  block={block}
                  accent={accent}
                  index={i}
                  profileDisplayName={profile.displayName}
                />
              )
            })}
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
            href="https://lanvip.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-100"
            style={{ color: 'var(--theme-text, #FFFFFF)', opacity: 0.75, textDecoration: 'none' }}
          >
            <LanvipLogo size={14} />
            <span>Creado con</span>
            <span style={{ color: `${accent}66`, fontWeight: 600 }}>Lanvip</span>
          </a>
          </motion.div>

          </div>
        </div>
      </main>
    </div>
  )
}
