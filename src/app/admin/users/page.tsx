'use client'

import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import type { UserProfile, UserRole } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/context/AdminContext'

export default function AdminUsersPage() {
  const { isSuperAdmin } = useAdmin()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [trialDays, setTrialDays] = useState('14')
  const [isUpdating, setIsUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

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
    if (!user.plan || user.plan === 'free') {
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

  async function handleUpdateUser(uid: string, data: Partial<UserProfile>) {
    setIsUpdating(true)
    try {
      const db = getFirebaseDb()
      await updateDoc(doc(db, 'users', uid), data)
      // Update local state
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...data } : u))
      
      // Show success message
      setSuccessMsg('¡Usuario actualizado con éxito!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Error al actualizar usuario')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleGrantTrial() {
    if (!selectedUser) return
    const days = parseInt(trialDays)
    if (isNaN(days) || days <= 0) return alert('Días inválidos')
    
    const end = new Date()
    end.setDate(end.getDate() + days)
    
    await handleUpdateUser(selectedUser.uid, {
      plan: 'vip',
      subscriptionEndsAt: Timestamp.fromDate(end)
    })
  }

  async function handleRoleChange(role: UserRole) {
    if (!selectedUser) return
    await handleUpdateUser(selectedUser.uid, { role })
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
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="text-xs text-[#D4AF37] hover:text-white transition-colors bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20"
                        >
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

      {/* Management Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#141414] border border-[#333333] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Success Alert */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-green-500/20 border-b border-green-500/30 px-6 py-3"
                  >
                    <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {successMsg}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="p-6 border-b border-[#333333] flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${selectedUser.displayName || selectedUser.username}&background=random`} 
                    alt={selectedUser.username} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                  />
                  <div>
                    <h2 className="font-bold text-white text-lg leading-tight">{selectedUser.displayName}</h2>
                    <p className="text-sm text-neutral-400">@{selectedUser.username}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* 1. Trial Management */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Otorgar Trial VIP
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="number" 
                        value={trialDays} 
                        onChange={e => setTrialDays(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors"
                      />
                      <span className="absolute right-4 top-2.5 text-sm text-neutral-500">días</span>
                    </div>
                    <button 
                      onClick={handleGrantTrial}
                      disabled={isUpdating}
                      className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Aplicar Trial
                    </button>
                  </div>
                </div>

                {/* 2. Manual Upgrade/Downgrade */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Modificar Plan Manualmente</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleUpdateUser(selectedUser.uid, { plan: 'vip', subscriptionEndsAt: null })}
                      disabled={isUpdating || selectedUser.plan === 'vip' && !selectedUser.subscriptionEndsAt}
                      className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hacer VIP (Lifetime)
                    </button>
                    <button 
                      onClick={() => handleUpdateUser(selectedUser.uid, { plan: 'free', subscriptionEndsAt: null })}
                      disabled={isUpdating || selectedUser.plan === 'free'}
                      className="bg-white/5 text-white hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Degradar a Free
                    </button>
                  </div>
                </div>

                {/* 3. Liberar URL */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-2 text-red-400">Moderación</h3>
                  <p className="text-xs text-neutral-400 mb-4">Liberar el @username permite que otro usuario lo registre.</p>
                  <button 
                    onClick={async () => {
                      if(confirm('¿Seguro que deseas liberar la URL de este usuario?')) {
                        setIsUpdating(true)
                        try {
                          const db = getFirebaseDb()
                          // 1. Borrar de la colección de usernames
                          if (selectedUser.username) {
                            const { deleteDoc } = await import('firebase/firestore')
                            await deleteDoc(doc(db, 'usernames', selectedUser.username))
                          }
                          // 2. Limpiar del perfil
                          await updateDoc(doc(db, 'users', selectedUser.uid), { username: '', hasCompletedOnboarding: false })
                          // Actualizar estado local
                          setUsers(prev => prev.map(u => u.uid === selectedUser.uid ? { ...u, username: '', hasCompletedOnboarding: false } : u))
                          setSelectedUser(prev => prev ? { ...prev, username: '', hasCompletedOnboarding: false } : null)
                        } catch (err) {
                          console.error('Error al liberar URL:', err)
                          alert('Error al liberar la URL')
                        } finally {
                          setIsUpdating(false)
                        }
                      }
                    }}
                    disabled={isUpdating || !selectedUser.username}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full"
                  >
                    Liberar Username (@{selectedUser.username})
                  </button>
                </div>

                {/* 4. Roles (Superadmin only) */}
                {isSuperAdmin && (
                  <div className="bg-black/40 rounded-xl p-5 border border-purple-500/30">
                    <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Asignar Rol (Superadmin)
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">Privilegios de Administrador</p>
                        <p className="text-xs text-neutral-500 mt-1">Permite acceso a este panel</p>
                      </div>
                      <div className="flex bg-black/50 p-1 rounded-lg border border-white/5">
                        <button 
                          onClick={() => handleRoleChange('user')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedUser.role !== 'admin' && selectedUser.role !== 'superadmin' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}
                        >
                          User
                        </button>
                        <button 
                          onClick={() => handleRoleChange('admin')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'text-neutral-500 hover:text-white'}`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
