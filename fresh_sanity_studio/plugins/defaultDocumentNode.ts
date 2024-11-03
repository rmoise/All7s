import { deskTool } from 'sanity/desk'
import { Iframe, IframeOptions } from 'sanity-plugin-iframe-pane'

interface SanityDocument {
  _type: string;
  _id: string;
  slug?: {
    current: string;
  };
}

const getPreviewUrl = (doc: SanityDocument | null): string => {
  if (!doc) return ''

  const baseUrl = (() => {
    if (typeof window === 'undefined') return 'https://all7z.com'

    const hostMap: Record<string, string> = {
      'localhost': 'http://localhost:8888',
      'staging--all7z.netlify.app': 'https://staging--all7z.netlify.app',
      'all7z.com': 'https://all7z.com'
    }

    return hostMap[window.location.hostname] || 'https://all7z.com'
  })()

  switch (doc._type) {
    case 'home':
      return `${baseUrl}/?preview=true`
    case 'post':
      return doc.slug?.current
        ? `${baseUrl}/posts/${doc.slug.current}?preview=true`
        : `${baseUrl}/?preview=true`
    case 'page':
      return doc.slug?.current
        ? `${baseUrl}/pages/${doc.slug.current}?preview=true`
        : `${baseUrl}/?preview=true`
    default:
      return `${baseUrl}/api/preview?type=${doc._type}&id=${doc._id}`
  }
}

interface DocumentNodeContext {
  schemaType: string;
}

export const defaultDocumentNode = (
  S: any,
  context: DocumentNodeContext
) => {
  const { schemaType } = context

  if (!['home', 'post', 'page'].includes(schemaType)) {
    return S.document()
  }

  const iframeOptions: IframeOptions = {
    url: getPreviewUrl,
    defaultSize: 'desktop',
    reload: {
      button: true
    },
    attributes: {
      allow: 'fullscreen',
      referrerPolicy: 'strict-origin-when-cross-origin',
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups'
    }
  }

  return S.document()
    .schemaType(schemaType)
    .views([
      S.view.form(),
      S.view
        .component(Iframe)
        .title('Preview')
        .options(iframeOptions)
    ])
}