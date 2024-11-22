import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { PageProps } from '../../types/page';
import { PortableTextBlock } from '@portabletext/types';

export interface Product {
  _id: string;
  name: string;
  price: number;
  slug: {
    current: string;
  };
  image?: SanityImageSource[];
  images?: SanityImageSource[];
  category: {
    title: string;
    description?: string;
  };
  description: PortableTextBlock[];
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

export interface ShopProps extends PageProps {
  products: Product[];
  bannerData: BannerItem[];
}

export interface ShopClientProps {
  products: Product[];
}

export interface ProductsProps {
  product: Product;
}