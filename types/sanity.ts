import type {
  Color as SanityColor,
  Footer,
  Navbar,
  SanityImageHotspot,
  SanityImageCrop
} from '../fresh_sanity_studio/sanity.types';

export type { SanityColor };

// Define SanityImage since it's not exported from sanity.types.ts
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
    url?: string;
  };
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
}

export interface FooterLink {
  text: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  iconUrl: string;
}

export interface NavigationLink {
  href: string;
  label: string;
  name?: string;
  current?: boolean;
}

export interface NavbarData {
  logo?: SanityImage | null;
  navigationLinks?: NavigationLink[];
  backgroundColor: SanityColor;
  isTransparent: boolean;
}

export interface FooterSettings {
  copyrightText: string;
  footerLinks?: Array<{
    text: string;
    url: string;
    _key: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
    iconUrl: string;
    _key: string;
  }>;
  fontColor: SanityColor;
  alignment: 'left' | 'center' | 'right';
}

export interface SiteSettings {
  title: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: SanityImage | null;
  };
  favicon?: SanityImage | null;
  footer: FooterSettings;
  navbar: NavbarData;
}

export interface LayoutProps {
  children: React.ReactNode;
  settings?: SiteSettings;
}

export interface AboutBlock {
  _type: 'about';
  title?: string;
  description?: string;
  // ... other fields
}

export interface HeroBannerBlock {
  _type: 'heroBanner';
  title?: string;
  subtitle?: string;
  backgroundImage?: {
    asset?: {
      url?: string;
    };
  };
  cta?: {
    text?: string;
    link?: string;
  };
}

export interface BackgroundVideoBlock {
  _type: 'backgroundVideoBlock';
  backgroundVideoUrl?: string;
  backgroundVideoFile?: {
    asset?: {
      _ref?: string;
      url?: string;
      _type?: 'reference';
    };
    _type?: 'file';
  };
  posterImage?: {
    asset?: {
      url?: string;
    };
  };
}

export interface VideoBlock {
  _type: 'videoBlock';
  lookTitle?: string;
  heroVideoLink?: string;
  additionalVideos?: Array<{
    url: string;
  }>;
}

export interface MusicBlock {
  _type: 'musicBlock';
  listenTitle?: string;
  albums?: Album[];
}

export type ContentBlock =
  | AboutBlock
  | HeroBannerBlock
  | BackgroundVideoBlock
  | VideoBlock
  | MusicBlock;

export interface HomeProps {
  contentBlocks: ContentBlock[];
  metaTitle: string | null;
  metaDescription: string | null;
  siteSettings: SiteSettings | null;
}

// Add the Song interface first since it's needed by both album types
export interface Song {
  trackTitle: string;
  url: string;
  duration: number;
  _key?: string;
  file?: {
    _type: 'file';
    asset: {
      url: string;
    };
  };
}

// Add CustomAlbum interface
export interface CustomAlbum {
  title: string;
  artist: string;
  songs: Song[];
  customImage?: {
    asset: {
      url: string;
    };
  };
}

// Add EmbeddedAlbum interface
export interface EmbeddedAlbum {
  title: string;
  artist: string;
  platform?: string;
  embedCode?: string;
  embedUrl?: string;
  imageUrl?: string;
  processedImageUrl?: string;
  songs?: Song[];
  customImage?: {
    asset: {
      url: string;
    };
  };
}

// Add Album interface
export interface Album {
  _id: string;
  albumId: string;
  albumSource: 'embedded' | 'custom';
  embeddedAlbum?: EmbeddedAlbum;
  customAlbum?: CustomAlbum;
}

// For FlipCard component
export interface FlipCardAlbum {
  albumId: string;
  title: string;
  artist: string;
  imageUrl: string;
  songs: Song[];
  embedUrl?: string;
  albumSource: 'embedded' | 'custom';
  customAlbum?: CustomAlbum;
  embeddedAlbum?: EmbeddedAlbum;
}

// Add or update these interfaces
export interface SanityImageAsset {
  _id?: string;
  url?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    };
  };
}

// Add this interface for the raw song format from Sanity
export interface SanityRawSong {
  _type: 'song';
  _key: string;
  trackTitle: string;
  duration: number;
  file: {
    _type: 'file';
    asset: {
      _ref: string;
      _type: 'reference';
      url?: string;
    };
  };
}