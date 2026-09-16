'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { sendEmailVerification } from 'firebase/auth'
import { getFirebaseErrorMessage } from '@/lib/errors'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user?.emailVerified) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  async function handleResendEmail() {
    if (!user) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await sendEmailVerification(user)
      setMessage('Correo de verificación reenviado. Revisa tu bandeja de entrada.')
    } catch (err: unknown) {
      console.error('[Lanvip] handleResendEmail catch:', err)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.code === 'auth/too-many-requests') {
        setError('Por favor, espera unos minutos antes de volver a intentar.')
      } else {
        setError(getFirebaseErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckVerification() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      await user.reload()
      if (user.emailVerified) {
        document.cookie = '__session=1; path=/; SameSite=Lax'
        router.push('/dashboard')
      } else {
        setError('Tu email aún no ha sido verificado. Por favor, revisa tu correo.')
      }
    } catch (err) {
      console.error('Error reloading user:', err)
      setError('Ocurrió un error al verificar tu estado.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
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
      <div className="glass-card p-8 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <LanvipLogo size={48} />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold gradient-text tracking-tight">Verifica tu email</h1>
          <p className="text-sm text-[#A3A3A3]">
            Hemos enviado un enlace de confirmación a <strong className="text-white">{user.email}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-left">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-left">
            {message}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckVerification}
            disabled={loading}
            className="w-full btn-accent relative overflow-hidden"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
            ) : (
              'Ya lo verifiqué, continuar'
            )}
          </button>
          
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors"
          >
            Reenviar correo
          </button>
        </div>
      </div>
    </motion.div>
  )
}
