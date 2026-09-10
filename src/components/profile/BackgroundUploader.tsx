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
  deviceType: 'mobile' | 'desktop'
  aspectRatio: number
  label: string
  description?: string
}

export function BackgroundUploader({ 
  currentUrl, 
  onUploadSuccess, 
  onRemoveSuccess,
  deviceType,
  aspectRatio,
  label,
  description
}: Props) {
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
      const url = await uploadUserBackground(user.uid, selectedFile, deviceType, cropPixels)
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
      await removeUserBackground(user.uid, deviceType)
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
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>
            {label}
          </span>
          {currentUrl ? (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Eliminar {deviceType === 'mobile' ? 'fondo celular' : 'fondo escritorio'}
            </button>
          ) : (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D4AF37] text-black hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isUploading ? 'Subiendo...' : 'Subir Fondo'}
            </button>
          )}
        </div>

        {description && (
          <p className="text-[10px] text-neutral-400 mt-1">
            {description}
          </p>
        )}
      </div>

      <p className="text-[10px] text-neutral-400">
        JPEG, PNG, WebP o HEIC (max 10MB).
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
        aspectRatio={aspectRatio}
        cropShape="rect"
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  )
}
