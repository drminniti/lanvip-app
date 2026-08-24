'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockType, SpanSize } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddBlockFormData {
  type: BlockType
  title: string
  url: string
  icon: string
  spanSize: SpanSize
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

const SPAN_OPTIONS: { value: SpanSize; label: string; desc: string }[] = [
  { value: '1x1', label: '1×1', desc: 'Cuadrado' },
  { value: '2x1', label: '2×1', desc: 'Ancho' },
  { value: '2x2', label: '2×2', desc: 'Grande' },
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

// ─── Component ───────────────────────────────────────────────────────────────

interface AddBlockModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddBlockFormData) => Promise<void>
}

export function AddBlockModal({ open, onClose, onSubmit }: AddBlockModalProps) {
  const [step, setStep]           = useState<'type' | 'details'>('type')
  const [blockType, setBlockType] = useState<'link' | 'social'>('link')
  const [platform, setPlatform]   = useState<SocialPlatform>('instagram')
  const [title, setTitle]         = useState('')
  const [handle, setHandle]       = useState('')  // social
  const [url, setUrl]             = useState('')   // link
  const [icon, setIcon]           = useState('🔗')
  const [spanSize, setSpanSize]   = useState<SpanSize>('1x1')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  function reset() {
    setStep('type')
    setBlockType('link')
    setPlatform('instagram')
    setTitle('')
    setHandle('')
    setUrl('')
    setIcon('🔗')
    setSpanSize('1x1')
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
        type:     blockType,
        title:    resolvedTitle,
        url:      resolvedUrl,
        icon:     resolvedIcon,
        spanSize,
        platform: blockType === 'social' ? platform : undefined,
      })
      handleClose()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
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
              className="w-full md:w-full md:max-w-md mx-auto rounded-t-3xl md:rounded-2xl p-6 space-y-5"
              style={{
                background: '#141414',
                border: '1px solid #2A2A2A',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step === 'details' && (
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
                    {step === 'type' ? 'Nuevo bloque' : blockType === 'link' ? 'Enlace' : 'Red Social'}
                  </h2>
                </div>
                <button onClick={handleClose} style={{ color: '#555' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step 1 — choose type */}
              <AnimatePresence mode="wait">
                {step === 'type' && (
                  <motion.div
                    key="step-type"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {/* Link */}
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
                    {/* Social */}
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

                {/* Step 2 — details */}
                {step === 'details' && (
                  <motion.form
                    key="step-details"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Social platform selector */}
                    {blockType === 'social' && (
                      <div className="grid grid-cols-4 gap-2">
                        {SOCIAL_PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setPlatform(p.id); setTitle(''); }}
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
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                            style={{ color: '#555' }}>@</span>
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

                    {/* Emoji (link only) */}
                    {blockType === 'link' && (
                      <div className="space-y-1">
                        <label className="label-dark">Emoji / Ícono</label>
                        <input
                          id="block-icon"
                          type="text"
                          value={icon}
                          onChange={e => setIcon(e.target.value)}
                          placeholder="🔗"
                          className="input-dark"
                          maxLength={4}
                        />
                      </div>
                    )}

                    {/* Span size */}
                    <div className="space-y-2">
                      <label className="label-dark">Tamaño</label>
                      <div className="grid grid-cols-3 gap-2">
                        {SPAN_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSpanSize(opt.value)}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                            style={{
                              background: spanSize === opt.value ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                              border: spanSize === opt.value ? '1.5px solid #D4AF37' : '1.5px solid transparent',
                            }}
                          >
                            <span className="text-sm font-bold" style={{ color: spanSize === opt.value ? '#D4AF37' : '#F5F5F5' }}>
                              {opt.label}
                            </span>
                            <span className="text-xs" style={{ color: '#A3A3A3' }}>{opt.desc}</span>
                          </button>
                        ))}
                      </div>
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
                      ) : 'Agregar bloque'}
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
