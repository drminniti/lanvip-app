'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from './_components/DashboardNav'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { DashboardContext } from '@/context/DashboardContext'
import { PaywallProvider } from '@/context/PaywallContext'
import PlanNotificationModal from './_components/PlanNotificationModal'

/**
 * Dashboard layout guard: checks hasCompletedOnboarding after mount.
 * If user hasn't completed onboarding, redirects to /onboarding.
 *
 * ── Single subscription architecture ────────────────────────────────────────
 * This layout owns the ONE AND ONLY useUserProfile subscription for the entire
 * dashboard. It passes { profile, loading, error } via DashboardContext so
 * that DashboardNav, DashboardPage and every other page can call
 * useDashboard() instead of creating their own onSnapshot listeners.
 *
 * This eliminates the race condition where page-level subscriptions would
 * restart from loading=true on every client-side navigation and get stuck.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading: authLoading }         = useAuth()
  const { profile, loading: profileLoading, error } = useUserProfile(user?.uid)

  useEffect(() => {
    if (authLoading || profileLoading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (profile && !profile.hasCompletedOnboarding) {
      router.replace('/onboarding')
    }
  }, [user, authLoading, profile, profileLoading, router])

  return (
    <DashboardContext.Provider value={{ profile, loading: authLoading || profileLoading, error }}>
      <PaywallProvider>
        <div className="flex min-h-screen" style={{ background: '#0A0A0A' }}>
          <DashboardNav />
          <main className="flex-1 pb-24 md:pb-8">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
              {children}
            </div>
          </main>
          {profile && <PlanNotificationModal profile={profile} />}
        </div>
      </PaywallProvider>
    </DashboardContext.Provider>
  )
}

