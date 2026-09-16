'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getFirebaseErrorMessage } from '@/lib/errors'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un formato de email válido.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.error === 'auth/user-not-found') {
          throw { code: 'auth/user-not-found' } // Simulate Firebase error format for getFirebaseErrorMessage
        }
        throw new Error('Error al enviar el correo')
      }

      setMessage('Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.')
    } catch (err: unknown) {
      console.error('[Lanvip] forgot-password UI catch:', err)
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <LanvipLogo size={48} />
        </motion.div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>
            Ingresa tu email y te enviaremos un enlace para que crees una nueva.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label htmlFor="reset-email" className="label-dark">Correo electrónico</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-dark"
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {message}
            </motion.div>
          )}

          <motion.button
            id="btn-reset-password"
            type="submit"
            disabled={loading || !!message}
            whileTap={!message ? { scale: 0.97 } : {}}
            className="btn-accent w-full"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </motion.button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/login" className="text-sm text-[#A3A3A3] hover:text-white transition-colors">
            ← Volver al login
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
