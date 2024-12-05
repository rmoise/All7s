import {
  HomeIcon,
  CogIcon,
  DocumentsIcon,
  ColorWheelIcon,
  ArchiveIcon,
  TagIcon,
  ComponentIcon,
} from '@sanity/icons'
import {FaMusic} from 'react-icons/fa'
import {MdPerson, MdArticle} from 'react-icons/md'
import type {StructureBuilder} from 'sanity/desk'
import {Iframe} from 'sanity-plugin-iframe-pane'
import {environments} from './sanity.config'

interface SanityDocument {
  _type: string
  _id: string
  contentBlocks?: any[]
  [key: string]: any
}

const getPreviewUrl = (doc: SanityDocument | null) => {
  if (!doc) return ''

  const baseUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://all7z.com'

  if (doc._type === 'home') {
    return `${baseUrl}/api/preview?preview=1`
  }

  return null
}

const singletonListItem = (
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon: any,
  preview = false,
) => {
  const documentId = ['shopPage', 'blogPage'].includes(typeName)
    ? typeName
    : `singleton-${typeName}`

  const documentNode = S.document().schemaType(typeName).documentId(documentId)

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
                revision: true,
              },
            }),
        ]),
      )
  }

  return S.listItem().title(title).icon(icon).child(documentNode)
}

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      singletonListItem(S, 'home', 'Home', HomeIcon, true),
      singletonListItem(S, 'settings', 'Settings', CogIcon),

      S.divider(),

      S.listItem()
        .title('Blog')
        .icon(MdArticle)
        .child(
          S.list()
            .title('Blog')
            .items([
              singletonListItem(S, 'blogPage', 'Blog Page', ComponentIcon),
              S.listItem().title('Posts').icon(DocumentsIcon).child(S.documentTypeList('post')),
              S.listItem().title('Authors').icon(MdPerson).child(S.documentTypeList('author')),
            ]),
        ),

      S.listItem()
        .title('E-commerce')
        .icon(TagIcon)
        .child(
          S.list()
            .title('E-commerce')
            .items([
              singletonListItem(S, 'shopPage', 'Shop Page', ComponentIcon),
              S.listItem().title('Products').icon(TagIcon).child(S.documentTypeList('product')),
              S.listItem()
                .title('Categories')
                .icon(ArchiveIcon)
                .child(S.documentTypeList('category')),
            ]),
        ),

      S.divider(),

      S.listItem().title('Albums').icon(FaMusic).child(S.documentTypeList('album').title('Albums')),

      S.listItem()
        .title('Contact Page')
        .icon(ComponentIcon)
        .child(S.document().schemaType('contactPage').documentId('singleton-contactPage')),

      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'home',
            'settings',
            'post',
            'author',
            'collection',
            'album',
            'product',
            'category',
            'shopPage',
            'blogPage',
          ].includes(listItem.getId() as string),
      ),
    ])
export default structure
