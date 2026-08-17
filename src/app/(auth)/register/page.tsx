'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { registerWithEmail, loginWithGoogle } from '@/lib/auth'

// ─── Google Icon ─────────────────────────────────────────────────────────────
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
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  // Sanitize username: lowercase, alphanumeric + underscores only
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
      document.cookie = '__session=1; path=/; SameSite=Lax'
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      document.cookie = '__session=1; path=/; SameSite=Lax'
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-sm"
    >
      <div className="glass-card p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">
            Crear cuenta
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tu landing VIP te espera — es gratis
          </p>
        </div>

        {/* Google */}
        <motion.button
          id="btn-google-register"
          onClick={handleGoogleRegister}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
        >
          <GoogleIcon />
          Registrarse con Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3">
          {/* Display name */}
          <div className="space-y-1">
            <label htmlFor="reg-name" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nombre completo
            </label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Tu Nombre"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label htmlFor="reg-username" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Nombre de usuario
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
                lanvip.app/
              </span>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                placeholder="tunombre"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 pl-[6.5rem] pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="reg-email" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="reg-password" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Contraseña <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            id="btn-register-submit"
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 text-sm transition-colors duration-200 disabled:opacity-50 shadow-lanvip-glow mt-1"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
          </motion.button>
        </form>

        {/* Login link */}
        <p className="text-center text-xs text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-500 hover:text-brand-400 transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

// ─── Error Helper ─────────────────────────────────────────────────────────────
function getFirebaseErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Este email ya está registrado. Inicia sesión.',
      'auth/invalid-email':        'El formato del email no es válido.',
      'auth/weak-password':        'La contraseña es muy débil. Usa al menos 8 caracteres.',
      'auth/popup-closed-by-user': 'Cerraste el popup de Google antes de completar.',
    }
    return messages[code] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
  }
  return 'Ocurrió un error inesperado.'
}
