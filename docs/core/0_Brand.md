# Brand & UI/UX Identity Document
**Proyecto:** Lanvip (Plataforma de Micro-Landings VIP)

### 1. Visión de la Marca
Lanvip no es un simple "árbol de enlaces"; es una **tarjeta de presentación digital de lujo**. Está diseñada para profesionales, consultores, emprendedores y empresas que necesitan centralizar su presencia online (agendamiento, contacto, redes, multimedia) con cero fricción y máxima conversión.

### 2. Concepto Visual: "Bento UI" & Apple Aesthetic
El diseño debe transmitir estatus, orden y simplicidad. Adoptamos un modelo de grillas modulares (Bento Box) para organizar la información.
- **Sensación:** Premium, serena, tecnológica, pulida y confiable.
- **Estructura:** Cajas (cards) de distintos tamaños (1x1, 2x1, 2x2) que contienen la información, rompiendo la monotonía de las listas verticales.
- **Micro-interacciones:** Fluidas y satisfactorias, utilizando físicas de rebote (springs) similares a las de iOS.

### 3. Guías de Estilo (Tailwind CSS)
El agente generador debe aplicar estrictamente las siguientes reglas:
- **Bordes (Squircles):** Uso intensivo de `rounded-2xl` o `rounded-3xl` para todas las tarjetas, imitando el radio de borde del ecosistema Apple.
- **Glassmorphism:** Tarjetas superpuestas, menúes inferiores o modales deben usar efectos de vidrio esmerilado: `bg-white/70` (o black/70 en dark mode), `backdrop-blur-xl`, `border border-white/20`.
- **Sombras:** Prohibidas las sombras duras. Usar sombras difusas y amplias para dar sensación de elevación: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.
- **Tipografía:** Limpia y geométrica. Usar `font-sans` para que renderice *San Francisco* en Apple y *Inter/Roboto* en el resto, manteniendo el look nativo del dispositivo.
- **Fondos (Backgrounds):** Mallas de gradientes (mesh gradients) fluidas y muy sutiles o colores pastel/neutros. El contenido de las Bento cards debe ser el foco.

### 4. Tono de Voz (Copywriting)
- **Panel de Administración:** Profesional, directo y orientado a la acción (ej. "Conectar herramienta", "Añadir bloque").
- **Empty States:** Inspiradores y de asistencia clara (ej. "Tu landing está en blanco. Agreguemos tu primer bloque para empezar a destacar.").