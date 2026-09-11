'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import type { UserProfile } from '@/types'
import { motion } from 'framer-motion'

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Date filter state
  const [dateRange, setDateRange] = useState<'7' | '30' | 'all' | 'custom'>('30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const db = getFirebaseDb()
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const loaded = snapshot.docs.map(doc => doc.data() as UserProfile)
        setUsers(loaded)
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Filter users based on date
  const filteredUsers = useMemo(() => {
    if (dateRange === 'all') return users

    let start: Date, end: Date = new Date()
    
    if (dateRange === 'custom') {
      if (!customStartDate || !customEndDate) return users
      start = new Date(customStartDate)
      end = new Date(customEndDate)
      end.setHours(23, 59, 59, 999)
    } else {
      start = new Date()
      start.setDate(start.getDate() - parseInt(dateRange))
    }

    return users.filter(u => {
      if (!u.createdAt) return false
      const created = (u.createdAt as any).toDate() // Timestamp to Date
      return created >= start && created <= end
    })
  }, [users, dateRange, customStartDate, customEndDate])

  // Compute KPIs
  const totalUsers = filteredUsers.length
  
  const now = new Date()
  const vips = filteredUsers.filter(u => u.plan === 'vip')
  const totalVips = vips.length
  
  // Determine if it's a trial by checking if they are VIP and their subscription ends at is within 30 days of creation
  // Or simply, any VIP with a subscriptionEndsAt that is active and less than 15 days from now, but for now we'll just 
  // count how many have a subscriptionEndsAt in the future.
  const activeTrials = vips.filter(u => {
    if (!u.subscriptionEndsAt) return false
    const ends = (u.subscriptionEndsAt as any).toDate()
    return ends > now
  }).length

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas y KPIs</h1>
        <p className="text-sm text-neutral-400 mt-1">Visión general del negocio y crecimiento.</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
        <span className="text-sm font-semibold text-white">Filtrar por:</span>
        <div className="flex gap-2">
          {['7', '30', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                dateRange === range ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {range === 'all' ? 'Todo' : `Últimos ${range} días`}
            </button>
          ))}
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              dateRange === 'custom' ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Personalizado
          </button>
        </div>

        {dateRange === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 ml-4"
          >
            <input 
              type="date" 
              value={customStartDate} 
              onChange={e => setCustomStartDate(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <span className="text-neutral-500">-</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={e => setCustomEndDate(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
          </motion.div>
        )}
      </div>

      {/* KPIs Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
          >
            <h3 className="text-sm font-medium text-neutral-400">Usuarios Registrados</h3>
            <p className="text-4xl font-bold text-white mt-2">{totalUsers}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-transparent"
          >
            <h3 className="text-sm font-medium text-[#D4AF37]">Total Usuarios VIP</h3>
            <p className="text-4xl font-bold text-white mt-2">{totalVips}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent"
          >
            <h3 className="text-sm font-medium text-green-400">Trials Activos</h3>
            <p className="text-4xl font-bold text-white mt-2">{activeTrials}</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
