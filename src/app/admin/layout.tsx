'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { AdminContext } from '@/context/AdminContext'
import { LanvipLogo } from '@/components/ui/LanvipLogo'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, error } = useUserProfile(user?.uid)

  useEffect(() => {
    if (authLoading || profileLoading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (profile && profile.role !== 'admin' && profile.role !== 'superadmin') {
      router.replace('/dashboard')
    }
  }, [user, authLoading, profile, profileLoading, router])

  const isLoading = authLoading || profileLoading

  if (isLoading || !profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <span className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
    )
  }

  const isSuperAdmin = profile.role === 'superadmin'

  return (
    <AdminContext.Provider value={{ profile, loading: isLoading, error, isSuperAdmin }}>
      <div className="flex min-h-screen bg-[#0A0A0A]">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-[#333333] bg-[#141414] flex flex-col p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 mb-10">
            <LanvipLogo size={28} />
            <span className="font-bold text-white tracking-wide">Super Admin</span>
          </div>

          <nav className="flex-1 space-y-2">
            <a href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Métricas
            </a>
            <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 font-medium hover:bg-white/5 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuarios (CRM)
            </a>
          </nav>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mi perfil
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  )
}
