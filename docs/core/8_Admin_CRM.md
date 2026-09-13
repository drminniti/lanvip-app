# Panel de Administración CRM
**Proyecto:** Lanvip

## 1. Módulos y Arquitectura
El archivo `src/app/admin/users/page.tsx` es un dashboard completo para la gestión interna de clientes, pensado para el Staff de Lanvip. Está completamente protegido para que solo roles `admin` y `superadmin` puedan ingresar.

### 1.1 Funcionalidades Principales
1. **Listado Reactivo:** Tabla global de todos los usuarios de Firebase ordenados por creación.
2. **Sistema de Filtros:** Búsquedas por UID, Nombre o @username, y un select rápido para ocultar cuentas Free y concentrarse solo en VIPs.
3. **Modal de Gestión (Framer Motion):** Al hacer clic en un usuario, se abre una tarjeta de control integral donde el admin puede realizar operaciones delicadas directamente en la base de datos de Firebase, inyectando feedback instantáneo.

## 2. Operaciones Administrativas

### 2.1 Trials y Permisos Promocionales (Onboarding Sales)
Un Admin tiene la capacidad de regalar suscripciones temporales sin que el usuario coloque tarjeta. 
- En lugar de pedir al usuario que se suscriba, el admin indica un número de días en el input y da clic en "Aplicar Trial".
- El sistema convierte la cuenta en VIP, fija un `subscriptionEndsAt` sumando esos días a partir de HOY, y lanza un flag de notificación interna. El CRM visualiza a esta cuenta con un badge verde brillante ("VIP (Trial)").

### 2.2 Modificación de Plan Manual
Útil para embajadores, cuentas corporativas o devoluciones manuales:
- **Hacer VIP (Lifetime):** Transforma la cuenta en VIP sin fecha de expiración (`null`).
- **Degradar a Free:** Revoca el estatus de plan de forma inmediata borrando fechas.

### 2.3 Moderación (Liberación de URL)
Dado que `@username` funciona como slug único, un problema frecuente es usuarios abandonados ocupando marcas registradas.
El panel incluye un botón rojo de "Liberar Username" protegido por una doble confirmación customizada.
El flujo elimina el registro del usuario del índice `usernames` y limpia la base del usuario, forzándolo a pasar por el onboarding la próxima vez que intente acceder.

### 2.4 Escalada de Permisos (Superadmin only)
Una cuenta con rol `superadmin` ve una caja púrpura adicional en el modal que le permite ascender usuarios normales a `admin`, dándoles acceso inmediato al CRM, o revocándolo bajándolos a `user`. 

## 3. Manejo de Alertas Customizado
Se evitó estrictamente el uso de `alert()` o `confirm()` nativos en favor de una experiencia de marca unificada. Todos los errores y éxitos al usar el CRM son controlados por los estados `errorMsg` y `successMsg`, que activan banners translúcidos animados en la cabecera del panel de administración.
