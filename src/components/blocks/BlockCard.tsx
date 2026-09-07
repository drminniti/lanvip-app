'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block } from '@/types'

const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  x:         '#888888',
  whatsapp:  '#25D366',
}

interface BlockCardProps {
  block:    Block
  onToggle: (block: Block) => Promise<void>
  onDelete: (blockId: string) => Promise<void>
  /** When provided, shows the edit pencil button (admin-only). */
  onEdit?:  (block: Block) => void
}

/**
 * BlockCard — Editor list layout.
 *
 * The dashboard editor always renders blocks as horizontal list rows,
 * regardless of their isFeatured flag. This gives verticalListSortingStrategy
 * a uniform item height, making drag-and-drop work perfectly without the
 * rect-based calculation problems of a 2D mixed-size grid.
 *
 * The isFeatured flag still controls how the block looks on the PUBLIC
 * landing page (PublicLanding.tsx). In the editor a ⭐ badge indicates
 * a block is featured so the user knows it will appear full-width publicly.
 */
export function BlockCard({ block, onToggle, onDelete, onEdit }: BlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy]                   = useState(false)
  const [isActive, setIsActive]           = useState(block.isActive)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style: React.CSSProperties = {
    transform:  CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity:    isDragging ? 0 : 1,
    // No gridColumn needed — the editor uses a vertical flex list
  }

  const accentColor = block.type === 'social'
    ? (SOCIAL_COLORS[block.content.icon ?? ''] ?? '#D4AF37')
    : '#D4AF37'

  useEffect(() => { setIsActive(block.isActive) }, [block.isActive])

  async function handleToggle() {
    setIsActive(prev => !prev)
    try { await onToggle(block) } catch { setIsActive(block.isActive) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setBusy(true)
    try { await onDelete(block.id) } finally { setBusy(false) }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0 : 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bento-tile flex items-center gap-3 px-3 py-3"
    >
      {/* VIP glow */}
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position:      'absolute',
          top:           '-30%',
          right:         '-10%',
          width:         '40%',
          height:        '140%',
          background:    `radial-gradient(circle, ${accentColor}14 0%, transparent 70%)`,
          filter:        'blur(20px)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* ── Drag handle ── always the leftmost element, large hit area */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-1 rounded-lg flex-shrink-0 relative z-10"
        style={{ color: '#3A3A3A', touchAction: 'none' }}
        aria-label="Arrastrar"
        tabIndex={-1}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="7"  cy="4"  r="1.5" />
          <circle cx="7"  cy="10" r="1.5" />
          <circle cx="7"  cy="16" r="1.5" />
          <circle cx="13" cy="4"  r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="13" cy="16" r="1.5" />
        </svg>
      </button>

      {/* ── Icon ── */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
        style={{ background: `${accentColor}15`, fontSize: '1.1rem' }}
        aria-hidden="true"
      >
        {block.content.icon || '🔗'}
      </div>

      {/* ── Info ── */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold truncate" style={{ color: '#F5F5F5' }}>
            {block.content.title}
          </p>
          {block.isFeatured && (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
            >
              ⭐ Destacado
            </span>
          )}
        </div>
        {block.content.description && (
          <p className="text-xs truncate mt-0.5" style={{ color: '#A3A3A3' }}>
            {block.content.description}
          </p>
        )}
        <p className="text-xs truncate mt-0.5" style={{ color: '#3A3A3A' }}>
          {block.content.url}
        </p>
      </div>

      {/* ── Active dot ── */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10"
        style={{ background: isActive ? accentColor : '#333' }}
        title={isActive ? 'Visible' : 'Oculto'}
      />

      {/* ── Action buttons ── always visible, no hover overlay needed */}
      <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
        {/* Edit */}
        {onEdit && (
          <button
            onClick={() => onEdit(block)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Editar bloque"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="#888" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        {/* Toggle visibility */}
        <button
          onClick={handleToggle}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ background: isActive ? `${accentColor}22` : 'rgba(255,255,255,0.05)' }}
          aria-label={isActive ? 'Ocultar' : 'Mostrar'}
          title={isActive ? 'Visible' : 'Oculto'}
        >
          {isActive ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke={accentColor} strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="#555" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ background: confirmDelete ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)' }}
          aria-label={confirmDelete ? 'Confirmar' : 'Eliminar'}
          title={confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
          onBlur={() => setConfirmDelete(false)}
        >
          {confirmDelete ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="#555" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  )
}
