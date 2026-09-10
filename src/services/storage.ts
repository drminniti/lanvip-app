import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage, getFirebaseDb } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { optimizeImage } from '@/lib/imageOptimization'

const CACHE_CONTROL = 'public, max-age=31536000' // 1 year cache

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  const optimizedBlob = await optimizeImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 })
  
  const storage = getFirebaseStorage()
  const avatarRef = ref(storage, `users/${userId}/avatar.webp`)
  
  await uploadBytes(avatarRef, optimizedBlob, {
    contentType: 'image/webp',
    cacheControl: CACHE_CONTROL
  })
  
  const downloadUrl = await getDownloadURL(avatarRef)
  
  // Update Firestore profile
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'profile.avatarUrl': downloadUrl
  })
  
  return downloadUrl
}

export async function uploadUserBackground(userId: string, file: File): Promise<string> {
  const optimizedBlob = await optimizeImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8 })
  
  const storage = getFirebaseStorage()
  const backgroundRef = ref(storage, `users/${userId}/background.webp`)
  
  await uploadBytes(backgroundRef, optimizedBlob, {
    contentType: 'image/webp',
    cacheControl: CACHE_CONTROL
  })
  
  const downloadUrl = await getDownloadURL(backgroundRef)
  
  // Update Firestore profile
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'profile.themeSettings.background.type': 'image',
    'profile.themeSettings.background.url': downloadUrl
  })
  
  return downloadUrl
}

export async function removeUserAvatar(userId: string): Promise<void> {
  // We leave the file in storage to avoid breaking aggressive caching or failing edge cases, 
  // but we revert the Firestore document to default empty string
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'profile.avatarUrl': ''
  })
}

export async function removeUserBackground(userId: string): Promise<void> {
  const db = getFirebaseDb()
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    'profile.themeSettings.background.type': 'none',
    'profile.themeSettings.background.url': ''
  })
}
