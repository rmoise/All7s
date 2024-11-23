import type {
  SanityBaseDocument,
  SanityImage,
  NavbarData as SanityNavbarData,
  FooterSettings as SanityFooterSettings,
  SiteSettings as SanitySiteSettings,
  ContentBlock as SanityContentBlock,
  SanityRawSong,
  NavigationLink,
  Song,
  ProductImage
} from './sanity'

import type {
  CustomAlbum,
  EmbeddedAlbum,
  Album as MusicAlbum
} from './music'

// Re-export types
export type {
  SanityBaseDocument,
  SanityImage,
  SanityRawSong,
  NavigationLink,
  Song,
  ProductImage,
  CustomAlbum,
  EmbeddedAlbum
}

// Content Block Types
export interface BaseContentBlock extends SanityContentBlock {
  _key: string
}

export interface HeroBannerContent extends BaseContentBlock {
  _type: 'heroBanner'
  backgroundImage: SanityImage
  smallText: string
  midText: string
  largeText1: string
  cta: {
    text?: string
    link?: string
  }
}

export interface AboutContent extends BaseContentBlock {
  _type: 'about'
  body: any[] // TODO: Replace with proper BlockContent type
  image: SanityImage
  alignment: 'left' | 'right'
}

export interface MusicBlockProps {
  listenTitle: string
  description?: string
  albums?: Array<Album | {
    _ref: string
    _type: 'reference'
    _key: string
  }>
}

export interface MusicBlockContent extends BaseContentBlock {
  _type: 'musicBlock'
  listenTitle: string
  description?: string
  albums: Array<{
    _ref: string
    _type: 'reference'
    _key: string
  }>
  resolvedAlbums?: Album[]
}

export interface VideoBlockContent extends BaseContentBlock {
  _type: 'videoBlock'
  lookTitle: string
  heroVideoLink: string
  additionalVideos: Array<{
    _key: string
    url: string
  }>
}

export interface BackgroundVideoContent extends BaseContentBlock {
  _type: 'backgroundVideoBlock'
  backgroundVideoUrl: string
  backgroundVideoFile: {
    asset?: {
      _ref: string
      _type: 'reference'
    }
    _type: 'file'
  }
  posterImage: {
    asset?: {
      _ref: string
      _type: 'reference'
    }
    _type: 'image'
  }
}

export interface NewsletterContent extends BaseContentBlock {
  _type: 'newsletter'
  headline: string
  description: string
  ctaText: string
  placeholderText: string
  formName: string
  notification?: {
    title: string
    description: string
    showSocialLinks: boolean
    socialLinksTitle: string
    socialLinks: Array<{
      platform: string
      url: string
      color: {
        hex: string
      }
    }>
  }
}

export type ContentBlock =
  | HeroBannerContent
  | AboutContent
  | MusicBlockContent
  | VideoBlockContent
  | BackgroundVideoContent
  | NewsletterContent

// Album Types
export interface SanityAsset {
  asset: {
    _id: string
    url: string
    metadata?: {
      dimensions: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
}

export interface Album extends MusicAlbum {
  _id: string
  _key?: string
  albumSource: 'custom' | 'embedded'
  embeddedAlbum?: EmbeddedAlbum
  customAlbum?: CustomAlbum
}

// Export HomeData interface
export interface HomeData extends SanityBaseDocument {
  _type: 'home'
  title?: string
  metaTitle?: string
  metaDescription?: string
  openGraphImage?: SanityImage
  contentBlocks: ContentBlock[]
}

// Extended Navbar types
export interface NavbarData extends SanityNavbarData {
  navigationLinks?: NavigationLink[]
}

export interface FooterSettings extends SanityFooterSettings {
  alignment?: 'left' | 'center' | 'right'
}

export interface SiteSettings extends SanitySiteSettings {
  navbar?: NavbarData
  footer?: FooterSettings
}

// Keep existing component and context types...
startLine: 258
endLine: 270