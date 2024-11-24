'use client'

import React from 'react'
import Link from 'next/link'
import type { Post } from '@/types'

interface AllPostsProps {
  postInfo: Post[]
}

const AllPosts: React.FC<AllPostsProps> = ({ postInfo }) => {
  return (
    <div className="bg-black px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="relative mx-auto max-w-lg divide-y-2 divide-white lg:max-w-7xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-Headline">
            ALL7Z BLOG
          </h2>
        </div>
        <div className="mt-6 grid gap-16 pt-10 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
          {postInfo.map((post) => (
            <div key={post._id}>
              <p className="text-sm text-white"></p>
              <div className="mt-2 block">
                <p className="text-xl font-semibold white font-Headline">
                  {post.title}
                </p>
              </div>
              <div className="mt-3">
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Read full story
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllPosts

