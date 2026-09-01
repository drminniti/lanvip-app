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

export function BlockCard({ block, onToggle, onDelete, onEdit }: BlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy]                   = useState(false)
  const [isActive, setIsActive]           = useState(block.isActive)
  const [actionsVisible, setActionsVisible] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const dndStyle = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.35 : 1,
    gridColumn: block.isFeatured ? 'span 2' : 'span 1',
  }

  const accentColor = block.type === 'social'
    ? (SOCIAL_COLORS[block.content.icon ?? ''] ?? '#D4AF37')
    : '#D4AF37'

  useEffect(() => { setIsActive(block.isActive) }, [block.isActive])
  // Reset confirm state on blur
  useEffect(() => {
    if (!actionsVisible) setConfirmDelete(false)
  }, [actionsVisible])

  async function handleToggle() {
    setIsActive(prev => !prev)
    try { await onToggle(block) } catch { setIsActive(block.isActive) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setBusy(true)
    try { await onDelete(block.id) } finally { setBusy(false) }
  }

  // ─── Shared: VIP glow ─────────────────────────────────────────────────────
  const glowEl = (
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
  )

  // ─── Shared: drag handle ──────────────────────────────────────────────────
  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1 rounded-lg flex-shrink-0 relative z-10"
      style={{ color: '#3A3A3A', touchAction: 'none' }}
      aria-label="Arrastrar"
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="7"  cy="5"  r="1.5" />
        <circle cx="7"  cy="10" r="1.5" />
        <circle cx="7"  cy="15" r="1.5" />
        <circle cx="13" cy="5"  r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="13" cy="15" r="1.5" />
      </svg>
    </button>
  )

  // ─── Action buttons ───────────────────────────────────────────────────────
  const editBtn = onEdit && (
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
  )

  const toggleBtn = (
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
  )

  const deleteBtn = (
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
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPACT CARD (col-span-1) — centered icon + title, hover action overlay
  // ═══════════════════════════════════════════════════════════════════════════
  if (!block.isFeatured) {
    return (
      <motion.div
        ref={setNodeRef}
        style={{
          ...dndStyle,
          borderColor: isActive ? 'rgba(212,175,55,0.22)' : undefined,
        }}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        whileHover={isDragging ? {} : { scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bento-tile relative overflow-hidden p-3 flex flex-col items-center justify-center gap-1.5 min-h-[4.5rem]"
        onMouseEnter={() => setActionsVisible(true)}
        onMouseLeave={() => setActionsVisible(false)}
        onFocus={() => setActionsVisible(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActionsVisible(false) }}
      >
        {glowEl}

        {/* Drag handle — top-left */}
        <div className="absolute top-1.5 left-1.5 z-10">
          {dragHandle}
        </div>

        {/* Active indicator dot — top-right */}
        <div
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: isActive ? accentColor : '#333' }}
        />

        {/* Icon — centered */}
        <div
          className="text-2xl leading-none relative z-10"
          aria-hidden="true"
        >
          {block.content.icon || '🔗'}
        </div>

        {/* Title — centered, truncated */}
        <p
          className="text-xs font-semibold leading-tight text-center w-full relative z-10 px-2"
          style={{ color: '#F0F0F0' }}
        >
          <span className="block truncate">{block.content.title}</span>
        </p>

        {/* Hover action overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: actionsVisible && !isDragging ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center gap-1.5 z-20 rounded-2xl"
          style={{
            background:     'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(4px)',
            pointerEvents:  actionsVisible ? 'auto' : 'none',
          }}
        >
          {editBtn}
          {toggleBtn}
          {deleteBtn}
        </motion.div>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED CARD (col-span-2) — full horizontal layout
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...dndStyle,
        borderColor: isActive ? 'rgba(212,175,55,0.22)' : undefined,
      }}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      whileHover={isDragging ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bento-tile flex items-center gap-3 p-4"
    >
      {glowEl}

      {dragHandle}

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
        style={{ background: `${accentColor}15`, fontSize: '1.1rem' }}
      >
        {block.content.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm font-semibold truncate" style={{ color: '#F5F5F5' }}>
          {block.content.title}
        </p>
        {block.content.description && (
          <p className="text-xs truncate mt-0.5" style={{ color: '#A3A3A3' }}>
            {block.content.description}
          </p>
        )}
        <p className="text-xs truncate mt-0.5" style={{ color: '#444' }}>
          {block.content.url}
          {block.isFeatured && (
            <span
              className="ml-1.5 px-1 py-0.5 rounded text-xs font-medium"
              style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
            >
              ⭐
            </span>
          )}
        </p>
      </div>

      {/* Action buttons — always visible on featured */}
      <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
        {editBtn}
        {toggleBtn}
        {deleteBtn}
      </div>
    </motion.div>
  )
}
