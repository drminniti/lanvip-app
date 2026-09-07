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
  // vCard-only
  phone?:    string
  email?:    string
  company?:  string
  jobTitle?: string
}

export type SocialPlatform = 'instagram' | 'linkedin' | 'x' | 'whatsapp'

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; color: string; icon: string }[] = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: '📸' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', icon: '💼' },
  { id: 'x',         label: 'X / Twitter', color: '#555555', icon: '🐦' },
  { id: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', icon: '💬' },
]

/** The 4 block types the user can choose in step 1 */
const BLOCK_TYPES: {
  id:       'link' | 'social' | 'vcard' | 'calendly'
  emoji:    string
  label:    string
  subtitle: string
  bg:       string
  border:   string
}[] = [
  {
    id:       'link',
    emoji:    '🔗',
    label:    'Enlace',
    subtitle: 'URL con título',
    bg:       'rgba(212,175,55,0.08)',
    border:   'rgba(212,175,55,0.20)',
  },
  {
    id:       'social',
    emoji:    '📲',
    label:    'Red Social',
    subtitle: 'Instagram, LinkedIn…',
    bg:       'rgba(59,130,246,0.08)',
    border:   'rgba(59,130,246,0.20)',
  },
  {
    id:       'vcard',
    emoji:    '👤',
    label:    'Tarjeta VIP',
    subtitle: 'Contacto descargable',
    bg:       'rgba(34,197,94,0.08)',
    border:   'rgba(34,197,94,0.20)',
  },
  {
    id:       'calendly',
    emoji:    '📅',
    label:    'Calendly',
    subtitle: 'Agendar reuniones',
    bg:       'rgba(0,105,255,0.08)',
    border:   'rgba(0,105,255,0.20)',
  },
]

// ─── Emoji palette ────────────────────────────────────────────────────────────
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Links & Web',  emojis: ['🔗', '🌐', '🖥️', '📱', '💻', '🔌', '📡', '🛰️'] },
  { label: 'Negocio',      emojis: ['💼', '📊', '📈', '🤝', '🏢', '💰', '🎯', '🏆'] },
  { label: 'Creativo',     emojis: ['🎨', '✏️', '📸', '🎬', '🎵', '🎤', '🖌️', '✨'] },
  { label: 'Contacto',     emojis: ['💬', '📩', '📞', '📧', '👋', '🙌', '❤️', '⭐'] },
  { label: 'Varios',       emojis: ['🚀', '🌟', '💡', '🔑', '🎁', '📌', '🗂️', '📋'] },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function socialUrl(platform: SocialPlatform, handle: string): string {
  const cleaned = handle.replace(/^@/, '').trim()
  switch (platform) {
    case 'instagram': return `https://instagram.com/${cleaned}`
    case 'linkedin':
      // Preserve company pages (e.g. 'company/acme') vs personal profiles
      if (cleaned.startsWith('company/')) return `https://linkedin.com/${cleaned}`
      return `https://linkedin.com/in/${cleaned}`
    case 'x':         return `https://x.com/${cleaned}`
    case 'whatsapp':  return `https://wa.me/${cleaned.replace(/\D/g, '')}`
  }
}

function platformFromIcon(icon: string): SocialPlatform {
  const match = SOCIAL_PLATFORMS.find(p => p.icon === icon)
  return match?.id ?? 'instagram'
}

/**
 * Extracts the user-editable handle from a stored social URL.
 * LinkedIn: strips the leading 'in/' prefix so editing doesn't double it.
 *   Personal: linkedin.com/in/johndoe  → 'johndoe'
 *   Company:  linkedin.com/company/acme → 'company/acme' (preserved as-is)
 * WhatsApp: returns the phone number digits from wa.me/{number}
 */
function handleFromUrl(platform: SocialPlatform, url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\//, '')
    if (platform === 'linkedin') {
      if (path.startsWith('in/'))      return path.slice(3)   // 'in/johndoe' → 'johndoe'
      if (path.startsWith('company/')) return path            // keep 'company/acme'
      return path
    }
    return path
  } catch { return url }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
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
                <p className="text-xs font-medium mb-1.5" style={{ color: '#555' }}>{group.label}</p>
                <div className="grid grid-cols-8 gap-1">
                  {group.emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onChange(emoji); setOpen(false) }}
                      className="w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{
                        background: value === emoji ? 'rgba(212,175,55,0.20)' : 'rgba(255,255,255,0.04)',
                        border:     value === emoji ? '1.5px solid rgba(212,175,55,0.50)' : '1.5px solid transparent',
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

