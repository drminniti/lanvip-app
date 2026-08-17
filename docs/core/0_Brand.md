# Brand & UI/UX Identity Document
**Proyecto:** Lanvip (Plataforma de Micro-Landings VIP)

### 1. Visión de la Marca
Lanvip no es un simple "árbol de enlaces"; es una **tarjeta de presentación digital de lujo**. Está diseñada para profesionales, consultores, emprendedores y empresas que necesitan centralizar su presencia online (agendamiento, contacto, redes, multimedia) con cero fricción y máxima conversión.

### 2. Concepto Visual: "Bento UI" & Apple Aesthetic
El diseño debe transmitir estatus, orden y simplicidad. Adoptamos un modelo de grillas modulares (Bento Box) para organizar la información.
- **Sensación:** Premium, serena, tecnológica, pulida y confiable.
- **Estructura:** Cajas (cards) de distintos tamaños (1x1, 2x1, 2x2) que contienen la información, rompiendo la monotonía de las listas verticales.
- **Micro-interacciones:** Fluidas y satisfactorias, utilizando físicas de rebote (springs) similares a las de iOS.

### 3. Paleta de Colores (Dark Premium - High Contrast)
Para garantizar la legibilidad y el estilo Apple Pro/Glassmorphism, el sistema de diseño debe utilizar estrictamente estos tokens de color en Tailwind:
- **Background:** `#0A0A0A` (Fondo principal de la aplicación).
- **Surface (Bento Boxes):** `#1A1A1A` (Usar con `bg-opacity-70` y `backdrop-blur-xl` para glassmorphism).
- **Borders:** `#333333` (Bordes de las tarjetas y separadores).
- **Text Primary:** `#F5F5F5` (Títulos, textos principales y botones primarios).
- **Text Secondary:** `#A3A3A3` (Subtítulos, placeholders y textos de apoyo. **No usar un gris más oscuro que este** para evitar problemas de contraste).
- **Accent:** `#D4AF37` (Dorado VIP para llamados a la acción, bordes activos e indicadores. Reemplaza cualquier azul previo para dar una sensación de lujo y exclusividad).

**Regla estricta de contraste:** Todo texto renderizado sobre una superficie `Surface` con efecto de cristal debe usar `Text Primary` o `Text Secondary`. Prohibido usar grises oscuros sobre fondos oscuros.

### 4. Guías de Estilo (Tailwind CSS)
El agente generador debe aplicar estrictamente las siguientes reglas:
- **Bordes (Squircles):** Uso intensivo de `rounded-2xl` o `rounded-3xl` para todas las tarjetas, imitando el radio de borde del ecosistema Apple.
- **Glassmorphism:** Tarjetas superpuestas, menúes inferiores o modales deben usar los colores de Surface definidos arriba, con efectos de vidrio esmerilado: `bg-[#1A1A1A]/70`, `backdrop-blur-xl`, y `border border-[#333333]`.
- **Sombras:** Prohibidas las sombras duras. Usar sombras difusas y amplias para dar sensación de elevación y despegar las cajas del fondo: `shadow-[0_8px_30px_rgb(0,0,0,0.4)]`.
- **Tipografía:** Limpia y geométrica. Usar `font-sans` para que renderice *San Francisco* en Apple y *Inter/Roboto* en el resto, manteniendo el look nativo del dispositivo.
- **Fondos (Backgrounds):** Mallas de gradientes (mesh gradients) fluidas y muy sutiles basadas en colores muy oscuros o el color `#0A0A0A` puro. El contenido de las Bento cards debe ser el foco.

### 5. Tono de Voz (Copywriting)
- **Panel de Administración:** Profesional, directo y orientado a la acción (ej. "Conectar herramienta", "Añadir bloque").
- **Empty States:** Inspiradores y de asistencia clara (ej. "Tu landing está en blanco. Agreguemos tu primer bloque para empezar a destacar.").