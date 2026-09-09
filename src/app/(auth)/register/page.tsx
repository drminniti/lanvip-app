'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { registerWithEmail, loginWithGoogle } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { getFirebaseErrorMessage } from '@/lib/errors'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  // All navigation to /dashboard is handled here — AFTER AuthContext settles.
  // Never call router.push in the handlers below; that creates a race where
  // DashboardLayout mounts before AuthContext has propagated the new user.
  useEffect(() => {
    if (!authLoading && user) {
      document.cookie = '__session=1; path=/; SameSite=Lax'
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  function handleUsernameChange(val: string) {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      await registerWithEmail(email, password, username, displayName)
      // Navigation handled by useEffect above when AuthContext updates.
    } catch (err: unknown) {
      console.error('[Lanvip] registerWithEmail UI catch:', err)
      setError(getFirebaseErrorMessage(err))
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      // Navigation handled by useEffect above when AuthContext updates.
    } catch (err: unknown) {
      console.error('[Lanvip] loginWithGoogle UI catch (register):', err)
      setError(getFirebaseErrorMessage(err))
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-sm"
    >
      <div className="glass-card p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <LanvipLogo size={48} />
        </motion.div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">Crear cuenta</h1>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>Tu landing VIP te espera — es gratis</p>
        </div>

        <motion.button
          id="btn-google-register"
          onClick={handleGoogleRegister}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="btn-ghost w-full"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Conectando con Google…
            </>
          ) : (
            <>
              <GoogleIcon />
              Registrarse con Google
            </>
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="divider" />
          <span className="text-xs" style={{ color: '#A3A3A3' }}>o</span>
          <div className="divider" />
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="reg-name" className="label-dark">Nombre completo</label>
            <input id="reg-name" type="text" required autoComplete="name" value={displayName}
              onChange={e => setDisplayName(e.target.value)} placeholder="Tu Nombre" className="input-dark" />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-username" className="label-dark">Nombre de usuario</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none" style={{ color: '#A3A3A3' }}>
                lanvip.app/
              </span>
              <input id="reg-username" type="text" required value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                placeholder="tunombre" className="input-dark" style={{ paddingLeft: '6.5rem' }} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="label-dark">Correo electrónico</label>
            <input id="reg-email" type="email" required autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="input-dark" />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-password" className="label-dark">
              Contraseña <span style={{ color: '#A3A3A3', fontWeight: 400 }}>(mín. 8 caracteres)</span>
            </label>
            <input id="reg-password" type="password" required autoComplete="new-password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-dark" />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-center" style={{ color: '#EF4444' }}>
              {error}
            </motion.p>
          )}

          <motion.button id="btn-register-submit" type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }} className="btn-accent w-full mt-1">
            {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
          </motion.button>
        </form>

        <p className="text-center text-xs" style={{ color: '#A3A3A3' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#D4AF37' }}>Iniciar sesión</Link>
        </p>
      </div>
    </motion.div>
  )
}
