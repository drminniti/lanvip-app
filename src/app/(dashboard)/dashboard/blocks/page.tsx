import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bloques Bento' }

export default function BlocksPage() {
  return (
    <div className="glass-card p-8 text-center space-y-3">
      <div className="text-3xl">⬜</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Motor de Bloques Bento</h1>
      <p className="text-sm text-gray-400">Disponible en la Fase 3 — Motor de Bloques Bento (CRUD).</p>
    </div>
  )
}