function WidthSelector({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      <label className="label-dark">Ancho en la grilla</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-width-half"
          type="button"
          onClick={() => onChange(false)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: !value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border:     !value ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full flex gap-1">
            <div className="h-5 rounded flex-1" style={{ background: !value ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
            <div className="h-5 rounded flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: !value ? '#F5F5F5' : '#666' }}>Mitad</span>
        </button>
        <button
          id="btn-width-full"
          type="button"
          onClick={() => onChange(true)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: value ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
            border:     value ? '1.5px solid rgba(212,175,55,0.40)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full">
            <div className="h-5 rounded w-full" style={{ background: value ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)' }} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium" style={{ color: value ? '#D4AF37' : '#666' }}>Completo</span>
            <span className="text-xs" style={{ color: value ? '#D4AF37' : '#555' }}>⭐</span>
          </div>
        </button>
      </div>
      {value && <p className="text-xs" style={{ color: '#666' }}>El bloque ocupa todo el ancho con resplandor dorado.</p>}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface BlockFormModalProps {
  open:         boolean
  onClose:      () => void
  onSubmit:     (data: BlockFormData) => Promise<void>
  initialData?: Block
}

export function BlockFormModal({ open, onClose, onSubmit, initialData }: BlockFormModalProps) {
  const isEditMode = Boolean(initialData)

  // Derive initial block type — clamp to the 4 supported UI types
  type UIBlockType = 'link' | 'social' | 'vcard' | 'calendly'
  function toUIType(t?: BlockType): UIBlockType {
    if (t === 'social' || t === 'vcard' || t === 'calendly') return t
    return 'link'
  }

  const initType     = toUIType(initialData?.type)
  const initPlatform = initType === 'social' ? platformFromIcon(initialData?.content.icon ?? '') : 'instagram' as SocialPlatform
  const initHandle   = initType === 'social' ? handleFromUrl(initPlatform, initialData?.content.url ?? '') : ''
  const initUrl      = (initType === 'link' || initType === 'calendly') ? (initialData?.content.url ?? '') : ''

  // ── State ────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState<'type' | 'details'>(isEditMode ? 'details' : 'type')
  const [blockType, setBlockType] = useState<UIBlockType>(initType)
  const [platform, setPlatform]   = useState<SocialPlatform>(initPlatform)
  const [title, setTitle]         = useState(initialData?.content.title ?? '')
  const [handle, setHandle]       = useState(initHandle)
  const [url, setUrl]             = useState(initUrl)
  const [icon, setIcon]           = useState(initialData?.content.icon ?? '🔗')
  const [description, setDescription] = useState(initialData?.content.description ?? '')
  const [isFeatured, setIsFeatured]   = useState(initialData?.isFeatured ?? false)
  // vCard fields
  const [phone, setPhone]       = useState(initialData?.content.phone    ?? '')
  const [email, setEmail]       = useState(initialData?.content.email    ?? '')
  const [company, setCompany]   = useState(initialData?.content.company  ?? '')
  const [jobTitle, setJobTitle] = useState(initialData?.content.jobTitle ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Re-seed when initialData changes
  useEffect(() => {
    if (initialData) {
      const pt  = platformFromIcon(initialData.content.icon ?? '')
      const uit = toUIType(initialData.type)
      setStep('details')
      setBlockType(uit)
      setPlatform(pt)
      setTitle(initialData.content.title ?? '')
      setHandle(uit === 'social' ? handleFromUrl(pt, initialData.content.url ?? '') : '')
      setUrl((uit === 'link' || uit === 'calendly') ? (initialData.content.url ?? '') : '')
      setIcon(initialData.content.icon ?? '🔗')
      setDescription(initialData.content.description ?? '')
      setIsFeatured(initialData.isFeatured ?? false)
      setPhone(initialData.content.phone    ?? '')
      setEmail(initialData.content.email    ?? '')
      setCompany(initialData.content.company  ?? '')
      setJobTitle(initialData.content.jobTitle ?? '')
      setError('')
    } else {
      setStep('type'); setBlockType('link'); setPlatform('instagram')
      setTitle(''); setHandle(''); setUrl(''); setIcon('🔗')
      setDescription(''); setIsFeatured(false)
      setPhone(''); setEmail(''); setCompany(''); setJobTitle('')
      setError('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  function reset() {
    if (!isEditMode) {
      setStep('type'); setTitle(''); setHandle(''); setUrl(''); setIcon('🔗')
      setDescription(''); setIsFeatured(false)
      setPhone(''); setEmail(''); setCompany(''); setJobTitle('')
    }
    setError('')
  }

  function handleClose() { reset(); onClose() }

  function handleTypeNext(type: UIBlockType) {
    setBlockType(type)
    if (type === 'social') setIcon(SOCIAL_PLATFORMS.find(p => p.id === platform)?.icon ?? '📱')
    if (type === 'vcard')   setIcon('👤')
    if (type === 'calendly') setIcon('📅')
    setStep('details')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let resolvedUrl   = ''
    let resolvedIcon  = icon || '🔗'
    let resolvedTitle = title.trim()

    if (blockType === 'social') {
      resolvedUrl   = socialUrl(platform, handle)
      resolvedIcon  = SOCIAL_PLATFORMS.find(p => p.id === platform)?.icon ?? '📱'
      resolvedTitle = resolvedTitle || (SOCIAL_PLATFORMS.find(p => p.id === platform)?.label ?? '')
    } else if (blockType === 'calendly') {
      resolvedUrl  = url.trim()
      resolvedIcon = '📅'
      if (!resolvedTitle) resolvedTitle = 'Agendar reunión'
    } else if (blockType === 'vcard') {
      resolvedUrl  = url.trim() // optional website
      resolvedIcon = icon || '👤'
    } else {
      resolvedUrl = url.trim()
    }

    if (!resolvedTitle) { setError('El título es obligatorio.'); return }
    if (blockType !== 'vcard' && !resolvedUrl) { setError('La URL es obligatoria.'); return }

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
        phone:       blockType === 'vcard' ? phone.trim()    : undefined,
        email:       blockType === 'vcard' ? email.trim()    : undefined,
        company:     blockType === 'vcard' ? company.trim()  : undefined,
        jobTitle:    blockType === 'vcard' ? jobTitle.trim() : undefined,
      })
      handleClose()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function headerTitle() {
    if (isEditMode) {
      if (blockType === 'vcard')   return 'Editar tarjeta VIP'
      if (blockType === 'calendly') return 'Editar Calendly'
      if (blockType === 'social')  return 'Editar red social'
      return 'Editar enlace'
    }
    if (step === 'type') return 'Nuevo bloque'
    if (blockType === 'vcard')   return 'Tarjeta VIP'
    if (blockType === 'calendly') return 'Calendly'
    if (blockType === 'social')  return 'Red Social'
    return 'Enlace'
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                background: '#141414',
                border:     '1px solid rgba(255,255,255,0.08)',
                boxShadow:  '0 -8px 40px rgba(0,0,0,0.6)',
                maxHeight:  '92dvh',
                overflowY:  'auto',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                {/* ── Step 1: type selector (creation only) ─────────────── */}
                {!isEditMode && step === 'type' && (
                  <motion.div
                    key="step-type"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {BLOCK_TYPES.map(bt => (
                      <button
                        key={bt.id}
                        id={`btn-block-type-${bt.id}`}
                        onClick={() => handleTypeNext(bt.id)}
                        className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all"
                        style={{ background: bt.bg, border: `1px solid ${bt.border}` }}
                      >
                        <span className="text-2xl">{bt.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>{bt.label}</span>
                        <span className="text-xs text-center" style={{ color: '#A3A3A3' }}>{bt.subtitle}</span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* ── Step 2: details ───────────────────────────────────── */}
                {(step === 'details' || isEditMode) && (
                  <motion.form
                    key="step-details"
                    initial={{ opacity: 0, x: isEditMode ? 0 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isEditMode ? 0 : 12 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >

                    {/* ── SOCIAL ─────────────────────────────────────────── */}
                    {blockType === 'social' && (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {SOCIAL_PLATFORMS.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setPlatform(p.id); if (!isEditMode) setTitle('') }}
                              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                              style={{
                                background: platform === p.id ? `${p.color}22` : 'rgba(255,255,255,0.04)',
                                border:     platform === p.id ? `1.5px solid ${p.color}` : '1.5px solid transparent',
                              }}
                            >
                              <span className="text-xl">{p.icon}</span>
                              <span className="text-xs" style={{ color: platform === p.id ? p.color : '#A3A3A3' }}>
                                {p.label.split('/')[0].trim()}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="label-dark">Etiqueta (opcional)</label>
                          <input
                            id="block-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={SOCIAL_PLATFORMS.find(p => p.id === platform)?.label ?? ''}
                            className="input-dark"
                            maxLength={60}
                          />
                        </div>

                        <div className="space-y-1">
                          {platform === 'whatsapp' ? (
                            /* WhatsApp uses a phone number, not a social handle */
                            <>
                              <label className="label-dark">Número de teléfono *</label>
                              <input
                                id="block-url"
                                type="tel"
                                value={handle}
                                onChange={e => setHandle(e.target.value)}
                                placeholder="+54 9 11 1234-5678"
                                className="input-dark"
                                required
                              />
                              <p className="text-xs" style={{ color: '#555' }}>
                                Formato internacional con código de país. Los espacios y guiones se ignoran automáticamente.
                              </p>
                            </>
                          ) : (
                            /* Instagram, LinkedIn, X — handle with @ prefix */
                            <>
                              <label className="label-dark">
                                {platform === 'linkedin'
                                  ? 'Perfil / Empresa *'
                                  : 'Usuario / Handle *'}
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: '#555' }}>@</span>
                                <input
                                  id="block-url"
                                  type="text"
                                  value={handle}
                                  onChange={e => setHandle(e.target.value)}
                                  placeholder={platform === 'linkedin' ? 'mi-perfil o company/mi-empresa' : 'tunombre'}
                                  className="input-dark"
                                  style={{ paddingLeft: '2rem' }}
                                  required
                                />
                              </div>
                              {platform === 'linkedin' && (
                                <p className="text-xs" style={{ color: '#555' }}>
                                  Perfil personal: <span style={{ color: '#888' }}>mi-nombre</span> — Empresa: <span style={{ color: '#888' }}>company/mi-empresa</span>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* ── LINK ───────────────────────────────────────────── */}
                    {blockType === 'link' && (
                      <>
                        <div className="space-y-1">
                          <label className="label-dark">Título *</label>
                          <input id="block-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Mi sitio web" className="input-dark" maxLength={60} />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">URL *</label>
                          <input id="block-url" type="url" value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://ejemplo.com" className="input-dark" required />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Descripción (opcional)</label>
                          <textarea id="block-description" value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Subtítulo breve" className="input-dark" style={{ resize: 'none', minHeight: '3.5rem' }}
                            maxLength={120} rows={2} />
                        </div>
                        <EmojiPicker value={icon} onChange={setIcon} />
                      </>
                    )}

                    {/* ── VCARD ──────────────────────────────────────────── */}
                    {blockType === 'vcard' && (
                      <>
                        {/* Info banner */}
                        <div
                          className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)' }}
                        >
                          <span className="text-lg mt-0.5">👤</span>
                          <p className="text-xs leading-relaxed" style={{ color: '#86efac' }}>
                            Al hacer clic en este bloque, el visitante descargará un archivo de contacto
                            (.vcf) listo para agregar a su teléfono.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="label-dark">Nombre completo *</label>
                          <input id="block-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Damian Minniti" className="input-dark" maxLength={60} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="label-dark">Cargo (opcional)</label>
                            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                              placeholder="CEO / Diseñador" className="input-dark" maxLength={50} />
                          </div>
                          <div className="space-y-1">
                            <label className="label-dark">Empresa (opcional)</label>
                            <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                              placeholder="Zripi Labs" className="input-dark" maxLength={50} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Teléfono (opcional)</label>
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="+54 11 1234-5678" className="input-dark" />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Email (opcional)</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="contacto@ejemplo.com" className="input-dark" />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Sitio web (opcional)</label>
                          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://ejemplo.com" className="input-dark" />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Nota breve (opcional)</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Ej: Disponible de lunes a viernes" className="input-dark"
                            style={{ resize: 'none', minHeight: '3rem' }} maxLength={120} rows={2} />
                        </div>
                        <EmojiPicker value={icon} onChange={setIcon} />
                      </>
                    )}

                    {/* ── CALENDLY ───────────────────────────────────────── */}
                    {blockType === 'calendly' && (
                      <>
                        {/* Info banner */}
                        <div
                          className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: 'rgba(0,105,255,0.08)', border: '1px solid rgba(0,105,255,0.25)' }}
                        >
                          <span className="text-lg mt-0.5">📅</span>
                          <p className="text-xs leading-relaxed" style={{ color: '#93c5fd' }}>
                            Al hacer clic, el visitante abrirá tu página de Calendly para elegir un horario.
                            Sin iframes pesados — carga instantánea.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="label-dark">Título del botón *</label>
                          <input id="block-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Agendá una reunión" className="input-dark" maxLength={60} />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">URL de Calendly *</label>
                          <input id="block-url" type="url" value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://calendly.com/usuario/reunión-30min" className="input-dark" required />
                          <p className="text-xs" style={{ color: '#555' }}>
                            Encontrala en tu dashboard de Calendly → Compartir.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Descripción (opcional)</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="30 min · Videollamada" className="input-dark"
                            style={{ resize: 'none', minHeight: '3rem' }} maxLength={120} rows={2} />
                        </div>
                      </>
                    )}

                    {/* ── Width selector (all types) ──────────────────────── */}
                    <WidthSelector value={isFeatured} onChange={setIsFeatured} />

                    {/* Error */}
                    {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}

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

// ─── Legacy aliases ───────────────────────────────────────────────────────────
/** @deprecated Use BlockFormModal */
export const AddBlockModal = BlockFormModal
/** @deprecated Use BlockFormData */
export type AddBlockFormData = BlockFormData
