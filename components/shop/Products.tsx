'use client';

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { urlFor } from '../../lib/client'
import { useStateContext } from '../../context/StateContext'
import { useRouter } from 'next/navigation'
import type { CartItem } from '../../types/cart'
import type { Product, ProductsProps } from '../../types/shop'
import Grid from '@/components/common/Grid/Grid'

const Products: React.FC<ProductsProps> = React.memo(({ product }) => {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { onAdd } = useStateContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const { image, name, slug, price, category, _id } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem: CartItem = {
      _id,
      name,
      price,
      quantity: 1,
      image: image || [],
      slug
    };
    onAdd(cartItem, 1);
  };

  const handleProductClick = () => {
    if (typeof slug?.current === 'string') {
      router.push(`/shop/${encodeURIComponent(slug.current)}`);
    } else {
      console.error('Invalid slug:', slug);
    }
  };

  const productImage = image?.[0];

  return (
    <div
      onClick={handleProductClick}
      className="cursor-pointer w-full"
    >
      <div className="flex flex-col gap-4 md:gap-8">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <motion.div
            className="relative pt-[100%] border border-gray-800 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden bg-white/[0.02]"
              >
                <img
                  src={productImage ? urlFor(productImage)
                    .auto('format')
                    .quality(100)
                    .url() : '/images/placeholder.png'}
                  alt={name}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Container */}
        <div className="p-4 pt-0" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1">
            {category?.title && (
              <p className="text-sm text-gray-400">{category.title}</p>
            )}
            <div className="group/tooltip relative">
              <h3 className="text-white font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                {name}
              </h3>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8 mt-4">
            <p className="text-white text-lg">${price}</p>
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-3 font-semibold rounded-lg hover:bg-gray-900 transition-colors border border-white/20"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

Products.displayName = 'Products';

export default Products;