import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analíticas PRO' }

export default function AnalyticsPage() {
  return (
    <div className="glass-card p-8 text-center space-y-3">
      <div className="text-3xl">📊</div>
      <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>Analíticas</h1>
      <span
        className="inline-block text-xs font-bold px-2 py-1 rounded-full"
        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
      >
        PRO 🔒 — Próximamente
      </span>
      <p className="text-sm" style={{ color: '#A3A3A3' }}>
        Las métricas avanzadas estarán disponibles en la Fase 5 y se desbloquean con el plan Pro.
      </p>
    </div>
  )
}
