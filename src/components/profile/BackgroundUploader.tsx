'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadUserBackground, removeUserBackground } from '@/services/storage'
import { useAuth } from '@/context/AuthContext'
import { ImageCropperModal, type CropPixels } from '@/components/profile/ImageCropperModal'

interface Props {
  currentUrl: string
  onUploadSuccess: (url: string) => void
  onRemoveSuccess: () => void
}

export function BackgroundUploader({ currentUrl, onUploadSuccess, onRemoveSuccess }: Props) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewSrc(url)
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmCrop = async (cropPixels: CropPixels) => {
    if (!user?.uid || !selectedFile) return
    
    setPreviewSrc(null)
    setIsUploading(true)
    setErrorMsg(null)
    
    try {
      const url = await uploadUserBackground(user.uid, selectedFile, cropPixels)
      onUploadSuccess(url)
    } catch (err: any) {
      console.error('[BackgroundUploader] upload failed:', err)
      setErrorMsg(err.message || 'Error al optimizar/subir el fondo.')
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleCancelCrop = () => {
    setPreviewSrc(null)
    setSelectedFile(null)
  }

  const handleRemove = async () => {
    if (!user?.uid || !currentUrl) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      await removeUserBackground(user.uid)
      onRemoveSuccess()
    } catch (err: any) {
      console.error('[BackgroundUploader] remove failed:', err)
      setErrorMsg('Error al remover el fondo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-4 py-2 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors relative overflow-hidden"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Optimizando...
            </span>
          ) : (
            'Subir Imagen de Fondo'
          )}
        </button>
        {currentUrl && (
          <button
            type="button"
            disabled={isUploading}
            onClick={handleRemove}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
          >
            Quitar
          </button>
        )}
      </div>

      <p className="text-[10px] text-neutral-400">
        JPEG, PNG, WebP o HEIC (max 10MB). Se comprimirá a un máximo de 1920px (~250KB).
      </p>

      <AnimatePresence>
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-400"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp, image/heic, image/heif, .heic, .heif"
        className="hidden"
      />

      <ImageCropperModal
        isOpen={!!previewSrc}
        imageSrc={previewSrc}
        aspectRatio={9 / 16}
        cropShape="rect"
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  )
}
