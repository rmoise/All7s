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

const RenderContent = ({ block }: { block: any }) => {
  console.log('Rendering block:', {
    type: block._type,
    hasAsset: !!block.asset,
    blockData: block
  });

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
          <p className="my-6 leading-relaxed text-xl text-gray-300 [&:has(+figure)]:mb-0">
            {text}
          </p>
        )
    }
  }

  if (block._type === 'image') {
    return (
      <figure className="not-prose my-16 first:mt-0">
        <div className="relative aspect-[16/9]">
          <Image
            src={urlFor(block).url()}
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
  console.log('BlogPost Component - relatedPosts:', {
    exists: !!relatedPosts,
    length: relatedPosts?.length,
    data: relatedPosts
  });

  if (!Array.isArray(body)) {
    console.error('Blog post body is not an array:', body)
    return null
  }

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
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Back to Blog</span>
            </Link>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-8 text-white text-left leading-tight tracking-tighter">
            {title}
          </h1>
          <div className="flex items-center mb-8">
            {author?.picture && (
              <div className="relative w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={urlFor(author.picture).width(48).height(48).url()}
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

        {/* Main Image */}
        {mainImage && (
          <div className="relative aspect-[16/9] mb-12">
            <Image
              src={urlFor(mainImage).url()}
              alt={title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-[800px] mx-auto">
          <div className="prose prose-invert prose-lg prose-p:my-6 prose-headings:mt-12 prose-headings:mb-6">
            {body.map((block, index) => (
              <RenderContent key={block._key || index} block={block} />
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div className="pt-20 border-t border-gray-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">More Stories</h2>
          {relatedPosts && relatedPosts.length > 0 ? (
            <RelatedPosts
              posts={relatedPosts}
              title="More Stories"
            />
          ) : (
            <p className="text-gray-400">No related posts available</p>
          )}
        </div>
      </Grid>
    </article>
  )
}

export default BlogPost