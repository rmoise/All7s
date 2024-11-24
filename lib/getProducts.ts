import { getClient } from '@lib/sanity'
import type { Product } from '@/types'
import { productsQuery } from '@app/shop/queries'

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await getClient().fetch<Product[]>(productsQuery, {}, {
      next: {
        tags: ['products'],
        revalidate: 10
      }
    })

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}