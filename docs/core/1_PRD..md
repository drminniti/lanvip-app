# Product Requirements Document (PRD)
## Proyecto: Lanvip (Mobile First VIP Micro-Landing)

### 1. Visión del Producto
Crear una plataforma escalable y segura que permita a profesionales y empresas desplegar una "Micro-Landing VIP" altamente personalizable, con foco en la conversión (Lead Generation) y una experiencia de usuario de primera clase.

### 2. Casos de Uso Principales
- **Visitante / Cliente Potencial:** Accede a `lanvip.app/usuario`, experimenta una interfaz premium tipo Bento Box, y puede agendar reuniones, descargar un contacto nativo o consumir multimedia sin fricción.
- **Usuario Administrador:** Inicia sesión en su panel para gestionar su grilla de contenidos, personalizar la estética de su landing y visualizar métricas de rendimiento en tiempo real.

### 3. Funcionalidades Core (MVP)
1. **Página Pública (Vista del Visitante):**
   - Perfil centralizado: Avatar HD, Título profesional y Biografía.
   - Grilla Bento: Distribución dinámica de enlaces y módulos (bloques cuadrados o rectangulares).
   - Soporte para enlaces estándar y "Rich Links" (Ver `F01_Enlaces_Especiales.md`).
2. **Panel de Administración (Backoffice):**
   - Autenticación segura gestionada por Firebase.
   - Interfaz de previsualización en vivo (Live Preview) al estilo editor visual.
   - CRUD de bloques (Crear, Leer, Actualizar, Borrar) y ordenamiento de la grilla.
   - Motor de personalización (Fondos, temas claros/oscuros, opacidad de tarjetas).
3. **Analíticas Básicas:**
   - Contador de visualizaciones únicas totales de la landing.
   - Tracking de clics por cada bloque/tarjeta de la grilla.

### 4. Requisitos No Funcionales
- **Mobile First Real:** Pensado primero para uso táctil en smartphones, escalando de manera responsiva a desktop.
- **Rendimiento:** Tiempos de carga ultrarrápidos para evitar caída de conversión, optimizando imágenes y usando lazy loading.
- **Seguridad:** Arquitectura server-less segura con reglas estrictas de acceso a base de datos.