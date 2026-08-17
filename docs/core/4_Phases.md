# Plan de Ejecución (Fases de Desarrollo)

### Fase 1: Inicialización y Fundamentos
1. Crear proyecto Next.js + Tailwind CSS.
2. Inicializar proyecto en Firebase (crear config e inyectar variables de entorno en `.env.local`).
3. Implementar módulo de Autenticación (Login, Registro con Google/Email).
4. Maquetar el esqueleto del Dashboard de administración.

### Fase 2: Gestión de Perfil y Motor Temático
1. Desarrollar colección `users` en Firestore.
2. Construir formulario de edición de perfil (subida de avatar a Firebase Storage, edición de texto).
3. Desarrollar el selector de "Temas VIP" (aplicación dinámica de clases de Tailwind/variables CSS al Live Preview).

### Fase 3: Motor de Bloques Bento (CRUD)
1. Desarrollar colección `blocks` en Firestore.
2. Construir el gestor de grilla en el admin: Permitir agregar bloques estándar, elegir su tamaño (1x1 o 2x1) y editarlos.
3. Asegurar la actualización en tiempo real entre el formulario y el Live Preview.

### Fase 4: Vista Pública y Rich Links
1. Generar la ruta dinámica `/[username]` que consulte la BD y renderice la Micro-Landing para los visitantes.
2. Ejecutar `F01_Enlaces_Especiales.md` para integrar los bloques de vCard, Calendly y Multimedia.
3. Incorporar las animaciones de entrada con Framer Motion.

### Fase 5: Analíticas y Despliegue
1. Implementar la lógica de incremento de contadores (`views` y `clickCount`) usando funciones transaccionales seguras de Firebase.
2. Armar gráficos/tarjetas simples de métricas en el Dashboard del usuario.
3. Configurar reglas de seguridad de Firebase en producción y hacer deploy final en Vercel.