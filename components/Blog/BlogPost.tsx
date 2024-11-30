'use client'

import React from 'react'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'
import Author from './Author'
import DateFormatter from './DateFormatter'
import Categories from './Categories'
import RelatedPosts from './RelatedPosts'
import Link from 'next/link'
import Grid from '@/components/common/Grid/Grid'

interface BlogPostProps {
  title: string
  mainImage: any
  body: any[]
  author?: {
    name: string
    picture?: any
    bio?: any[]
  }
  _createdAt: string
  categories?: any[]
  relatedPosts?: any[]
}

const BlogPost: React.FC<BlogPostProps> = ({
  title,
  mainImage,
  body,
  author,
  _createdAt,
  categories,
  relatedPosts,
}) => {
  const mainImageUrl = mainImage ? urlFor(mainImage).url() : ''
  const authorImageUrl = author?.picture ? urlFor(author.picture).width(48).height(48).url() : ''

  return (
    <article>
      <div className="max-w-[800px] mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {title}
        </h1>
        <div className="flex items-center mb-8">
          {author?.picture && (
            <div className="relative w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={authorImageUrl}
                alt={author.name || 'Author'}
                className="rounded-full object-cover"
                fill
                sizes="24px"
              />
            </div>
          )}
          {author?.name && (
            <span className="text-sm text-gray-400">
              {author.name}
            </span>
          )}
          <span className="text-sm text-gray-400 mx-4">•</span>
          <span className="text-sm text-gray-400">
            <DateFormatter dateString={_createdAt} />
          </span>
        </div>
      </div>

      {mainImage && (
        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={mainImageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}

      {/* Content section */}
      <div className="max-w-[800px] mx-auto">
        <div className="prose prose-invert prose-lg">
          {body.map((block, index) => {
            if (block._type === 'image') {
              const imageUrl = urlFor(block).url()
              return (
                <figure key={index} className="not-prose my-16 first:mt-0">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={imageUrl}
                      alt={block.alt || 'Blog post image'}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-gray-400 mt-4 text-sm">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )
            }
            // Handle other block types...
            return null
          })}
        </div>
      </div>
    </article>
  )
}

export default BlogPost