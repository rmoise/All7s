import {
  type SanityClient,
  definePlugin,
  type DocumentActionsContext,
  type DocumentActionComponent,
  type DocumentActionDescription,
  useClient,
} from 'sanity'
import {useCallback, useEffect, useRef, useMemo} from 'react'
import {useDocumentOperation, useEditState} from 'sanity'
import {useExcerptSync} from '../hooks/excerptSync'

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

function ExcerptSyncAction(props: DocumentActionProps): DocumentActionDescription {
  const {id, type} = props
  const documentId = useMemo(() => getBaseId(id), [id])
  const client = useClient({apiVersion: '2021-06-07'})
  const editState = useEditState(documentId, type)
  const doc = editState?.draft || editState?.published

  const {generateExcerpt} = useExcerptSync(documentId, type)

  useEffect(() => {
    // Only update if we have a valid document and body content
    if (editState && doc?.body && Array.isArray(doc.body)) {
      // Add a small delay to avoid rapid updates while typing
      const timer = setTimeout(() => {
        generateExcerpt()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [doc?.body, generateExcerpt, editState])

  const disabled = !editState || !doc?.body || !Array.isArray(doc.body) || doc.body.length === 0

  return {
    label: 'Sync Excerpt',
    onHandle: generateExcerpt,
    disabled,
    title: disabled
      ? 'Document must have content to sync excerpt'
      : 'Generate excerpt from content',
  }
}

// Export as named export for better debugging
export const excerptSyncPlugin = definePlugin(() => {
  return {
    name: 'excerpt-sync',
    document: {
      actions: (prev: DocumentActionComponent[], context: DocumentActionsContext) => {
        if (context.schemaType !== 'post') return prev
        return [...prev, ExcerptSyncAction]
      },
    },
  }
})
