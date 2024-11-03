// schemas/schema.ts
import type { BaseSchemaDefinition } from 'sanity'

// Import your schema types
import blockContent from './objects/blockContent'
import category from './modules/category'
import post from './documents/post'
import author from './documents/author'
import about from './documents/about'
import youtube from './objects/youtube'
import musicLink from './objects/musicLink'
import videoLink from './objects/videoLink'
import heroVideo from './objects/heroVideo'
import product from './documents/product'
import banner from './modules/banner'
import comments from './documents/comments'
import footer from './documents/footer'
import heroBanner from './objects/heroBanner'
import homePage from './documents/home'
import newsletter from './objects/newsletter'
import navbar from './documents/navbar'
import siteSettings from './documents/settings'
import contactPage from './documents/contactPage'
import album from './objects/album'
import colorTheme from './documents/colorTheme'
import page from './documents/page'
import collection from './documents/collection'
import additionalVideo from './objects/additionalVideo'
import musicBlock from './objects/musicBlock'
import videoBlock from './objects/videoBlock'
import backgroundVideoBlock from './objects/backgroundVideoBlock'
import contentBlock from './objects/contentBlock'
import splash from './objects/splash'

const schemaTypes: BaseSchemaDefinition[] = [
  // Document types
  post,
  author,
  page,
  homePage,
  about,
  contactPage,
  collection,
  product,
  comments,
  footer,
  navbar,
  siteSettings,
  colorTheme,

  // Object types
  heroBanner,
  splash,
  musicBlock,
  videoBlock,
  backgroundVideoBlock,
  contentBlock,
  blockContent,
  musicLink,
  videoLink,
  heroVideo,
  banner,
  newsletter,
  album,
  category,
  youtube,
  additionalVideo,
]

export default schemaTypes
