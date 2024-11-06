import { HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon } from '@sanity/icons'
import { FaMusic } from 'react-icons/fa'
import { MdPerson, MdArticle } from 'react-icons/md'
import type { StructureBuilder } from 'sanity/desk'
import { Iframe } from 'sanity-plugin-iframe-pane'

interface SanityDocument {
  _type: string
  _id: string
  contentBlocks?: any[]
  [key: string]: any
}

const getPreviewUrl = (doc: SanityDocument | null) => {
  if (!doc) return ''

  const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET ||
                 process.env.NEXT_PUBLIC_PREVIEW_SECRET
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.pathname.includes('/staging')
      ? 'https://staging--all7z.netlify.app'
      : process.env.SANITY_STUDIO_PREVIEW_URL || 'https://all7z.com'

  if (doc._type === 'home') {
    const timestamp = new Date().getTime()
    return `${baseUrl}/api/preview?secret=${secret}&type=${doc._type}&id=${doc._id}&preview=1&timestamp=${timestamp}`
  }

  return null
}

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
              url: (doc: SanityDocument) => getPreviewUrl(doc),
              defaultSize: 'desktop',
              reload: {
                button: true,
                revision: true
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
      singletonListItem(S, 'home', 'Home', HomeIcon, true),
      singletonListItem(S, 'settings', 'Settings', CogIcon),

      S.divider(),

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

      S.divider(),

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

      S.divider(),

      S.listItem()
        .title('Color Themes')
        .icon(ColorWheelIcon)
        .child(
          S.documentTypeList('colorTheme')
            .title('Color Themes')
        ),

      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['home', 'settings', 'page', 'post', 'author', 'colorTheme', 'collection', 'album'].includes(
            listItem.getId() as string
          )
      ),
    ])

export default structure
