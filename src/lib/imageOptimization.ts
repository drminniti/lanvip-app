export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
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

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato no soportado. Usa JPEG, PNG o WebP.')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error leyendo el archivo.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error cargando la imagen.'))
      img.onload = () => {
        let { width, height } = img

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
        ctx.drawImage(img, 0, 0, width, height)

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
    reader.readAsDataURL(file)
  })
}
