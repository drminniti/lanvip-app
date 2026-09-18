'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadUserFavicon, removeUserFavicon } from '@/services/storage'
import { useAuth } from '@/context/AuthContext'
import { ImageCropperModal, type CropPixels } from '@/components/profile/ImageCropperModal'

interface Props {
  currentUrl?: string
  onUploadSuccess: (url: string) => void
  onRemoveSuccess: () => void
}

export function FaviconUploader({ currentUrl, onUploadSuccess, onRemoveSuccess }: Props) {
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
    
    // clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmCrop = async (cropPixels: CropPixels) => {
    if (!user?.uid || !selectedFile) return
    
    setPreviewSrc(null)
    setIsUploading(true)
    setErrorMsg(null)
    
    try {
      const url = await uploadUserFavicon(user.uid, selectedFile, cropPixels)
      onUploadSuccess(url)
    } catch (err: any) {
      console.error('[FaviconUploader] upload failed:', err)
      setErrorMsg(err.message || 'Error al optimizar/subir el favicon.')
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
    if (!user?.uid) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      await removeUserFavicon(user.uid)
      onRemoveSuccess()
    } catch (err: any) {
      console.error('[FaviconUploader] remove failed:', err)
      setErrorMsg(err.message || 'Error al eliminar el favicon.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group w-16 h-16 rounded overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center">
            {currentUrl ? (
              <img 
                src={currentUrl} 
                alt="Favicon preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            
            {/* Overlay for actions if existing image */}
            {currentUrl && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-full transition-colors backdrop-blur-sm"
                  title="Eliminar favicon"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-primary-dark py-1.5 px-4 text-xs font-semibold whitespace-nowrap bg-white/5 hover:bg-white/10 border-white/10 w-fit"
            >
              {isUploading ? 'Subiendo...' : (currentUrl ? 'Cambiar icono' : 'Subir icono')}
            </button>
            <span className="text-[10px] text-white/50 max-w-[200px]">
              Recomendado: Imagen cuadrada de al menos 64x64px (PNG, WebP).
            </span>
          </div>
        </div>
        
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mt-2 w-fit"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {previewSrc && selectedFile && (
        <ImageCropperModal
          isOpen={!!previewSrc}
          imageSrc={previewSrc}
          aspectRatio={1}
          cropShape="round"
          onCancel={handleCancelCrop}
          onConfirm={handleConfirmCrop}
        />
      )}
    </>
  )
}
