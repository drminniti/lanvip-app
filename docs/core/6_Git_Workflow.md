# Git & Version Control Guidelines

### 1. Repositorio y Estrategia de Ramas (GitHub Flow)
- **Remote Origin:** El repositorio principal está alojado en: `git@github.com:drminniti/lanvip-app.git`
- La rama `main` es sagrada y debe ser siempre estable y desplegable (conectada a Vercel).
- Todo el trabajo nuevo se debe hacer en ramas creadas desde `main`.
- Las ramas deben tener trazabilidad con los documentos SDD:
  - Formato: `tipo/ID-descripcion` (Ej: `feat/Fase1-setup`, `feat/F01-rich-links`, `fix/login-ui`).

### 2. Commits (Conventional Commits)
El agente debe agrupar los cambios lógicos y proporcionar mensajes de commit semánticos antes de pedir la revisión del usuario.
- Usar prefijos obligatorios: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Ejemplo: `feat(db): implementa esquema de colección blocks en Firestore`
- Mantener los commits atómicos (no mezclar cambios de UI con reestructuraciones de BD en un solo commit si no están directamente relacionados).

### 3. Flujo de Revisión y Pull Requests
- **Prohibido el Push Directo:** Bajo ninguna circunstancia debes hacer `git push` a la rama `main` o fusionar (merge) localmente hacia `main` sin preguntarme.
- **Desarrollo Autónomo:** Puedes hacer push de tus ramas de funcionalidad (ej. `feat/Fase1-setup`) al repositorio remoto de forma autónoma.
- **Proceso de Aprobación:**
  1. Al terminar una tarea, haz push de la rama de funcionalidad a GitHub.
  2. Detente y notifícame que la rama está lista para revisión.
  3. Yo realizaré pruebas locales o en el entorno de Preview de Vercel.
  4. Una vez que yo te dé el OK, puedes fusionar a main y continuar con la siguiente fase.