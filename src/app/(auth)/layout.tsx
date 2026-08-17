import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accede a tu cuenta',
}

/**
 * Auth layout: Centers content on a full-screen mesh gradient background.
 * Shared by /login and /register.
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
