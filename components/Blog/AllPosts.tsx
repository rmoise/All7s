'use client'

import React from 'react'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import type { Post } from '@/types/sanity'

interface AllPostsProps {
  postInfo: Post[]
}

const AllPosts: React.FC<AllPostsProps> = ({ postInfo }) => {
  return (
    <div className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {postInfo.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="block hover:opacity-75 transition-opacity"
            >
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {post.mainImage && (
                  <img
                    src={urlFor(post.mainImage)}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-400 line-clamp-3">
                    {post.excerpt || post.title || 'Read more...'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllPosts

