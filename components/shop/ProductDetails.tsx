'use client'

import React, { useState, useEffect } from 'react'
import { urlFor } from '@lib/sanity'
import { useRouter } from 'next/navigation'
import { useStateContext } from '../../context/StateContext'
import { motion } from 'framer-motion'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import { IoArrowBack } from 'react-icons/io5'
import type { Product } from '../../types/shop'
import type { CartItem } from '../../types/cart'
import { PortableText, PortableTextReactComponents } from '@portabletext/react'
import type { PortableTextComponentProps } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import Grid from '@/components/common/Grid/Grid'
import Products from '@/components/shop/Products'

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => <p className="text-gray-300 mb-4">{children}</p>,
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold mb-3 text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium mb-2 text-white">{children}</h3>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

interface ProductDetailsProps {
  product: Product
  products: Product[]
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  products,
}) => {
  const { onAdd } = useStateContext()
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [localQty, setLocalQty] = useState('1')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const incLocalQty = () =>
    setLocalQty((prev) => (parseInt(prev) + 1).toString())
  const decLocalQty = () =>
    setLocalQty((prev) =>
      parseInt(prev) > 1 ? (parseInt(prev) - 1).toString() : '1'
    )
  const handleQtyChange = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num > 0) {
      setLocalQty(num.toString())
    }
  }

  if (!product) {
    return (
      <div className="bg-black min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const { image = [], name, price, description, _id, category } = product

  console.log('Current image:', image && image.length > 0 ? image[index] : null)

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      _id,
      name,
      price,
      quantity: parseInt(localQty) || 1,
      image: image?.map(img => ({
        ...img,
        asset: {
          _id: img.asset._id,
          url: img.asset.url,
          metadata: {
            dimensions: {
              width: img.asset.metadata?.dimensions?.width || 0,
              height: img.asset.metadata?.dimensions?.height || 0,
              aspectRatio: img.asset.metadata?.dimensions ?
                img.asset.metadata.dimensions.width / img.asset.metadata.dimensions.height :
                1
            }
          }
        }
      })) || [],
      details: description,
      slug: typeof product.slug === 'string' ? product.slug : product.slug.current,
    };
    onAdd(cartItem, parseInt(localQty) || 1);
  }

  const recommendations = React.useMemo(() => {
    if (!products || !product) return []

    return products
      .filter((p) => p._id !== product._id)
      .map(p => ({
        ...p,
        category: {
          title: p.category?.title || product.category?.title || ''
        }
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
  }, [products, product])

  const getProductImage = (product: Product) => {
    if (product.mainImage?.asset?.url) {
      return product.mainImage.asset.url;
    }
    if (product.image?.[0]?.asset?.url) {
      return product.image[0].asset.url;
    }
    return '/images/placeholder.png';
  };

  const handleRecommendationAddToCart = (recommendedProduct: Product) => {
    const cartItem: CartItem = {
      _id: recommendedProduct._id,
      name: recommendedProduct.name,
      price: recommendedProduct.price,
      quantity: 1,
      image: recommendedProduct.image?.map(img => ({
        ...img,
        asset: {
          _id: img.asset._id,
          url: img.asset.url,
          metadata: {
            dimensions: {
              width: img.asset.metadata?.dimensions?.width || 0,
              height: img.asset.metadata?.dimensions?.height || 0,
              aspectRatio: img.asset.metadata?.dimensions ?
                img.asset.metadata.dimensions.width / img.asset.metadata.dimensions.height :
                1
            }
          }
        }
      })) || [],
      details: recommendedProduct.description,
      slug: typeof recommendedProduct.slug === 'string' ? recommendedProduct.slug : recommendedProduct.slug.current,
    }
    onAdd(cartItem, 1)
  }

  return (
    <div className="min-h-screen bg-black">
      <Grid fullWidth>
        <div className="pt-24 pb-32">
          <Grid>
            <div className="flex flex-col">
              <button
                onClick={() => router.push('/shop')}
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-8"
              >
                <IoArrowBack className="text-xl" />
                <span>Back to Shop</span>
              </button>

              <div className="flex flex-col md:flex-row gap-16 mb-32 md:mb-48">
                {/* Left Column - Images */}
                <div className="w-full md:w-1/2 space-y-8">
                  {/* Main Image */}
                  <div className="relative">
                    {image && image.length > 0 && (
                      <div className="relative pt-[100%] border border-gray-800 rounded-lg">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <div className="relative w-[85%] h-[85%] rounded-lg overflow-hidden bg-white/[0.02]">
                            <img
                              src={
                                image[index]
                                  ? urlFor(image[index]).url()
                                  : '/images/placeholder.png'
                              }
                              alt={image[index]?.alt || name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {image && image.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {image.map((item, i) => (
                        <motion.div
                          key={i}
                          onClick={() => setIndex(i)}
                          className={`relative aspect-square cursor-pointer bg-black/40 rounded-lg
                            ${
                              i === index
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                                : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:ring-offset-black'
                            }`}
                        >
                          <div className="flex items-center justify-center h-full p-2">
                            <img
                              src={urlFor(item).url()}
                              alt={item?.alt || `${name} thumbnail ${i + 1}`}
                              className="max-w-[85%] max-h-[85%] object-contain"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Product Info */}
                <div className="w-full md:w-1/2 text-white flex flex-col justify-center">
                  <div className="space-y-8">
                    {/* Category */}
                    {category?.title && (
                      <p className="text-sm text-gray-400">{category.title}</p>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl font-bold">{name}</h1>

                    {/* Price */}
                    <p className="text-3xl">${price}</p>

                    {/* Quantity and CTA Container */}
                    <div>
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-6">
                        <span className="text-lg">Quantity:</span>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={decLocalQty}
                            className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-lg border border-white/20"
                          >
                            <AiOutlineMinus />
                          </button>
                          <input
                            type="number"
                            value={localQty}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || parseInt(value) > 0) {
                                setLocalQty(value)
                              }
                            }}
                            className="w-16 text-xl text-center bg-black rounded-lg text-white px-2 py-1 border border-white/20
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                          />
                          <button
                            onClick={incLocalQty}
                            className="w-10 h-10 flex items-center justify-center bg-black hover:bg-gray-900 text-white rounded-lg border border-white/20"
                          >
                            <AiOutlinePlus />
                          </button>
                        </div>
                      </div>

                      <div className="h-12"></div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-4 font-bold rounded-lg hover:bg-gray-900 transition-colors border border-white/20"
                      >
                        Add to Cart
                      </button>
                    </div>

                    {/* Description */}
                    {description && description.length > 0 && (
                      <div className="prose prose-invert max-w-none">
                        <PortableText
                          value={description}
                          components={components}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {mounted && recommendations.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold text-white mb-8">You May Also Like</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommendations.map((recommendedProduct) => (
                      <div
                        key={recommendedProduct._id}
                        onClick={() => router.push(`/shop/${typeof recommendedProduct.slug === 'string' ? recommendedProduct.slug : recommendedProduct.slug.current}`)}
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
                                <div className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden bg-white/[0.02]">
                                  <img
                                    src={getProductImage(recommendedProduct)}
                                    alt={recommendedProduct.name}
                                    className="w-auto h-auto max-w-full max-h-full object-contain"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Info Container */}
                          <div className="p-4 pt-0" onClick={e => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                              {/* Category - Always show if we have it */}
                              {recommendedProduct.category?.title && (
                                <p className="text-sm text-gray-400">
                                  {recommendedProduct.category.title}
                                </p>
                              )}
                              <div className="group/tooltip relative">
                                <h3 className="text-white font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                                  {recommendedProduct.name}
                                </h3>
                              </div>
                            </div>

                            <div className="space-y-4 md:space-y-8 mt-4">
                              <p className="text-white text-lg">${recommendedProduct.price}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecommendationAddToCart(recommendedProduct);
                                }}
                                className="w-full bg-black text-white py-3 font-semibold rounded-lg hover:bg-gray-900 transition-colors border border-white/20"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default ProductDetails
