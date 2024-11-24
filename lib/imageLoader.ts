export default function imageLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) {
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