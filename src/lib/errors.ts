export function getFirebaseErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code
    const map: Record<string, string> = {
      'auth/user-not-found':         'No encontramos una cuenta con ese email.',
      'auth/wrong-password':         'Contraseña incorrecta.',
      'auth/email-already-in-use':   'El email ya está registrado.',
      'auth/weak-password':          'La contraseña es muy débil.',
      'auth/invalid-email':          'El formato del email no es válido.',
      'auth/invalid-credential':     'Credenciales inválidas.',
      'auth/too-many-requests':      'Demasiados intentos. Espera unos minutos.',
      'auth/user-disabled':          'Esta cuenta ha sido deshabilitada.',
      'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
      'auth/popup-closed-by-user':   'Cerraste el popup de Google antes de completar.',
      'auth/cancelled-popup-request':'Solicitud de popup cancelada.',
      'auth/popup-blocked':          'El popup fue bloqueado. Permite los popups en tu navegador.',
      'auth/unauthorized-domain':    'Dominio no autorizado. Agrega localhost en Firebase Console.',
    }
    if (map[code]) return map[code]
    return process.env.NODE_ENV === 'development'
      ? `Error Firebase [${code}]`
      : 'Ocurrió un error inesperado.'
  }
  return 'Ocurrió un error inesperado.'
}
