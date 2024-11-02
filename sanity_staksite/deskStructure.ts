import { StructureBuilder } from 'sanity/desk'
import { HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon } from '@sanity/icons'
import { FaMusic } from 'react-icons/fa'

export default (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singleton for Home
      S.listItem()
        .title('Home')
        .id('home')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('home')
            .documentId('singleton-home')
            .title('Home')
        ),

      // Singleton for Settings
      S.listItem()
        .title('Settings')
        .id('settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('settings')
            .documentId('singleton-settings')
            .title('Settings')
        ),

      // Color Themes
      S.listItem()
        .title('Color Themes')
        .id('color-themes-list')
        .icon(ColorWheelIcon)
        .child(S.documentTypeList('colorTheme')),

      // Pages
      S.listItem()
        .title('Pages')
        .id('pages-list')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('page')),

      // Collections
      S.listItem()
        .title('Collections')
        .id('collections-list')
        .icon(ArchiveIcon)
        .child(S.documentTypeList('collection')),

      // Albums
      S.listItem()
        .title('Albums')
        .id('albums-list')
        .icon(FaMusic)
        .child(S.documentTypeList('album').title('Albums')),

      // All other document types
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['home', 'settings', 'colorTheme', 'page', 'collection', 'album'].includes(
            listItem.getId() as string
          )
      ),
    ])
