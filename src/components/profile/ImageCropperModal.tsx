'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

export interface CropPixels {
  x: number
  y: number
  width: number
  height: number
}

interface Props {
  isOpen: boolean
  imageSrc: string | null
  aspectRatio: number
  cropShape?: 'rect' | 'round'
  onCancel: () => void
  onConfirm: (croppedAreaPixels: CropPixels) => void
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio,
  cropShape = 'rect',
  onCancel,
  onConfirm
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropPixels | null>(null)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      onConfirm(croppedAreaPixels)
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !imageSrc || !mounted) return null

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 pb-12"
      >
        <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-white font-semibold">Ajustar Imagen</h3>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="relative w-full flex-1 min-h-[40vh] bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-neutral-400">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(Number(e.target.value))
                }}
                className="w-full accent-[#D4AF37]"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#D4AF37] text-black hover:brightness-110 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
