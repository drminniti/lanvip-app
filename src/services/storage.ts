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

export async function removeUserAvatar(userId: string): Promise<void> {
  // We leave the file in storage to avoid breaking aggressive caching or failing edge cases, 
  // but we revert the Firestore document to default empty string
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'avatarUrl': ''
  })
}

