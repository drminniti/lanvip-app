import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: {
    default: 'Lanvip – Tu Micro-Landing VIP',
    template: '%s | Lanvip',
  },
  description:
    'Centraliza tu presencia online con una tarjeta de presentación digital de lujo. Diseñada para profesionales que quieren destacar.',
  keywords: ['micro landing', 'link in bio', 'landing page', 'vip', 'lanvip'],
  openGraph: {
    type: 'website',
    siteName: 'Lanvip',
    title: 'Lanvip – Tu Micro-Landing VIP',
    description: 'Tu tarjeta de presentación digital de lujo.',
  },
  twitter: {
    card: 'summary_large_image',
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
      <body className="min-h-screen bg-surface-50 font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
