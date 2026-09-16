'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { useSubscription } from '@/hooks/useSubscription'
import { useAnalytics } from '@/hooks/useAnalytics'
import { usePaywall } from '@/context/PaywallContext'

const ACCENT = '#D4AF37'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent,
  delay,
  onInfoClick,
}: {
  label:  string
  value:  number | string
  icon:   string
  accent: string
  delay:  number
  onInfoClick?: () => void
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
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm" style={{ color: '#A3A3A3' }}>{label}</p>
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="w-4 h-4 rounded-full flex items-center justify-center border border-[#555] text-[#A3A3A3] hover:text-white hover:border-white transition-colors"
            title="Información"
          >
            <span className="text-[10px] font-bold">i</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

function InfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 max-w-md w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-[#D4AF37]">ℹ</span> ¿Qué es el CTR Único?
            </h3>
            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
              El <strong>Click-Through Rate (CTR)</strong> mide el porcentaje de visitantes que hicieron clic en alguno de tus enlaces.
            </p>
            <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-4">
              <p className="text-xs text-neutral-400 mb-1">Fórmula:</p>
              <p className="text-sm font-mono text-[#D4AF37]">Usuarios Únicos con clic / Visitas Únicas</p>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              <strong>Ejemplo:</strong> Si 10 personas distintas visitan tu perfil (10 visitas únicas) y 3 de ellas hacen clic en algún enlace, tu CTR será del <strong>30%</strong>, sin importar si esas 3 personas hicieron clic 20 veces en total.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
      <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: '#555' }}>
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate mb-1" style={{ color: '#E0E0E0' }}>{title}</p>
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
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: accent }}>
        {clickCount}
      </span>
    </motion.div>
  )
}

// ─── VIP: Bar chart (SVG) ─────────────────────────────────────────────────────
function DailyBarChart({ daily, accent }: { daily: { date: string; views: number }[]; accent: string }) {
  const max = Math.max(...daily.map(d => d.views), 1)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-1.5 h-28 min-w-0" style={{ minWidth: daily.length * 28 }}>
        {daily.map((day, i) => {
          const heightPct = (day.views / max) * 100
          const label = day.date.slice(5) // 'MM-DD'
          const isToday = day.date === new Date().toISOString().slice(0, 10)
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-black/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap">
                  {day.views} vista{day.views !== 1 ? 's' : ''}
                </div>
              </div>
              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, day.views > 0 ? 4 : 0)}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
                  className="w-full rounded-t-sm"
                  style={{
                    background: isToday
                      ? accent
                      : `${accent}55`,
                    minHeight: day.views > 0 ? 3 : 0,
                    maxHeight: '80px',
                  }}
                />
              </div>
              {/* Label */}
              <span className="text-[9px] text-neutral-500 truncate w-full text-center">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── VIP: Breakdown row ───────────────────────────────────────────────────────
function BreakdownRow({ label, pct, count, accent }: { label: string; pct: number; count: number; accent: string }) {
  // Country flag emoji from 2-letter ISO code
  const flag = /^[A-Z]{2}$/.test(label)
    ? String.fromCodePoint(...[...label].map(c => 0x1F1E0 - 65 + c.charCodeAt(0)))
    : null

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-28 truncate flex-shrink-0 flex items-center gap-1.5" style={{ color: '#E0E0E0' }}>
        {flag && <span>{flag}</span>}
        <span className="truncate capitalize">{label === 'Unknown' ? 'Desconocido' : label}</span>
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `${accent}99` }}
        />
      </div>
      <span className="text-xs font-semibold flex-shrink-0 w-10 text-right" style={{ color: accent }}>
        {pct}%
      </span>
    </div>
  )
}

