# Estructura de UI e Interacciones

### 1. Filosofía de Diseño
- **Bento Box Layout:** Reemplazamos la lista vertical por una grilla CSS (`grid-cols-2` en móvil, escalando a más columnas en desktop). Los bloques pueden ocupar 1 columna (cuadrados, ideales para íconos sociales) o 2 columnas (rectangulares amplios, ideales para videos o llamados a la acción).

### 2. Estructura de Pantallas
**A. Vista Pública (Micro-Landing VIP):**
- Layout: Contenedor centrado (`max-w-md` en móvil).
- Header: Avatar prominente centrado, tipografía bold para el nombre, subtítulo en gris (text-muted).
- Cuerpo: `<div className="grid grid-cols-2 gap-4">` donde se inyectan las tarjetas.
- Badge: Discreto "Creado con Lanvip" en el footer con un nivel bajo de opacidad.

**B. Panel de Administración:**
- Navegación: Sidebar flotante en desktop, Bottom Tab Bar en móvil (efecto glassmorphism).
- Interfaz dividida (Desktop): Mitad izquierda para el formulario y ajustes; mitad derecha con un iframe interactivo o componente renderizando la preview en vivo de la micro-landing.

### 3. Animaciones Core (Framer Motion)
- **Staggered Fade In:** Al cargar la landing pública, las tarjetas de la grilla deben aparecer en cascada (stagger) de arriba hacia abajo con un sutil desplazamiento vertical (`y: 20` a `y: 0`).
- **Tap Feedback:** Todos los bloques interactivos deben encogerse sutilmente al presionar (`whileTap={{ scale: 0.95 }}`) para confirmar la acción táctil al usuario de forma nativa.