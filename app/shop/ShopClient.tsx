'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Product from '../../components/shop/Products'
import { HiOutlineFilter } from 'react-icons/hi'
import type { Product as ProductType } from '../../types/shop'

export interface ShopClientProps {
  products: ProductType[]
}

const ShopClient = ({ products }: ShopClientProps) => {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const categories = ['all'].concat(
    Array.from(
      new Set(
        products
          ?.map((product) => product?.category?.title)
          .filter(Boolean)
      )
    )
  );

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products?.filter(
          (product) =>
            product?.category?.title?.toLowerCase() ===
            selectedCategory.toLowerCase()
        )

  const handleCategoryChange = useCallback((category: string) => {
    setIsTransitioning(true)
    setSelectedCategory(category)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="pt-16 md:pt-24 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 text-white"
        >
          <HiOutlineFilter className="text-xl" />
          <span>Filter</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="flex flex-wrap gap-4 mb-8"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'border-white text-white'
                }`}
              >
                {category?.toUpperCase()}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative ${isTransitioning ? 'h-screen overflow-hidden' : ''}`}>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-8"
          layout
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.15 },
                  layout: { duration: 0.15 }
                }}
              >
                <Product key={product._id} product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ShopClient
