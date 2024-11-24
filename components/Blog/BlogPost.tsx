'use client'

import React from 'react'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { Post } from '@/types'
import type { SanityImage } from '@/types/sanity'

interface BlogPostProps {
  post: Post
}

interface ProductImage {
  asset: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="bg-black text-white">
      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
              Blog
            </span>
            <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              {post.title}
            </span>
          </h1>
          {post.mainImage && (
            <img
              className="w-full rounded-lg mt-8"
              src={urlFor(post.mainImage as unknown as (string | SanityImage | ProductImage | null | undefined))}
              alt={post.title}
            />
          )}
          <div className="mt-8 text-xl text-gray-300 leading-8">
            <PortableText value={post.body} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogPost