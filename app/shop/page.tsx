import React from 'react'
import { getClient, urlFor } from '@lib/sanity'
import { Metadata } from 'next'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type { Product } from '@/types'
import dynamic from 'next/dynamic'
import Grid from '@/components/common/Grid/Grid'

const ShopClient = dynamic(() => import('./ShopClient'), {
  loading: () => <p>Loading...</p>,
})

export const fetchCache = 'force-no-store'
export const revalidate = 10

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(fetcher: () => Promise<any>, retries = MAX_RETRIES): Promise<any> {
  try {
    return await fetcher()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(fetcher, retries - 1)
    }
    throw error
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const shopPage = await fetchWithRetry(() =>
      getClient().fetch('*[_type == "shopPage"][0]')
    )

    return {
      title: shopPage?.seo?.metaTitle || 'Shop - All7Z Brand',
      description: shopPage?.seo?.metaDescription || 'Browse our collection of products from All7Z.',
      openGraph: {
        images: [shopPage?.seo?.openGraphImage?.asset?.url || ''],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Shop - All7Z Brand',
      description: 'Browse our collection of products from All7Z.',
    }
  }
}

export default async function ShopPage() {
  try {
    const [products, shopPage] = await Promise.all([
      fetchWithRetry(() =>
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
        }`)
      ),
      fetchWithRetry(() =>
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
      ),
    ])

    const displayProducts = shopPage?.featuredProducts || []

    return (
      <div className="min-h-screen bg-black">
        <Grid fullWidth>
          <div className="relative h-[50vh]">
            {shopPage?.heroImage && (
              <div className="absolute inset-0">
                <img
                  src={urlFor(shopPage.heroImage).url()}
                  alt={shopPage.heroImage.alt || 'Shop Banner'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-headline text-white tracking-wider text-center px-4">
                {shopPage?.heroTitle || 'SHOP ALL7Z'}
              </h1>
            </div>
          </div>
        </Grid>

        <Grid>
          <ShopClient products={displayProducts} />
        </Grid>
      </div>
    )
  } catch (error) {
    console.error('Error loading shop page:', error)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Unable to load shop. Please try again later.</p>
      </div>
    )
  }
}
