'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { applyActionCode, confirmPasswordReset } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { getFirebaseErrorMessage } from '@/lib/errors'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

function ActionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!mode || !oobCode) {
      setError('Enlace inválido o incompleto.')
      setLoading(false)
      return
    }

    // Auto-apply verifyEmail immediately
    if (mode === 'verifyEmail') {
      const auth = getFirebaseAuth()
      applyActionCode(auth, oobCode)
        .then(() => {
          setSuccess('¡Tu correo electrónico ha sido verificado con éxito!')
          setLoading(false)
        })
        .catch((err) => {
          setError(getFirebaseErrorMessage(err))
          setLoading(false)
        })
    } else if (mode === 'resetPassword') {
      // Just stop loading so the user can enter the new password
      setLoading(false)
    } else {
      setError('Modo no soportado.')
      setLoading(false)
    }
  }, [mode, oobCode])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oobCode) return

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const auth = getFirebaseAuth()
      await confirmPasswordReset(auth, oobCode, newPassword)
      setSuccess('Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.')
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
      <div className="glass-card p-8 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <LanvipLogo size={48} />
        </motion.div>
        
        {loading && !success && !error && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <span className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
            <p className="text-[#A3A3A3] text-sm">Procesando solicitud...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-left">
              {error}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
            {mode === 'verifyEmail' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-[#D4AF37] hover:bg-[#F2C94C] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Ir al Dashboard
              </button>
            )}
            {mode === 'resetPassword' && (
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-[#D4AF37] hover:bg-[#F2C94C] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        )}

        {!loading && !success && !error && mode === 'resetPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-left">
            <div className="space-y-2 text-center mb-6">
              <h1 className="text-2xl font-bold gradient-text tracking-tight">Nueva contraseña</h1>
              <p className="text-sm text-[#A3A3A3]">
                Ingresá tu nueva contraseña a continuación.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80 pl-1">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-[#D4AF37] hover:bg-[#F2C94C] text-black disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2"
            >
              Restablecer Contraseña
            </button>
          </form>
        )}
      </div>
    </motion.div>
  )
}

export default function ActionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ActionPageContent />
    </Suspense>
  )
}
