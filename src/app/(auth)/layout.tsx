import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accede a tu cuenta',
}

/**
 * Auth layout: full-screen dark mesh gradient, centered card.
 * Background: #0A0A0A with dark mesh — see globals.css .bg-mesh
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  )
}
