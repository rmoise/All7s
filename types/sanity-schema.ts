// First, import the types we need
import type {
  SanityImageCrop,
  SanityImageHotspot,
  SanityImageMetadata,
  SanityImageAsset,
  SanityAssetSourceData,
  SanityImageDimensions,
  SanityImagePalette,
  Album,
  HeroBanner,
  Newsletter,
  Settings,
  Home
} from '../fresh_sanity_studio/sanity.types';

// Then define our SanityImage interface using the imported types
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
}

// Finally, re-export everything including our new SanityImage interface
export type {
  SanityImageCrop,
  SanityImageHotspot,
  SanityImageMetadata,
  SanityImageAsset,
  SanityAssetSourceData,
  SanityImageDimensions,
  SanityImagePalette,
  Album,
  HeroBanner,
  Newsletter,
  Settings,
  Home
};