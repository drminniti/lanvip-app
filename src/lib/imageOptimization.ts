export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  cropPixels?: { x: number; y: number; width: number; height: number }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo excede el límite de 10 MB.')
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
    throw new Error('Formato no soportado. Usa JPEG, PNG, WebP o HEIC.')
  }

  let processFile: Blob = file

  // If HEIC/HEIF, transcode to JPEG first
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const heic2any = (await import('heic2any')).default
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 })
      processFile = Array.isArray(converted) ? converted[0] : converted
    } catch (err) {
      console.error('[imageOptimization] heic2any error:', err)
      throw new Error('Fallo al convertir imagen HEIC/HEIF de iOS.')
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error cargando la imagen.'))
      img.onload = () => {
        let { width, height } = img
        
        let cropX = 0
        let cropY = 0
        let sourceW = width
        let sourceH = height

        if (options.cropPixels) {
          cropX = options.cropPixels.x
          cropY = options.cropPixels.y
          sourceW = options.cropPixels.width
          sourceH = options.cropPixels.height
          
          width = sourceW
          height = sourceH
        }

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas ctx no disponible.'))

        // Draw image onto canvas
        ctx.drawImage(img, cropX, cropY, sourceW, sourceH, 0, 0, width, height)

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Fallo al convertir a WebP.'))
            resolve(blob)
          },
          'image/webp',
          quality
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(processFile)
  })
}
