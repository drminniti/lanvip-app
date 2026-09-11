'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { LanvipLogo } from '@/components/ui/LanvipLogo'
import { useSubscription } from '@/hooks/useSubscription'
import { usePaywall } from '@/context/PaywallContext'

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href:  '/dashboard',
    label: 'Mi Landing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/profile',
    label: 'Perfil',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/blocks',
    label: 'Bloques',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href:  '/dashboard/analytics',
    label: 'Métricas Avanzadas',
    isPremium: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href:  '#domain', // Placeholder href since it's just a teaser
    label: 'Dominio Personalizado',
    isPremium: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
]

function NavItem({
  item,
  isActive,
  isVip,
  onUpgradeClick,
}: {
  item: typeof NAV_ITEMS[number]
  isActive: boolean
  isVip: boolean
  onUpgradeClick: () => void
}) {
  const isLocked = item.isPremium && !isVip

  if (isLocked) {
    return (
      <button
        onClick={onUpgradeClick}
        title={item.label}
        className={`relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-200 text-neutral-500 hover:text-neutral-300 group`}
      >
        <span className="relative z-10">{item.icon}</span>
        {/* Lock Icon Overlay */}
        <div className="absolute top-1 right-1 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-[#D4AF37]/30">
          <svg className="w-2.5 h-2.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
      title={item.label}
      className={`relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-200 ${
        isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="nav-active-desktop"
          className="absolute inset-0 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10">{item.icon}</span>
    </Link>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useAuth()
  const { profile } = useDashboard()
  const { isVip } = useSubscription()
  const { openUpgradeModal } = usePaywall()
  const username = profile?.username ?? null

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  async function handleLogoutConfirm() {
    await logout()
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  function handleLogoutClick() {
    setIsLogoutModalOpen(true)
  }

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[88px] shrink-0 h-screen sticky top-0 py-6 items-center gap-4 backdrop-blur-xl"
        style={{
          background:  'rgba(26,26,26,0.80)',
          borderRight: '1px solid #333333',
        }}
      >
        {/* Logo */}
        <div className="mb-4">
          <LanvipLogo size={32} />
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-3 w-full">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isVip={isVip}
              onUpgradeClick={openUpgradeModal}
            />
          ))}
        </nav>

        {/* Ver mi landing */}
        {username && (
          <a
            id="btn-view-public-profile-sidebar"
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Mi link"
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 group mb-2"
            style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.07)' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogoutClick}
          title="Cerrar sesión"
          className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <div
          className="mx-3 mb-3 px-2 py-2 flex items-stretch justify-around rounded-3xl backdrop-blur-2xl"
          style={{
            background: 'rgba(26,26,26,0.85)',
            border:     '1px solid #333333',
            boxShadow:  '0 8px 30px rgb(0 0 0 / 0.40)',
          }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            const isLocked = item.isPremium && !isVip

            if (isLocked) {
              return (
                <button
                  key={item.href}
                  onClick={openUpgradeModal}
                  title={item.label}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 text-neutral-500 hover:text-neutral-300`}
                >
                  <motion.span whileTap={{ scale: 0.85 }} className="block relative z-10">
                    {item.icon}
                  </motion.span>
                  <div className="absolute top-1 right-1 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-[#D4AF37]/30">
                    <svg className="w-2.5 h-2.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                title={item.label}
                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-mobile"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <motion.span whileTap={{ scale: 0.85 }} className="block relative z-10">
                  {item.icon}
                </motion.span>
              </Link>
            )
          })}
          {/* Ver landing pública — mobile */}
          {username && (
            <a
              id="btn-view-public-profile-mobile"
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Mi link"
              className="flex items-center justify-center p-3 rounded-2xl transition-all duration-200"
              style={{ color: '#D4AF37' }}
            >
              <motion.span whileTap={{ scale: 0.85 }} className="block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.span>
            </a>
          )}
          {/* Cerrar sesión — mobile */}
          <button
            id="btn-logout-mobile"
            onClick={handleLogoutClick}
            title="Cerrar sesión"
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <motion.span whileTap={{ scale: 0.85 }} className="block relative z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.span>
          </button>
        </div>
      </nav>

      {/* ── Logout Modal (Glassmorphism) ────────────────────────────── */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-[90%] max-w-sm flex flex-col gap-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <h3 className="text-white font-semibold text-lg">Cerrar sesión</h3>
                <p className="text-neutral-400 text-sm mt-1">¿Estás seguro de que deseas salir de LanVip?</p>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
