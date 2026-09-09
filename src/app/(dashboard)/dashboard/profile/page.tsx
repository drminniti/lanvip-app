'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { updateUserProfile, checkUsernameAvailable } from '@/lib/auth'
import { ThemePicker } from '@/components/profile/ThemePicker'
import { LandingPreview } from '@/components/profile/LandingPreview'
import type { VipTheme } from '@/lib/themes'

const DEBOUNCE_MS = 600

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading } = useUserProfile(user?.uid)
  const { blocks }           = useUserBlocks(user?.uid)

  // Form state — mirrors profile, editable locally before save
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [bio, setBio]                 = useState('')
  const [avatarUrl, setAvatarUrl]     = useState('')

  // Sprint 4: Visuals
  const [bgType, setBgType]           = useState<'color' | 'image'>('color')
  const [bgUrl, setBgUrl]             = useState('')
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(50)

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'too-short' | 'unchanged'
  >('idle')
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Sync form from Firestore on first load.
  // Fallback chain for avatarUrl: Firestore doc → Google photoURL → ''
  // This ensures Google users see their photo pre-filled without pasting a URL.
  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName ?? '')
    setUsername(profile.username ?? '')
    setBio(profile.bio ?? '')
    setAvatarUrl(profile.avatarUrl || user?.photoURL || '')
    
    // Sprint 4 Visuals
    setBgType(profile.themeSettings?.background?.type ?? 'color')
    setBgUrl(profile.themeSettings?.background?.url ?? '')
    setBgOverlayOpacity(profile.themeSettings?.background?.overlayOpacity ?? 50)
  }, [profile?.uid, user?.photoURL]) // only on uid change to avoid overwriting in-progress edits

  // Username availability check (debounced)
  const checkUsername = useCallback(
    async (value: string) => {
      if (!user?.uid) return
      if (value === profile?.username) { setUsernameStatus('unchanged'); return }
      if (value.length < 3) { setUsernameStatus('too-short'); return }
      setUsernameStatus('checking')
      try {
        const ok = await checkUsernameAvailable(value, user.uid)
        setUsernameStatus(ok ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    },
    [user?.uid, profile?.username],
  )

  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); return }
    const t = setTimeout(() => checkUsername(username), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [username, checkUsername])

  function handleUsernameChange(val: string) {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  // Theme change: save immediately on select
  async function handleThemeChange(theme: VipTheme) {
    if (!user?.uid || !profile) return
    try {
      const mergedSettings: any = { ...theme.settings }
      if (profile.themeSettings?.background) {
        const bg = { ...profile.themeSettings.background }
        if (bg.url === undefined) delete bg.url
        if (bg.overlayOpacity === undefined) delete bg.overlayOpacity
        mergedSettings.background = bg
      }
      await updateUserProfile(user.uid, { 
        themeSettings: mergedSettings
      })
    } catch (err) {
      console.error('[Lanvip] theme update failed:', err)
    }
  }

  // Save identity fields
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return
    if (usernameStatus === 'taken') return

    const canSaveUsername =
      usernameStatus === 'available' ||
      usernameStatus === 'unchanged' ||
      username === profile?.username

    if (!canSaveUsername) return

    setSaving(true)
    setSaveMsg(null)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        username,
        bio:         bio.trim(),
        avatarUrl:   avatarUrl.trim(),
        themeSettings: {
          ...profile!.themeSettings,
          background: bgUrl.trim() ? {
            type: 'image' as const,
            url: bgUrl.trim(),
            overlayOpacity: bgOverlayOpacity
          } : {
            type: 'color' as const
          }
        }
      })
      setSaveMsg({ type: 'ok', text: '¡Perfil y apariencia actualizados!' })
    } catch (err) {
      console.error('[Lanvip] updateUserProfile failed:', err)
      setSaveMsg({ type: 'err', text: 'Error al guardar. Inténtalo de nuevo.' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  // Build a live preview profile merging form state over persisted data
  const previewProfile = profile
    ? { 
        ...profile, 
        displayName, 
        username, 
        bio, 
        avatarUrl,
        themeSettings: {
          ...profile.themeSettings,
          background: bgUrl.trim() ? {
            type: 'image' as const,
            url: bgUrl.trim(),
            overlayOpacity: bgOverlayOpacity
          } : {
            type: 'color' as const
          }
        }
      }
    : null

  const statusColors: Record<string, string> = {
    available:  '#4CAF72',
    taken:      '#EF4444',
    'too-short': '#A3A3A3',
    unchanged:  '#A3A3A3',
    checking:   '#A3A3A3',
    idle:       'transparent',
  }
  const statusMsgs: Record<string, string> = {
    available:  '✓ Disponible',
    taken:      '✗ Ya está en uso',
    'too-short': 'Mínimo 3 caracteres',
    unchanged:  'Username actual',
    checking:   'Verificando…',
    idle:       '',
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>Editar Perfil</h1>
        <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
          Los cambios en el tema se aplican en tiempo real.
        </p>
      </div>

      {/* Desktop: split layout | Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT COLUMN: Form ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >

          {/* Avatar URL */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
              Foto de perfil
            </h2>

            {/* Avatar preview + URL field */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `2px solid #D4AF37` }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xl font-bold"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
                  >
                    {(displayName || user?.displayName || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="prof-avatar" className="label-dark">
                  URL de imagen pública
                </label>
                <input
                  id="prof-avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/tu-foto.jpg"
                  className="input-dark"
                />
              </div>
            </div>
          </div>

          {/* Identity */}
          <form onSubmit={handleSave} className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>Identidad</h2>

            <div className="space-y-1">
              <label htmlFor="prof-name" className="label-dark">Nombre</label>
              <input
                id="prof-name"
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="input-dark"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prof-username" className="label-dark">Username</label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                  style={{ color: '#A3A3A3' }}
                >
                  lanvip.app/
                </span>
                <input
                  id="prof-username"
                  type="text"
                  required
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="tunombre"
                  className="input-dark"
                  style={{
                    paddingLeft: '6.5rem',
                    borderColor: usernameStatus === 'available' ? '#4CAF72'
                      : usernameStatus === 'taken' ? '#EF4444' : undefined,
                  }}
                />
              </div>
              <AnimatePresence mode="wait">
                {usernameStatus !== 'idle' && (
                  <motion.p
                    key={usernameStatus}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs"
                    style={{ color: statusColors[usernameStatus] }}
                  >
                    {usernameStatus === 'checking' && (
                      <span className="inline-block w-3 h-3 rounded-full border border-current border-t-transparent animate-spin mr-1 align-middle" />
                    )}
                    {statusMsgs[usernameStatus]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <label htmlFor="prof-bio" className="label-dark">Bio</label>
              <textarea
                id="prof-bio"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Cuéntale al mundo quién eres…"
                className="input-dark resize-none"
                maxLength={160}
              />
              <p className="text-xs text-right" style={{ color: '#555' }}>
                {bio.length}/160
              </p>
            </div>

            <div className="pt-4 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>Fondo de Pantalla</h3>
              <div className="space-y-1">
                <label htmlFor="prof-bg-url" className="label-dark">URL de imagen (opcional)</label>
                <input
                  id="prof-bg-url"
                  type="url"
                  value={bgUrl}
                  onChange={e => setBgUrl(e.target.value)}
                  placeholder="https://ejemplo.com/tu-fondo.jpg"
                  className="input-dark"
                />
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#A3A3A3' }}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recomendación: Imágenes verticales (ej. 1080x1920) y optimizadas (menos de 1MB).
                </p>
              </div>
              
              {bgUrl.trim() !== '' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="prof-bg-opacity" className="label-dark">Oscurecimiento (Overlay)</label>
                    <span className="text-xs font-mono" style={{ color: '#A3A3A3' }}>{bgOverlayOpacity}%</span>
                  </div>
                  <input
                    id="prof-bg-opacity"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={bgOverlayOpacity}
                    onChange={e => setBgOverlayOpacity(parseInt(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                  <p className="text-xs" style={{ color: '#A3A3A3' }}>
                    Mejora la legibilidad de tus enlaces oscureciendo la imagen.
                  </p>
                </div>
              )}
            </div>

            {/* Save feedback */}
            <AnimatePresence>
              {saveMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-center font-medium"
                  style={{ color: saveMsg.type === 'ok' ? '#4CAF72' : '#EF4444' }}
                >
                  {saveMsg.text}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              id="btn-save-profile"
              type="submit"
              disabled={saving || usernameStatus === 'taken' || usernameStatus === 'checking'}
              whileTap={{ scale: 0.97 }}
              className="btn-accent w-full"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </motion.button>
          </form>

          {/* Theme Picker — saves instantly */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#F5F5F5' }}>
              Tema VIP
            </h2>
            <ThemePicker
              currentSettings={previewProfile?.themeSettings ?? profile.themeSettings}
              onChange={handleThemeChange}
              disabled={saving}
            />
          </div>

        </motion.div>

        {/* ── RIGHT COLUMN: Live Preview ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:sticky lg:top-8"
        >
          {previewProfile && (
            <LandingPreview profile={previewProfile} blocks={blocks} />
          )}
        </motion.div>

      </div>
    </div>
  )
}
