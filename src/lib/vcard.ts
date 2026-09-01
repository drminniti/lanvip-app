/**
 * vcard.ts — VCF 3.0 generator for vCard blocks.
 *
 * Generates a .vcf file client-side and triggers a browser download.
 * Zero external dependencies — pure string manipulation + Blob API.
 *
 * VCF 3.0 spec: https://datatracker.ietf.org/doc/html/rfc2426
 */

import type { BlockContent } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escapes commas, semicolons and backslashes per VCF 3.0 spec. */
function escVcf(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g,  '\\,')
    .replace(/;/g,  '\\;')
    .replace(/\n/g, '\\n')
}

/**
 * Derives a safe filename from the block title.
 * e.g. "Damian Minniti CEO" → "Damian_Minniti_CEO.vcf"
 */
function safeFilename(title: string): string {
  const base = title
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, '') // keep accented chars
    .replace(/\s+/g, '_')
    .slice(0, 60) // max 60 chars to stay reasonable
  return `${base || 'contacto'}.vcf`
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates and downloads a VCF 3.0 contact card from a vCard block's content.
 *
 * @param content      - The block's content object
 * @param displayName  - Profile displayName used as fallback for FN field
 */
export function downloadVCard(
  content:     BlockContent,
  displayName: string = '',
): void {
  const name    = content.title  || displayName || 'Contacto'
  const phone   = content.phone   ?? ''
  const email   = content.email   ?? ''
  const company = content.company ?? ''
  const title   = content.jobTitle ?? ''
  const url     = content.url     ?? ''
  const note    = content.description ?? ''

  // Build VCF lines — only include non-empty fields
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escVcf(name)}`,
    `N:${escVcf(name)};;;;`,
  ]

  if (title)   lines.push(`TITLE:${escVcf(title)}`)
  if (company) lines.push(`ORG:${escVcf(company)}`)
  if (phone)   lines.push(`TEL;TYPE=CELL:${escVcf(phone)}`)
  if (email)   lines.push(`EMAIL;TYPE=INTERNET:${escVcf(email)}`)
  if (url)     lines.push(`URL:${escVcf(url)}`)
  if (note)    lines.push(`NOTE:${escVcf(note)}`)

  lines.push('END:VCARD')

  const vcfString = lines.join('\r\n')
  const blob      = new Blob([vcfString], { type: 'text/vcard;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)

  // Trigger download via a temporary <a> element
  const anchor       = document.createElement('a')
  anchor.href        = objectUrl
  anchor.download    = safeFilename(name)
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  // Release the object URL after a short delay (browser needs it for the click)
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
