'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block } from '@/types'
import { FaInstagram, FaLinkedin, FaXTwitter, FaWhatsapp, FaYoutube, FaTiktok, FaFacebook } from 'react-icons/fa6'

const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin:  '#0A66C2',
  x:         '#555555',
  whatsapp:  '#25D366',
  youtube:   '#FF0000',
  tiktok:    '#000000',
  facebook:  '#1877F2',
}

interface BlockCardProps {
  block:    Block
  onToggle: (block: Block) => Promise<void>
  onDelete: (blockId: string) => Promise<void>
  onEdit?:  (block: Block) => void
}

export function BlockCard({ block, onToggle, onDelete, onEdit }: BlockCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy]                   = useState(false)
  const [isActive, setIsActive]           = useState(block.isActive)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  useEffect(() => { setIsActive(block.isActive) }, [block.isActive])

  async function handleToggle() {
    setIsActive(p => !p)
    try { await onToggle(block) } catch { setIsActive(block.isActive) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setBusy(true)
    try { await onDelete(block.id) } finally { setBusy(false) }
  }

  const accentColor = block.type === 'social'
    ? (SOCIAL_COLORS[block.content.icon ?? ''] ?? '#D4AF37')
    : '#D4AF37'

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition: transition ?? 'transform 200ms ease',
        opacity:    isDragging ? 0.5 : 1,
        zIndex:     isDragging ? 10 : 'auto',
        boxShadow:  block.isFeatured && !isDragging ? '0 0 12px rgba(212,175,55,0.15)' : 'none',
        borderColor: block.isFeatured ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.06)'
      }}
      className="bento-tile flex items-center gap-3 px-3 py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        style={{ color: '#444', touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
        className="p-2 -ml-1 rounded-lg flex-shrink-0"
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

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
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
          block.content.icon || '🔗'
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: '#F5F5F5' }}>
            {block.content.title}
          </p>
        </div>
        {block.content.url && (
          <p className="text-xs truncate mt-0.5" style={{ color: '#444' }}>
            {block.content.url}
          </p>
        )}
      </div>

      {/* Active dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: isActive ? accentColor : '#333' }}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(block)}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Editar"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="#888" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleToggle}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: isActive ? `${accentColor}22` : 'rgba(255,255,255,0.05)' }}
          aria-label={isActive ? 'Ocultar' : 'Mostrar'}
          title={isActive ? 'Visible' : 'Oculto'}
        >
          {isActive
            ? <svg className="w-3.5 h-3.5" fill="none" stroke={accentColor} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            : <svg className="w-3.5 h-3.5" fill="none" stroke="#555" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
          }
        </button>

        <button
          onClick={handleDelete}
          disabled={busy}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: confirmDelete ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)' }}
          aria-label={confirmDelete ? 'Confirmar' : 'Eliminar'}
          title={confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
          onBlur={() => setConfirmDelete(false)}
        >
          {confirmDelete
            ? <svg className="w-3.5 h-3.5" fill="none" stroke="#EF4444" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-3.5 h-3.5" fill="none" stroke="#555" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          }
        </button>
      </div>
    </div>
  )
}
