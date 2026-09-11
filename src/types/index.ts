import { Timestamp } from 'firebase/firestore'

export type Plan = 'free' | 'vip'
export type UserRole = 'user' | 'admin' | 'superadmin'

// ─── Theme Settings ──────────────────────────────────────────────────────────
export type BgType = 'mesh' | 'solid' | 'gradient'
export type CardStyle = 'glass' | 'solid' | 'minimal'
export type BgEffect = 'aurora' | 'grid-motion' | 'floating-orbs' | 'bauhaus-shapes'

export interface ThemeSettings {
  bgType: BgType
  bgEffect?: BgEffect
  colors: string[]        // e.g. ['#f0e6ff', '#e0f0ff']
  cardStyle: CardStyle
  darkMode: boolean
  
  // ── Sprint 5: Custom Themes ──
  hideWatermark?: boolean
  themeId?: string // e.g. 'obsidian', 'custom'
  customColors?: {
    background: string
    accent: string
    textColor: string
    useGradient?: boolean
    gradientColor?: string
    useTexture?: boolean
    autoContrast?: boolean
  }
  
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string
  username: string
  displayName: string
  bio: string
  /** Public image URL. No Firebase Storage — see 2_Architecture.md §2.5 */
  avatarUrl: string
  themeSettings: ThemeSettings
  views: number
  createdAt: Timestamp
  /**
   * Tracks whether the user has completed the onboarding flow (chosen their
   * username explicitly). False for new Google OAuth users (auto-assigned
   * username from email prefix). True after /onboarding completion or for
   * email/password users who chose their username at registration.
   */
  hasCompletedOnboarding: boolean

  // Business Model – Future-proofing fields (docs/core/5_Business_Model.md)
  plan: Plan
  organizationId: string | null
  isNfcEnabled: boolean

  // ── Admin & Seguridad ──
  role?: UserRole                 // Por defecto asume 'user' si no existe
  
  // ── Suscripción & Trials ──
  subscriptionEndsAt?: Timestamp | null  // Timestamp de fin de VIP o Trial
}

// ─── Block (Bento Card) ──────────────────────────────────────────────────────
export type BlockType =
  | 'link'
  | 'social'
  | 'vcard'
  | 'calendly'
  | 'youtube'
  | 'email'
  | 'video'
  | 'image'
  | 'text'
  | 'music'
  // ── Structural blocks (no click action, always full-width) ───────────────
  | 'divider'       // subtle visual separator (line / space)
  | 'section_title' // plain text heading to group links

/**
 * Controls the column span of a block in the public Bento grid.
 * Independent from `isFeatured` — a block can be full-width without the
 * gold glassmorphism treatment, or half-width but still "featured".
 * New field: old Firestore docs without it fall back to the legacy behaviour
 * via: block.width ?? (block.isFeatured ? 'full' : 'half')
 */
export type BlockWidth = 'half' | 'full'

export type SpanSize = '1x1' | '2x1' | '1x2' | '2x2'

export interface BlockContent {
  title: string
  url?: string
  icon?: string       // emoji or icon identifier
  description?: string  // optional subtitle shown below the title
  thumbnailUrl?: string
  embedId?: string    // for YouTube / Spotify
  autoplay?: boolean  // for YouTube
  displayMode?: 'player' | 'button' // for YouTube

  // ── vCard-specific fields ───────────────────────────────────────────────
  /** Full phone number, e.g. "+54 11 1234-5678" */
  phone?:    string
  /** Contact email, e.g. "damian@ejemplo.com" */
  email?:    string
  /** Company / organization name */
  company?:  string
  /** Job title or professional role */
  jobTitle?: string
}

export interface Block {
  id: string
  userId: string
  type: BlockType
  content: BlockContent
  layout: {
    spanSize: SpanSize
  }
  order: number
  clickCount: number
  isActive: boolean
  /**
   * Grid width in the public Bento layout.
   * 'full' = col-span-2 (full width), 'half' = col-span-1.
   * Independent from isFeatured — decoupled as of Sprint 2.
   * Optional for backwards compat: old docs fall back to
   *   block.isFeatured ? 'full' : 'half'
   */
  width?: BlockWidth
  /**
   * When true, applies the gold glassmorphism glow + border treatment.
   * Does NOT control column width any more (use `width` for that).
   * Default: false.
   */
  isFeatured: boolean
  createdAt?: Timestamp
}

// ─── Organization (B2B – Prep) ───────────────────────────────────────────────
export interface BrandingSettings {
  forceLogo: boolean
  forceColors: boolean
  logoUrl?: string
  primaryColor?: string
}

export interface Organization {
  id: string
  name: string
  adminUid: string
  brandingSettings: BrandingSettings
  activeLicenses: number
  maxLicenses: number
  createdAt?: Timestamp
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
