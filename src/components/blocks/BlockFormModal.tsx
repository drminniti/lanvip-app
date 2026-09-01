'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockType, Block } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockFormData {
  type:        BlockType
  title:       string
  url:         string
  icon:        string
  description: string
  isFeatured:  boolean
  // social-only
  platform?: SocialPlatform
}

export type SocialPlatform = 'instagram' | 'linkedin' | 'x' | 'whatsapp'

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; color: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: '📸' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', icon: '💼' },
  { id: 'x',         label: 'X / Twitter', color: '#000000', icon: '🐦' },
  { id: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', icon: '💬' },
]

// ─── Emoji palette ────────────────────────────────────────────────────────────
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Links & Web',
    emojis: ['🔗', '🌐', '🖥️', '📱', '💻', '🔌', '📡', '🛰️'],
  },
  {
    label: 'Negocio',
    emojis: ['💼', '📊', '📈', '🤝', '🏢', '💰', '🎯', '🏆'],
  },
  {
    label: 'Creativo',
    emojis: ['🎨', '✏️', '📸', '🎬', '🎵', '🎤', '🖌️', '✨'],
  },
  {
    label: 'Contacto',
    emojis: ['💬', '📩', '📞', '📧', '👋', '🙌', '❤️', '⭐'],
  },
  {
    label: 'Varios',
    emojis: ['🚀', '🌟', '💡', '🔑', '🎁', '📌', '🗂️', '📋'],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function socialUrl(platform: SocialPlatform, handle: string): string {
  const cleaned = handle.replace(/^@/, '').trim()
  switch (platform) {
    case 'instagram': return `https://instagram.com/${cleaned}`
    case 'linkedin':  return `https://linkedin.com/in/${cleaned}`
    case 'x':         return `https://x.com/${cleaned}`
    case 'whatsapp':  return `https://wa.me/${cleaned.replace(/\D/g, '')}`
  }
}

/** Derives a SocialPlatform from the stored icon emoji. Falls back to 'instagram'. */
function platformFromIcon(icon: string): SocialPlatform {
  const match = SOCIAL_PLATFORMS.find(p => p.icon === icon)
  return match?.id ?? 'instagram'
}

/** Extracts the raw handle from a stored social URL. */
function handleFromUrl(platform: SocialPlatform, url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\//, '')
    // WhatsApp stores a phone number — return as-is
    return path
  } catch {
    return url
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline emoji picker grid */
function EmojiPicker({
  value,
  onChange,
}: {
  value:    string
  onChange: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-1">
      <label className="label-dark">Ícono / Emoji</label>
      <div className="flex items-center gap-2">
        <button
          id="btn-emoji-trigger"
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all flex-shrink-0"
          style={{
            background: open ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)',
            border:     `1.5px solid ${open ? '#D4AF37' : 'transparent'}`,
          }}
          aria-label="Elegir emoji"
          title="Elegir emoji"
        >
          {value}
        </button>
        <p className="text-xs" style={{ color: '#666' }}>
          {open ? 'Elegí un emoji ↓' : 'Tocá para cambiar el ícono'}
        </p>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="emoji-panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="rounded-2xl p-3 space-y-3"
            style={{
              background:     'rgba(0,0,0,0.60)',
              backdropFilter: 'blur(20px)',
              border:         '1px solid rgba(255,255,255,0.08)',
              maxHeight:      '220px',
              overflowY:      'auto',
            }}
          >
            {EMOJI_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-medium mb-1.5" style={{ color: '#555' }}>
                  {group.label}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {group.emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onChange(emoji); setOpen(false) }}
                      className="w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{
                        background: value === emoji
                          ? 'rgba(212,175,55,0.20)'
                          : 'rgba(255,255,255,0.04)',
                        border: value === emoji
                          ? '1.5px solid rgba(212,175,55,0.50)'
                          : '1.5px solid transparent',
                      }}
                      aria-label={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface BlockFormModalProps {
  open:     boolean
  onClose:  () => void
  onSubmit: (data: BlockFormData) => Promise<void>
  /**
   * When provided, the modal enters Edit Mode:
   *   - All fields are pre-populated from the block's current data.
   *   - The type selector (step 1) is skipped — type cannot change.
   *   - The submit button reads "Guardar cambios".
   */
  initialData?: Block
}

export function BlockFormModal({ open, onClose, onSubmit, initialData }: BlockFormModalProps) {
  const isEditMode = Boolean(initialData)

  // ── Derive initial values from initialData (edit mode) ──────────────────────
  const initBlockType = (initialData?.type === 'social' ? 'social' : 'link') as 'link' | 'social'
  const initPlatform  = initialData?.type === 'social'
    ? platformFromIcon(initialData.content.icon ?? '')
    : 'instagram' as SocialPlatform
  const initHandle    = initialData?.type === 'social'
    ? handleFromUrl(initPlatform, initialData.content.url ?? '')
    : ''
  const initUrl       = initialData?.type === 'link' ? (initialData.content.url ?? '') : ''
  const initIcon      = initialData?.content.icon ?? '🔗'
  const initTitle     = initialData?.content.title ?? ''
  const initDesc      = initialData?.content.description ?? ''
  const initFeatured  = initialData?.isFeatured ?? false

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState<'type' | 'details'>(isEditMode ? 'details' : 'type')
  const [blockType, setBlockType] = useState<'link' | 'social'>(initBlockType)
  const [platform, setPlatform]   = useState<SocialPlatform>(initPlatform)
  const [title, setTitle]         = useState(initTitle)
  const [handle, setHandle]       = useState(initHandle)
  const [url, setUrl]             = useState(initUrl)
  const [icon, setIcon]           = useState(initIcon)
  const [description, setDescription] = useState(initDesc)
  const [isFeatured, setIsFeatured]   = useState(initFeatured)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // Re-seed state whenever initialData changes (different block opened)
  useEffect(() => {
    if (initialData) {
      const pt = platformFromIcon(initialData.content.icon ?? '')
      setStep('details')
      setBlockType(initialData.type === 'social' ? 'social' : 'link')
      setPlatform(pt)
      setTitle(initialData.content.title ?? '')
      setHandle(initialData.type === 'social' ? handleFromUrl(pt, initialData.content.url ?? '') : '')
      setUrl(initialData.type === 'link' ? (initialData.content.url ?? '') : '')
      setIcon(initialData.content.icon ?? '🔗')
      setDescription(initialData.content.description ?? '')
      setIsFeatured(initialData.isFeatured ?? false)
      setError('')
    } else {
      // Reset to creation defaults when switching from edit → create
      setStep('type')
      setBlockType('link')
      setPlatform('instagram')
      setTitle('')
      setHandle('')
      setUrl('')
      setIcon('🔗')
      setDescription('')
      setIsFeatured(false)
      setError('')
    }
  }, [initialData])

  function reset() {
    if (!isEditMode) {
      setStep('type')
      setTitle('')
      setHandle('')
      setUrl('')
      setIcon('🔗')
      setDescription('')
      setIsFeatured(false)
    }
    setError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleTypeNext(type: 'link' | 'social') {
    setBlockType(type)
    if (type === 'social') setIcon(SOCIAL_PLATFORMS.find(p => p.id === platform)?.icon ?? '📱')
    setStep('details')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const resolvedUrl  = blockType === 'social' ? socialUrl(platform, handle) : url.trim()
    const resolvedIcon = blockType === 'social'
      ? SOCIAL_PLATFORMS.find(p => p.id === platform)?.icon ?? '📱'
      : icon || '🔗'
    const resolvedTitle = title.trim() ||
      (blockType === 'social' ? SOCIAL_PLATFORMS.find(p => p.id === platform)?.label ?? '' : '')

    if (!resolvedTitle) { setError('El título es obligatorio.'); return }
    if (!resolvedUrl)   { setError('La URL / handle es obligatoria.'); return }

    setSaving(true)
    try {
      await onSubmit({
        type:        blockType,
        title:       resolvedTitle,
        url:         resolvedUrl,
        icon:        resolvedIcon,
        description: description.trim(),
        isFeatured,
        platform:    blockType === 'social' ? platform : undefined,
      })
      handleClose()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Header title logic ───────────────────────────────────────────────────────
  function headerTitle() {
    if (isEditMode) return blockType === 'link' ? 'Editar enlace' : 'Editar red social'
    if (step === 'type') return 'Nuevo bloque'
    return blockType === 'link' ? 'Enlace' : 'Red Social'
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:flex md:items-center md:justify-center"
          >
            <div
              className="w-full md:max-w-md mx-auto rounded-t-3xl md:rounded-2xl p-6 space-y-5"
              style={{
                background:   '#141414',
                border:       '1px solid rgba(255,255,255,0.08)',
                boxShadow:    '0 -8px 40px rgba(0,0,0,0.6)',
                maxHeight:    '92dvh',
                overflowY:    'auto',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Back arrow only in creation mode at step details */}
                  {!isEditMode && step === 'details' && (
                    <button
                      onClick={() => setStep('type')}
                      className="p-1 rounded-lg transition-colors"
                      style={{ color: '#A3A3A3' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <h2 className="text-base font-semibold" style={{ color: '#F5F5F5' }}>
                    {headerTitle()}
                  </h2>
                </div>
                <button onClick={handleClose} style={{ color: '#555' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1 — choose type (creation mode only) */}
                {!isEditMode && step === 'type' && (
                  <motion.div
                    key="step-type"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <button
                      id="btn-block-type-link"
                      onClick={() => handleTypeNext('link')}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                      <span className="text-2xl">🔗</span>
                      <span className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>Enlace</span>
                      <span className="text-xs text-center" style={{ color: '#A3A3A3' }}>URL con título</span>
                    </button>
                    <button
                      id="btn-block-type-social"
                      onClick={() => handleTypeNext('social')}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all"
                      style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      <span className="text-2xl">📲</span>
                      <span className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>Red Social</span>
                      <span className="text-xs text-center" style={{ color: '#A3A3A3' }}>Instagram, LinkedIn…</span>
                    </button>
                  </motion.div>
                )}

                {/* Step 2 — details (creation) OR single step (edit) */}
                {(step === 'details' || isEditMode) && (
                  <motion.form
                    key="step-details"
                    initial={{ opacity: 0, x: isEditMode ? 0 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isEditMode ? 0 : 12 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Social platform selector (available in both modes for social blocks) */}
                    {blockType === 'social' && (
                      <div className="grid grid-cols-4 gap-2">
                        {SOCIAL_PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setPlatform(p.id)
                              if (!isEditMode) setTitle('')
                            }}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                            style={{
                              background: platform === p.id ? `${p.color}22` : 'rgba(255,255,255,0.04)',
                              border: platform === p.id ? `1.5px solid ${p.color}` : '1.5px solid transparent',
                            }}
                          >
                            <span className="text-xl">{p.icon}</span>
                            <span className="text-xs" style={{ color: platform === p.id ? p.color : '#A3A3A3' }}>
                              {p.label.split('/')[0].trim()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1">
                      <label className="label-dark">
                        {blockType === 'social' ? 'Etiqueta (opcional)' : 'Título *'}
                      </label>
                      <input
                        id="block-title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={
                          blockType === 'social'
                            ? SOCIAL_PLATFORMS.find(p => p.id === platform)?.label ?? ''
                            : 'Mi sitio web'
                        }
                        className="input-dark"
                        maxLength={60}
                      />
                    </div>

                    {/* URL / Handle */}
                    <div className="space-y-1">
                      <label className="label-dark">
                        {blockType === 'social' ? 'Usuario / Handle *' : 'URL *'}
                      </label>
                      <div className="relative">
                        {blockType === 'social' && (
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                            style={{ color: '#555' }}
                          >
                            @
                          </span>
                        )}
                        <input
                          id="block-url"
                          type={blockType === 'link' ? 'url' : 'text'}
                          value={blockType === 'social' ? handle : url}
                          onChange={e => blockType === 'social' ? setHandle(e.target.value) : setUrl(e.target.value)}
                          placeholder={blockType === 'social' ? 'tunombre' : 'https://ejemplo.com'}
                          className="input-dark"
                          style={{ paddingLeft: blockType === 'social' ? '2rem' : undefined }}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="label-dark">Descripción (opcional)</label>
                      <textarea
                        id="block-description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Subtítulo o descripción breve del enlace"
                        className="input-dark"
                        style={{ resize: 'none', minHeight: '3.5rem' }}
                        maxLength={120}
                        rows={2}
                      />
                    </div>

                    {/* Emoji picker — link only */}
                    {blockType === 'link' && (
                      <EmojiPicker value={icon} onChange={setIcon} />
                    )}

                    {/* Width selector — half vs full */}
                    <div className="space-y-2">
                      <label className="label-dark">Ancho en la grilla</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="btn-width-half"
                          type="button"
                          onClick={() => setIsFeatured(false)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                          style={{
                            background: !isFeatured ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                            border: !isFeatured ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
                          }}
                        >
                          <div className="w-full flex gap-1">
                            <div className="h-5 rounded flex-1" style={{ background: !isFeatured ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
                            <div className="h-5 rounded flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: !isFeatured ? '#F5F5F5' : '#666' }}>Mitad</span>
                        </button>

                        <button
                          id="btn-width-full"
                          type="button"
                          onClick={() => setIsFeatured(true)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                          style={{
                            background: isFeatured ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                            border: isFeatured ? '1.5px solid rgba(212,175,55,0.40)' : '1.5px solid transparent',
                          }}
                        >
                          <div className="w-full flex gap-1">
                            <div className="h-5 rounded w-full" style={{ background: isFeatured ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)' }} />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium" style={{ color: isFeatured ? '#D4AF37' : '#666' }}>Completo</span>
                            <span className="text-xs" style={{ color: isFeatured ? '#D4AF37' : '#555' }}>⭐</span>
                          </div>
                        </button>
                      </div>
                      {isFeatured && (
                        <p className="text-xs" style={{ color: '#666' }}>
                          El bloque ocupa todo el ancho y se muestra con un resplandor dorado especial.
                        </p>
                      )}
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
                    )}

                    {/* Submit */}
                    <motion.button
                      id="btn-save-block"
                      type="submit"
                      disabled={saving}
                      whileTap={{ scale: 0.97 }}
                      className="btn-accent w-full"
                    >
                      {saving ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Guardando…
                        </>
                      ) : isEditMode ? 'Guardar cambios' : 'Agregar bloque'}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Legacy alias ─────────────────────────────────────────────────────────────
// Keeps backwards compatibility with any import that still uses AddBlockModal.
/** @deprecated Use BlockFormModal instead */
export const AddBlockModal = BlockFormModal
/** @deprecated Use BlockFormData instead */
export type AddBlockFormData = BlockFormData
