'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDashboard } from '@/context/DashboardContext'
import { useUserBlocks } from '@/hooks/useUserBlocks'
import { addBlock, updateBlockContent } from '@/lib/blocks'
import { BlockFormModal, type BlockFormData } from '@/components/blocks/BlockFormModal'
import { BlocksGrid } from '@/components/blocks/BlocksGrid'
import { LandingPreview } from '@/components/profile/LandingPreview'
import type { Block } from '@/types'

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
  // Consume DashboardContext — single source of truth for profile.
  // Replaces the previous useUserProfile(user?.uid) call which opened a
  // parallel Firestore subscription, risking desync with the rest of the dashboard.
  const { profile, loading: profileLoading } = useDashboard()
  const { blocks, loading: blocksLoading }   = useUserBlocks(user?.uid)

  // ── Modal state ──────────────────────────────────────────────────────────────
  // A single BlockFormModal handles both modes:
  //   - createOpen=true, editingBlock=null → Creation mode
  //   - editingBlock≠null                 → Edit mode (createOpen irrelevant)
  const [createOpen, setCreateOpen]     = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)

  const modalOpen = createOpen || editingBlock !== null

  function openCreate() {
    setEditingBlock(null)
    setCreateOpen(true)
  }

  function openEdit(block: Block) {
    setCreateOpen(false)
    setEditingBlock(block)
  }

  function closeModal() {
    setCreateOpen(false)
    setEditingBlock(null)
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleAddBlock(data: BlockFormData) {
    if (!user?.uid) return
    await addBlock(user.uid, {
      type:         data.type,
      content: {
        title:       data.title,
        url:         data.url || undefined,
        icon:        data.icon,
        description: data.description || undefined,
        // vCard fields (undefined for other types)
        phone:       data.phone    || undefined,
        email:       data.email    || undefined,
        company:     data.company  || undefined,
        jobTitle:    data.jobTitle || undefined,
      },
      spanSize:     '1x1',
      isFeatured:   data.isFeatured,
      currentCount: blocks.length,
    })
  }

  async function handleSaveEdit(data: BlockFormData) {
    if (!editingBlock) return
    await updateBlockContent(editingBlock.id, {
      content: {
        title:       data.title,
        url:         data.url || undefined,
        icon:        data.icon,
        description: data.description || undefined,
        phone:       data.phone    || undefined,
        email:       data.email    || undefined,
        company:     data.company  || undefined,
        jobTitle:    data.jobTitle || undefined,
      },
      isFeatured: data.isFeatured,
    })
  }

  // Unified submit — routes to create or edit based on current mode
  async function handleSubmit(data: BlockFormData) {
    if (editingBlock) {
      await handleSaveEdit(data)
    } else {
      await handleAddBlock(data)
    }
  }

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
            <h1 className="text-2xl font-bold" style={{ color: '#F5F5F5' }}>Bloques</h1>
            <p className="text-sm mt-1" style={{ color: '#A3A3A3' }}>
              Gestioná y ordená los bloques de tu Micro-Landing.
            </p>
          </div>
          <motion.button
            id="btn-add-block"
            onClick={openCreate}
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
                ↕ Arrastrá para reordenar · ✏️ Lápiz para editar
              </p>
            )}

            {/* List */}
            {blocksLoading ? (
              <Skeleton />
            ) : (
              <BlocksGrid blocks={blocks} onEdit={openEdit} />
            )}

            {/* Add CTA if empty */}
            {!blocksLoading && blocks.length === 0 && (
              <motion.button
                id="btn-add-first-block-inline"
                onClick={openCreate}
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

      {/* Single BlockFormModal — handles both create and edit */}
      <BlockFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingBlock ?? undefined}
      />
    </>
  )
}
