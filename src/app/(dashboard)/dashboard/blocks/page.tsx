'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { addBlock } from '@/lib/blocks'
import { AddBlockModal, type AddBlockFormData } from '@/components/blocks/AddBlockModal'
import { BlocksGrid } from '@/components/blocks/BlocksGrid'
import { LandingPreview } from '@/components/profile/LandingPreview'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="h-14 rounded-2xl animate-pulse"
          style={{ background: '#1A1A1A' }}
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlocksPage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.uid)
  const { blocks, loading: blocksLoading }   = useUserBlocks(user?.uid)
  const [modalOpen, setModalOpen] = useState(false)

  async function handleAddBlock(data: AddBlockFormData) {
    if (!user?.uid) return
    await addBlock(user.uid, {
      type:         data.type,
      content: {
        title: data.title,
        url:   data.url,
        icon:  data.icon,
      },
      spanSize:     data.spanSize,
      currentCount: blocks.length,
    })
  }

  // Merge blocks into the preview profile
  const previewProfile = profile ? { ...profile } : null

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>Bloques Bento</h1>
            <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
              Gestioná y ordená los bloques de tu Micro-Landing.
            </p>
          </div>
          <motion.button
            id="btn-add-block"
            onClick={() => setModalOpen(true)}
            whileTap={{ scale: 0.96 }}
            className="btn-accent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </motion.button>
        </motion.div>

        {/* Desktop: split | Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── LEFT: block list ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-5 space-y-4"
          >
            {/* Stats row */}
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
              >
                {blocks.filter(b => b.isActive).length} activos
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A3A3A3' }}
              >
                {blocks.length} total
              </div>
            </div>

            {/* Hint */}
            {blocks.length > 1 && (
              <p className="text-xs" style={{ color: '#555' }}>
                ↕ Arrastrá para reordenar
              </p>
            )}

            {/* List */}
            {blocksLoading ? (
              <Skeleton />
            ) : (
              <BlocksGrid blocks={blocks} />
            )}

            {/* Add CTA if empty */}
            {!blocksLoading && blocks.length === 0 && (
              <motion.button
                id="btn-add-first-block-inline"
                onClick={() => setModalOpen(true)}
                whileTap={{ scale: 0.97 }}
                className="btn-accent w-full mt-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar primer bloque
              </motion.button>
            )}
          </motion.div>

          {/* ── RIGHT: live preview ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:sticky lg:top-8"
          >
            {!profileLoading && previewProfile && (
              <LandingPreview profile={previewProfile} blocks={blocks} />
            )}
          </motion.div>

        </div>
      </div>

      {/* Modal */}
      <AddBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddBlock}
      />
    </>
  )
}