// ─── VIP Paywall placeholder ──────────────────────────────────────────────────
function VipAnalyticsPaywall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border"
      style={{ borderColor: `${ACCENT}30` }}
    >
      {/* Blurred fake content preview */}
      <div className="p-6 space-y-4 select-none pointer-events-none" style={{ filter: 'blur(4px)', opacity: 0.4 }}>
        <div className="flex gap-2 mb-2">
          {['7 días', '30 días'].map(l => (
            <div key={l} className="px-3 py-1 rounded-lg text-xs bg-white/10 text-white">{l}</div>
          ))}
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {[3, 7, 5, 9, 4, 12, 8].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${(h / 12) * 100}%`, background: `${ACCENT}55` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {['📱 Mobile 70%', '🖥 Desktop 30%', '🇦🇷 AR 60%', '🇺🇸 US 25%'].map(t => (
            <div key={t} className="h-4 rounded bg-white/10 text-xs text-white px-2 flex items-center">{t}</div>
          ))}
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.85))' }}
      >
        <div className="text-center px-4">
          <div className="text-3xl mb-2">👑</div>
          <p className="font-bold text-white text-base">Analíticas Avanzadas</p>
          <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
            Gráfico histórico, países, dispositivos y referrers.<br />Disponible en el plan VIP.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-transform hover:scale-105 active:scale-95"
          style={{ background: ACCENT, color: '#000' }}
        >
          Upgrade a VIP
        </button>
      </div>
    </motion.div>
  )
}

// ─── VIP Analytics Panel ──────────────────────────────────────────────────────
function VipAnalyticsPanel({ uid }: { uid: string }) {
  const [period, setPeriod] = useState<7 | 30>(7)
  const analytics = useAnalytics(uid, period)

  if (analytics.loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-48">
        <span className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-5"
    >
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
          Analíticas Avanzadas VIP
        </h2>
        <div className="flex gap-1.5">
          {([7, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={period === d
                ? { background: ACCENT, color: '#000' }
                : { background: 'rgba(255,255,255,0.08)', color: '#A3A3A3' }}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium" style={{ color: '#E0E0E0' }}>Visitas diarias</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
            {analytics.totalViews.toLocaleString('es-AR')} total
          </span>
        </div>
        <DailyBarChart daily={analytics.daily} accent={ACCENT} />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A3A3A3' }}>Dispositivos</p>
          {analytics.devices.length > 0
            ? analytics.devices.map(d => <BreakdownRow key={d.label} label={d.label} pct={d.pct} count={d.count} accent={ACCENT} />)
            : <p className="text-xs" style={{ color: '#555' }}>Sin datos aún</p>
          }
        </div>

        {/* Countries */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A3A3A3' }}>Países</p>
          {analytics.countries.length > 0
            ? analytics.countries.map(c => <BreakdownRow key={c.label} label={c.label} pct={c.pct} count={c.count} accent={ACCENT} />)
            : <p className="text-xs" style={{ color: '#555' }}>Sin datos aún</p>
          }
        </div>

        {/* Referrers */}
        <div className="glass-card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A3A3A3' }}>Fuentes de tráfico</p>
          {analytics.referrers.length > 0
            ? analytics.referrers.map(r => <BreakdownRow key={r.label} label={r.label} pct={r.pct} count={r.count} accent={ACCENT} />)
            : <p className="text-xs" style={{ color: '#555' }}>Sin datos aún</p>
          }
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: pLoading } = useUserProfile(user?.uid)
  const { blocks,  loading: bLoading } = useUserBlocks(user?.uid)
  const { isVip }             = useSubscription()
  const { openUpgradeModal }  = usePaywall()
  const [showCtrInfo, setShowCtrInfo] = useState(false)

  const isLoading = authLoading || pLoading || bLoading

  // Derived stats (Free + VIP)
  const totalViews  = profile?.views ?? 0
  const totalClicks = blocks.reduce((sum, b) => sum + (b.clickCount ?? 0), 0)
  const activeCount = blocks.filter(b => b.isActive).length
  const uniqueClicks = profile?.uniqueClicks ?? Math.min(totalClicks, totalViews)
  const ctr = totalViews > 0
    ? `${((uniqueClicks / totalViews) * 100).toFixed(1)} %`
    : '—'

  const topBlocks = [...blocks]
    .filter(b => b.isActive)
    .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
    .slice(0, 8)
  const maxClicks = topBlocks[0]?.clickCount ?? 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
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
        <h1 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>Analíticas</h1>
        <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
          Métricas en tiempo real de tu Micro-Landing VIP
        </p>
      </motion.div>

      {/* KPI cards — Free + VIP */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitas totales" value={totalViews}  icon="👁"  accent={ACCENT} delay={0.05} />
        <StatCard label="Clics totales"   value={totalClicks} icon="🔗"  accent={ACCENT} delay={0.12} />
        <StatCard label="Bloques activos" value={activeCount} icon="⚡"  accent={ACCENT} delay={0.19} />
        <StatCard
          label="CTR Único"
          value={ctr}
          icon="📈"
          accent={ACCENT}
          delay={0.26}
          onInfoClick={() => setShowCtrInfo(true)}
        />
      </div>

      <InfoModal isOpen={showCtrInfo} onClose={() => setShowCtrInfo(false)} />

      {/* Top blocks — Free + VIP */}
      {topBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
            Performance por bloque
          </h2>
          <div className="space-y-4 pt-1">
            {topBlocks.map((block, i) => (
              <BlockRow
                key={block.id}
                title={block.content.title}
                clickCount={block.clickCount ?? 0}
                maxClicks={maxClicks}
                accent={ACCENT}
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

      {/* Advanced analytics — VIP only */}
      {isVip && profile
        ? <VipAnalyticsPanel uid={profile.uid} />
        : !isVip && <VipAnalyticsPaywall onUpgrade={openUpgradeModal} />
      }

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
          <a href="/dashboard/blocks" className="btn-accent inline-flex mt-2">
            Ir a Bloques
          </a>
        </motion.div>
      )}

    </div>
  )
}
