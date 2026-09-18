'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { updateUserProfile } from '@/lib/auth'

interface InAppTutorialProps {
  uid: string
}

export function InAppTutorial({ uid }: InAppTutorialProps) {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)

  useEffect(() => {
    // Only initialize if not already done to prevent duplicate drivers
    if (driverObj.current) return

    driverObj.current = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Siguiente &rarr;',
      prevBtnText: '&larr; Anterior',
      doneBtnText: '¡Comenzar!',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'lanvip-driver-popover',
      onDestroyStarted: () => {
        if (!driverObj.current?.hasNextStep() || confirm('¿Estás seguro de que quieres omitir el tutorial?')) {
          driverObj.current?.destroy()
          // Mark tutorial as seen in Firebase
          updateUserProfile(uid, { hasSeenTutorial: true }).catch(err => {
            console.error('[Lanvip] Failed to save tutorial completion:', err)
          })
        }
      },
      steps: [
        {
          popover: {
            title: '¡Bienvenido a Lanvip!',
            description: 'Vamos a dar un paseo rápido para que aprendas a usar tu nueva Micro-Landing VIP. Prometemos que será breve.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#nav-perfil',
          popover: {
            title: 'Configurá tu Perfil',
            description: 'Acá podés cambiar tu nombre de usuario, subir tu foto de perfil, agregar una biografía y conectar tu Dominio Personalizado.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#nav-bloques',
          popover: {
            title: 'Armá tu Landing',
            description: 'En esta sección podrás agregar todos tus links, redes sociales, videos y reorganizarlos como más te guste.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#btn-view-public-profile-sidebar',
          popover: {
            title: 'Previsualizá tu éxito',
            description: 'Hacé clic acá en cualquier momento para ver cómo queda tu perfil en vivo. ¡Asegurate de que se vea increíble!',
            side: 'right',
            align: 'start'
          }
        }
      ]
    })

    // Slight delay to ensure DOM is fully painted
    const timer = setTimeout(() => {
      driverObj.current?.drive()
    }, 500)

    return () => clearTimeout(timer)
  }, [uid])

  return null
}
