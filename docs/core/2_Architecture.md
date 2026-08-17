# Arquitectura y Stack Tecnológico

### 1. Stack Seleccionado
- **Frontend:** Next.js (App Router) + React.
- **Estilos:** Tailwind CSS.
- **Animaciones:** Framer Motion.
- **Base de Datos & Auth:** Firebase (Firestore para DB NoSQL en tiempo real, Storage para media, Auth para sesiones).
- **Hosting y CI/CD:** Vercel (con soporte para dominios personalizados a futuro).

### 2. Patrones de Arquitectura
- **Specification-Driven Development (SDD):** Código generado estrictamente sobre specs.
- **Componentes Server/Client:** Las vistas públicas deben priorizar Server Components (SSR/SSG) para SEO y performance. El dashboard usará Client Components para interactividad.
- **Seguridad en DB (Firestore Rules):**
  - Lectura pública en `profiles` y `blocks`.
  - Escritura restringida exclusivamente a `request.auth.uid == resource.data.userId`.

### 3. Estructura de Datos (Esquema Firestore)
- **Colección `users`**: 
  `{ uid, username, displayName, bio, avatarUrl, themeSettings: { bgType, colors, cardStyle }, views, createdAt }`
- **Colección `blocks`** (Reemplaza a los clásicos "links" para soportar el modelo Bento): 
  `{ id, userId, type, content: { title, url, icon, ... }, layout: { spanSize }, order, clickCount, isActive }`

### 4. Flujo de Despliegue
- Repositorio GitHub conectado a Vercel para despliegues automáticos (Main branch -> Producción).