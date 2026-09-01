# F01 — Bloques Especiales (Rich Links)

> **Referenciado desde:** `2_Architecture.md §5`, `1_PRD..md §3.1`

## Propósito

Los bloques especiales transforman la Micro-Landing de un directorio de enlaces simples en una **herramienta de conversión VIP**. Cada tipo define:

- Un **esquema de datos** específico en `BlockContent`
- Un **comportamiento de interacción** en la landing pública
- Un **formulario de creación/edición** en el `BlockFormModal`

---

## Tipos de Bloque Soportados

### `link` — Enlace estándar

**Propósito:** Cualquier URL pública con título e ícono personalizable.

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `title` | string | ✅ | Nombre visible del enlace |
| `url`   | string | ✅ | URL completa (https://…) |
| `icon`  | string | — | Emoji elegido con EmojiPicker |
| `description` | string | — | Subtítulo breve (≤120 chars) |

**Interacción:** `<a target="_blank">` → abre en nueva pestaña.
**Analytics:** `incrementClickCount(block.id)` al hacer clic.

---

### `social` — Red Social

**Propósito:** Perfil en plataforma social con generación automática de URL.

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `title` | string | — | Etiqueta (default: nombre de la plataforma) |
| `url`   | string | ✅ | URL construida: `instagram.com/handle`, etc. |
| `icon`  | string | ✅ | Emoji de plataforma (determina el color de acento) |

**Plataformas:** `instagram` 📸 · `linkedin` 💼 · `x` 🐦 · `whatsapp` 💬

**Colores de acento:**
- Instagram: `#E1306C`
- LinkedIn: `#0A66C2`
- X: `#888888`
- WhatsApp: `#25D366`

**Interacción:** `<a target="_blank">` → perfil en la plataforma.

---

### `vcard` — Tarjeta de Contacto VIP ⭐ NEW

**Propósito:** Permite al visitante descargar los datos de contacto del usuario como archivo `.vcf` (estándar universal compatible con iOS, Android y Outlook).

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `title`    | string | ✅ | Nombre completo (campo `FN` del VCF) |
| `icon`     | string | — | Emoji personalizable (default: 👤) |
| `description` | string | — | Nota breve (campo `NOTE` del VCF) |
| `phone`    | string | — | Teléfono (campo `TEL;TYPE=CELL`) |
| `email`    | string | — | Email (campo `EMAIL;TYPE=INTERNET`) |
| `company`  | string | — | Empresa (campo `ORG`) |
| `jobTitle` | string | — | Cargo (campo `TITLE`) |
| `url`      | string | — | Sitio web personal (campo `URL`) |

**Interacción:** `<button>` → `downloadVCard()` en `src/lib/vcard.ts`
- Genera VCF 3.0 (RFC 2426) client-side con Blob API
- Nombre del archivo: derivado del `title` (ej. `Damian_Minniti.vcf`)
- Sin dependencias externas — cero impacto en bundle

**Estética:** Acento verde `#22c55e` · Badge "↓ VCF"

**Analytics:** `incrementClickCount(block.id)` al descargar.

---

### `calendly` — Agendar Reunión ⭐ NEW

**Propósito:** Botón de alta conversión que lleva al visitante directamente a la página de reserva de Calendly del usuario.

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `title` | string | ✅ | Texto del botón (ej. "Agendá una reunión") |
| `url`   | string | ✅ | URL de Calendly (https://calendly.com/…) |
| `icon`  | string | — | Fijo `📅` en la landing (siempre coherente) |
| `description` | string | — | Detalle (ej. "30 min · Videollamada") |

**Interacción:** `<a target="_blank">` → página de Calendly.

> **Decisión de arquitectura:** Se optó por **link optimizado** en lugar de embed inline del widget de Calendly.
> El widget requiere cargar `calendly.com/assets/external/widget.js` (~50KB) en **cada visita** a la landing pública, afectando LCP y el requisito de "tiempos de carga ultrarrápidos" del PRD. El link ofrece la misma tasa de conversión sin penalizar el performance. El embed puede implementarse como feature Pro en el futuro.

**Estética:** Acento Calendly blue `#0069FF` · Badge "Agendar"

**Analytics:** `incrementClickCount(block.id)` al hacer clic.

---

## Tipos Futuros (Hoja de Ruta)

| Tipo | Descripción | Estado |
|------|-------------|--------|
| `video` | Embed de YouTube (usa `embedId`) | 📋 Planificado |
| `music` | Embed de Spotify | 📋 Planificado |
| `image` | Imagen full-width con caption | 📋 Planificado |
| `text`  | Bloque de texto libre / quote | 📋 Planificado |

---

## Arquitectura de Componentes

```
BlockFormModal          ← creación / edición (dashboard)
  └─ step 1: BLOCK_TYPES grid (4 tipos)
  └─ step 2: formulario específico por tipo

PublicLanding → BentoTile  ← renderizado público
  ├─ type='vcard'    → <motion.button> → downloadVCard()
  ├─ type='calendly' → <motion.a target=_blank>
  └─ type='link'|'social' → <motion.a target=_blank> (default)

src/lib/vcard.ts
  └─ downloadVCard(content, displayName): void
  └─ safeFilename(title): string
  └─ escVcf(value): string
```

---

## Contrato de Datos en Firestore

```
blocks/{blockId}
  type: 'link' | 'social' | 'vcard' | 'calendly'   // determina el comportamiento
  content: {
    title:       string    // requerido siempre
    url?:        string    // requerido para link, social, calendly
    icon?:       string    // emoji
    description?: string
    // vCard only
    phone?:    string
    email?:    string
    company?:  string
    jobTitle?: string
  }
  isFeatured:  boolean     // col-span-2 cuando true
  isActive:    boolean     // oculta el bloque en la landing si false
  order:       number      // posición en la grilla
  clickCount:  number      // incrementado en cada clic/descarga
```
