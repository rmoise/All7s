'use client'

import React, { useState, useMemo } from 'react'
import { AllPosts } from '@/components/Blog'
import Container from '@/components/Blog/Container'
import HeroPost from '@/components/Blog/HeroPost'
import Intro from '@/components/Blog/Intro'
import type { BlogPageData, Post } from '@/types'
import { motion } from 'framer-motion'

interface BlogClientProps {
  blogPage: BlogPageData
  posts: Post[]
}

const BlogClient: React.FC<BlogClientProps> = ({ blogPage, posts }) => {
  return (
    <Container>
      <div>
        <Intro title={blogPage.heroTitle} />
        {posts.length > 0 && (
          <HeroPost
            title={posts[0].title}
            coverImage={posts[0].mainImage}
            date={posts[0]._createdAt}
            author={posts[0].author}
            slug={posts[0].slug.current}
            excerpt={posts[0].excerpt}
          />
        )}
        <AllPosts postInfo={posts.slice(1)} />
      </div>
    </Container>
  )
}

export default BlogClient