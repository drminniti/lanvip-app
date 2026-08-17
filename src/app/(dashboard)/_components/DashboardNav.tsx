'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { logout } from '@/lib/auth'

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
    label: 'Analíticas',
    pro:   true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({
  item,
  isActive,
  compact = false,
}: {
  item: typeof NAV_ITEMS[number]
  isActive: boolean
  compact?: boolean
}) {
  return (
    <Link
      href={item.href}
      id={`nav-${item.label.toLowerCase()}`}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200
        ${compact ? 'justify-center' : ''}
        ${
          isActive
            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5'
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-2xl bg-brand-500/10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10">{item.icon}</span>
      {!compact && (
        <span className="relative z-10 flex items-center gap-2">
          {item.label}
          {item.pro && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-500">
              PRO 🔒
            </span>
          )}
        </span>
      )}
    </Link>
  )
}

// ─── Main DashboardNav Component ──────────────────────────────────────────────
export default function DashboardNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await logout()
    // Clear session cookie
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 p-4 gap-2 border-r border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
        {/* Logo */}
        <div className="px-3 py-3 mb-2">
          <span className="text-xl font-bold gradient-text tracking-tight">Lanvip</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </aside>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-area-inset-bottom">
        <div className="glass-card mx-3 mb-3 px-2 py-2 flex items-center justify-around rounded-3xl border-0 shadow-lanvip-lg">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-200
                ${
                  pathname === item.href
                    ? 'text-brand-500'
                    : 'text-gray-400 hover:text-gray-700'
                }
              `}
            >
              <motion.span whileTap={{ scale: 0.85 }} className="block">
                {item.icon}
              </motion.span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
