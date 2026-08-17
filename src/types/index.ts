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
  avatarUrl: string
  themeSettings: ThemeSettings
  views: number
  createdAt: Timestamp

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
  description?: string
  thumbnailUrl?: string
  embedId?: string    // for YouTube / Spotify
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
