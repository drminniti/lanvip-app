'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { logout } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

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
    icon:  null,
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
    icon:  null,
  },
]

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({
  item,
  isActive,
}: {
  item: typeof NAV_ITEMS[number]
  isActive: boolean
}) {
  return (
    <Link
      href={item.href}
      id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
      style={{
        color: isActive ? '#F5F5F5' : '#A3A3A3',
      }}
    >
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-2xl"
          style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      {item.icon && <span className="relative z-10">{item.icon}</span>}
      <span className={`relative z-10 flex items-center gap-2 ${!item.icon ? 'ml-8' : ''}`}>
        {item.label}
      </span>
    </Link>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useAuth()
  const { profile } = useDashboard()
  const username = profile?.username ?? null

  async function handleLogout() {
    await logout()
    document.cookie = '__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
  }

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 p-4 gap-2 backdrop-blur-xl"
        style={{
          background:  'rgba(26,26,26,0.80)',
          borderRight: '1px solid #333333',
        }}
      >
        {/* Logo */}
        <div className="px-3 py-3 mb-2">
          <div className="flex items-center gap-2">
            <LanvipLogo size={30} />
            <span className="text-xl font-bold gradient-text tracking-tight">Lanvip</span>
          </div>
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

        {/* Ver mi landing */}
        {username && (
          <a
            id="btn-view-public-profile-sidebar"
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group"
            style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.07)' }}
          >
            <span className="flex-1 truncate text-center">/{username}</span>
          </a>
        )}

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
          style={{ color: '#A3A3A3' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#EF4444'
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#A3A3A3'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
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
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              id={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex flex-col items-center justify-start gap-1 px-1 py-2 rounded-2xl text-[11px] leading-tight text-center font-medium transition-all duration-200 ${!item.icon ? 'pt-4' : ''}`}
              style={{ color: pathname === item.href ? '#F5F5F5' : '#A3A3A3', width: '4.5rem' }}
            >
              {item.icon && (
                <motion.span whileTap={{ scale: 0.85 }} className="block flex-shrink-0">
                  {item.icon}
                </motion.span>
              )}
              <span>{item.label}</span>
            </Link>
          ))}
          {/* Ver landing pública — mobile */}
          {username && (
            <a
              id="btn-view-public-profile-mobile"
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-start gap-1 px-1 py-2 pt-4 rounded-2xl text-[11px] leading-tight text-center font-medium transition-all duration-200"
              style={{ color: '#D4AF37', width: '4.5rem' }}
            >
              <span>Mi link</span>
            </a>
          )}
          {/* Cerrar sesión — mobile */}
          <button
            id="btn-logout-mobile"
            onClick={handleLogout}
            className="flex flex-col items-center justify-start gap-1 px-1 py-2 rounded-2xl text-[11px] leading-tight text-center font-medium transition-all duration-200"
            style={{ color: '#A3A3A3', width: '4.5rem' }}
          >
            <motion.span whileTap={{ scale: 0.85 }} className="block flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.span>
            <span>Salir</span>
          </button>
        </div>
      </nav>
    </>
  )
}
