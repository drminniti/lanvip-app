import { Timestamp } from 'firebase/firestore'

// ─── Plan & Roles ────────────────────────────────────────────────────────────
export type PlanId = 'free' | 'pro' | 'team_member' | 'team_admin'

// ─── Theme Settings ──────────────────────────────────────────────────────────
export type BgType = 'mesh' | 'solid' | 'gradient'
export type CardStyle = 'glass' | 'solid' | 'minimal'

export interface ThemeSettings {
  bgType: BgType
  colors: string[]        // e.g. ['#f0e6ff', '#e0f0ff']
  cardStyle: CardStyle
  darkMode: boolean
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
  planId: PlanId
  organizationId: string | null
  isNfcEnabled: boolean
}

// ─── Block (Bento Card) ──────────────────────────────────────────────────────
export type BlockType =
  | 'link'
  | 'social'
  | 'vcard'
  | 'calendly'
  | 'video'
  | 'image'
  | 'text'
  | 'music'

export type SpanSize = '1x1' | '2x1' | '1x2' | '2x2'

export interface BlockContent {
  title: string
  url?: string
  icon?: string       // emoji or icon identifier
  description?: string  // optional subtitle shown below the title
  thumbnailUrl?: string
  embedId?: string    // for YouTube / Spotify

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
   * When true the block occupies the full grid width (col-span-2).
   * Replaces the previous spanSize-based col-span logic.
   * Default: false (compact 1-column square).
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
