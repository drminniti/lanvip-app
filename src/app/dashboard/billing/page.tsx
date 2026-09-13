'use client'

import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { UserProfile } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function BillingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ title: string; desc: string; isError?: boolean } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getFirebaseAuth()
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const db = getFirebaseDb()
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile)
          }
        }
        setLoading(false)
      })
    }
    fetchProfile()
  }, [])

  const executeCancellation = async () => {
    setShowCancelConfirm(false)
    setCancelling(true)
    try {
      const auth = getFirebaseAuth()
      const user = auth.currentUser
      if (!user) throw new Error('No user authenticated')
      
      const token = await user.getIdToken()
      const res = await fetch('/api/checkout/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setModalMessage({
        title: 'Suscripción cancelada',
        desc: 'Tu suscripción ha sido cancelada exitosamente. Mantendrás tus beneficios hasta que finalice tu ciclo actual.'
      })
    } catch (err: any) {
      console.error(err)
      setModalMessage({
        title: 'Error',
        desc: err.message || 'Ocurrió un error al intentar cancelar tu suscripción.',
        isError: true
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleModalClose = () => {
    if (modalMessage && !modalMessage.isError) {
      window.location.reload()
    } else {
      setModalMessage(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!profile) {
    return <div className="p-8 text-white">No se pudo cargar el perfil.</div>
  }

  const isVip = profile.plan === 'vip'
  const isCancelled = profile.isSubscriptionCancelled

  let formattedDate = 'N/A'
  if (profile.subscriptionEndsAt) {
    // Manejo seguro del Timestamp de Firebase
    const dateObj = profile.subscriptionEndsAt.toDate ? profile.subscriptionEndsAt.toDate() : new Date(profile.subscriptionEndsAt)
    formattedDate = dateObj.toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 text-white">
      <h1 className="text-3xl font-bold mb-8">Facturación y Suscripción</h1>
      
      <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Tu Plan Actual</h2>
            {isVip ? (
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-full border border-[#D4AF37]/30 uppercase tracking-wide text-sm">
                  Lanvip Pro VIP
                </span>
                {isCancelled && (
                  <span className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                    Cancelada
                  </span>
                )}
              </div>
            ) : (
              <span className="px-4 py-1.5 bg-white/10 text-white font-bold rounded-full border border-white/20 uppercase tracking-wide text-sm">
                Plan Gratuito
              </span>
            )}
          </div>

          <div className="md:text-right">
            {isVip ? (
              <>
                <p className="text-sm text-[#A3A3A3] mb-1">
                  {isCancelled ? 'Pierdes el acceso VIP el:' : 'Próxima renovación automática:'}
                </p>
                <p className="text-lg font-medium">{formattedDate}</p>
              </>
            ) : (
              <p className="text-sm text-[#A3A3A3]">Disfrutando de las funciones básicas.</p>
            )}
          </div>

        </div>
      </div>

      {isVip && !isCancelled && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Zona de Peligro</h3>
          <p className="text-sm text-[#A3A3A3] mb-6">
            Al cancelar tu suscripción, se detendrán los cobros automáticos. Mantendrás tus beneficios VIP hasta el final de tu ciclo de facturación actual ({formattedDate}).
          </p>
          <button 
            onClick={() => setShowCancelConfirm(true)}
            disabled={cancelling}
            className="px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {cancelling ? (
              <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Cancelar Suscripción
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-xl mb-2">Cancelar Suscripción</h3>
              <p className="text-neutral-400 text-sm mb-6">
                ¿Estás seguro de que deseas cancelar tu suscripción automática? Perderás los beneficios VIP cuando finalice tu ciclo actual.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Mantener suscripción
                </button>
                <button
                  onClick={executeCancellation}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Sí, cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modalMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${modalMessage.isError ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {modalMessage.isError ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{modalMessage.title}</h3>
              <p className="text-neutral-400 text-sm mb-6">{modalMessage.desc}</p>
              <button
                onClick={handleModalClose}
                className="w-full px-4 py-2 font-medium bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
