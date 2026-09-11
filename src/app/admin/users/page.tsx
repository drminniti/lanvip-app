'use client'

import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import type { UserProfile } from '@/types'
import { motion } from 'framer-motion'
import { useAdmin } from '@/context/AdminContext'

export default function AdminUsersPage() {
  const { isSuperAdmin } = useAdmin()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchUsers() {
    setLoading(true)
    try {
      const db = getFirebaseDb()
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const loaded = snapshot.docs.map(d => d.data() as UserProfile)
      setUsers(loaded)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function getLicenseState(user: UserProfile) {
    if (user.plan === 'free') {
      return { label: 'Free', color: 'bg-neutral-500/20 text-neutral-400' }
    }
    
    // User is VIP
    if (user.subscriptionEndsAt) {
      const ends = (user.subscriptionEndsAt as any).toDate()
      const now = new Date()
      
      if (ends < now) {
        return { label: 'Vencido', color: 'bg-red-500/20 text-red-400' }
      } else {
        // Active Trial or Limited VIP
        return { label: 'VIP (Trial)', color: 'bg-green-500/20 text-green-400' }
      }
    }
    
    // VIP without end date = Lifetime
    return { label: 'VIP Activo', color: 'bg-[#D4AF37]/20 text-[#D4AF37]' }
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.uid.includes(search)
  )

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios (CRM)</h1>
          <p className="text-sm text-neutral-400 mt-1">Administra cuentas, roles y suscripciones.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <input
          type="text"
          placeholder="Buscar por username, nombre o UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-black/40 border-b border-white/10 text-neutral-500">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado / Plan</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <span className="inline-block w-6 h-6 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const state = getLicenseState(u)
                  return (
                    <motion.tr 
                      key={u.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.displayName || u.username}&background=random`} 
                            alt={u.username} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-white">{u.displayName}</p>
                            <a href={`/${u.username}`} target="_blank" rel="noreferrer" className="text-xs hover:text-[#D4AF37] transition-colors">
                              @{u.username}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-neutral-400'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${state.color}`}>
                          {state.label}
                        </span>
                        {u.subscriptionEndsAt && (
                          <p className="text-[10px] mt-1 text-neutral-500">
                            Expira: {(u.subscriptionEndsAt as any).toDate().toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs text-[#D4AF37] hover:text-white transition-colors bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20">
                          Gestionar
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
