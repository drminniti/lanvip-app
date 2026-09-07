'use client'

/**
 * DashboardContext — single Firestore onSnapshot subscription for the dashboard.
 *
 * Problem it solves:
 *   DashboardLayout, DashboardNav, and every dashboard page were each calling
 *   `useUserProfile(uid)`, creating 3+ independent onSnapshot listeners for the
 *   same document. On client-side navigation the page's listener would restart
 *   from loading=true and sometimes never resolve, causing an infinite skeleton.
 *
 * Solution:
 *   DashboardLayout owns the single subscription and provides it to all
 *   descendants via this context. Pages and the nav consume `useDashboard()`
 *   instead of calling `useUserProfile()` directly.
 */

import { createContext, useContext } from 'react'
import type { UserProfile } from '@/types'

interface DashboardContextValue {
  profile:  UserProfile | null
  loading:  boolean
  error:    string | null
}

export const DashboardContext = createContext<DashboardContextValue>({
  profile: null,
  loading: true,
  error:   null,
})

export function useDashboard(): DashboardContextValue {
  return useContext(DashboardContext)
}
