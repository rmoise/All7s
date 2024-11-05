import { HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon } from '@sanity/icons'
import { FaMusic } from 'react-icons/fa'
import { MdPerson, MdArticle } from 'react-icons/md'
import type { StructureBuilder, DefaultDocumentNodeResolver } from 'sanity/desk'
import { Iframe } from 'sanity-plugin-iframe-pane'

// Add type for document
interface SanityDocument {
  _type: string
  _id: string
  contentBlocks?: any[]
  [key: string]: any
}

// Add a revision counter outside the function to track changes
let revisionCounter = 0

const getPreviewUrl = (doc: SanityDocument | null) => {
  if (!doc) return ''

  const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : process.env.SANITY_STUDIO_PREVIEW_URL || 'https://all7z.com'

  if (doc._type === 'home') {
    // Increment counter on each call
    revisionCounter++

    // Create a content hash based on the document's content and counter
    const contentHash = JSON.stringify({
      blocks: doc.contentBlocks || [],
      revision: revisionCounter
    })
      .split('')
      .reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)
      .toString(36)

    const timestamp = new Date().getTime()
    return `${baseUrl}/api/preview?secret=${secret}&type=${doc._type}&id=singleton-home&preview=1&timestamp=${timestamp}&hash=${contentHash}&rev=${revisionCounter}`
  }

  return null
}

// Helper function for singleton items
const singletonListItem = (
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon: any,
  preview = false
) => {
  const documentId = `singleton-${typeName}`

  const documentNode = S.document()
    .schemaType(typeName)
    .documentId(documentId)

  if (preview) {
    return S.listItem()
      .title(title)
      .icon(icon)
      .child(
        documentNode.views([
          S.view.form(),
          S.view
            .component(Iframe)
            .title('Preview')
            .options({
              url: (doc: SanityDocument) => {
                // Force new URL on every change
                const previewUrl = getPreviewUrl(doc)
                console.log('Generated preview URL:', previewUrl)
                return previewUrl
              },
              defaultSize: 'desktop',
              reload: {
                button: true,
                revision: true,
                onPublish: true,
                onDelete: true
              },
              listenToValidationErrors: true,
              listenToFieldValues: true,
              autoRefresh: {
                enabled: true,
                delay: 100
              },
              attributes: {
                allow: 'fullscreen',
                key: revisionCounter.toString()
              }
            })
        ])
      )
  }

  return S.listItem()
    .title(title)
    .icon(icon)
    .child(documentNode)
}

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singleton items using helper
      singletonListItem(S, 'home', 'Home', HomeIcon, true),
      singletonListItem(S, 'settings', 'Settings', CogIcon),

      // Divider
      S.divider(),

      // Document types with custom views
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.documentTypeList('page')
            .title('Pages')
        ),

      S.listItem()
        .title('Blog Posts')
        .icon(MdArticle)
        .child(
          S.documentTypeList('post')
            .title('Blog Posts')
        ),

      S.listItem()
        .title('Authors')
        .icon(MdPerson)
        .child(
          S.documentTypeList('author')
            .title('Authors')
        ),

      // Divider
      S.divider(),

      // Collections and Media
      S.listItem()
        .title('Collections')
        .icon(ArchiveIcon)
        .child(
          S.documentTypeList('collection')
            .title('Collections')
        ),

      S.listItem()
        .title('Albums')
        .icon(FaMusic)
        .child(
          S.documentTypeList('album')
            .title('Albums')
        ),

      // Divider
      S.divider(),

      // Theme and Settings
      S.listItem()
        .title('Color Themes')
        .icon(ColorWheelIcon)
        .child(
          S.documentTypeList('colorTheme')
            .title('Color Themes')
        ),

      // Filter out already defined types
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['home', 'settings', 'page', 'post', 'author', 'colorTheme', 'collection', 'album'].includes(
            listItem.getId() as string
          )
      ),
    ])

export default structure
