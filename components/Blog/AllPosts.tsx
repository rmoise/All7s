'use client'

import React from 'react'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { motion } from 'framer-motion'
import Image from 'next/image'
import DateFormatter from './DateFormatter'

interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  mainImage?: {
    asset: {
      _ref: string
      _type: string
    }
  }
  excerpt?: string
  _createdAt: string
  author?: {
    name: string
    picture?: {
      asset: {
        _ref: string
        _type: string
      }
    }
  }
}

interface AllPostsProps {
  postInfo: Post[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const PostPreview = ({ post }: { post: Post }) => {
  // Pre-generate image URLs
  const mainImageUrl = post.mainImage ? urlFor(post.mainImage).url() : ''
  const authorImageUrl = post.author?.picture
    ? urlFor(post.author.picture).url()
    : ''

  return (
    <motion.div variants={item} className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-8">
        {/* Image */}
        <div>
          {mainImageUrl && (
            <Link href={`/blog/${post.slug.current}`} aria-label={post.title}>
              <div className="relative aspect-[16/9]">
                <Image
                  src={mainImageUrl}
                  alt={`Cover Image for ${post.title}`}
                  className="object-cover rounded hover:opacity-90 transition-opacity"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </Link>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-3xl font-bold mb-4">
            <Link
              href={`/blog/${post.slug.current}`}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {post.title}
            </Link>
          </h3>
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {/* Author section */}
          <div className="flex items-center">
            {authorImageUrl && (
              <div className="relative w-12 h-12 mr-4">
                <Image
                  src={authorImageUrl}
                  alt={post.author?.name || 'Author'}
                  className="rounded-full object-cover"
                  fill
                  sizes="48px"
                />
              </div>
            )}
            <div className="flex flex-col">
              {post.author?.name && (
                <span className="font-medium text-white">
                  {post.author.name}
                </span>
              )}
              <span className="text-gray-400 text-sm">
                <DateFormatter dateString={post._createdAt} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const AllPosts: React.FC<AllPostsProps> = ({ postInfo }) => {
  if (!postInfo || postInfo.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">
          No posts available
        </h2>
        <p className="text-gray-400">Check back soon for new content!</p>
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-5">
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
        More Stories
      </h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        {postInfo.map((post) => (
          <PostPreview key={post._id} post={post} />
        ))}
      </motion.div>
    </section>
  )
}

export default AllPosts
