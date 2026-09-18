'use server'

import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/firebase-admin'

export async function verifyProfilePassword(uid: string, passwordAttempt: string) {
  try {
    const db = getAdminDb()
    const snap = await db.collection('users').doc(uid).get()
    const profile = snap.data()

    if (!profile) {
      return { success: false, message: 'Perfil no encontrado.' }
    }

    if (!profile.isPasswordProtected) {
      // Should not happen unless they disabled it right when typing
      return { success: false, message: 'El perfil ya no está protegido con contraseña.' }
    }

    if (profile.profilePassword !== passwordAttempt) {
      return { success: false, message: 'Contraseña incorrecta.' }
    }

    // Success: set cookie
    // Max age: 30 days
    const cookieStore = await cookies()
    cookieStore.set(`lanvip_auth_${uid}`, profile.profilePassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    return { success: true }
  } catch (err) {
    console.error('[verifyProfilePassword] Error:', err)
    return { success: false, message: 'Ocurrió un error al verificar la contraseña.' }
  }
}
