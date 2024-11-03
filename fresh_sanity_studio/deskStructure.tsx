import { HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon } from '@sanity/icons'
import { FaMusic } from 'react-icons/fa'
import { MdPerson, MdArticle } from 'react-icons/md'
import type { StructureBuilder } from 'sanity/desk'

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
