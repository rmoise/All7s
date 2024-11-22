import React from "react";
import { getClient } from '../../lib/client';
import imageUrlBuilder from '@sanity/image-url';
import { Metadata } from 'next';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Product } from '../../types/shop';
import dynamic from 'next/dynamic';
import Grid from '@/components/common/Grid/Grid';

const ShopClient = dynamic(() => import('./ShopClient'), {
  loading: () => <p>Loading...</p>
});

const builder = imageUrlBuilder(getClient());

function urlFor(source: SanityImageSource): string {
  if (!source) return '/images/placeholder.png';
  return builder.image(source).url();
}

export const fetchCache = 'force-no-store';
export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const shopPage = await getClient().fetch('*[_type == "shopPage"][0]');

  return {
    title: shopPage?.seo?.metaTitle || 'Shop - All7Z Brand',
    description: shopPage?.seo?.metaDescription || 'Browse our collection of products from All7Z.',
    openGraph: {
      images: [shopPage?.seo?.openGraphImage?.asset?.url || ''],
    },
  };
}

export default async function ShopPage() {
  const [products, shopPage] = await Promise.all([
    getClient().fetch<Product[]>(`*[_type == "product"] {
      _id,
      name,
      price,
      slug,
      image[] {
        asset-> {
          _id,
          url,
          metadata {
            dimensions
          }
        },
        alt
      },
      category->{
        title,
        description
      }
    }`),
    getClient().fetch(`*[_type == "shopPage" && _id == "shopPage"][0] {
      _id,
      heroTitle,
      heroImage,
      featuredProducts[]->{
        _id,
        name,
        price,
        slug,
        image[] {
          asset-> {
            _id,
            url,
            metadata {
              dimensions
            }
          },
          alt
        },
        category->{
          title,
          description
        }
      }
    }`)
  ]);

  const displayProducts = shopPage?.featuredProducts || [];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <Grid fullWidth>
        <div className="relative h-[50vh]">
          {shopPage?.heroImage && (
            <div className="absolute inset-0">
              <img
                src={urlFor(shopPage.heroImage)}
                alt={shopPage.heroImage.alt || "Shop Banner"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-headline text-white tracking-wider text-center px-4">
              {shopPage?.heroTitle || "SHOP ALL7Z"}
            </h1>
          </div>
        </div>
      </Grid>

      {/* Shop Content */}
      <Grid>
        <ShopClient products={displayProducts} />
      </Grid>
    </div>
  );
}