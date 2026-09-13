'use client'

import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { PaymentBrick } from './PaymentBrick'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)
  const [firebaseToken, setFirebaseToken] = useState<string>('')
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'payment' | 'success'>('selection')

  useEffect(() => {
    if (isOpen) {
      // Reset state when opened
      setCheckoutStep('selection')
      setLoadingPlan(null)
      
      const fetchToken = async () => {
        const auth = getAuth()
        const user = auth.currentUser
        if (user) {
          const token = await user.getIdToken()
          setFirebaseToken(token)
        }
      }
      fetchToken()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectPlan = (planType: 'monthly' | 'annual') => {
    setLoadingPlan(planType)
    if (!firebaseToken) {
      alert('Debes estar autenticado para realizar esta acción.')
      setLoadingPlan(null)
      return
    }
    setCheckoutStep('payment')
  }

  const handlePaymentSuccess = () => {
    setCheckoutStep('success')
    // Optionally reload the page or update context after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }

  const handlePaymentError = (errorMsg: string) => {
    alert(errorMsg)
    setCheckoutStep('selection')
    setLoadingPlan(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center transform transition-all max-h-[90vh] overflow-y-auto">
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
          {checkoutStep === 'selection' && (
            <>
              <button 
                onClick={() => handleSelectPlan('monthly')}
                className="w-full bg-[#D4AF37] hover:bg-[#F5D989] text-black font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Suscripción Mensual
              </button>

              <button 
                onClick={() => handleSelectPlan('annual')}
                className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Suscripción Anual
              </button>
            </>
          )}

          {checkoutStep === 'payment' && loadingPlan && (
            <PaymentBrick 
              planType={loadingPlan} 
              firebaseToken={firebaseToken}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {checkoutStep === 'success' && (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-medium">
              ¡Pago exitoso! Activando tu cuenta VIP...
            </div>
          )}
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
