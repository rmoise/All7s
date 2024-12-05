// schemas/schema.ts
import type {BaseSchemaDefinition} from 'sanity'

// Import your schema types
import blockContent from './objects/blockContent'
import post from './documents/post'
import author from './documents/author'
import heroBanner from './objects/heroBanner'
import product from './documents/products'
import comments from './documents/comments'
import homePage from './documents/home'
import newsletter from './objects/newsletter'
import siteSettings from './documents/settings'
import contactPage from './documents/contactPage'
import album from './objects/album'
import blogPage from './documents/blogPage'
import additionalVideo from './objects/additionalVideo'
import musicBlock from './objects/musicBlock'
import videoBlock from './objects/videoBlock'
import backgroundVideoBlock from './objects/backgroundVideoBlock'
import contentBlock from './objects/contentBlock'
import splash from './objects/splash'
import shopPage from './documents/shopPage'
import productCategory from './documents/category'
import song from './objects/song'
import seo from './objects/seo'
import category from './documents/category'
import about from './objects/about'
import youtube from './objects/youtube'

const schemaTypes: BaseSchemaDefinition[] = [
  // Document types
  post,
  author,
  seo,
  blogPage,
  homePage,
  contactPage,
  product,
  comments,
  siteSettings,
  shopPage,
  category,

  // Object types
  heroBanner,
  splash,
  musicBlock,
  videoBlock,
  backgroundVideoBlock,
  contentBlock,
  blockContent,
  newsletter,
  album,
  additionalVideo,
  song,
  about,
  youtube,
]
export default schemaTypes
