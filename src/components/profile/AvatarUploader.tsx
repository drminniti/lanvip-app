'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadUserAvatar, removeUserAvatar } from '@/services/storage'
import { useAuth } from '@/context/AuthContext'

interface Props {
  currentUrl: string
  displayName: string
  onUploadSuccess: (url: string) => void
  onRemoveSuccess: () => void
}

export function AvatarUploader({ currentUrl, displayName, onUploadSuccess, onRemoveSuccess }: Props) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return

    setIsUploading(true)
    setErrorMsg(null)

    try {
      const url = await uploadUserAvatar(user.uid, file)
      onUploadSuccess(url)
    } catch (err: any) {
      console.error('[AvatarUploader] upload failed:', err)
      setErrorMsg(err.message || 'Error al optimizar/subir la imagen.')
    } finally {
      setIsUploading(false)
      // reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!user?.uid || !currentUrl) return
    setIsUploading(true)
    setErrorMsg(null)
    try {
      await removeUserAvatar(user.uid)
      onRemoveSuccess()
    } catch (err: any) {
      console.error('[AvatarUploader] remove failed:', err)
      setErrorMsg('Error al remover el avatar.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Display */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 relative group bg-[#1A1A1A]"
        style={{ border: `2px solid #D4AF37` }}
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          </div>
        )}
        
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-bold"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
          >
            {(displayName || '?')[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Subir Foto
          </button>
          {currentUrl && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleRemove}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              Quitar
            </button>
          )}
        </div>
        <p className="text-[10px] text-neutral-400">
          JPEG, PNG o WebP (max 10MB). Se comprimirá automáticamente a ~80KB.
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
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />
      </div>
    </div>
  )
}
