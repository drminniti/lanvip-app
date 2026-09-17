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
  const [domainStatus, setDomainStatus] = useState<'idle' | 'loading' | 'active' | 'pending' | 'invalid'>('idle')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Sync state if initialDomain updates from parent
  useEffect(() => {
    setDomain(initialDomain)
  }, [initialDomain])

  // Check Vercel domain status on load
  useEffect(() => {
    async function checkDomainStatus() {
      if (!initialDomain || !user) return
      setDomainStatus('loading')
      try {
        const token = await user.getIdToken()
        const res = await fetch(`/api/domains?domain=${initialDomain}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.status === 'mocked') {
          setDomainStatus('active')
        } else if (data.verified) {
          setDomainStatus('active')
        } else if (data.hasConflicts) {
          setDomainStatus('invalid')
        } else {
          setDomainStatus('pending')
        }
      } catch (e) {
        console.error('Status check error:', e)
        setDomainStatus('idle')
      }
    }
    checkDomainStatus()
  }, [initialDomain, user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVip) {
      openUpgradeModal()
      return
    }
    
    if (!user?.uid) return
    
    // Remove protocol and trailing slashes
    const sanitizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    
    if (!sanitizedDomain) {
      setStatusMsg({ type: 'err', text: 'Por favor, ingresa un dominio válido.' })
      return
    }

    setShowConfirmModal(true)
  }

  const confirmSave = async () => {
    setShowConfirmModal(false)
    if (!user?.uid) return
    const sanitizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^www\./, '')
    
    setLoading(true)
    setStatusMsg(null)
    
    try {
      if (!sanitizedDomain) throw new Error('Dominio inválido.')

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
      
      setStatusMsg({ type: 'ok', text: '¡Dominio conectado! La propagación de DNS (y emisión de SSL) puede tardar unos minutos o hasta 24 horas.' })
      setDomain(sanitizedDomain)
      setIsEditing(false) // Lock it back since we successfully modified it
    } catch (err: any) {
      console.error('[Lanvip] custom domain save error:', err)
      setStatusMsg({ type: 'err', text: err.message || 'Error al guardar el dominio.' })
    } finally {
      setLoading(false)
      // We do not clear the success message so the user can read the DNS warning.
      // If error, we can clear it or leave it. Let's clear errors only.
      setTimeout(() => {
        setStatusMsg((prev) => prev?.type === 'err' ? null : prev)
      }, 5000)
    }
  }

  return (
    <>
      <form onSubmit={handleSave} className="glass-card p-6 space-y-4 relative overflow-hidden mt-6">
      
      <div 
        className="flex justify-between items-start cursor-pointer group" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#F5F5F5' }}>
            Dominio Personalizado
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">VIP</span>
          </h2>
          <p className="text-xs mt-1" style={{ color: '#A3A3A3' }}>
            {initialDomain ? `Conectado a: ${initialDomain}` : 'Usa tu propia URL (ej. damian.com) en lugar de lanvip.app/tu-usuario'}
          </p>
        </div>
        <button 
          type="button" 
          className="text-[#A3A3A3] group-hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
        >
          <svg 
            className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden relative"
          >
            {!isVip && (
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/60 rounded-xl"
                onClick={openUpgradeModal}
              >
                <div className="flex flex-col items-center gap-2 bg-[#111]/90 px-6 py-4 rounded-2xl border border-[#D4AF37]/30 shadow-2xl text-center max-w-[80%]">
                  <div className="bg-[#D4AF37]/20 p-2 rounded-full mb-1">
                    <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">Mejorá tu plan para conectar un dominio personalizado</span>
                  <span className="text-xs text-[#A3A3A3]">Dale un aspecto mucho más profesional a tu perfil y compartilo con tu propia URL.</span>
                  <button type="button" className="mt-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#F2CD5C] px-4 py-1.5 rounded-full transition-colors">
                    Actualizar a VIP
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
              <div className="space-y-1">
                <label htmlFor="custom-domain" className="label-dark flex justify-between items-center">
                  <span>Tu Dominio</span>
                  {initialDomain && !isEditing && (
                    <button 
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-[#D4AF37] hover:text-[#F2CD5C] text-xs flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Modificar
                    </button>
                  )}
                </label>
                <input
                  id="custom-domain"
                  type="text"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="ej. midominio.com"
                  className={`input-dark w-full ${initialDomain && !isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isVip || loading || (Boolean(initialDomain) && !isEditing)}
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

              {initialDomain && domainStatus !== 'idle' && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 mt-4 ${
                  domainStatus === 'active' ? 'bg-green-500/10 border-green-500/30' :
                  domainStatus === 'invalid' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}>
                  <div className="mt-0.5">
                    {domainStatus === 'active' && <span className="text-green-500 text-lg">✅</span>}
                    {domainStatus === 'invalid' && <span className="text-red-500 text-lg">⚠️</span>}
                    {domainStatus === 'pending' && <span className="text-yellow-500 text-lg">⏳</span>}
                    {domainStatus === 'loading' && <span className="text-gray-400 text-lg animate-pulse">🔄</span>}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${
                      domainStatus === 'active' ? 'text-green-500' :
                      domainStatus === 'invalid' ? 'text-red-500' :
                      domainStatus === 'pending' ? 'text-yellow-500' : 'text-gray-400'
                    }`}>
                      {domainStatus === 'active' && 'Dominio Activo y Conectado'}
                      {domainStatus === 'invalid' && 'Configuración de DNS Inválida'}
                      {domainStatus === 'pending' && 'Esperando Propagación DNS...'}
                      {domainStatus === 'loading' && 'Consultando estado del dominio...'}
                    </h3>
                    <p className="text-xs text-[#A3A3A3] mt-1">
                      {domainStatus === 'active' && 'Tu dominio está configurado correctamente y el certificado SSL está emitido.'}
                      {domainStatus === 'invalid' && 'Vercel detectó conflictos. Asegurate de eliminar los Registros A por defecto.'}
                      {domainStatus === 'pending' && 'Los cambios de DNS pueden tardar en reflejarse mundialmente.'}
                      {domainStatus === 'loading' && 'Verificando con Vercel...'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <AnimatePresence mode="wait">
                  {statusMsg && (
                    <motion.div
                      key={statusMsg.text}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs p-3 rounded-lg border ${
                        statusMsg.type === 'ok' 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      } max-w-sm`}
                    >
                      {statusMsg.text}
                    </motion.div>
                  )}
                  {!statusMsg && <div />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </form>

    <AnimatePresence>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Confirmar Dominio
            </h3>
            <p className="text-[#A3A3A3] text-sm mb-6">
              {initialDomain && initialDomain !== domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '') ? (
                <>
                  Actualmente tienes conectado el dominio <strong>{initialDomain}</strong>.<br/><br/>
                  ¿Estás seguro de que quieres cambiarlo a <strong className="text-white">{domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')}</strong>?<br/><br/>
                  <span className="text-red-400">⚠️ IMPORTANTE: Tu dominio anterior dejará de funcionar en tu perfil de Lanvip y deberás configurarlo nuevamente si deseas volver atrás.</span>
                </>
              ) : (
                <>
                  ¿Estás seguro de que quieres conectar el dominio <strong className="text-white">{domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')}</strong>?<br/><br/>
                  Por favor, verifica que esté escrito correctamente para evitar problemas de conexión.
                </>
              )}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="btn-primary-dark px-6 py-2 text-sm"
              >
                Conectar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}
