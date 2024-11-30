export default function imageLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    if (src.startsWith('https://cdn.sanity.io')) {
      const url = new URL(src)
      const params = new URLSearchParams(url.search)

      if (!params.has('w')) params.set('w', width.toString())
      if (!params.has('q') && quality) params.set('q', quality.toString())
      if (!params.has('auto')) params.set('auto', 'format')

      url.search = params.toString()
      return url.toString()
    }
    return src
  }

  // In production, use Netlify's image optimization
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}${quality ? `&q=${quality}` : ''}`
}