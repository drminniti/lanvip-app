'use client'

import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { PaymentBrick } from './PaymentBrick'
import { motion, AnimatePresence } from 'framer-motion'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null)
  const [firebaseToken, setFirebaseToken] = useState<string>('')
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'payment' | 'success'>('selection')
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCheckoutStep('selection')
      setLoadingPlan(null)
      setPaymentError(null)
      
      const fetchToken = async () => {
        const auth = getAuth()
        const user = auth.currentUser
        if (user) {
          const token = await user.getIdToken()
          setFirebaseToken(token)
        }
      }
      fetchToken()
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectPlan = (planType: 'monthly' | 'annual') => {
    setLoadingPlan(planType)
    if (!firebaseToken) {
      setPaymentError('Debes estar autenticado para realizar esta acción.')
      setLoadingPlan(null)
      return
    }
    setPaymentError(null)
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
    setPaymentError(errorMsg)
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
        <div className="flex flex-col gap-3">
        {checkoutStep === 'selection' && (
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Desbloquea Lanvip VIP</h2>
            <p className="text-[#A3A3A3] mb-6 text-sm text-center">
              Lleva tu perfil al siguiente nivel con todas las funcionalidades premium.
            </p>

            <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
              <h3 className="text-white font-medium mb-3">Tu plan VIP incluye:</h3>
              <ul className="space-y-2 text-sm text-[#A3A3A3]">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Eliminar marca de agua</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Acceso a Temas Premium</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Analíticas Avanzadas</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Dominio Personalizado (Próximamente)</li>
              </ul>
            </div>

            <AnimatePresence>
              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm flex items-start gap-2 text-left"
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>{paymentError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <button 
                onClick={() => handleSelectPlan('monthly')}
                className="w-full bg-[#D4AF37] hover:bg-[#F5D989] text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex flex-col text-left">
                  <span className="text-lg">Mensual</span>
                  <span className="text-xs opacity-80 font-medium">Facturado cada mes</span>
                </div>
                <div className="text-right">
                  <span className="text-xl block">${process.env.NEXT_PUBLIC_PRICE_MONTHLY || '5.000'}</span>
                  <span className="text-xs opacity-80 uppercase tracking-wide">ARS / mes</span>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPlan('annual')}
                className="w-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                  Ahorra 16%
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg">Anual</span>
                  <span className="text-xs opacity-80 font-medium">Facturado anualmente</span>
                </div>
                <div className="text-right">
                  <span className="text-xl block">${process.env.NEXT_PUBLIC_PRICE_ANNUAL || '50.000'}</span>
                  <span className="text-xs opacity-80 uppercase tracking-wide">ARS / año</span>
                </div>
              </button>
            </div>
            
            <p className="text-center text-xs text-neutral-500 mt-5">
              💳 Tarjetas de crédito y débito. Pagos 100% seguros con Mercado Pago.
            </p>
          </div>
        )}

        {checkoutStep === 'payment' && loadingPlan && (
          <div className="text-left animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setCheckoutStep('selection')}
              className="text-[#A3A3A3] hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Volver a los planes
            </button>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center mb-2">
              <div>
                <h3 className="text-white font-medium">Lanvip VIP {loadingPlan === 'monthly' ? 'Mensual' : 'Anual'}</h3>
                <p className="text-sm text-[#A3A3A3]">{loadingPlan === 'monthly' ? 'Facturado cada mes' : 'Facturado anualmente'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#D4AF37] block">
                  ${loadingPlan === 'monthly' ? (process.env.NEXT_PUBLIC_PRICE_MONTHLY || '5.000') : (process.env.NEXT_PUBLIC_PRICE_ANNUAL || '50.000')}
                </span>
                <span className="text-xs text-[#A3A3A3]">ARS</span>
              </div>
            </div>

            <PaymentBrick 
              planType={loadingPlan} 
              firebaseToken={firebaseToken}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

          {checkoutStep === 'success' && (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-medium">
              ¡Pago exitoso! Activando tu cuenta VIP...
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          disabled={checkoutStep === 'success'}
          className="mt-6 text-[#A3A3A3] hover:text-white transition-colors text-sm disabled:opacity-50"
        >
          Quizás más tarde
        </button>
      </div>
    </div>
  )
}
