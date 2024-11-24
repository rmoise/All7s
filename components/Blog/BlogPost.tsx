'use client'

import React from 'react'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import type { Post } from '@/types/sanity'
import Image from 'next/image'

const BlogPost: React.FC<Post> = ({ title, mainImage, body }) => {
  return (
    <article className="bg-black text-white">
      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
              Blog
            </span>
            <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              {title}
            </span>
          </h1>
          {mainImage && (
            <Image
              className="w-full rounded-lg mt-8"
              src={urlFor(mainImage)}
              alt={title || 'Blog post image'}
              width={800}
              height={500}
            />
          )}
          <div className="mt-8 text-xl text-gray-300 leading-8">
            <PortableText value={body} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogPost