'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { updateBlock, deleteBlock, reorderBlocks } from '@/lib/blocks'
import { getFirebaseStorage } from "@/lib/firebase"
import { ref, deleteObject } from "firebase/storage"

import { BlockCard } from './BlockCard'
import type { Block } from '@/types'

interface BlocksGridProps {
  blocks:  Block[]
  accent:  string
  onEdit?: (block: Block) => void
}

export function BlocksGrid({ blocks: liveBlocks, accent, onEdit }: BlocksGridProps) {
  // Local copy for optimistic updates — stays in sync with liveBlocks
  // when not dragging, and holds the reordered state after a drag until
  // Firestore confirms the new order via onSnapshot.
  const [localBlocks, setLocalBlocks] = useState<Block[]>(liveBlocks)

  // Keep localBlocks in sync when Firestore delivers updates
  useEffect(() => {
    setLocalBlocks(liveBlocks)
  }, [liveBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const oldIndex = localBlocks.findIndex(b => b.id === active.id)
    const newIndex = localBlocks.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(localBlocks, oldIndex, newIndex)

    // Optimistic update — show the new order immediately
    setLocalBlocks(reordered)

    // Persist to Firestore (fire-and-forget; onSnapshot will confirm)
    reorderBlocks(reordered).catch(() => {
      // On error, revert to last known Firestore state
      setLocalBlocks(liveBlocks)
    })
  }

  function handleToggle(block: Block) {
    updateBlock(block.id, { isActive: !block.isActive }).catch(console.error)
  }

  async function handleDelete(block: Block) {
    if (block.type === 'image_gallery' && block.content.galleryImages) {
      try {
        const storage = getFirebaseStorage()
        await Promise.all(
          block.content.galleryImages.map(img =>
            deleteObject(ref(storage, img.url)).catch((e: any) => {
              if (e.code !== 'storage/object-not-found') {
                console.error('Error deleting image:', e)
              }
            })
          )
        )
      } catch (err) {
        console.error('Error in batch image deletion:', err)
      }
    }
    deleteBlock(block.id).catch(console.error)
  }

  if (liveBlocks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 space-y-2"
      >
        <p className="text-2xl">⬜</p>
        <p className="text-sm" style={{ color: '#A3A3A3' }}>
          Todavía no tenés bloques. ¡Agregá el primero!
        </p>
      </motion.div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localBlocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {localBlocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              accent={accent}
              onEdit={onEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
