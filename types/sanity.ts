import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Base Document Type
export interface SanityBaseDocument {
  _id: string
  _type: string
  _rev: string
  _createdAt: string
  _updatedAt: string
}

// Base Sanity Image types
export interface SanityImageHotspot {
  _type: 'sanity.imageHotspot'
  x: number
  y: number
  height: number
  width: number
}

export interface SanityImageCrop {
  _type: 'sanity.imageCrop'
  top: number
  bottom: number
  left: number
  right: number
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: SanityImageHotspot
  crop?: SanityImageCrop
}

// Navigation types
export interface NavigationLink {
  name: string
  href: string
  _key?: string
}

export interface NavbarData {
  navigationLinks?: NavigationLink[]
  logo?: string | SanityImage
  isTransparent?: boolean
  backgroundColor?: {
    hex: string
  }
}

// Add SiteSettings
export interface SiteSettings extends SanityBaseDocument {
  _type: 'settings'
  title: string
  description?: string
  navbar?: NavbarData
  footer?: FooterSettings
}

// Footer types
export interface FooterSettings {
  footerLinks: FooterLink[]
  socialLinks: SocialLink[]
  backgroundColor: SanityColor
  copyrightText?: string
  fontColor?: SanityColor
  alignment?: 'left' | 'center' | 'right'
}

export interface FooterLink {
  _key: string
  text: string
  url: string
}

export interface SocialLink {
  _key: string
  platform: string
  url: string
  iconUrl?: string
}

export interface SanityColor {
  hex: string
}

// Media types
export interface Song {
  _key: string
  title: string
  trackTitle?: string
  duration?: number
  url?: string
  file?: {
    asset?: {
      _ref: string
      url?: string
    }
  }
}

// Product types (referenced in lib/sanity.ts)
export interface ProductImage {
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
  alt?: string
}

// Add SanityRawSong type
export interface SanityRawSong {
  _key: string
  title: string
  trackTitle?: string
  duration?: number
  url?: string
  file?: {
    asset?: {
      _ref: string
      url?: string
    }
  }
}

export interface ContentBlock extends SanityBaseDocument {
  _type: string
  _key: string
}

// Content Block Types
export interface NewsletterContent extends ContentBlock {
  _type: 'newsletter'
  headline?: string
  description?: string
  ctaText?: string
  placeholderText?: string
  formName?: string
}

// Album Types
export interface Album {
  _id: string
  _key?: string
  albumSource: string
  embeddedAlbum?: {
    embedUrl: string
    title: string
    artist: string
    platform: string
    releaseType: string
    imageUrl: string
    customImage?: {
      asset?: {
        url?: string
      }
    }
    songs: Song[]
  }
  customAlbum?: {
    title: string
    artist: string
    releaseType: string
    customImage?: {
      asset?: {
        url?: string
      }
    }
    songs: Song[]
  }
}

export interface SanityReference {
  _ref: string;
  _type: 'reference';
}

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: SanityImage;
  body: any[]; // or use proper PortableText type
}

