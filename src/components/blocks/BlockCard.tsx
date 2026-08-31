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
  colSpan?: 'col-span-1' | 'col-span-2'
  onToggle: (block: Block) => Promise<void>
  onDelete: (blockId: string) => Promise<void>
}

export function BlockCard({ block, colSpan = 'col-span-1', onToggle, onDelete }: BlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy]                   = useState(false)
  // Optimistic: flip locally immediately, Firestore confirms in background
  const [isActive, setIsActive]           = useState(block.isActive)

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  // DnD transform/transition kept separate from Framer Motion props
  const dndStyle = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.35 : 1,
    gridColumn: colSpan === 'col-span-2' ? 'span 2' : 'span 1',
  }

  const accentColor = block.type === 'social'
    ? (SOCIAL_COLORS[block.content.icon ?? ''] ?? '#D4AF37')
    : '#D4AF37'

  // Sync from Firestore when external update arrives (onSnapshot)
  useEffect(() => { setIsActive(block.isActive) }, [block.isActive])

  async function handleToggle() {
    setIsActive(prev => !prev)   // optimistic
    try { await onToggle(block) } catch { setIsActive(block.isActive) } // rollback on error
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setBusy(true)
    try { await onDelete(block.id) } finally { setBusy(false) }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...dndStyle,
        // Active state: hairline gold border instead of opaque colored border
        borderColor: isActive ? 'rgba(212,175,55,0.22)' : undefined,
      }}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      // ── Spring hover scale — VIP micro-interaction ──────────────────────
      whileHover={isDragging ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bento-tile flex items-center gap-3 p-3 relative overflow-hidden"
    >
      {/* VIP Glow — radial gradient, shown on hover via motion */}
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position:      'absolute',
          top:           '-30%',
          right:         '-10%',
          width:         '60%',
          height:        '140%',
          background:    `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          filter:        'blur(20px)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded-lg flex-shrink-0 relative z-10"
        style={{ color: '#444', touchAction: 'none' }}
        aria-label="Arrastrar"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="7" cy="5"  r="1.5" />
          <circle cx="7" cy="10" r="1.5" />
          <circle cx="7" cy="15" r="1.5" />
          <circle cx="13" cy="5"  r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="13" cy="15" r="1.5" />
        </svg>
      </button>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 relative z-10"
        style={{ background: `${accentColor}15`, fontSize: '1.1rem' }}
      >
        {block.content.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm font-semibold truncate" style={{ color: '#F5F5F5' }}>
          {block.content.title}
        </p>
        <p className="text-xs truncate" style={{ color: '#555' }}>
          {block.content.url} · {block.layout.spanSize}
        </p>
      </div>

      {/* Active toggle — pill badge */}
      <button
        onClick={handleToggle}
        disabled={busy}
        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all relative z-10"
        style={{
          background:     isActive ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
          color:          isActive ? accentColor : '#666',
          border:         `1px solid ${isActive ? accentColor + '44' : 'transparent'}`,
          minWidth:       '4.5rem',
          justifyContent: 'center',
        }}
        aria-label={isActive ? 'Ocultar bloque' : 'Mostrar bloque'}
      >
        {isActive ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Visible
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            Oculto
          </>
        )}
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10"
        style={{ background: confirmDelete ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)' }}
        aria-label={confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
        onBlur={() => setConfirmDelete(false)}
      >
        {confirmDelete ? (
          <svg className="w-4 h-4" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="#555" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </motion.div>
  )
}
