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
    const bodyContent = currentDoc?.body?.[0]
    console.log('ExcerptSync: Document state:', {
      hasDraft: !!props.draft,
      hasPublished: !!props.published,
      currentDoc: currentDoc ? {
        id: currentDoc._id,
        type: currentDoc._type,
        bodyLength: currentDoc.body?.length,
        bodyContent: bodyContent ? {
          _type: bodyContent._type,
          childrenCount: bodyContent.children?.length,
          firstChild: bodyContent.children?.[0]
        } : null
      } : null
    })
    return currentDoc
  }, [props.draft, props.published])

  const handleSync = useCallback(() => {
    console.log('ExcerptSync: Starting sync', {
      hasBody: !!doc?.body,
      isArray: Array.isArray(doc?.body),
      bodyLength: doc?.body?.length,
      documentId
    })

    if (!doc?.body || !Array.isArray(doc.body)) {
      console.warn('ExcerptSync: Cannot sync - invalid document state')
      patch.execute([{
        unset: ['excerpt']
      }])
      return
    }

    try {
      const textBlocks = doc.body.filter(block => block._type === 'block')

      if (textBlocks.length === 0) {
        console.log('ExcerptSync: No text blocks found, clearing excerpt')
        patch.execute([{
          unset: ['excerpt']
        }])
        return
      }

      const text = textBlocks
        .map(block => {
          const content = block.children
            .filter((child: SpanChild) => child._type === 'span')
            .map((span: SpanChild) => {
              console.log('ExcerptSync: Processing span', { text: span.text })
              return span.text || ''
            })
            .join('')
          console.log('ExcerptSync: Block content', { content })
          return content
        })
        .join('\n\n')
        .trim()

      if (!text) {
        console.log('ExcerptSync: No text content found, clearing excerpt')
        patch.execute([{
          unset: ['excerpt']
        }])
        return
      }

      const excerpt = text.length > 197
        ? text.substring(0, 197) + '...'
        : text

      console.log('ExcerptSync: Generated excerpt', {
        textLength: excerpt.length,
        excerpt,
        originalText: text
      })

      lastSyncRef.current = text

      patch.execute([{
        set: {
          excerpt
        }
      }])
      console.log('ExcerptSync: Patch executed')
    } catch (error) {
      console.error('ExcerptSync: Error during sync', error)
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
      console.log('ExcerptSync: Content changed, preparing to sync')

      // Update the ref immediately to prevent multiple triggers
      lastContentRef.current = currentText

      // Debounce the sync operation
      const timeoutId = setTimeout(() => {
        console.log('ExcerptSync: Executing delayed sync')
        handleSync()
      }, 1000) // Wait 1 second before syncing

      // Cleanup timeout on unmount or content change
      return () => clearTimeout(timeoutId)
    }
  }, [doc?.body, handleSync])

  // Stable disabled state with logging
  const disabled = useMemo(() => {
    const isDisabled = !doc?.body || !Array.isArray(doc.body)
    console.log('ExcerptSync: Disabled state', {
      isDisabled,
      hasBody: !!doc?.body,
      isArray: Array.isArray(doc?.body)
    })
    return isDisabled
  }, [doc?.body])

  useEffect(() => {
    mountCount.current += 1
    console.log('ExcerptSync: Component mounted', {
      mountCount: mountCount.current,
      documentId,
      hasBody: !!doc?.body
    })

    return () => {
      console.log('ExcerptSync: Component unmounted', {
        mountCount: mountCount.current,
        documentId
      })
    }
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
