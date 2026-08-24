'use client'

import { useState } from 'react'
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
  block: Block
  onToggle: (block: Block) => Promise<void>
  onDelete: (blockId: string) => Promise<void>
}

export function BlockCard({ block, onToggle, onDelete }: BlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const accentColor = block.type === 'social'
    ? (SOCIAL_COLORS[block.content.icon ?? ''] ?? '#D4AF37')
    : '#D4AF37'

  async function handleToggle() {
    setBusy(true)
    try { await onToggle(block) } finally { setBusy(false) }
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
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 p-3 rounded-2xl"
      style={{
        background: '#1A1A1A',
        border: `1px solid ${block.isActive ? accentColor + '33' : '#2A2A2A'}`,
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded-lg flex-shrink-0"
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
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: `${accentColor}18`, fontSize: '1.1rem' }}
      >
        {block.content.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#F5F5F5' }}>
          {block.content.title}
        </p>
        <p className="text-xs truncate" style={{ color: '#555' }}>
          {block.content.url} · {block.layout.spanSize}
        </p>
      </div>

      {/* Active toggle */}
      <button
        onClick={handleToggle}
        disabled={busy}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        style={{ background: block.isActive ? `${accentColor}22` : 'rgba(255,255,255,0.04)' }}
        aria-label={block.isActive ? 'Desactivar' : 'Activar'}
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: block.isActive ? accentColor : '#444' }}
        />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
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
