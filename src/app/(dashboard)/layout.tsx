import type { Metadata } from 'next'
import DashboardNav from './_components/DashboardNav'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Background: #0A0A0A per spec
    <div className="flex min-h-screen" style={{ background: '#0A0A0A' }}>
      <DashboardNav />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
