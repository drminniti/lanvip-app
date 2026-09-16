import { getAdminAuth, getAdminDb } from '../src/lib/firebase-admin'

// Las variables de entorno se van a cargar usando la flag nativa de Node (--env-file)
async function deleteUserByEmail(email: string) {
  try {
    const auth = getAdminAuth()
    const db = getAdminDb()

    console.log(`Buscando usuario con email: ${email}...`)
    
    // 1. Buscar en Auth
    const userRecord = await auth.getUserByEmail(email)
    const uid = userRecord.uid
    console.log(`✅ Usuario encontrado en Auth (UID: ${uid})`)

    // 2. Buscar en Firestore para liberar el username
    const userDocRef = db.collection('users').doc(uid)
    const userDoc = await userDocRef.get()

    if (userDoc.exists) {
      const userData = userDoc.data()
      const username = userData?.username
      
      if (username) {
        console.log(`Liberando nombre de usuario: @${username}...`)
        await db.collection('usernames').doc(username).delete()
        console.log(`✅ Username @${username} liberado.`)
      }

      // Borrar documento del usuario
      console.log(`Borrando documento de usuario en Firestore...`)
      await userDocRef.delete()
      console.log(`✅ Documento de Firestore eliminado.`)
    } else {
      console.log(`⚠️ El usuario no tenía documento en Firestore.`)
    }

    // 3. Borrar de Auth
    console.log(`Eliminando cuenta de Firebase Auth...`)
    await auth.deleteUser(uid)
    console.log(`✅ Cuenta eliminada por completo de Auth.`)

    console.log(`\n🎉 Limpieza completada. Ya podés volver a registrarte con ${email}`)
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error eliminando usuario:', error.message)
    process.exit(1)
  }
}

// Reemplazá por el email que quieras borrar
const emailToDelete = process.argv[2]

if (!emailToDelete) {
  console.error('❌ Por favor, pasá un email como argumento. Ejemplo: npx tsx scratch/delete-user.ts test@ejemplo.com')
  process.exit(1)
}

deleteUserByEmail(emailToDelete)
