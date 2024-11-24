import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PageProps } from './page';
import { PortableTextBlock } from '@portabletext/types';

export interface Product {
  _id: string;
  name: string;
  price: number;
  slug: string | {
    current: string;
  };
  mainImage?: {
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
    alt?: string;
  };
  image?: Array<{
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
    alt?: string;
  }>;
  category?: {
    title: string;
    description?: string;
  };
  description?: any[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: {
      asset: {
        url: string;
      };
    };
  };
}

export interface BannerItem {
  image: SanityImageSource;
}

export interface ShopProps {
  products: Product[];
  bannerData: BannerItem[];
}

export interface ShopClientProps {
  products: Product[];
}

export interface ProductsProps {
  product: Product;
}