'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { updateUserProfile } from '@/lib/auth'
import { usePaywall } from '@/context/PaywallContext'

interface CustomDomainCardProps {
  initialDomain?: string
  isVip: boolean
}

export function CustomDomainCard({ initialDomain = '', isVip }: CustomDomainCardProps) {
  const { user } = useAuth()
  const { openUpgradeModal } = usePaywall()
  
  const [domain, setDomain] = useState(initialDomain)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)

  // Sync state if initialDomain updates from parent
  useEffect(() => {
    setDomain(initialDomain)
  }, [initialDomain])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVip) {
      openUpgradeModal()
      return
    }
    
    if (!user?.uid) return
    
    // Remove protocol and trailing slashes
    const sanitizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    setLoading(true)
    setStatusMsg(null)
    
    try {
      // 1. Save in Firestore
      await updateUserProfile(user.uid, {
        customDomain: sanitizedDomain
      })
      
      // 2. Call Vercel API
      if (sanitizedDomain) {
        const token = await user.getIdToken()
        const res = await fetch('/api/domains', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ domain: sanitizedDomain })
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Error al conectar el dominio en Vercel')
        }
      }
      
      setStatusMsg({ type: 'ok', text: '¡Dominio guardado correctamente!' })
      setDomain(sanitizedDomain)
    } catch (err: any) {
      console.error('[Lanvip] custom domain save error:', err)
      setStatusMsg({ type: 'err', text: err.message || 'Error al guardar el dominio.' })
    } finally {
      setLoading(false)
      setTimeout(() => setStatusMsg(null), 5000)
    }
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-6 space-y-4 relative overflow-hidden mt-6">
      {!isVip && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/60"
          onClick={openUpgradeModal}
        >
          <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-[#D4AF37]/30 shadow-lg">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase mt-px">VIP Exclusivo</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#F5F5F5' }}>
            Dominio Personalizado
            {isVip && <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">VIP</span>}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#A3A3A3' }}>
            Usa tu propia URL (ej. damian.com) en lugar de lanvip.app/tu-usuario
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <label htmlFor="custom-domain" className="label-dark">Tu Dominio</label>
          <input
            id="custom-domain"
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="ej. midominio.com"
            className="input-dark w-full"
            disabled={!isVip || loading}
          />
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 text-xs space-y-2">
          <p className="font-medium text-[#F5F5F5]">Instrucciones de configuración DNS:</p>
          <ol className="list-decimal list-inside space-y-1 text-[#A3A3A3]">
            <li>Ve a la configuración DNS de tu proveedor (GoDaddy, Namecheap, etc.)</li>
            <li>Si usas un <strong>Dominio raíz</strong> (ej. midominio.com), crea un <strong>Registro A</strong> apuntando a <code className="bg-black/50 px-1 py-0.5 rounded text-[#D4AF37]">76.76.21.21</code></li>
            <li>Si usas un <strong>Subdominio</strong> (ej. www.midominio.com), crea un <strong>Registro CNAME</strong> apuntando a <code className="bg-black/50 px-1 py-0.5 rounded text-[#D4AF37]">cname.vercel-dns.com</code></li>
          </ol>
          <p className="text-[#A3A3A3] italic pt-1">Nota: Los cambios DNS pueden tardar algunas horas en propagarse.</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <AnimatePresence mode="wait">
            {statusMsg && (
              <motion.span
                key={statusMsg.text}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs ${statusMsg.type === 'ok' ? 'text-green-500' : 'text-red-500'}`}
              >
                {statusMsg.text}
              </motion.span>
            )}
            {!statusMsg && <span />}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !isVip || domain === initialDomain}
            className="btn-primary-dark text-sm px-6 py-2 ml-auto"
          >
            {loading ? 'Conectando...' : 'Conectar Dominio'}
          </button>
        </div>
      </div>
    </form>
  )
}
