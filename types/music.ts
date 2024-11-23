export interface Song {
  _key: string;
  title: string;
  trackTitle: string;
  url: string;
  duration: number;
}

interface SanityAsset {
  asset: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      }
    }
  };
}

export interface CustomAlbum {
  title: string;
  artist: string;
  releaseType: string;
  customImage?: SanityAsset;
  songs: Song[];
}

export interface EmbeddedAlbum {
  embedUrl: string;
  embedCode?: string;
  title: string;
  artist: string;
  platform: string;
  releaseType: string;
  imageUrl: string;
  customImage?: SanityAsset;
  processedImageUrl?: string;
  songs: Song[];
}

export interface Album {
  _id: string;
  _key?: string;
  albumSource: 'custom' | 'embedded';
  embeddedAlbum?: EmbeddedAlbum;
  customAlbum?: CustomAlbum;
}