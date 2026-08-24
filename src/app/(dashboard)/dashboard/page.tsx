'use client'

import { useAuth } from '@/context/AuthContext'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { motion } from 'framer-motion'

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card animate-pulse p-6 ${className}`}>
      <div className="h-4 w-3/4 rounded-full" style={{ background: '#2A2A2A' }} />
      <div className="h-3 w-1/2 rounded-full mt-3" style={{ background: '#222222' }} />
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
      {/* Icon container — accent #D4AF37 */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
      >
        {icon}
      </div>
      <div>
        {/* Text Secondary — #A3A3A3 */}
        <p className="text-xs font-medium" style={{ color: '#A3A3A3' }}>{label}</p>
        {/* Text Primary — #F5F5F5 */}
        <p className="text-2xl font-bold tabular-nums" style={{ color: '#F5F5F5' }}>{value}</p>
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
  href: string
  id: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  title: string
  subtitle: string
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
    </a>
  )
}

// ─── Dashboard Home ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { blocks, loading: blocksLoading } = useUserBlocks(user?.uid)

  if (loading || blocksLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard className="h-24" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      </div>
    )
  }

  const displayName  = user?.displayName ?? 'Usuario'
  const activeBlocks = blocks.filter(b => b.isActive).length
  const hasBlocks    = blocks.length > 0

  return (
    <div className="space-y-8">
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
          Aquí está el resumen de tu Micro-Landing VIP.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Visitas totales"  value="—"           delay={0.10} icon={<EyeIcon />} />
        <StatCard label="Clics totales"    value="—"           delay={0.15} icon={<ClickIcon />} />
        <StatCard label="Bloques activos"  value={activeBlocks} delay={0.20} icon={<GridIcon />} />
        <StatCard label="Plan actual"      value="Free"        delay={0.25} icon={<BadgeIcon />} />
      </div>

      {/* Empty State — solo si no hay bloques */}
      {!hasBlocks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
              Tu landing está en blanco
            </h2>
            <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: '#A3A3A3' }}>
              Agreguemos tu primer bloque para empezar a destacar.
            </p>
          </div>
          <motion.a
            href="/dashboard/blocks"
            id="btn-add-first-block"
            whileTap={{ scale: 0.97 }}
            className="btn-accent inline-flex"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Añadir primer bloque
          </motion.a>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
          subtitle="Grilla Bento"
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

// ─── Icon Components ──────────────────────────────────────────────────────────
function EyeIcon()   { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }
function ClickIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg> }
function GridIcon()  { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> }
function BadgeIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> }
