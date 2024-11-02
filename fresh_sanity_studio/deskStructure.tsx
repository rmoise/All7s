import {HomeIcon, CogIcon, DocumentsIcon, ColorWheelIcon, ArchiveIcon} from '@sanity/icons'
import {FaMusic} from 'react-icons/fa'
import {MdPerson, MdArticle} from 'react-icons/md'
import type {StructureBuilder} from 'sanity/desk'
import { Iframe } from 'sanity-plugin-iframe-pane'
import { iframeOptions } from './sanity.config'

type DeskStructureResolver = (S: StructureBuilder) => ReturnType<StructureBuilder['list']>

const deskStructure: DeskStructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Home
      S.listItem()
        .title('Home')
        .id('home-singleton')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('home')
            .documentId('singleton-home')
            .views([
              S.view.form(),
              S.view
                .component(Iframe)
                .options(iframeOptions)
                .title('Preview')
            ])
        ),

      // Settings
      S.listItem()
        .title('Settings')
        .id('settings-singleton')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('settings')
            .documentId('singleton-settings')
        ),

      // Color Themes
      S.listItem()
        .title('Color Themes')
        .id('color-themes')
        .icon(ColorWheelIcon)
        .child(S.documentTypeList('colorTheme')),

      // Pages with Preview
      S.listItem()
        .title('Pages')
        .id('pages-with-preview')
        .icon(DocumentsIcon)
        .child(
          S.documentTypeList('page')
            .title('Pages')
            .child(documentId =>
              S.document()
                .documentId(documentId)
                .schemaType('page')
                .views([
                  S.view.form(),
                  S.view
                    .component(Iframe)
                    .options(iframeOptions)
                    .title('Preview')
                ])
            )
        ),

      // Collections
      S.listItem()
        .title('Collections')
        .id('collections')
        .icon(ArchiveIcon)
        .child(S.documentTypeList('collection')),

      // Albums
      S.listItem()
        .title('Albums')
        .id('albums')
        .icon(FaMusic)
        .child(S.documentTypeList('album')),

      // Blog Posts with Preview
      S.listItem()
        .title('Blog Posts')
        .id('blog-posts-with-preview')
        .icon(MdArticle)
        .child(
          S.documentTypeList('post')
            .title('Blog Posts')
            .child(documentId =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(),
                  S.view
                    .component(Iframe)
                    .options(iframeOptions)
                    .title('Preview')
                ])
            )
        ),

      // Authors
      S.listItem()
        .title('Authors')
        .id('authors')
        .icon(MdPerson)
        .child(S.documentTypeList('author')),

      // Filter out the types we've explicitly defined above
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['home', 'settings', 'colorTheme', 'page', 'collection', 'album', 'author', 'post'].includes(
            listItem.getId() as string
          )
      ),
    ])

export default deskStructure
