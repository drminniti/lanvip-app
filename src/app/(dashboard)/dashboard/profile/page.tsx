import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Perfil' }

export default function ProfilePage() {
  return (
    <div className="glass-card p-8 text-center space-y-3">
      <div className="text-3xl">👤</div>
      <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>Editar Perfil</h1>
      <p className="text-sm" style={{ color: '#A3A3A3' }}>
        Disponible en la Fase 2 — Gestión de Perfil y Motor Temático.
      </p>
    </div>
  )
}
