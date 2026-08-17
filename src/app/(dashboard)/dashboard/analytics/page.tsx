import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analíticas PRO' }

export default function AnalyticsPage() {
  return (
    <div className="glass-card p-8 text-center space-y-3">
      <div className="text-3xl">📊</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analíticas</h1>
      <span className="inline-block text-xs font-bold px-2 py-1 rounded-full bg-brand-500/15 text-brand-500">
        PRO 🔒 — Próximamente
      </span>
      <p className="text-sm text-gray-400">
        Las métricas avanzadas estarán disponibles en la Fase 5 y se desbloquean con el plan Pro.
      </p>
    </div>
  )
}
