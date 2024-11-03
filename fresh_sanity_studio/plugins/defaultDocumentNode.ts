import { DefaultDocumentNodeResolver } from 'sanity/desk'
import { Iframe } from 'sanity-plugin-iframe-pane'

const getPreviewUrl = (doc: any) => {
  if (!doc) return ''

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://your-production-url.com'

  switch (doc._type) {
    case 'home':
      return `${baseUrl}/api/preview?type=home`
    case 'post':
      return `${baseUrl}/api/preview?type=post&slug=${doc?.slug?.current}`
    case 'page':
      return `${baseUrl}/api/preview?type=page&slug=${doc?.slug?.current}`
    default:
      return `${baseUrl}/api/preview`
  }
}

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  // Add preview view only to documents with schema type 'home'
  if (schemaType === 'home') {
    return S.document().views([
      // Default form view
      S.view.form(),
      // Preview view
      S.view
        .component(Iframe)
        .title('Preview')
        .options({
          url: getPreviewUrl,
          defaultSize: 'desktop',
          reload: {
            button: true
          }
        })
    ])
  }
  return S.document().views([S.view.form()])
}