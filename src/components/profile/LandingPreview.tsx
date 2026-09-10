'use client'

import { useRef, useState, useEffect } from 'react'
import { PublicLanding } from '@/components/public/PublicLanding'
import type { UserProfile, Block } from '@/types'

interface LandingPreviewProps {
  profile: UserProfile
  /** Optional blocks — if provided, replaces the placeholder grid. */
  blocks?: Block[]
}

/**
 * Scaled live preview of the user's public micro-landing.
 *
 * Renders the real PublicLanding component inside a scaled viewport frame
 * so the preview and the public URL are pixel-identical — no drift possible.
 *
 * Strategy:
 *   - Virtual viewport: 390 × 720 px (iPhone-ish)
 *   - ResizeObserver measures the outer container's real width
 *   - CSS scale = containerWidth / VIRTUAL_WIDTH applied to the inner div
 *   - Outer container clips overflow; aspect-ratio keeps the frame proportional
 */
const VIRTUAL_WIDTH  = 390
const VIRTUAL_HEIGHT = 720

export function LandingPreview({ profile, blocks = [] }: LandingPreviewProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.44)   // sensible default before measure

  // Measure container width and recalculate scale on resize
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / VIRTUAL_WIDTH)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const activeBlocks = blocks.filter(b => b.isActive)

  return (
    <div className="space-y-3">
      <p className="label-dark">Preview público</p>

      {/* Outer container — aspect ratio 390:720, clips inner content */}
      <div
        ref={outerRef}
        className="relative rounded-2xl overflow-hidden w-full max-h-full mx-auto"
        style={{
          aspectRatio: `${VIRTUAL_WIDTH} / ${VIRTUAL_HEIGHT}`,
          border:      '1px solid rgba(255,255,255,0.08)',
          background:  '#0A0A0A',
        }}
      >
        {/* URL label pill */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs font-medium pointer-events-none"
          style={{
            background:     'rgba(0,0,0,0.65)',
            color:          '#A3A3A3',
            backdropFilter: 'blur(8px)',
            whiteSpace:     'nowrap',
          }}
        >
          lanvip.app/{profile.username}
        </div>

        {/*
          Inner scaler:
          - Fixed at VIRTUAL_WIDTH × VIRTUAL_HEIGHT
          - Scaled down so it fits exactly within the outer container
          - transform-origin: top left keeps it aligned correctly
          - overflow-y: auto allows scrolling within the virtual phone frame
          - pointer-events: auto so the user can scroll the preview
          - userSelect: none to avoid accidental text selection while scrolling
        */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              width:           `${VIRTUAL_WIDTH}px`,
              height:          `${VIRTUAL_HEIGHT}px`,
              transformOrigin: 'top left',
              transform:       `scale(${scale})`,
              overflowY:       'hidden',
              overflowX:       'hidden',
              userSelect:      'none',
              // Custom scrollbar — subtle, matches dark theme
              scrollbarWidth:  'thin',
            }}
          >
            <PublicLanding profile={profile} blocks={activeBlocks} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
