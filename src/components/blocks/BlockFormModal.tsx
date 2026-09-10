'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockType, BlockWidth, Block } from '@/types'
import { FaInstagram, FaLinkedin, FaXTwitter, FaWhatsapp, FaYoutube, FaTiktok, FaFacebook, FaPhone, FaLink } from 'react-icons/fa6'


// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockFormData {
  type:        BlockType
  title:       string
  url:         string
  icon:        string
  description: string
  /** Column span in the public Bento grid. Default: 'half'. */
  width:       BlockWidth
  /** Gold glassmorphism glow. Decoupled from width as of Sprint 2. */
  isFeatured:  boolean
  // social-only
  platform?: SocialPlatform
  // vCard-only
  phone?:    string
  email?:    string
  company?:  string
  jobTitle?: string
  // youtube-only
  autoplay?: boolean
  embedId?:  string
  displayMode?: 'player' | 'button'
}

export type SocialPlatform = 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'youtube' | 'tiktok' | 'facebook'

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: <FaInstagram /> },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', icon: <FaYoutube /> },
  { id: 'tiktok',    label: 'TikTok',    color: '#000000', icon: <FaTiktok /> },
  { id: 'x',         label: 'X / Twitter', color: '#555555', icon: <FaXTwitter /> },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', icon: <FaLinkedin /> },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', icon: <FaFacebook /> },
  { id: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', icon: <FaWhatsapp /> },
]

/** The block types the user can choose in step 1 */
const BLOCK_TYPES: {
  id:       'link' | 'social' | 'vcard' | 'calendly' | 'divider' | 'section_title' | 'youtube' | 'email'
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
  {
    id:       'divider',
    emoji:    '―',
    label:    'Divisor',
    subtitle: 'Separador visual',
    bg:       'rgba(255,255,255,0.04)',
    border:   'rgba(255,255,255,0.10)',
  },
  {
    id:       'section_title',
    emoji:    '§',
    label:    'Sección',
    subtitle: 'Encabezado de grupo',
    bg:       'rgba(168,85,247,0.08)',
    border:   'rgba(168,85,247,0.20)',
  },
  {
    id:       'youtube',
    emoji:    '▶️',
    label:    'YouTube',
    subtitle: 'Video interactivo',
    bg:       'rgba(239,68,68,0.08)',
    border:   'rgba(239,68,68,0.20)',
  },
  {
    id:       'email',
    emoji:    '📧',
    label:    'Email',
    subtitle: 'Botón de contacto',
    bg:       'rgba(59,130,246,0.08)',
    border:   'rgba(59,130,246,0.20)',
  },
]

// ─── Emoji palette ────────────────────────────────────────────────────────────
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Links & Web',  emojis: ['🔗', '🌐', '🖥️', '📱', '💻', '🔌', '📡', '🛰️'] },
  { label: 'Negocio',      emojis: ['💼', '📊', '📈', '🤝', '🏢', '💰', '🎯', '🏆'] },
  { label: 'Creativo',     emojis: ['🎨', '✏️', '📸', '🎬', '🎵', '🎤', '🖌️', '✨'] },
  { label: 'Contacto',     emojis: ['💬', '📩', '📞', '📧', '👋', '🙌', '❤️'] },
  { label: 'Varios',       emojis: ['🚀', '🌟', '💡', '🔑', '🎁', '📌', '🗂️', '📋'] },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function socialUrl(platform: SocialPlatform, handle: string): string {
  let cleaned = handle.trim()

  if (platform === 'whatsapp') {
    cleaned = cleaned.replace(/\D/g, '')
    return `https://wa.me/${cleaned}`
  }

  // Remove generic URL prefixes
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?/, '')
  cleaned = cleaned.replace(/^@/, '')
  cleaned = cleaned.replace(/\/$/, '')

  if (platform === 'linkedin') {
    if (cleaned.includes('linkedin.com/in/')) {
      cleaned = cleaned.split('linkedin.com/in/')[1]
    } else if (cleaned.includes('linkedin.com/company/')) {
      cleaned = 'company/' + cleaned.split('linkedin.com/company/')[1]
    }
    // Clean remaining 'in/' prefix if present
    cleaned = cleaned.replace(/^in\//, '')
  } else {
    // For instagram, tiktok, x, youtube, facebook
    if (cleaned.includes('.com/')) {
      cleaned = cleaned.split('.com/')[1]
    } else if (cleaned.includes('.me/')) {
      cleaned = cleaned.split('.me/')[1]
    }
    // Handle youtube/@usuario or tiktok/@usuario
    cleaned = cleaned.replace(/^@/, '')
  }

  switch (platform) {
    case 'instagram': return `https://instagram.com/${cleaned}`
    case 'youtube':   return `https://youtube.com/@${cleaned}`
    case 'tiktok':    return `https://tiktok.com/@${cleaned}`
    case 'facebook':  return `https://facebook.com/${cleaned}`
    case 'linkedin':
      if (cleaned.startsWith('company/')) return `https://linkedin.com/${cleaned}`
      return `https://linkedin.com/in/${cleaned}`
    case 'x':         return `https://x.com/${cleaned}`
    default:          return `https://${platform}.com/${cleaned}`
  }
}

