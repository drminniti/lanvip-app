'use client'

import React, { useState } from 'react'
import { getAuth } from 'firebase/auth'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)

  if (!isOpen) return null

  const handleCheckout = async (planType: 'monthly' | 'annual') => {
    setLoadingPlan(planType)
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error('No user authenticated')
      
      const token = await user.getIdToken()
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType })
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        throw new Error('No init_point received')
      }
    } catch (err) {
      console.error('Error starting checkout:', err)
      alert('Hubo un error al iniciar el pago. Intenta de nuevo.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center transform transition-all">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
          <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Desbloquea el poder de Lanvip VIP</h2>
        <p className="text-[#A3A3A3] mb-8 leading-relaxed">
          Actualiza a Lanvip VIP para desbloquear Temas Premium, Marca de Agua Oculta, Dominio Personalizado y Métricas Avanzadas.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleCheckout('monthly')}
            disabled={loadingPlan !== null}
            className="w-full bg-[#D4AF37] hover:bg-[#F5D989] text-black font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingPlan === 'monthly' ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Suscripción Mensual
          </button>

          <button 
            onClick={() => handleCheckout('annual')}
            disabled={loadingPlan !== null}
            className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loadingPlan === 'annual' ? (
              <span className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Suscripción Anual
          </button>
        </div>

        <button 
          onClick={onClose}
          disabled={loadingPlan !== null}
          className="mt-6 text-[#A3A3A3] hover:text-white transition-colors text-sm disabled:opacity-50"
        >
          Quizás más tarde
        </button>
      </div>
    </div>
  )
}
