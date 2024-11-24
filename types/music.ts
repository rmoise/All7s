interface BaseSong {
  _key?: string;
  trackTitle?: string;
  title?: string;
  url?: string;
  duration?: number;
}

export interface Song extends BaseSong {
  _id?: string;
  file?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
    url?: string;
  };
}

export interface SanityRawSong extends BaseSong {
  _id: string;
  file: {
    asset: {
      _ref: string;
      url?: string;
    };
    url?: string;
  };
}

interface BaseAlbum {
  _id?: string;
  _key?: string;
  title: string;
  albumId: string;
  albumSource: 'custom' | 'embedded';
  coverArt?: {
    asset?: {
      _ref: string;
      url?: string;
    };
    url?: string;
  };
  songs?: (Song | SanityRawSong)[];
  customAlbum?: {
    title: string;
    artist: string;
    releaseType: string;
    customImage?: {
      asset?: {
        _ref: string;
        url?: string;
      };
    };
    songs: Song[];
  };
  embeddedAlbum?: {
    embedCode: string;
    title: string;
    artist: string;
    platform: 'spotify' | 'soundcloud' | 'other';
    releaseType: string;
    imageUrl: string;
    processedImageUrl?: string;
    customImage?: {
      asset?: {
        _ref: string;
        url?: string;
      };
    };
    songs: Song[];
  };
}

export interface Album extends BaseAlbum {
  _type: 'album';
}

export interface CustomAlbum extends BaseAlbum {
  _type: 'customAlbum';
  albumSource: 'custom';
  customAlbum: {
    title: string;
    artist: string;
    releaseType: string;
    customImage?: {
      asset?: {
        _ref: string;
        url?: string;
      };
    };
    songs: Song[];
  };
}

export interface EmbeddedAlbum extends BaseAlbum {
  _type: 'embeddedAlbum';
  albumSource: 'embedded';
  embeddedAlbum: {
    embedCode: string;
    title: string;
    artist: string;
    platform: 'spotify' | 'soundcloud' | 'other';
    releaseType: string;
    imageUrl: string;
    processedImageUrl?: string;
    customImage?: {
      asset?: {
        _ref: string;
        url?: string;
      };
    };
    songs: Song[];
  };
}

export type MusicAlbum = Album | CustomAlbum | EmbeddedAlbum;