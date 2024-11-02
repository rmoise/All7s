import type { StructureBuilder } from 'sanity/desk'
import { Iframe, IframeOptions } from 'sanity-plugin-iframe-pane'

type DefaultDocumentNode = (
  S: StructureBuilder,
  ctx: { schemaType: string }
) => ReturnType<StructureBuilder['document']>

// Define proper types for the iframe options
export const iframeOptions: IframeOptions = {
  url: (doc: any) => {
    if (!doc?._id) return '';
    const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000';

    switch (doc._type) {
      case 'home':
        return `${baseUrl}/?preview=true`;
      case 'post':
        return `${baseUrl}/posts/${doc.slug?.current}?preview=true`;
      case 'page':
        return `${baseUrl}/pages/${doc.slug?.current}?preview=true`;
      default:
        return `${baseUrl}/api/preview?type=${doc._type}&id=${doc._id}`;
    }
  },
  defaultSize: 'desktop' as const, // Type assertion to literal type
  reload: {
    button: true
  },
  attributes: {
    allow: 'fullscreen',
    referrerPolicy: 'strict-origin-when-cross-origin',
    sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups'
  }
}

export const defaultDocumentNode: DefaultDocumentNode = (S, { schemaType }) => {
  const doc = S.document()
  doc.schemaType(schemaType)

  if (['home', 'page', 'post'].includes(schemaType)) {
    doc.documentId(schemaType === 'home' ? 'singleton-home' : `${schemaType}-preview`)
  }

  return doc
}