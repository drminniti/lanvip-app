'use client'

import { useEffect, useRef, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { updateUserProfile } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

interface InAppTutorialProps {
  uid: string
}

export function InAppTutorial({ uid }: InAppTutorialProps) {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    console.log('[Lanvip] InAppTutorial mounted with uid:', uid)
    
    // Only initialize if not already done to prevent duplicate drivers
    if (driverObj.current) {
      console.log('[Lanvip] InAppTutorial already initialized')
      return
    }

    console.log('[Lanvip] Initializing driver.js...')
    driverObj.current = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Siguiente &rarr;',
      prevBtnText: '&larr; Anterior',
      doneBtnText: '¡Comenzar!',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'lanvip-driver-popover',
      onDestroyStarted: () => {
        if (!driverObj.current?.hasNextStep()) {
          driverObj.current?.destroy()
          // Mark tutorial as seen in Firebase
          updateUserProfile(uid, { hasSeenTutorial: true }).catch(err => {
            console.error('[Lanvip] Failed to save tutorial completion:', err)
          })
        } else {
          // Show custom modal instead of native confirm
          setShowCancelModal(true)
        }
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a Lanvip!',
            description: 'Vamos a dar un paseo rápido para que aprendas a crear tu nueva Micro-Landing VIP. Prometemos que será breve.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: window.innerWidth < 768 ? '#mobile-nav-perfil' : '#nav-perfil',
          popover: {
            title: 'Configurá tu Perfil',
            description: 'Acá podés cambiar tu nombre de usuario, subir tu foto de perfil, agregar una biografía y conectar tu Dominio Personalizado.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: window.innerWidth < 768 ? '#mobile-nav-bloques' : '#nav-bloques',
          popover: {
            title: 'Armá tu Landing',
            description: 'En esta sección podrás agregar todos tus links, redes sociales, videos y reorganizarlos como más te guste.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: window.innerWidth < 768 ? '#btn-view-public-profile-mobile' : '#btn-view-public-profile-sidebar',
          popover: {
            title: 'Previsualizá tu éxito',
            description: 'Hacé clic acá en cualquier momento para ver cómo queda tu perfil en vivo. ¡Asegurate de que se vea increíble!',
            side: 'top',
            align: 'center'
          }
        }
      ]
    })

    const timer = setTimeout(() => {
      console.log('[Lanvip] Driving tutorial...')
      driverObj.current?.drive()
    }, 500)

    return () => {
      console.log('[Lanvip] Unmounting tutorial...')
      clearTimeout(timer)
      if (driverObj.current) {
        driverObj.current.destroy()
        driverObj.current = null
      }
    }
  }, [uid])

  function handleSkipTutorial() {
    setShowCancelModal(false)
    driverObj.current?.destroy()
    updateUserProfile(uid, { hasSeenTutorial: true }).catch(err => {
      console.error('[Lanvip] Failed to save tutorial completion:', err)
    })
  }

  return (
    <AnimatePresence>
      {showCancelModal && (
        <div className="fixed inset-0 z-[10000001] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center"
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-2">
              ¿Omitir el tutorial?
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Aún faltan algunos pasos para descubrir todo lo que Lanvip tiene para ofrecer.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#F5D989] text-black font-medium rounded-xl transition-colors"
              >
                Continuar tutorial
              </button>
              <button
                onClick={handleSkipTutorial}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Sí, omitir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
