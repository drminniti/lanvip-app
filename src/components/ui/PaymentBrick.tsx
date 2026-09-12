'use client'

import React, { useEffect, useState } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'

interface PaymentBrickProps {
  planType: 'monthly' | 'annual'
  firebaseToken: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function PaymentBrick({ planType, firebaseToken, onSuccess, onError }: PaymentBrickProps) {
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: 'es-AR' })
      setIsReady(true)
    } else {
      console.error('Mercado Pago Public Key is missing.')
      onError('Configuración de pago incompleta.')
    }
  }, [onError])

  if (!isReady) return null

  const onSubmit = async (formData: any) => {
    setIsProcessing(true)
    try {
      const { token, payer } = formData

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          planType,
          cardTokenId: token,
          payerEmail: payer.email
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      // La suscripción fue creada exitosamente
      onSuccess()
    } catch (err: any) {
      console.error('Error in checkout:', err)
      onError(err.message || 'Hubo un problema al procesar el pago.')
    } finally {
      setIsProcessing(false)
    }
  }

  const onErrorBrick = (error: any) => {
    console.error('Brick Error:', error)
  }

  const onReady = () => {
    console.log('Brick is ready')
  }

  return (
    <div className="w-full text-left bg-white p-4 rounded-xl mt-4">
      <CardPayment
        initialization={{ amount: planType === 'monthly' ? 5000 : 50000 }} // Monto ilustrativo para el Brick
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onErrorBrick}
        customization={{
          visual: {
            style: {
              theme: 'default'
            }
          }
        }}
      />
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-[#D4AF37] font-semibold">Procesando suscripción...</p>
          </div>
        </div>
      )}
    </div>
  )
}
