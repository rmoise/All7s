import {type SanityClient} from 'sanity'
import {useEffect, useCallback} from 'react'
import {useFormValue, useDocumentOperation} from 'sanity'

export function useExcerptSync(client: SanityClient, documentId: string, documentType: string) {
  const body = useFormValue(['body']) as any[]
  const {patch} = useDocumentOperation(documentId, documentType)

  const generateExcerpt = useCallback(() => {
    if (!body || !documentId || !documentType) {
      console.log('Missing required data:', {body, documentId, documentType})
      return
    }

    const excerpt = body
      .filter((block) => block._type === 'block')
      .map((block) =>
        block.children
          ?.filter((child: any) => child._type === 'span' && child.text)
          .map((span: any) => span.text)
          .join(''),
      )
      .join(' ')
      .slice(0, 200)

    if (excerpt) {
      console.log('Generated excerpt:', excerpt)
      patch.execute([
        {
          set: {
            excerpt: excerpt + (excerpt.length >= 200 ? '...' : ''),
          },
        },
      ])
    }
  }, [body, documentId, documentType, patch])

  useEffect(() => {
    console.log('ExcerptSync effect running:', {
      documentId,
      documentType,
      hasBody: !!body,
      bodyLength: body?.length,
    })

    generateExcerpt()
  }, [generateExcerpt])

  return {generateExcerpt}
}
