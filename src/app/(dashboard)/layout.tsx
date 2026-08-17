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
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Sidebar (desktop) + Bottom tab (mobile) */}
      <DashboardNav />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
