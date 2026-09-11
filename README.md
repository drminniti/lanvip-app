# Lanvip – Tu Micro-Landing VIP

Lanvip es una plataforma premium para crear micro-landings personalizadas en minutos, permitiendo a los creadores agrupar todos sus enlaces, redes sociales y contacto en un solo link elegante.

## Modelo de Monetización (Feature Flags: Free vs VIP)

La plataforma opera bajo un modelo *Freemium* controlado por **Feature Flags** a nivel de esquema de base de datos. Cada usuario tiene asignado un plan que dicta a qué características tiene acceso.

### Plan Free (Gratuito)
- **Bloques Básicos:** Enlaces, separadores, textos y enlaces de contacto (email).
- **Temas Limitados:** Acceso a los 4 temas "Esenciales".
- **Marca de Agua:** Todas las micro-landings públicas tienen la marca de agua obligatoria "Creado con Lanvip".
- **Sin personalización avanzada:** Colores y tipografías personalizadas bloqueadas.
- **Métricas:** Acceso básico (vistas totales).

### Plan VIP (Premium)
- **Bloques Premium:** Desbloqueo de bloques enriquecidos (Video de YouTube, Spotify, etc.).
- **Temas Premium:** Acceso a todos los temas exclusivos de la plataforma.
- **Personalización de Identidad Visual:** Posibilidad de elegir paletas de colores y fuentes a medida.
- **Marca de Agua Oculta:** Capacidad de ocultar el branding de Lanvip.
- **Métricas Avanzadas y Dominio Personalizado:** Acceso total al panel de analíticas y configuración de dominios propios.

## Arquitectura Tecnológica
- **Framework:** Next.js 14+ (App Router)
- **Styling:** CSS Modules / Vanilla CSS (Sistema de diseño premium)
- **Base de Datos:** Firebase / Firestore
- **SEO & Metadatos:** OpenGraph dinámico mediante `next/og`
