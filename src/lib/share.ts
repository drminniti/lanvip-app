export async function shareProfile(url: string, title: string, text: string) {
  if (typeof navigator === 'undefined') return false

  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      })
      return true
    } else {
      // Fallback
      await navigator.clipboard.writeText(url)
      return 'copied'
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled the share sheet, do nothing
      return false
    }
    // Fallback on error
    try {
      await navigator.clipboard.writeText(url)
      return 'copied'
    } catch {
      return false
    }
  }
}
