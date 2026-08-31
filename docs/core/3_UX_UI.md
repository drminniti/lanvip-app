# Estructura de UI e Interacciones

### 1. Filosofía de Diseño
- **Bento Box Layout:** La grilla CSS (`grid-cols-2`) es el corazón de la Micro-Landing. Los bloques son adaptativos: su tamaño responde al campo `isFeatured` del bloque, no a alturas fijas.
- **Content-Driven Heights:** Las tarjetas no tienen alturas fijas (`h-*`). Crecen según su contenido mediante padding interno generoso (`p-4`). Esto evita el problema de "espacio negativo" en bloques con poco texto.
- **Glassmorphism Puro:** Fondo `rgba(0,0,0,0.40)` + `backdrop-filter: blur(16px)`. Sin marrón ni oliva. La clase `.bento-tile` en `globals.css` es la única fuente de verdad del estilo de tarjeta.

### 2. Reglas de la Grilla Bento (Fuente de Verdad)

| Campo | Valor | Comportamiento en grilla |
|-------|-------|--------------------------|
| `block.isFeatured` | `true` | `col-span-2` — ancho completo (bloque destacado) |
| `block.isFeatured` | `false` | `col-span-1` — cuadrado compacto (default) |

**Regla de retrocompatibilidad:** Bloques viejos sin `isFeatured` hacen fallback a `spanSize !== '1x1'` para determinar si son full-width.

**Bloques sociales** (type: `social`): siempre compactos — el usuario no puede marcarlos como `isFeatured`.

### 3. Componentes de Tarjeta

**BentoTile (`PublicLanding.tsx`) — vista pública:**
- Layout siempre horizontal (`flex items-center gap-3 px-4 py-4`).
- Muestra `description` debajo del título cuando existe (`text-xs rgba(163,163,163,0.85)`).
- VIP Glow: `radial-gradient` con `tileColor`, opacity 0→1 en hover; levemente visible en tiles `isFeatured`.
- Spring hover: `scale(1.02)` con `stiffness: 260, damping: 22`.

**BlockCard (`BlockCard.tsx`) — admin/dashboard:**
- Misma base glassmorphism (`.bento-tile`).
- `gridColumn` derivado directamente de `block.isFeatured`.
- Muestra `description` cuando existe + badge "Destacado" para `isFeatured=true`.
- Spring hover: `scale(1.02)` con `stiffness: 300, damping: 25`.
- VIP Glow radial en hover (opacity 0→1).

### 4. Estructura de Pantallas

**A. Vista Pública (Micro-Landing VIP):**
- Layout: Contenedor centrado (`max-w-md`).
- Header: Avatar prominente centrado + glow de acento, nombre, @username, bio.
- Cuerpo: `<div className="grid grid-cols-2 gap-3">` con `BentoTile` por cada bloque activo.
- Badge: Discreto "Creado con Lanvip" en el footer.

**B. Panel de Administración:**
- Navegación: Sidebar flotante en desktop, Bottom Tab Bar en móvil (glassmorphism).
- Layout dividido (Desktop): Lista de bloques (izquierda) + Live Preview (derecha, sticky).

### 5. Animaciones Core (Framer Motion)

- **Staggered Fade In:** Las tarjetas de la landing pública aparecen en cascada (`delay: index * 0.07`) con `y: 20 → 0`.
- **Spring Hover Scale:** `whileHover={{ scale: 1.02 }}` + `transition: spring` en todas las tarjetas.
- **Tap Feedback:** `whileTap={{ scale: 0.96 }}` en tiles públicos; `scale: 0.97` en botones de acción.
- **VIP Glow on Hover:** `<motion.span>` con `radial-gradient`, `opacity: 0 → 1` en hover, `blur(18px)`.

### 6. AddBlockModal — Campos y UX

Al crear un bloque nuevo, el usuario puede configurar:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | selector (step 1) | `link` o `social` |
| `title` | input text | Nombre del bloque (requerido) |
| `url` | input url/text | URL o handle de red social (requerido) |
| `icon` | EmojiPicker | Grid de 40 emojis en 5 grupos. Default: 🔗 |
| `description` | textarea | Subtítulo opcional (120 char max) |
| `isFeatured` | Toggle switch | `true` → ancho completo en la grilla |
| `spanSize` | selector | Solo visible si `isFeatured=false` |

**EmojiPicker:** Panel animado con `AnimatePresence`, 5 grupos curados (Links & Web, Negocio, Creativo, Contacto, Varios). Se cierra al seleccionar.

**Toggle isFeatured:** Switch animado CSS, dorado cuando activo (`background: #D4AF37`, `box-shadow` con glow). Al activar, el selector de `spanSize` se oculta (redundante).

### 7. Bordes y Color System

- **Hairline border:** `rgba(255,255,255,0.08)` — casi invisible, define el contorno sin peso visual.
- **Hover border:** `rgba(212,175,55,0.20)` — tinte dorado suave al pasar el mouse.
- **Active border (admin):** `rgba(212,175,55,0.22)` — indica que el bloque está visible en la landing.
- **Tile color tint:** `${tileColor}28` como border-color base — identidad visual de la red social o dorado de acento.