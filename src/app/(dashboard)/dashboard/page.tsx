'use client'

import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card animate-pulse ${className}`}>
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded-full" />
      <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded-full mt-3" />
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  delay,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glass-card p-5 flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard className="p-6 h-24" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="p-5 h-20" />
          <SkeletonCard className="p-5 h-20" />
        </div>
      </div>
    )
  }

  const displayName = user?.displayName ?? 'Usuario'

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Hola, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aquí está el resumen de tu Micro-Landing VIP.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Visitas totales"
          value="—"
          delay={0.1}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatCard
          label="Clics totales"
          value="—"
          delay={0.15}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
          }
        />
        <StatCard
          label="Bloques activos"
          value="0"
          delay={0.2}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />
        <StatCard
          label="Plan actual"
          value="Free"
          delay={0.25}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
      </div>

      {/* Empty State – Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card p-8 text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto text-3xl">
          ✨
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tu landing está en blanco
          </h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            Agreguemos tu primer bloque para empezar a destacar.
          </p>
        </div>
        <motion.a
          href="/dashboard/blocks"
          id="btn-add-first-block"
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 text-sm transition-colors shadow-lanvip-glow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Añadir primer bloque
        </motion.a>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="grid grid-cols-2 gap-4"
      >
        <a
          href="/dashboard/profile"
          id="btn-edit-profile"
          className="glass-card p-5 flex items-center gap-3 hover:shadow-lanvip transition-shadow group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Editar perfil</p>
            <p className="text-xs text-gray-400">Nombre, bio, avatar</p>
          </div>
        </a>

        <a
          href="/dashboard/blocks"
          id="btn-manage-blocks"
          className="glass-card p-5 flex items-center gap-3 hover:shadow-lanvip transition-shadow group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Gestionar bloques</p>
            <p className="text-xs text-gray-400">Grilla Bento</p>
          </div>
        </a>
      </motion.div>
    </div>
  )
}
