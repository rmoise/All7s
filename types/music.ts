export interface Song {
  trackTitle: string;
  url: string;
  duration: number;
}

interface SanityAsset {
  asset?: {
    url?: string;
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
  title: string;
  artist: string;
  platform: string;
  releaseType: string;
  imageUrl: string;
  customImage?: SanityAsset;
  songs: Song[];
}

export interface Album {
  _id: string;
  _key?: string;
  albumSource: string;
  embeddedAlbum?: EmbeddedAlbum;
  customAlbum?: CustomAlbum;
} 