function parseYouTubeId(urlStr: string): string | null {
  const match = urlStr.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
  return match ? match[1] : null
}

function platformFromIcon(icon: string): SocialPlatform {
  return (icon as SocialPlatform) ?? 'instagram'
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

// WidthSelector — now driven by BlockWidth ('half' | 'full'), NOT isFeatured
function WidthSelector({ value, onChange }: { value: BlockWidth; onChange: (v: BlockWidth) => void }) {
  const isHalf = value === 'half'
  const isFull = value === 'full'
  return (
    <div className="space-y-2">
      <label className="label-dark">Ancho en la grilla</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-width-half"
          type="button"
          onClick={() => onChange('half')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: isHalf ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border:     isHalf ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full flex gap-1">
            <div className="h-5 rounded flex-1" style={{ background: isHalf ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
            <div className="h-5 rounded flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: isHalf ? '#F5F5F5' : '#666' }}>Mitad</span>
        </button>
        <button
          id="btn-width-full"
          type="button"
          onClick={() => onChange('full')}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: isFull ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border:     isFull ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full">
            <div className="h-5 rounded w-full" style={{ background: isFull ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: isFull ? '#F5F5F5' : '#666' }}>Completo</span>
        </button>
      </div>
    </div>
  )
}

function YouTubeDisplaySelector({
  displayMode,
  setDisplayMode,
  blockWidth,
  setBlockWidth,
}: {
  displayMode: 'player' | 'button'
  setDisplayMode: (v: 'player' | 'button') => void
  blockWidth: BlockWidth
  setBlockWidth: (v: BlockWidth) => void
}) {
  const isPlayer = displayMode === 'player'
  const isButtonFull = displayMode === 'button' && blockWidth === 'full'
  const isButtonHalf = displayMode === 'button' && blockWidth === 'half'

  return (
    <div className="space-y-2">
      <label className="label-dark">Modo de visualización</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => { setDisplayMode('player'); setBlockWidth('full') }}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: isPlayer ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
            border:     isPlayer ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full">
            <div className="h-5 rounded w-full" style={{ background: isPlayer ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: isPlayer ? '#ef4444' : '#666' }}>Reproductor</span>
        </button>
        <button
          type="button"
          onClick={() => { setDisplayMode('button'); setBlockWidth('full') }}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: isButtonFull ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border:     isButtonFull ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full">
            <div className="h-5 rounded w-full" style={{ background: isButtonFull ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: isButtonFull ? '#F5F5F5' : '#666' }}>Botón Completo</span>
        </button>
        <button
          type="button"
          onClick={() => { setDisplayMode('button'); setBlockWidth('half') }}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
          style={{
            background: isButtonHalf ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            border:     isButtonHalf ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid transparent',
          }}
        >
          <div className="w-full flex gap-1">
            <div className="h-5 rounded flex-1" style={{ background: isButtonHalf ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }} />
            <div className="h-5 rounded flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <span className="text-xs font-medium" style={{ color: isButtonHalf ? '#F5F5F5' : '#666' }}>Botón Mitad</span>
        </button>
      </div>
    </div>
  )
}

// FeaturedToggle — independent from width; controls gold glassmorphism glow
function FeaturedToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id="btn-featured-toggle"
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all"
      style={{
        background: value ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.04)',
        border:     value ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none" style={{ color: value ? '#D4AF37' : '#888' }}>✨</span>
        <div className="text-left">
          <p className="text-sm font-medium" style={{ color: value ? '#D4AF37' : '#888' }}>Destacado</p>
          <p className="text-xs" style={{ color: '#555' }}>Destaca este bloque visualmente en tu grilla</p>
        </div>
      </div>
      <div
        className="w-10 h-5 rounded-full relative transition-all"
        style={{ background: value ? 'rgba(212,175,55,0.60)' : 'rgba(255,255,255,0.10)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{ background: '#fff', left: value ? '1.25rem' : '0.125rem' }}
        />
      </div>
    </button>
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

  // Derive initial block type — clamp to the supported UI types
  type UIBlockType = 'link' | 'social' | 'vcard' | 'calendly' | 'divider' | 'section_title' | 'youtube' | 'email'
  function toUIType(t?: BlockType): UIBlockType {
    if (t === 'social' || t === 'vcard' || t === 'calendly' || t === 'divider' || t === 'section_title' || t === 'youtube' || t === 'email') return t
    return 'link'
  }

  const initType     = toUIType(initialData?.type)
  const initPlatform = initType === 'social' ? platformFromIcon(initialData?.content.icon ?? '') : 'instagram' as SocialPlatform
  const initHandle   = initType === 'social' ? handleFromUrl(initPlatform, initialData?.content.url ?? '') : ''
  const initUrl      = (initType === 'link' || initType === 'calendly' || initType === 'youtube') ? (initialData?.content.url ?? '') : ''
  const initEmail    = initType === 'email' ? (initialData?.content.email ?? '') : (initType === 'vcard' ? (initialData?.content.email ?? '') : '')

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
  // Sprint 2: blockWidth is independent from isFeatured
  const [blockWidth, setBlockWidth]   = useState<BlockWidth>(
    initialData ? (initialData.width ?? (initialData.isFeatured ? 'full' : 'half')) : 'full'
  )
  const [linkedinType, setLinkedinType] = useState<'personal' | 'company'>(
    initPlatform === 'linkedin' && initHandle.startsWith('company/') ? 'company' : 'personal'
  )
  // vCard fields
  const [phone, setPhone]       = useState(initialData?.content.phone    ?? '')
  const [email, setEmail]       = useState(initEmail)
  const [company, setCompany]   = useState(initialData?.content.company  ?? '')
  const [jobTitle, setJobTitle] = useState(initialData?.content.jobTitle ?? '')
  const [autoplay, setAutoplay] = useState(initialData?.content.autoplay ?? false)
  const [displayMode, setDisplayMode] = useState<'player' | 'button'>(initialData?.content.displayMode ?? 'player')
  const [showLabelWarning, setShowLabelWarning] = useState(false)

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
      const resolvedHandle = uit === 'social' ? handleFromUrl(pt, initialData.content.url ?? '') : ''
      setHandle(resolvedHandle)
      setLinkedinType(pt === 'linkedin' && resolvedHandle.startsWith('company/') ? 'company' : 'personal')
      setUrl((uit === 'link' || uit === 'calendly' || uit === 'youtube') ? (initialData.content.url ?? '') : '')
      setIcon(initialData.content.icon ?? '🔗')
      setDescription(initialData.content.description ?? '')
      setIsFeatured(initialData.isFeatured ?? false)
      setBlockWidth(initialData.width ?? (initialData.isFeatured ? 'full' : 'half'))
      setPhone(initialData.content.phone    ?? '')
      setEmail(uit === 'email' || uit === 'vcard' ? (initialData.content.email ?? '') : '')
      setCompany(initialData.content.company  ?? '')
      setJobTitle(initialData.content.jobTitle ?? '')
      setAutoplay(initialData.content.autoplay ?? false)
      setDisplayMode(initialData.content.displayMode ?? 'player')
      setError('')
    } else {
      setStep('type'); setBlockType('link'); setPlatform('instagram')
      setTitle(''); setHandle(''); setUrl(''); setIcon('🔗')
      setDescription(''); setIsFeatured(false); setBlockWidth('full')
      setPhone(''); setEmail(''); setCompany(''); setJobTitle('')
      setAutoplay(false)
      setDisplayMode('player')
      setError('')
      setShowLabelWarning(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Lock background scroll while modal is open.
  // Cleanup runs on close AND on unmount (e.g. navigating away with modal open).
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function reset() {
    if (!isEditMode) {
      setStep('type'); setTitle(''); setHandle(''); setUrl(''); setIcon('🔗')
      setDescription(''); setIsFeatured(false); setBlockWidth('full')
      setPhone(''); setEmail(''); setCompany(''); setJobTitle('')
      setAutoplay(false)
      setDisplayMode('player')
      setLinkedinType('personal')
    }
    setError('')
    setShowLabelWarning(false)
  }

  function handleUrlBlur() {
    if (url && !url.match(/^https?:\/\//) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      setUrl(`https://${url}`)
    }
  }

  function handleClose() { reset(); onClose() }

  function handleTypeNext(type: UIBlockType) {
    setBlockType(type)
    if (type === 'social')        setIcon(platform)
    if (type === 'vcard')         setIcon('👤')
    if (type === 'calendly')      setIcon('📅')
    if (type === 'email')         setIcon('📧')
    if (type === 'divider')       { setIcon(''); setBlockWidth('full') }
    if (type === 'section_title') { setIcon(''); setBlockWidth('full') }
    setStep('details')
  }

  function handleSocialChange(newPlatformId: SocialPlatform) {
    const oldPlatform = SOCIAL_PLATFORMS.find(p => p.id === platform)
    const newPlatform = SOCIAL_PLATFORMS.find(p => p.id === newPlatformId)

    if (!isEditMode) {
      setTitle('')
      setShowLabelWarning(false)
    } else {
      // Si el titulo actual era exactamente el label anterior, lo pisamos con el nuevo
      if (title.trim() === oldPlatform?.label || title.trim() === '') {
        setTitle(newPlatform?.label ?? '')
        setShowLabelWarning(false)
      } else {
        // Es un texto custom, avisamos
        setShowLabelWarning(true)
      }
    }
    setPlatform(newPlatformId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let resolvedUrl   = ''
    let resolvedIcon  = icon || '🔗'
    let resolvedTitle = title.trim()

    if (blockType === 'divider') {
      resolvedUrl   = ''
      resolvedIcon  = ''
      resolvedTitle = title.trim() // optional label text for the divider
    } else if (blockType === 'section_title') {
      resolvedUrl   = ''
      resolvedIcon  = ''
    } else if (blockType === 'social') {
      let finalHandle = handle.toLowerCase().trim()
      if (platform === 'linkedin' && linkedinType === 'company' && !finalHandle.startsWith('company/')) {
        finalHandle = `company/${finalHandle}`
      }
      resolvedUrl   = socialUrl(platform, finalHandle)
      resolvedIcon  = platform
      resolvedTitle = resolvedTitle || (SOCIAL_PLATFORMS.find(p => p.id === platform)?.label ?? '')
    } else if (blockType === 'calendly') {
      resolvedUrl  = url.trim()
      resolvedIcon = '📅'
      if (!resolvedTitle) resolvedTitle = 'Agendar reunión'
    } else if (blockType === 'vcard') {
      resolvedUrl  = url.trim() // optional website
      resolvedIcon = icon || '👤'
    } else if (blockType === 'youtube') {
      const parsedId = parseYouTubeId(url.trim())
      if (!parsedId) {
        setError('URL de YouTube inválida. Revisa el enlace.')
        return
      }
      resolvedUrl = `https://youtu.be/${parsedId}`
      resolvedIcon = '▶️'
      if (!resolvedTitle) resolvedTitle = 'Video de YouTube'
    } else if (blockType === 'email') {
      resolvedUrl = ''
      resolvedIcon = icon || '📧'
      if (!resolvedTitle) resolvedTitle = 'Enviar correo'
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email.trim() || !emailPattern.test(email.trim())) {
        setError('Por favor ingresa un correo válido.')
        return
      }
    } else {
      resolvedUrl = url.trim()
    }

    // Structural blocks don't need a URL or a mandatory title
    const isStructural = blockType === 'divider' || blockType === 'section_title'
    if (!resolvedTitle && !isStructural) { setError('El título es obligatorio.'); return }
    if (!resolvedUrl && !isStructural && blockType !== 'vcard' && blockType !== 'email') { setError('La URL es obligatoria.'); return }

    // Auto-format URLs: prepend https:// if missing
    let formattedUrl = resolvedUrl.trim()
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('mailto:') && !formattedUrl.startsWith('tel:')) {
      formattedUrl = `https://${formattedUrl}`
    }

    setSaving(true)
    try {
      await onSubmit({
        type:        blockType,
        title:       resolvedTitle,
        url:         formattedUrl,
        icon:        resolvedIcon,
        description: description.trim(),
        width:       blockWidth,
        isFeatured,
        platform:    blockType === 'social' ? platform : undefined,
        phone:       blockType === 'vcard' ? phone.trim()    : undefined,
        email:       (blockType === 'vcard' || blockType === 'email') ? email.trim() : undefined,
        company:     blockType === 'vcard' ? company.trim()  : undefined,
        jobTitle:    blockType === 'vcard' ? jobTitle.trim() : undefined,
        embedId:     blockType === 'youtube' ? parseYouTubeId(formattedUrl) || undefined : undefined,
        autoplay:    blockType === 'youtube' ? autoplay : undefined,
        displayMode: blockType === 'youtube' ? displayMode : undefined,
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
      if (blockType === 'vcard')         return 'Editar tarjeta VIP'
      if (blockType === 'calendly')      return 'Editar Calendly'
      if (blockType === 'social')        return 'Editar red social'
      if (blockType === 'email')         return 'Editar correo'
      if (blockType === 'divider')       return 'Editar divisor'
      if (blockType === 'section_title') return 'Editar sección'
      return 'Editar enlace'
    }
    if (step === 'type') return 'Nuevo bloque'
    if (blockType === 'vcard')         return 'Tarjeta VIP'
    if (blockType === 'calendly')      return 'Calendly'
    if (blockType === 'social')        return 'Red Social'
    if (blockType === 'email')         return 'Correo'
    if (blockType === 'divider')       return 'Divisor'
    if (blockType === 'section_title') return 'Sección'
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
                              onClick={() => handleSocialChange(p.id)}
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
                        {showLabelWarning && isEditMode && (
                          <p className="text-xs" style={{ color: '#D4AF37' }}>
                            ⚠️ Verifica que tu etiqueta coincida con la nueva red social.
                          </p>
                        )}

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
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: '#555' }}><FaPhone /></span>
                                <input
                                  id="block-url"
                                  type="tel"
                                  value={handle}
                                  onChange={e => setHandle(e.target.value)}
                                  placeholder="Ej: 549112345678 (Solo números, con código de país)"
                                  className="input-dark"
                                  style={{ paddingLeft: '2.5rem' }}
                                  required
                                />
                              </div>
                              <p className="text-xs" style={{ color: '#555' }}>
                                Formato internacional con código de país. Los espacios y guiones se ignoran automáticamente.
                              </p>
                            </>
                          ) : (
                            /* Instagram, LinkedIn, X — handle with @ prefix or URL */
                            <>
                              <div className="flex items-center justify-between">
                                <label className="label-dark">
                                  {platform === 'linkedin'
                                    ? 'Usuario o URL *'
                                    : 'Usuario / Handle *'}
                                </label>
                                {platform === 'linkedin' && (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLinkedinType('personal')
                                        if (handle.startsWith('company/')) setHandle(handle.replace('company/', ''))
                                      }}
                                      className="text-xs px-2 py-1 rounded-md transition-colors"
                                      style={{ background: linkedinType === 'personal' ? 'rgba(255,255,255,0.1)' : 'transparent', color: linkedinType === 'personal' ? '#FFF' : '#A3A3A3' }}
                                    >Personal</button>
                                    <button
                                      type="button"
                                      onClick={() => setLinkedinType('company')}
                                      className="text-xs px-2 py-1 rounded-md transition-colors"
                                      style={{ background: linkedinType === 'company' ? 'rgba(255,255,255,0.1)' : 'transparent', color: linkedinType === 'company' ? '#FFF' : '#A3A3A3' }}
                                    >Empresa</button>
                                  </div>
                                )}
                              </div>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: '#555' }}>
                                  {platform === 'linkedin' ? <FaLink /> : '@'}
                                </span>
                                <input
                                  id="block-url"
                                  type="text"
                                  value={handle}
                                  onChange={e => setHandle(e.target.value.toLowerCase().trim())}
                                  placeholder={platform === 'linkedin' ? 'Ej: tu-perfil o pegá tu URL completa' : 'Ej: tu_usuario o pegá tu URL completa'}
                                  className="input-dark"
                                  style={{ paddingLeft: platform === 'linkedin' ? '2.5rem' : '2rem' }}
                                  required
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Descripción (opcional)</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Ej: Seguime para más contenido" className="input-dark"
                            style={{ resize: 'none', minHeight: '3rem' }} maxLength={120} rows={2} />
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
                          <input id="block-url" type="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur}
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
                              placeholder="Mi empresa" className="input-dark" maxLength={50} />
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
                          <input type="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur}
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
                          <input id="block-url" type="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur}
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
                    {/* ── EMAIL ──────────────────────────────────────────── */}
                    {blockType === 'email' && (
                      <>
                        <div
                          className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
                        >
                          <span className="text-lg mt-0.5">📧</span>
                          <p className="text-xs leading-relaxed" style={{ color: '#93c5fd' }}>
                            Agrega un botón para que tus visitantes te envíen un correo o copien tu dirección.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="label-dark">Título del botón *</label>
                          <input id="block-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Escribime un correo" className="input-dark" maxLength={60} />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Correo electrónico *</label>
                          <input id="block-email" type="email" value={email} onChange={e => setEmail(e.target.value.trim())}
                            placeholder="usuario@dominio.com" className="input-dark" required />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Descripción (opcional)</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Subtítulo breve" className="input-dark"
                            style={{ resize: 'none', minHeight: '3.5rem' }} maxLength={120} rows={2} />
                        </div>
                        <EmojiPicker value={icon} onChange={setIcon} />
                      </>
                    )}

                    {/* ── YOUTUBE ────────────────────────────────────────── */}
                    {blockType === 'youtube' && (
                      <>
                        <div className="space-y-1">
                          <label className="label-dark">Enlace del video de YouTube *</label>
                          <input id="block-url" type="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur}
                            placeholder="https://youtube.com/watch?v=..." className="input-dark" required />
                        </div>
                        {displayMode === 'button' && (
                          <>
                            <div className="space-y-1">
                              <label className="label-dark">Título (opcional)</label>
                              <input id="block-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="Dejar vacío para 'Video de YouTube'" className="input-dark" maxLength={60} />
                            </div>
                            <div className="space-y-1">
                              <label className="label-dark">Descripción (opcional)</label>
                              <textarea value={description} onChange={e => setDescription(e.target.value)}
                                placeholder="Breve descripción del video" className="input-dark"
                                style={{ resize: 'none', minHeight: '3rem' }} maxLength={120} rows={2} />
                            </div>
                          </>
                        )}
                        <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <button
                            type="button"
                            onClick={() => setAutoplay(!autoplay)}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all"
                            style={{
                              background: autoplay ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)',
                              border:     autoplay ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium" style={{ color: autoplay ? '#ef4444' : '#888' }}>Autoplay (Inicia en silencio)</p>
                              <p className="text-xs" style={{ color: '#555' }}>El video arrancará automáticamente sin sonido para no ser invasivo.</p>
                            </div>
                            <div
                              className="w-10 h-5 rounded-full relative transition-all"
                              style={{ background: autoplay ? 'rgba(239,68,68,0.60)' : 'rgba(255,255,255,0.10)' }}
                            >
                              <div
                                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                                style={{ background: '#fff', left: autoplay ? '1.25rem' : '0.125rem' }}
                              />
                            </div>
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── DIVIDER ────────────────────────────────────────── */}
                    {blockType === 'divider' && (
                      <div className="space-y-4">
                        <div
                          className="flex items-center gap-3 py-2 px-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <span className="text-xl">―</span>
                          <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                            Añade una línea separadora sutil entre tus bloques.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Etiqueta (opcional)</label>
                          <input
                            id="block-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="ej: Servicios, Contacto…"
                            className="input-dark"
                            maxLength={40}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── SECTION TITLE ──────────────────────────────────── */}
                    {blockType === 'section_title' && (
                      <div className="space-y-4">
                        <div
                          className="flex items-center gap-3 py-2 px-3 rounded-xl"
                          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.20)' }}
                        >
                          <span className="text-xl">§</span>
                          <p className="text-xs leading-relaxed" style={{ color: '#c4b5fd' }}>
                            Crea un encabezado para agrupar los bloques que le siguen.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Título de la sección *</label>
                          <input
                            id="block-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="ej: Mis servicios"
                            className="input-dark"
                            maxLength={60}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="label-dark">Descripción (opcional)</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Subtítulo de la sección" className="input-dark"
                            style={{ resize: 'none', minHeight: '3rem' }} maxLength={120} rows={2} />
                        </div>
                      </div>
                    )}

                    {/* ── Width + Featured (link/social/vcard/calendly/youtube only) ─ */}
                    {blockType !== 'divider' && blockType !== 'section_title' && (
                      <>
                        {blockType === 'youtube' ? (
                          <YouTubeDisplaySelector 
                            displayMode={displayMode}
                            setDisplayMode={setDisplayMode}
                            blockWidth={blockWidth}
                            setBlockWidth={setBlockWidth}
                          />
                        ) : (
                          <WidthSelector value={blockWidth} onChange={setBlockWidth} />
                        )}
                        <FeaturedToggle value={isFeatured} onChange={setIsFeatured} />
                      </>
                    )}

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
