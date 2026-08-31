'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserBlocks } from '@/hooks/useUserBlocks'



// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent,
  delay,
}: {
  label:  string
  value:  number | string
  icon:   string
  accent: string
  delay:  number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      className="glass-card p-6 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}15`, color: accent }}
        >
          En vivo
        </span>
      </div>
      <p
        className="text-3xl font-bold tracking-tight mt-1"
        style={{ color: '#F5F5F5' }}
      >
        {value.toLocaleString('es-AR')}
      </p>
      <p className="text-sm" style={{ color: '#A3A3A3' }}>{label}</p>
    </motion.div>
  )
}

// ─── Block performance row ────────────────────────────────────────────────────
function BlockRow({
  title,
  clickCount,
  maxClicks,
  accent,
  index,
}: {
  title:      string
  clickCount: number
  maxClicks:  number
  accent:     string
  index:      number
}) {
  const pct = maxClicks > 0 ? Math.round((clickCount / maxClicks) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06, type: 'spring', stiffness: 260 }}
      className="flex items-center gap-3"
    >
      {/* Rank */}
      <span
        className="text-xs font-bold w-5 text-center flex-shrink-0"
        style={{ color: '#555' }}
      >
        {index + 1}
      </span>

      {/* Bar + label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate mb-1" style={{ color: '#E0E0E0' }}>
          {title}
        </p>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.4 + index * 0.06, duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}99, ${accent})` }}
          />
        </div>
      </div>

      {/* Count */}
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: accent }}>
        {clickCount}
      </span>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user }              = useAuth()
  const { profile, loading: pLoading } = useUserProfile(user?.uid)
  const { blocks,  loading: bLoading } = useUserBlocks(user?.uid)

  const accent     = '#D4AF37'
  const isLoading  = pLoading || bLoading

  // Derived stats
  const totalViews  = profile?.views ?? 0
  const totalClicks = blocks.reduce((sum, b) => sum + (b.clickCount ?? 0), 0)
  const activeCount = blocks.filter(b => b.isActive).length

  // Blocks sorted by clickCount desc (only active ones)
  const topBlocks = [...blocks]
    .filter(b => b.isActive)
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 8)

  const maxClicks = topBlocks[0]?.clickCount ?? 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${accent} transparent transparent transparent` }} />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>
          Analíticas
        </h1>
        <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
          Métricas en tiempo real de tu Micro-Landing VIP
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Visitas totales"
          value={totalViews}
          icon="👁"
          accent={accent}
          delay={0.05}
        />
        <StatCard
          label="Clics totales"
          value={totalClicks}
          icon="🔗"
          accent={accent}
          delay={0.12}
        />
        <StatCard
          label="Bloques activos"
          value={activeCount}
          icon="⚡"
          accent={accent}
          delay={0.19}
        />
      </div>

      {/* Top blocks */}
      {topBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
            Performance por bloque
          </h2>
          <div className="space-y-4 pt-1">
            {topBlocks.map((block, i) => (
              <BlockRow
                key={block.id}
                title={block.content.title}
                clickCount={block.clickCount ?? 0}
                maxClicks={maxClicks}
                accent={accent}
                index={i}
              />
            ))}
          </div>

          {topBlocks.every(b => (b.clickCount ?? 0) === 0) && (
            <p className="text-xs text-center pt-2" style={{ color: '#555' }}>
              Los clics aparecerán aquí cuando los visitantes interactúen con tu landing.
            </p>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {blocks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-10 text-center space-y-3"
        >
          <div className="text-4xl">📊</div>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>
            Agregá bloques a tu landing para ver las métricas de clics.
          </p>
          <a
            href="/dashboard/blocks"
            className="btn-accent inline-flex mt-2"
          >
            Ir a Bloques
          </a>
        </motion.div>
      )}

    </div>
  )
}
