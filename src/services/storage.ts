import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFirebaseStorage, getFirebaseDb } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { optimizeImage } from '@/lib/imageOptimization'

const CACHE_CONTROL = 'public, max-age=31536000' // 1 year cache

export async function uploadUserAvatar(userId: string, file: File, cropPixels?: { x: number; y: number; width: number; height: number }): Promise<string> {
  const optimizedBlob = await optimizeImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8, cropPixels })
  
  const storage = getFirebaseStorage()
  const avatarRef = ref(storage, `users/${userId}/avatar.webp`)
  
  await uploadBytes(avatarRef, optimizedBlob, {
    contentType: optimizedBlob.type || 'image/webp',
    cacheControl: CACHE_CONTROL
  })
  
  const downloadUrl = await getDownloadURL(avatarRef)
  
  // Update Firestore profile
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'avatarUrl': downloadUrl
  })
  
  return downloadUrl
}

export async function uploadUserBackground(
  userId: string, 
  file: File, 
  deviceType: 'mobile' | 'desktop',
  cropPixels?: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const optimizedBlob = await optimizeImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8, cropPixels })
  
  const storage = getFirebaseStorage()
  const filename = deviceType === 'mobile' ? 'background_mobile.webp' : 'background_desktop.webp'
  const backgroundRef = ref(storage, `users/${userId}/${filename}`)
  
  await uploadBytes(backgroundRef, optimizedBlob, {
    contentType: optimizedBlob.type || 'image/webp',
    cacheControl: CACHE_CONTROL
  })
  
  const downloadUrl = await getDownloadURL(backgroundRef)
  
  // Update Firestore profile
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'themeSettings.background.type': 'image',
    [`themeSettings.background.${deviceType}Url`]: downloadUrl
  })
  
  return downloadUrl
}

export async function removeUserAvatar(userId: string): Promise<void> {
  // We leave the file in storage to avoid breaking aggressive caching or failing edge cases, 
  // but we revert the Firestore document to default empty string
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'avatarUrl': ''
  })
}

export async function removeUserBackground(userId: string, deviceType?: 'mobile' | 'desktop'): Promise<void> {
  const db = getFirebaseDb()
  const storage = getFirebaseStorage()
  const userRef = doc(db, 'users', userId)
  
  if (deviceType) {
    const filename = deviceType === 'mobile' ? 'background_mobile.webp' : 'background_desktop.webp'
    const backgroundRef = ref(storage, `users/${userId}/${filename}`)
    
    try {
      await deleteObject(backgroundRef)
    } catch (err: any) {
      if (err.code !== 'storage/object-not-found') console.error('[Lanvip] Error deleting background file:', err)
    }

    // Also delete legacy background.webp to prevent fallback ghosting
    const legacyRef = ref(storage, `users/${userId}/background.webp`)
    try {
      await deleteObject(legacyRef)
    } catch (err: any) {
      // Ignore
    }

    await updateDoc(userRef, {
      [`themeSettings.background.${deviceType}Url`]: '',
      'themeSettings.background.url': ''
    })
  } else {
    // Remove all backgrounds
    await updateDoc(userRef, {
      'themeSettings.background.type': 'none',
      'themeSettings.background.url': '',
      'themeSettings.background.mobileUrl': '',
      'themeSettings.background.desktopUrl': ''
    })
  }
}
