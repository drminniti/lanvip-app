'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { updateUserProfile, checkUsernameAvailable } from '@/lib/auth'
import { ThemePicker } from '@/components/profile/ThemePicker'
import { LandingPreview } from '@/components/profile/LandingPreview'
import { AvatarUploader } from '@/components/profile/AvatarUploader'
import type { VipTheme } from '@/lib/themes'
import type { ThemeSettings } from '@/types'

const DEBOUNCE_MS = 600

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.uid)
  const { blocks }           = useUserBlocks(user?.uid)

  // Form state — mirrors profile, editable locally before save
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [bio, setBio]                 = useState('')
  const [avatarUrl, setAvatarUrl]     = useState('')

  // Sprint 4: Visuals
  // background state removed to rely on live profile state as it's saved immediately

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'too-short' | 'unchanged'
  >('idle')
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Lock scroll when mobile preview is open
  useEffect(() => {
    if (showMobilePreview) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobilePreview])

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
    // (background is now handled purely via ThemePicker and BackgroundUploader saving directly)
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
  async function handleThemeChange(theme: VipTheme | { id: 'custom', settings: ThemeSettings }) {
    if (!user?.uid || !profile) return
    try {
      const mergedSettings: any = { ...theme.settings, themeId: theme.id }
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

  async function handleCustomColorChange(updates: Partial<{
    background: string
    accent: string
    textColor: string
    useGradient: boolean
    gradientColor: string
    useTexture: boolean
    autoContrast: boolean
  }>) {
    if (!user?.uid || !profile) return
    try {
      const currentThemeSettings = profile.themeSettings
      const newCustomColors = {
        background: currentThemeSettings.customColors?.background ?? '#0a0a0a',
        accent: currentThemeSettings.customColors?.accent ?? '#D4AF37',
        textColor: currentThemeSettings.customColors?.textColor ?? '#ffffff',
        useGradient: currentThemeSettings.customColors?.useGradient ?? false,
        gradientColor: currentThemeSettings.customColors?.gradientColor ?? '#1a1a1a',
        useTexture: currentThemeSettings.customColors?.useTexture ?? false,
        autoContrast: currentThemeSettings.customColors?.autoContrast ?? true,
        ...updates
      }
      
      const mergedSettings: any = { 
        ...currentThemeSettings,
        themeId: 'custom',
        customColors: newCustomColors
      }
      
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
      console.error('[Lanvip] custom color update failed:', err)
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
        themeSettings: profile!.themeSettings
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
        themeSettings: profile.themeSettings
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

  if (authLoading || profileLoading || !profile) {
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

          {/* Avatar */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
              Foto de perfil
            </h2>
            <AvatarUploader
              currentUrl={avatarUrl}
              displayName={displayName || user?.displayName || ''}
              onUploadSuccess={(url) => {
                setAvatarUrl(url)
                setSaveMsg({ type: 'ok', text: '¡Avatar actualizado exitosamente!' })
                setTimeout(() => setSaveMsg(null), 3000)
              }}
              onRemoveSuccess={() => {
                setAvatarUrl('')
                setSaveMsg({ type: 'ok', text: '¡Avatar eliminado!' })
                setTimeout(() => setSaveMsg(null), 3000)
              }}
            />
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
              onCustomColorChange={handleCustomColorChange}
              disabled={saving}
            />
          </div>

        </motion.div>

        {/* ── RIGHT COLUMN: Live Preview ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden lg:flex lg:sticky lg:top-6 self-start justify-center w-full"
        >
          {previewProfile && (
            <div className="w-full max-w-[340px] xl:max-w-sm">
              <LandingPreview profile={previewProfile} blocks={blocks} />
            </div>
          )}
        </motion.div>

      </div>

      {/* ── MOBILE: Floating Preview Button ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl transition-transform active:scale-95"
          style={{ background: 'rgba(26,26,26,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }}
        >
          <span>👁️</span> Ver Vista Previa
        </button>
      </div>

      {/* ── MOBILE: Preview Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobilePreview && previewProfile && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#333] shrink-0" style={{ background: '#111' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>Vista Previa en Vivo</h2>
              <button 
                onClick={() => setShowMobilePreview(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-black p-4 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <LandingPreview profile={previewProfile} blocks={blocks} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
