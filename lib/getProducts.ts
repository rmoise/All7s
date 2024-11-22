import { client } from './client';
import type { Product } from '../types/shop';
import { productsQuery } from '../app/shop/queries';

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await client.fetch<Product[]>(productsQuery, {}, {
      next: {
        tags: ['products'],
        revalidate: 10
      }
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}