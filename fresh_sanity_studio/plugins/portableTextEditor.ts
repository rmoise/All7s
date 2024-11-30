import {definePlugin} from 'sanity'
import {type SanityClient} from 'sanity'
import {useDocumentStore, useDocumentOperation, useEditState, useFormValue} from 'sanity'
import React, {useEffect, useState} from 'react'
import {type Observable} from 'rxjs'

interface FormBuilderContext {
  value?: any
  path?: string[]
  presence?: any
  markers?: any[]
  focusPath?: string[]
  onFocus?: (path: string[]) => void
  onBlur?: () => void
  onChange?: (patch: any) => void
  level?: number
  readOnly?: boolean
  filterField?: any
}

interface FormContext {
  documentId?: string
  documentType?: string
  getState?: () => FormState
  [key: string]: any
}

interface BlockContentInputProps {
  schemaType?: {name: string}
  path?: string[]
  value?: any
  changed?: boolean
  parent?: {
    document?: any
    form?: FormContext
    formBuilder?: FormBuilderContext
  }
  form?: FormContext
  renderDefault: (props: any) => React.ReactNode
  client: SanityClient
  documentId?: string
}

interface FormState {
  documentId?: string
  documentType?: string
  [key: string]: any
}

interface PostDocument {
  _id: string
  _type: string
  _rev: string
  _createdAt: string
  _updatedAt: string
  body?: any
}

interface ExcerptUpdaterProps {
  client: SanityClient
}

interface LayoutProps {
  renderDefault?: (props: any) => React.ReactElement
  client?: SanityClient
}

function BlockContentInputWrapper(props: BlockContentInputProps) {
  // Get document ID from form context or props
  const documentId = props.documentId || props.form?.documentId || props.parent?.form?.documentId;

  // Add helper to strip draft prefix
  const stripDraftId = (id: string | undefined) =>
    id ? id.replace(/^drafts\./, '') : id;

  // Modify props before passing to component
  const sanitizedProps = {
    ...props,
    documentId: stripDraftId(documentId)
  };

  console.log('Form values:', props);

  return props.renderDefault(sanitizedProps);
}

// Create the forwarded ref component
const BlockContentInput = React.forwardRef<HTMLDivElement, BlockContentInputProps>(
  (props, ref) => {
    return React.createElement(BlockContentInputWrapper, props);
  }
);

BlockContentInput.displayName = 'BlockContentInput';

const ExcerptUpdater: React.ForwardRefRenderFunction<HTMLDivElement, ExcerptUpdaterProps> = (props, ref) => {
  const { client } = props
  React.useEffect(() => {
    console.log('ExcerptUpdater mounted with client:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset
    })
  }, [client])

  return null
}

const ForwardedExcerptUpdater = React.forwardRef(ExcerptUpdater)
ForwardedExcerptUpdater.displayName = 'ExcerptUpdater'

const LayoutComponent = React.forwardRef<HTMLDivElement, LayoutProps>((props, ref) => {
  const { renderDefault, client } = props

  React.useEffect(() => {
    console.log('Layout component mounted with props:', {
      hasRenderDefault: !!renderDefault,
      hasClient: !!client,
      clientConfig: client?.config()
    })
    return () => console.log('Layout component unmounted')
  }, [renderDefault, client])

  if (!renderDefault || !client) {
    return null
  }

  return React.createElement(
    React.Fragment,
    null,
    renderDefault(props),
    React.createElement(ForwardedExcerptUpdater, {
      client: client,
      key: "excerptUpdater"
    })
  )
})

LayoutComponent.displayName = 'LayoutComponent'

const ForwardedLayoutComponent = LayoutComponent

// Create a wrapper component to handle document store access
const DocumentStoreInput = (props: any) => {
  const documentStore = useDocumentStore()
  // Always call hooks at the top level
  const editState = useEditState(props.id, props.type)
  const {patch} = useDocumentOperation(props.id, props.type)
  const [currentDocument, setCurrentDocument] = useState<any>(null)

  useEffect(() => {
    console.log('Document store context:', {
      hasEditState: !!editState,
      id: props.id,
      type: props.type,
      draft: editState?.draft,
      published: editState?.published,
      ready: editState?.ready
    })

    if (props.id && props.type && props.id !== 'unknown') {
      console.log('Subscribing to document:', {
        id: props.id,
        type: props.type,
        path: props.path
      })

      const subscription = documentStore.listenQuery(
        `*[_id == $id || _id == $draftId][0]`,
        {
          id: props.id,
          draftId: `drafts.${props.id}`
        },
        { perspective: 'previewDrafts' }
      ).subscribe((result: any) => {
        console.log('Document subscription result:', {
          id: props.id,
          result,
          hasResult: !!result,
          resultId: result?._id,
          resultType: result?._type
        })
        setCurrentDocument(result)
      })

      return () => subscription.unsubscribe()
    }
  }, [documentStore, editState, props.id, props.type])

  // Create document context
  const documentContext = {
    document: currentDocument || editState?.draft || editState?.published || {},
    value: props.value,
    editState
  }

  return React.createElement(BlockContentInput, {
    ...props,
    client: props.client,
    parent: documentContext,
    ref: null
  })
}

export const portableTextEditorPlugin = definePlugin<{client: SanityClient}>(({client}) => {
  if (!client) {
    throw new Error('Client is required for portableTextEditorPlugin')
  }

  return {
    name: 'portable-text-editor',
    form: {
      components: {
        input: (props: any) => {
          if (props.schemaType?.name !== 'blockContent') {
            return props.renderDefault(props)
          }

          return React.createElement(BlockContentInputWrapper, {
            ...props,
            client,
            ref: null
          })
        }
      }
    }
  }
})
