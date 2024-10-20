import type {StructureBuilder} from 'sanity/desk'
import {HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon} from '@sanity/icons'

export default (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home')
        .id('home-singleton')
        .icon(HomeIcon)
        .child(
          S.document().schemaType('home').documentId('home').title('Home')
        ),
      S.listItem()
        .title('Settings')
        .id('settings-singleton')
        .icon(CogIcon)
        .child(S.editor().schemaType('settings').documentId('settings')
        .title('Settings')),
      S.listItem()
        .title('Color Themes')
        .id('color-themes-list')
        .icon(ColorWheelIcon)
        .child(S.documentTypeList('colorTheme')),
      S.listItem()
        .title('Pages')
        .id('pages-list')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('page')),
      S.listItem()
        .title('Collections')
        .id('collections-list')
        .icon(ArchiveIcon)
        .child(S.documentTypeList('collection')),
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['home', 'settings', 'colorTheme', 'page', 'collection'].includes(
            listItem.getId() as string
          )
      ),
    ])
