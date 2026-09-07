'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card animate-pulse p-6 ${className}`}>
      <div className="h-4 w-3/4 rounded-full" style={{ background: '#2A2A2A' }} />
      <div className="h-3 w-1/2 rounded-full mt-3" style={{ background: '#222222' }} />
    </div>
  )
}

// ─── Live URL Hero Card ───────────────────────────────────────────────────────
function LiveHeroCard({ username }: { username: string }) {
  const publicUrl   = `lanvip.app/${username}`
  const fullUrl     = `https://${publicUrl}`
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard without interaction
      const el = document.createElement('input')
      el.value = fullUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.10, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-8"
      style={{
        background:  'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        border:      '1px solid rgba(212,175,55,0.18)',
        boxShadow:   '0 0 60px rgba(212,175,55,0.06)',
      }}
    >
      {/* Background glow */}
      <span
        aria-hidden="true"
        style={{
          position:    'absolute',
          top:         '-40%',
          right:       '-10%',
          width:       '55%',
          height:      '200%',
          background:  'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          filter:      'blur(32px)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 space-y-5">
        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
          />
          <span className="text-xs font-medium tracking-wide uppercase" style={{ color: '#22c55e' }}>
            En vivo
          </span>
        </div>

        {/* Main heading */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#F5F5F5' }}>
            Tu enlace está en vivo
          </h2>
          <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
            Compartí tu Micro-Landing VIP con el mundo.
          </p>
        </div>

        {/* URL display + copy */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border:     '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Chain link icon */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="#D4AF37"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>

          {/* URL text */}
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="link-public-url"
            className="flex-1 text-sm font-mono truncate transition-colors"
            style={{ color: '#D4AF37', textDecoration: 'none' }}
          >
            {publicUrl}
          </a>

          {/* Copy button */}
          <motion.button
            id="btn-copy-link"
            onClick={handleCopy}
            whileTap={{ scale: 0.94 }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.18)' : 'rgba(212,175,55,0.15)',
              border:     copied ? '1px solid rgba(34,197,94,0.40)' : '1px solid rgba(212,175,55,0.35)',
              color:      copied ? '#22c55e' : '#D4AF37',
            }}
            aria-label="Copiar enlace"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Open in new tab link */}
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="link-open-landing"
          className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-100"
          style={{ color: '#555', textDecoration: 'none', opacity: 0.7 }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ver mi landing
        </a>
      </div>
    </motion.div>
  )
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
function QuickAction({
  href,
  id,
  iconBg,
  iconColor,
  icon,
  title,
  subtitle,
}: {
  href:       string
  id:         string
  iconBg:     string
  iconColor:  string
  icon:       React.ReactNode
  title:      string
  subtitle:   string
}) {
  return (
    <a
      href={href}
      id={id}
      className="glass-card p-5 flex items-center gap-3 transition-shadow group"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>{title}</p>
        <p className="text-xs" style={{ color: '#A3A3A3' }}>{subtitle}</p>
      </div>
      {/* Chevron */}
      <svg
        className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none"
        stroke="#555"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

// ─── Dashboard Home ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  // Reads from the single DashboardContext subscription owned by the layout.
  // No new onSnapshot is created — this resolves instantly from cached state.
  const { user }                         = useAuth()
  const { profile, loading }             = useDashboard()

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-16" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      </div>
    )
  }

  const displayName = user?.displayName ?? profile?.displayName ?? 'Usuario'
  const username    = profile?.username ?? ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>
          Hola, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
          Tu Micro-Landing VIP está activa y lista para compartir.
        </p>
      </motion.div>

      {/* ── Live URL Hero ─────────────────────────────────────────────────── */}
      {username ? (
        <LiveHeroCard username={username} />
      ) : (
        // Fallback si el perfil aún no tiene username (estado transitorio)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10, duration: 0.5 }}
          className="glass-card p-8 text-center space-y-4"
        >
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-3xl"
            style={{ background: 'rgba(212,175,55,0.10)' }}
          >
            ✨
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
              Completá tu perfil
            </h2>
            <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: '#A3A3A3' }}>
              Elegí tu @username para activar tu enlace público.
            </p>
          </div>
          <a href="/dashboard/profile" id="btn-complete-profile" className="btn-accent inline-flex">
            Completar perfil
          </a>
        </motion.div>
      )}

      {/* ── Plan Actual ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.20, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card px-5 py-4 flex items-center gap-4"
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: '#A3A3A3' }}>Plan actual</p>
          <p className="text-base font-bold" style={{ color: '#F5F5F5' }}>Free</p>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(212,175,55,0.10)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.20)' }}
        >
          Activo
        </span>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="grid grid-cols-2 gap-4"
      >
        <QuickAction
          href="/dashboard/profile"
          id="btn-edit-profile"
          iconBg="rgba(212,175,55,0.12)"
          iconColor="#D4AF37"
          title="Editar perfil"
          subtitle="Nombre, bio, avatar"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/blocks"
          id="btn-manage-blocks"
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
          title="Gestionar bloques"
          subtitle="Mis bloques"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />
      </motion.div>
    </div>
  )
}
