'use client'

import React from 'react'
import { urlForImage } from '@/lib/sanity'
import Image from 'next/image'
import Author from './Author'
import DateFormatter from './DateFormatter'
import Categories from './Categories'
import RelatedPosts from './RelatedPosts'
import Link from 'next/link'
import Grid from '@/components/common/Grid/Grid'
import { Post } from '@/types'

interface BlogPostProps {
  title: string
  mainImage: {
    _type: 'image'
    asset: {
      _ref: string | null
      _type: 'sanity.imageAsset'
      url: string
    }
  }
  body: any[]
  author?: {
    name: string
    picture?: {
      asset: {
        _ref: string | null
        _type: 'sanity.imageAsset'
        url: string
      }
    }
    bio?: any[]
  }
  _createdAt: string
  categories?: any[]
  relatedPosts?: Post[]
}

const shouldOptimize = process.env.NODE_ENV !== 'production'

const RenderContent = ({ block }: { block: any }) => {
  if (!block) return null

  if (block._type === 'block') {
    const style = block.style || 'normal'
    const text = block.children
      ?.filter((child: any) => typeof child.text === 'string')
      ?.map((child: any) => child.text)
      .join(' ')

    if (!text) return null

    switch (style) {
      case 'h1':
        return <h1 className="text-6xl md:text-7xl font-bold my-8">{text}</h1>
      case 'h2':
        return <h2 className="text-5xl md:text-6xl font-bold my-6">{text}</h2>
      case 'h3':
        return <h3 className="text-4xl md:text-5xl font-bold my-4">{text}</h3>
      case 'h4':
        return <h4 className="text-3xl md:text-4xl font-bold my-3">{text}</h4>
      case 'blockquote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6 text-2xl text-gray-300">
            {text}
          </blockquote>
        )
      default:
        return (
          <p className="my-4 leading-relaxed text-base text-gray-300 [&:has(+figure)]:mb-0">
            {text}
          </p>
        )
    }
  }

  if (block._type === 'image') {
    const imageUrl = urlForImage(block, {
      width: 1200,
      quality: 75,
    })

    return (
      <figure className="not-prose my-8 first:mt-0">
        <div className="relative aspect-[16/9]">
          <Image
            src={imageUrl}
            alt={block.alt || 'Blog post image'}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 1200px"
            unoptimized={!shouldOptimize}
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

  return null
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
  if (!Array.isArray(body)) {
    console.error('Blog post body is not an array:', body)
    return null
  }

  const mainImageUrl = mainImage?.asset?.url || ''
  const authorImageUrl = author?.picture?.asset?.url || ''

  return (
    <article className="bg-black">
      <Grid maxWidth="7xl" className="bg-black text-white">
        {/* Header */}
        <div className="pt-32 pb-8">
          <div className="mb-8">
            <Link
              href="/blog"
              className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Blog</span>
            </Link>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-8 text-white text-left leading-tight tracking-tighter">
            {title}
          </h1>
          <div className="flex items-center mb-8">
            {authorImageUrl && (
              <div className="relative w-12 h-12 mr-3 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={authorImageUrl}
                  alt={author?.name || 'Author'}
                  className="rounded-full object-cover"
                  fill
                  sizes="48px"
                  unoptimized={!shouldOptimize}
                />
              </div>
            )}
            {author?.name && (
              <span className="text-lg text-gray-400">{author.name}</span>
            )}
            <span className="text-lg text-gray-400 mx-4">•</span>
            <span className="text-lg text-gray-400">
              <DateFormatter dateString={_createdAt} />
            </span>
          </div>
        </div>

        {/* Main Image */}
        {mainImageUrl && (
          <div className="relative aspect-[16/9] mb-12">
            <Image
              src={mainImageUrl}
              alt={title}
              fill
              className="object-cover rounded-lg"
              priority
              unoptimized={!shouldOptimize}
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-[800px] mx-auto">
          <div className="prose prose-invert prose-sm prose-p:text-base prose-p:my-4 prose-headings:mt-8 prose-headings:mb-4">
            {body.map((block, index) => (
              <RenderContent key={block._key || index} block={block} />
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div className="pt-20 border-t border-gray-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
            More Stories
          </h2>
          {relatedPosts && relatedPosts.length > 0 ? (
            <RelatedPosts posts={relatedPosts} title="More Stories" />
          ) : (
            <p className="text-gray-400">No related posts available</p>
          )}
        </div>
      </Grid>
    </article>
  )
}

export default BlogPost
