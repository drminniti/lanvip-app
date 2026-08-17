'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { loginWithEmail, loginWithGoogle } from '@/lib/auth'

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

// ─── Login Form ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      // Set session cookie so middleware can validate the session
      document.cookie = '__session=1; path=/; SameSite=Lax'
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
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
      {/* Card */}
      <div className="glass-card p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">
            Lanvip
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bienvenido de vuelta
          </p>
        </div>

        {/* Google */}
        <motion.button
          id="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          Continuar con Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
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
            id="btn-email-login"
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lanvip-glow"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </motion.button>
        </form>

        {/* Register link */}
        <p className="text-center text-xs text-gray-500">
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold text-brand-500 hover:text-brand-400 transition-colors"
          >
            Crear cuenta gratis
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
      'auth/user-not-found':    'No encontramos una cuenta con ese email.',
      'auth/wrong-password':    'Contraseña incorrecta. Inténtalo de nuevo.',
      'auth/invalid-email':     'El formato del email no es válido.',
      'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
      'auth/popup-closed-by-user': 'Cerraste el popup de Google antes de completar.',
      'auth/invalid-credential': 'Credenciales inválidas. Verifica tu email y contraseña.',
    }
    return messages[code] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
  }
  return 'Ocurrió un error inesperado.'
}
