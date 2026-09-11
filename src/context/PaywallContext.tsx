'use client'

import React, { createContext, useContext, useState } from 'react'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

interface PaywallContextValue {
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
}

export const PaywallContext = createContext<PaywallContextValue>({
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
})

export function usePaywall() {
  return useContext(PaywallContext)
}

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <PaywallContext.Provider value={{
      openUpgradeModal: () => setIsOpen(true),
      closeUpgradeModal: () => setIsOpen(false)
    }}>
      {children}
      <UpgradeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </PaywallContext.Provider>
  )
}
