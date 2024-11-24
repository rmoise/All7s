'use client'

import React from 'react'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import type { Post } from '@/types/sanity'
import Image from 'next/image'

interface BlogPostProps extends Post {
  // Add any additional props if needed
}

const BlogPost: React.FC<BlogPostProps> = ({
  title,
  mainImage,
  body,
  // Destructure other props you might need
}) => {
  // Add error boundary for image loading
  const imageUrl = mainImage ? urlFor(mainImage) : '';

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
          {mainImage && imageUrl && (
            <div className="relative w-full h-[500px] mt-8">
              <Image
                className="rounded-lg object-cover"
                src={imageUrl}
                alt={title || 'Blog post image'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                priority
              />
            </div>
          )}
          <div className="mt-8 text-xl text-gray-300 leading-8">
            <PortableText
              value={body}
              components={{
                // Add any custom components for PortableText if needed
              }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogPost