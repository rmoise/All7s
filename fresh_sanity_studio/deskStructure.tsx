import {HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon, TagIcon, ComponentIcon} from '@sanity/icons'
import {FaMusic} from 'react-icons/fa'
import {MdPerson, MdArticle} from 'react-icons/md'
import type {StructureBuilder} from 'sanity/desk'
import {Iframe} from 'sanity-plugin-iframe-pane'
import { environments } from './sanity.config'

interface SanityDocument {
  _type: string
  _id: string
  contentBlocks?: any[]
  [key: string]: any
}

const getPreviewUrl = (doc: SanityDocument | null) => {
  if (!doc) return ''

  const envConfig = environments[
    window.location.pathname.includes('/staging') ? 'staging' : 'production'
  ]

  const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET
  if (!secret) return ''

  if (doc._type === 'home') {
    const timestamp = new Date().getTime()
    const isDraft = doc._id.startsWith('drafts.')
    return `${envConfig.baseUrl}/api/preview?secret=${secret}&type=${doc._type}&id=${doc._id}&preview=1&timestamp=${timestamp}&draft=${isDraft}`
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
  const documentId = typeName === 'shopPage' ? 'shopPage' : `singleton-${typeName}`

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
        .title('E-commerce')
        .icon(TagIcon)
        .child(
          S.list()
            .title('E-commerce')
            .items([
              singletonListItem(S, 'shopPage', 'Shop Page', ComponentIcon),
              S.listItem()
                .title('Products')
                .icon(TagIcon)
                .child(S.documentTypeList('product')),
              S.listItem()
                .title('Categories')
                .icon(ArchiveIcon)
                .child(S.documentTypeList('category')),
            ])
        ),

      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('page').title('Pages')),

      S.listItem()
        .title('Blog Posts')
        .icon(MdArticle)
        .child(S.documentTypeList('post').title('Blog Posts')),

      S.listItem()
        .title('Authors')
        .icon(MdPerson)
        .child(S.documentTypeList('author').title('Authors')),

      S.divider(),

      S.listItem()
        .title('Albums')
        .icon(FaMusic)
        .child(S.documentTypeList('album').title('Albums')),

      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'home',
            'settings',
            'page',
            'post',
            'author',
            'collection',
            'album',
            'product',
            'category',
            'shopPage'
          ].includes(listItem.getId() as string),
      ),
    ])

export default structure
