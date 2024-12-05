import { HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon } from '@sanity/icons'
import { FaMusic } from 'react-icons/fa'
import { MdPerson, MdArticle } from 'react-icons/md'
import type { StructureBuilder } from 'sanity/desk'
import { Iframe } from 'sanity-plugin-iframe-pane'

const getPreviewUrl = (doc: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://all7z.com'

  switch (doc._type) {
    case 'home':
      return `${baseUrl}/?preview=1`
    case 'post':
      return `${baseUrl}/blog/${doc?.slug?.current}?preview=1`
    case 'page':
      return `${baseUrl}/${doc?.slug?.current}?preview=1`
    default:
      return `${baseUrl}/?preview=1`
  }
}

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singleton items
      S.listItem()
        .title('Home')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('home')
            .documentId('singleton-home')
            .views([
              S.view.form(),
              S.view
                .component(Iframe)
                .title('Preview')
                .options({
                  url: (doc: any) => getPreviewUrl(doc)
                })
            ])
        ),

      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('settings')
            .documentId('singleton-settings')
        ),

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
