'use client'

interface PortableTextChild {
  _type?: string
  text?: string
  [key: string]: any
}

interface PortableTextBlock {
  _type: string
  children?: PortableTextChild[]
  [key: string]: any
}

interface ErrorObject {
  message?: string
  text?: string
  [key: string]: unknown
}

type ErrorLike = Error | ErrorObject | unknown

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const hasMessage = (obj: unknown): obj is { message: string } => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'message' in obj &&
      typeof (obj as any).message === 'string'
    )
  }

  const hasText = (obj: unknown): obj is { text: string } => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'text' in obj &&
      typeof (obj as any).text === 'string'
    )
  }

  const extractText = (obj: unknown): string => {
    // Base cases
    if (typeof obj === 'string') return obj
    if (typeof obj === 'number') return String(obj)
    if (obj === null || obj === undefined) return ''

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj
        .map((item: unknown) => {
          if (typeof item === 'string') return item
          if (hasText(item)) return item.text
          return extractText(item)
        })
        .filter(Boolean)
        .join(' ')
    }

    // Handle Portable Text block
    if (typeof obj === 'object' && obj !== null && '_type' in obj) {
      const block = obj as PortableTextBlock
      if (block._type === 'block' && Array.isArray(block.children)) {
        return block.children
          .map((child: PortableTextChild) =>
            typeof child?.text === 'string' ? child.text : ''
          )
          .filter(Boolean)
          .join(' ')
      }
    }

    // Handle Error instance and objects with message
    if (typeof obj === 'object' && obj !== null) {
      if (obj instanceof Error || hasMessage(obj)) {
        return (obj as { message: string }).message || 'Unknown error'
      }
      if (hasText(obj)) {
        return obj.text
      }

      // Handle plain object
      return Object.values(obj as Record<string, unknown>)
        .map((value) => extractText(value))
        .filter(Boolean)
        .join(' ')
    }

    return ''
  }

  const getErrorMessage = (error: ErrorLike): string => {
    try {
      const message = extractText(error)
      return message || 'An unexpected error occurred'
    } catch (e) {
      console.error('Error while processing error message:', e)
      return 'An unexpected error occurred'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-xl mb-4">Error loading blog</h2>
      <div className="text-sm mb-4 max-w-lg text-gray-400">
        {getErrorMessage(error)}
      </div>
      <button
        onClick={() => reset()}
        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
