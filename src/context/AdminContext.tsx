'use client'

import { createContext, useContext } from 'react'
import type { UserProfile } from '@/types'

interface AdminContextValue {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isSuperAdmin: boolean
}

export const AdminContext = createContext<AdminContextValue>({
  profile: null,
  loading: true,
  error: null,
  isSuperAdmin: false
})

export function useAdmin() {
  return useContext(AdminContext)
}
