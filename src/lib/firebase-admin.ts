import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Reemplaza los escapes de saltos de línea literales en la clave privada si existen
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
    console.log('✅ Firebase Admin SDK initialized successfully.')
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error', error)
  }
}

export const adminDb = admin.firestore()
export const adminAuth = admin.auth()
