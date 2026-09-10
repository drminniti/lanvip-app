# Changelog

## [Unreleased]

### Added
- **Theme Engine 2.0**:
  - Implementación de 16 temas VIP curados, organizados en 4 categorías exactas ("Esenciales", "Cyber & Neon", "Organic & Earth", "Minimal Luxury").
  - Acordeón colapsable en el selector de temas para mejorar el minimalismo en la interfaz del dashboard.
  - Regla estricta de contraste: cada tema VIP ahora define explícitamente su `textColor` para garantizar legibilidad absoluta y una experiencia inmersiva.
- **Dynamic & Avant-Garde Themes**:
  - Incorporación de una 5ta categoría exclusiva en el Motor de Temas 2.0.
  - Soporte de renderizado de `bgEffect` animado para fondos altamente inmersivos (Aurora Flow, Cyber Grid, Floating Orbs, Bauhaus Shapes).
  - Efectos creados nativamente con CSS, Data URI y Framer Motion (cero dependencias externas pesadas) garantizando 60 FPS y aceleración por hardware.
- **Expansión de Nichos Estratégicos (Motor de Temas 2.0 Completado)**:
  - Adición de 3 nuevas categorías orientadas a públicos específicos ("Clean & Pro", "Creator & Pop", "Dev & Studio").
  - El catálogo ahora cuenta con 32 temas VIP en total.
  - Los temas claros ahora adaptan los efectos dinámicos (`bgEffect`) garantizando legibilidad y estética sin perder la esencia VIP.
- **Infraestructura de Imágenes Optimizadas (Firebase Storage)**:
  - Implementación de compresión 100% en cliente usando Canvas API (conversión a WebP moderno).
  - Redimensionamiento automático de Avatares a 400x400 y Fondos a 1920px (pesos < 80KB y < 250KB respectivamente).
  - Nuevos componentes UI `AvatarUploader` y `BackgroundUploader` con carga en tiempo real y fallback elegante.
  - Rutas de almacenamiento deterministas y caché estático agresivo (`max-age=31536000`) para micro-landings súper rápidas.
