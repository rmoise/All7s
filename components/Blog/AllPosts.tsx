'use client'

import React from 'react'
import { motion } from 'framer-motion'
import PostPreview from './PostPreview'

interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  mainImage?: {
    _type: 'image'
    asset: {
      _ref: string | null
      _type: 'sanity.imageAsset'
      url: string
    }
  }
  excerpt?: string
  _createdAt: string
  author?: {
    name: string
    picture?: {
      asset: {
        _ref: string | null
        _type: 'sanity.imageAsset'
        url: string
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
          <motion.div key={post._id} variants={item}>
            <PostPreview
              title={post.title}
              mainImage={post.mainImage}
              date={post._createdAt}
              author={post.author}
              slug={post.slug.current}
              excerpt={post.excerpt}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default AllPosts

