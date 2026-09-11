import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: {
    default: 'Lanvip – Tu Micro-Landing VIP, en Minutos',
    template: '%s | Lanvip',
  },
  description:
    'Agrupa todos tus enlaces, redes y contacto en un solo link con un diseño premium espectacular. Crea tu tarjeta de presentación digital gratis y destaca al instante.',
  keywords: ['micro landing', 'link in bio', 'landing page', 'vip', 'lanvip', 'tarjeta digital', 'portafolio', 'enlaces'],
  openGraph: {
    type: 'website',
    siteName: 'Lanvip',
    title: 'Lanvip – Destaca con tu Micro-Landing VIP',
    description: 'La forma más elegante de compartir todos tus enlaces, redes y contacto. Crea la tuya en minutos y sin programar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lanvip – Destaca con tu Micro-Landing VIP',
    description: 'La forma más elegante de compartir todos tus enlaces, redes y contacto. Crea la tuya en minutos y sin programar.',
  },
  icons: {
    icon: '/assets/LV_Logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-[#0a0a0a] font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
