'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFirebaseDb } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import type { UserProfile } from '@/types'

export default function PlanNotificationModal({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(!!profile.planNotification)
  const [isDismissing, setIsDismissing] = useState(false)

  if (!profile.planNotification || !isOpen) return null

  const handleDismiss = async () => {
    setIsDismissing(true)
    try {
      const db = getFirebaseDb()
      await updateDoc(doc(db, 'users', profile.uid), { planNotification: null })
      setIsOpen(false)
    } catch (error) {
      console.error('Error clearing notification:', error)
      setIsOpen(false)
    } finally {
      setIsDismissing(false)
    }
  }

  let title = ''
  let message = ''
  let buttonText = 'Entendido'
  let colorClass = ''
  let bgGradient = ''

  if (profile.planNotification === 'upgraded') {
    title = '¡Felicidades, eres VIP!'
    message = 'Tu cuenta ha sido mejorada a VIP (Lifetime). Ahora tienes acceso ilimitado a todos los temas premium, bloques exclusivos y puedes remover la marca de agua.'
    colorClass = 'text-[#D4AF37]'
    bgGradient = 'from-[#D4AF37]/20 to-transparent'
    buttonText = '¡Increíble!'
  } else if (profile.planNotification === 'trial') {
    title = '¡Tienes VIP Gratis!'
    message = 'Te hemos otorgado acceso VIP por tiempo limitado. Aprovecha para explorar todos los temas premium y probar todas las funcionalidades pro antes de que expire.'
    colorClass = 'text-green-400'
    bgGradient = 'from-green-500/20 to-transparent'
    buttonText = '¡Genial!'
  } else if (profile.planNotification === 'downgraded') {
    title = 'Tu plan VIP ha expirado'
    message = 'Tu cuenta ha regresado al plan Free. Tus bloques y temas premium han sido ocultados de tu perfil público temporalmente. ¡Vuelve a suscribirte para recuperar todo!'
    colorClass = 'text-red-400'
    bgGradient = 'from-red-500/20 to-transparent'
    buttonText = 'Entendido'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-[#141414] border border-[#333333] rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Top glow */}
          <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${bgGradient} pointer-events-none opacity-50`} />
          
          <div className="p-8 relative z-10 flex flex-col items-center text-center">
            <h2 className={`text-2xl font-bold mb-4 ${colorClass}`}>
              {title}
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="w-full space-y-3">
              {profile.planNotification === 'downgraded' && (
                <button
                  onClick={() => {
                    handleDismiss()
                    // Si tuviéramos un checkout, redirigimos aquí. 
                    // Por ahora solo cerramos el modal, pero podrías agregar router.push('/upgrade')
                  }}
                  className="w-full bg-[#D4AF37] text-black font-bold py-3.5 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Mejorar a VIP
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                disabled={isDismissing}
                className={`w-full py-3.5 rounded-xl font-medium transition-colors ${
                  profile.planNotification === 'downgraded'
                    ? 'bg-white/5 text-white hover:bg-white/10'
                    : 'bg-[#D4AF37] text-black font-bold hover:bg-[#C2A032]'
                }`}
              >
                {isDismissing ? 'Cargando...' : buttonText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
