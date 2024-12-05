import {
  type SanityClient,
  definePlugin,
  type DocumentActionsContext,
  type DocumentActionComponent,
  type DocumentActionDescription,
} from 'sanity'
import {useCallback, useEffect, useRef, useMemo} from 'react'
import {useDocumentOperation} from 'sanity'

interface SpanChild {
  _type: string
  text?: string
}

interface Block {
  _type: string
  children: SpanChild[]
}

interface SanityDocument {
  _id: string
  _type: string
  body?: Block[]
}

interface DocumentActionProps {
  id: string
  type: string
  draft?: SanityDocument | null
  published?: SanityDocument | null
}

// Helper function to get base ID (removes "drafts." prefix)
function getBaseId(id: string): string {
  return id.replace(/^drafts\./, '')
}

// Define the document action
function ExcerptSyncAction(props: DocumentActionProps): DocumentActionDescription {
  const {id, type} = props
  const documentId = useMemo(() => getBaseId(id), [id])
  const {patch} = useDocumentOperation(documentId, type)
  const mountCount = useRef(0)
  const lastSyncRef = useRef<string | null>(null)
  const lastContentRef = useRef<string | null>(null)

  // Stable reference to current document with debug logging
  const doc = useMemo(() => {
    const currentDoc = props.draft || props.published
    return currentDoc
  }, [props.draft, props.published])

  const handleSync = useCallback(() => {
    if (!doc?.body || !Array.isArray(doc.body)) {
      patch.execute([{
        unset: ['excerpt']
      }])
      return
    }

    try {
      const textBlocks = doc.body.filter(block => block._type === 'block')

      if (textBlocks.length === 0) {
        patch.execute([{
          unset: ['excerpt']
        }])
        return
      }

      const text = textBlocks
        .map(block => {
          const content = block.children
            .filter((child: SpanChild) => child._type === 'span')
            .map((span: SpanChild) => span.text || '')
            .join('')
          return content
        })
        .join('\n\n')
        .trim()

      if (!text) {
        patch.execute([{
          unset: ['excerpt']
        }])
        return
      }

      const excerpt = text.length > 197
        ? text.substring(0, 197) + '...'
        : text

      lastSyncRef.current = text

      patch.execute([{
        set: {
          excerpt
        }
      }])
    } catch (error) {
      throw error
    }
  }, [doc?.body, patch, documentId])

  // Modified auto-sync effect with debouncing and content tracking
  useEffect(() => {
    if (!doc?.body || !Array.isArray(doc.body)) return

    const currentText = doc.body
      .filter(block => block._type === 'block')
      .map(block => block.children
        .filter((child: SpanChild) => child._type === 'span')
        .map((span: SpanChild) => span.text || '')
        .join('')
      )
      .join('\n\n')

    // Only sync if content has actually changed
    if (currentText && currentText !== lastContentRef.current) {
      lastContentRef.current = currentText
      const timeoutId = setTimeout(() => {
        handleSync()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [doc?.body, handleSync])

  // Stable disabled state with logging
  const disabled = useMemo(() => {
    return !doc?.body || !Array.isArray(doc.body)
  }, [doc?.body])

  useEffect(() => {
    mountCount.current += 1
    return () => {}
  }, [documentId, doc?.body])

  return {
    label: 'Sync Excerpt',
    onHandle: handleSync,
    disabled,
    title: disabled ? 'Document must have content to sync excerpt' : 'Generate excerpt from content'
  }
}

// Plugin definition
export const excerptSyncPlugin = definePlugin(() => ({
  name: 'excerpt-sync',
  document: {
    actions: (prev: DocumentActionComponent[], context: DocumentActionsContext) =>
      context.schemaType === 'post' ? [...prev, ExcerptSyncAction] : prev
  }
}))
