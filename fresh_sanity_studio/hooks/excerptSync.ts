import {type SanityClient} from 'sanity'
import {useCallback} from 'react'
import {useDocumentOperation, useEditState, useClient} from 'sanity'

interface SpanChild {
  _type: string
  text?: string
}

interface Block {
  _type: string
  children?: SpanChild[]
}

interface SanityDocument {
  _id: string
  _type: string
  body?: Block[]
}

interface DocumentOperation {
  patch: {
    execute: (patches: any[]) => void
    disabled: boolean
  }
}

export function useExcerptSync(documentId: string, documentType: string) {
  const client = useClient({apiVersion: '2021-06-07'})
  const {patch} = useDocumentOperation(documentId, documentType) as DocumentOperation
  const editState = useEditState(documentId, documentType)
  const doc = (editState?.draft || editState?.published) as SanityDocument | undefined

  const generateExcerpt = useCallback(() => {
    if (patch.disabled || !editState) return

    const body = doc?.body || []

    if (!documentId || !documentType || !Array.isArray(body)) {
      patch.execute([{unset: ['excerpt']}])
      return
    }

    const textBlocks = body.filter((block): block is Block => block?._type === 'block')

    if (textBlocks.length === 0) {
      patch.execute([{unset: ['excerpt']}])
      return
    }

    const text = textBlocks
      .map((block) => {
        const children = block?.children || []
        return children
          .filter(
            (child): child is SpanChild =>
              child?._type === 'span' && typeof child?.text === 'string',
          )
          .map((span) => span.text || '')
          .join('')
      })
      .join(' ')
      .trim()

    if (!text) {
      patch.execute([{unset: ['excerpt']}])
      return
    }

    const excerpt = text.length > 197 ? text.substring(0, 197) + '...' : text

    patch.execute([
      {
        set: {
          excerpt,
        },
      },
    ])
  }, [doc?.body, documentId, documentType, patch, editState])

  return {generateExcerpt}
}
