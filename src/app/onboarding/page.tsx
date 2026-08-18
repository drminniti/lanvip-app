'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { completeOnboarding, checkUsernameAvailable } from '@/lib/auth'

// Debounce delay for username availability check
const DEBOUNCE_MS = 600

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.uid)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'too-short'
  >('idle')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  // Pre-fill from Google profile when data arrives
  useEffect(() => {
    if (profile) {
      if (!displayName) setDisplayName(profile.displayName || '')
    }
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName)
    }
  }, [profile, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to dashboard if onboarding already completed
  useEffect(() => {
    if (!authLoading && !profileLoading && profile?.hasCompletedOnboarding) {
      router.replace('/dashboard')
    }
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, profileLoading, profile, user, router])

  // Debounced username availability check
  const checkUsername = useCallback(
    async (value: string) => {
      if (value.length < 3) {
        setUsernameStatus('too-short')
        return
      }
      setUsernameStatus('checking')
      try {
        const available = await checkUsernameAvailable(value, user!.uid)
        setUsernameStatus(available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    },
    [user],
  )

  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); return }
    const timer = setTimeout(() => checkUsername(username), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [username, checkUsername])

  function handleUsernameChange(val: string) {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (usernameStatus !== 'available') return
    if (!displayName.trim()) { setError('El nombre es obligatorio.'); return }

    setSaving(true)
    setError('')
    try {
      await completeOnboarding(user!.uid, username, displayName.trim())
      router.replace('/dashboard')
    } catch (err) {
      console.error('[Lanvip] completeOnboarding error:', err)
      setError('Error al guardar. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  const statusColor: Record<string, string> = {
    available: '#4CAF72',
    taken:     '#EF4444',
    'too-short': '#A3A3A3',
    checking:  '#A3A3A3',
    idle:      'transparent',
  }
  const statusMsg: Record<string, string> = {
    available:  '✓ Disponible',
    taken:      '✗ Ya está en uso',
    'too-short': 'Mínimo 3 caracteres',
    checking:   'Verificando…',
    idle:       '',
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0A0A0A' }}>
        <span className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-mesh">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-2"
            >
              👑
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text tracking-tight">
              Reclama tu espacio VIP
            </h1>
            <p className="text-sm" style={{ color: '#A3A3A3' }}>
              Elige tu nombre de usuario único. Esta será tu URL pública en Lanvip.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Display name */}
            <div className="space-y-1">
              <label htmlFor="ob-name" className="label-dark">Tu nombre</label>
              <input
                id="ob-name"
                type="text"
                required
                autoComplete="name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Como quieres que te vean"
                className="input-dark"
              />
            </div>

            {/* Username with availability indicator */}
            <div className="space-y-1">
              <label htmlFor="ob-username" className="label-dark">
                Nombre de usuario
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
                  style={{ color: '#A3A3A3' }}
                >
                  lanvip.app/
                </span>
                <input
                  id="ob-username"
                  type="text"
                  required
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="tunombre"
                  className="input-dark"
                  style={{
                    paddingLeft: '6.5rem',
                    borderColor: usernameStatus === 'available'
                      ? '#4CAF72'
                      : usernameStatus === 'taken'
                        ? '#EF4444'
                        : undefined,
                  }}
                />
              </div>

              {/* Status indicator */}
              <AnimatePresence mode="wait">
                {usernameStatus !== 'idle' && (
                  <motion.p
                    key={usernameStatus}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium"
                    style={{ color: statusColor[usernameStatus] }}
                  >
                    {usernameStatus === 'checking' && (
                      <span className="inline-block w-3 h-3 rounded-full border border-current border-t-transparent animate-spin mr-1" />
                    )}
                    {statusMsg[usernameStatus]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center"
                style={{ color: '#EF4444' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              id="btn-complete-onboarding"
              type="submit"
              disabled={saving || usernameStatus !== 'available' || !displayName.trim()}
              whileTap={{ scale: 0.97 }}
              className="btn-accent w-full"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Guardando…
                </>
              ) : (
                'Comenzar →'
              )}
            </motion.button>
          </form>

          {/* Preview URL */}
          <AnimatePresence>
            {usernameStatus === 'available' && username && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center"
              >
                <p className="text-xs" style={{ color: '#A3A3A3' }}>
                  Tu landing pública será:{' '}
                  <span className="font-semibold" style={{ color: '#D4AF37' }}>
                    lanvip.app/{username}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  )
}
