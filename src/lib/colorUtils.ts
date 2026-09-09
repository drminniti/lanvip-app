/**
 * Parses a hex color string (e.g. #fff, #ffffff) to RGB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculates luminance (YIQ) of a hex color.
 * Returns true if the color is considered 'light'.
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false // Assume dark if invalid

  // YIQ formula
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq >= 128
}

/**
 * Returns the best contrasting text color (#ffffff or #111111) for a given background color.
 */
export function getAutoContrastTextColor(bgHex: string): string {
  return isLightColor(bgHex) ? '#111111' : '#ffffff'
}
