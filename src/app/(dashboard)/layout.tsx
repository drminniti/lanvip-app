'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'
import DashboardNav from './_components/DashboardNav'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'

// Note: metadata can't be exported from a 'use client' component.
// Title is set per-page instead.

/**
 * Dashboard layout guard: checks hasCompletedOnboarding after mount.
 * If user hasn't completed onboarding, redirects to /onboarding.
 * This handles Google OAuth users who enter the dashboard directly
 * (e.g., via a bookmarked URL) without completing onboarding.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.uid)

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
