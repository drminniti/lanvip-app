'use client'

import { useDashboard } from '@/context/DashboardContext'

export function useSubscription() {
  const { profile, loading } = useDashboard()

  const isVip = profile?.plan === 'vip'
  const plan = profile?.plan || 'free'

  return { isVip, plan, loading }
}
