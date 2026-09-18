'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { verifyProfilePassword } from '@/app/actions/verifyPassword'

interface PasswordPromptProps {
  profileUid: string
}

export function PasswordPrompt({ profileUid }: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await verifyProfilePassword(profileUid, password)
      if (res.success) {
        router.refresh() // Reload SSR page, which will now have the auth cookie
      } else {
        setError(res.message || 'Contraseña incorrecta')
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow behind */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Perfil Protegido</h1>
            <p className="text-[#A3A3A3] text-sm mb-8">
              Este creador ha protegido su micro-landing VIP con una contraseña. Ingresala abajo para acceder.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest pl-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-center tracking-[0.2em] font-mono text-lg"
                  placeholder="••••••••"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F2CD5C] shadow-[0_0_15px_rgba(212,175,55,0.2)] mt-4 flex justify-center items-center h-[52px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Ingresar al perfil'
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
