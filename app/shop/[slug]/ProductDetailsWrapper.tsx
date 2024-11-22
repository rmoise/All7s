'use client';

import React from 'react';
import { default as dynamicImport } from 'next/dynamic';
import type { Product } from '@/types/shop';

const ProductDetails = dynamicImport(
  () => import('@/components/shop/ProductDetails'),
  {
    loading: () => (
      <div className="bg-black min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    ),
    ssr: true
  }
);

interface ProductDetailsWrapperProps {
  product: Product;
  products: Product[];
}

export default function ProductDetailsWrapper({ product, products }: ProductDetailsWrapperProps) {
  if (!product || !products) {
    return null;
  }

  return <ProductDetails product={product} products={products} />;
}