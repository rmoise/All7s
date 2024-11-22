import React from "react";
import { getClient } from '../../../lib/client';
import { Metadata } from 'next';
import ProductDetailsWrapper from './ProductDetailsWrapper';
import { productsQuery, productDetailQuery } from '../queries';
import type { Product } from '@/types/shop';
import { notFound } from 'next/navigation';
import { ShopPageProps } from '@/types/page';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

async function getProductData(slug: string) {
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid slug:', slug);
    return { products: [], product: null };
  }

  try {
    const [products, product] = await Promise.all([
      getClient().fetch<Product[]>(productsQuery),
      getClient().fetch<Product>(
        productDetailQuery,
        { slug: slug.toString() },
        { next: { tags: ['products'], revalidate: 10 } }
      )
    ]);

    if (!product) {
      return { products: [], product: null };
    }

    return { products, product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { products: [], product: null };
  }
}

export async function generateMetadata(
  props: ShopPageProps
): Promise<Metadata> {
  const params = await props.params;
  const slug = params?.slug?.toString();
  const { product } = await getProductData(slug);

  if (!product) {
    return {
      title: 'Product Not Found - All7Z Brand',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: product.seo?.metaTitle || `${product.name} - All7Z Brand`,
    description: product.seo?.metaDescription || 'Product description',
  };
}

export default async function ShopPage(
  props: ShopPageProps
): Promise<JSX.Element> {
  const params = await props.params;
  const slug = params?.slug?.toString();
  const { products, product } = await getProductData(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-black min-h-screen">
      <ProductDetailsWrapper product={product} products={products} />
    </div>
  );
}