'use client'

import React from 'react'
import { AllPosts } from '@/components/Blog'
import Container from '@/components/Blog/Container'
import HeroPost from '@/components/Blog/HeroPost'
import Intro from '@/components/Blog/Intro'
import type { BlogPageData, Post } from '@/types'

interface BlogClientProps {
  blogPage: BlogPageData
}

const BlogClient: React.FC<BlogClientProps> = ({ blogPage }) => {
  const heroPost = blogPage.featuredPost || null
  const feedPosts = blogPage.blogFeed || []

  return (
    <Container>
      <div>
        <Intro title={blogPage.heroTitle} subtitle={blogPage.heroSubtitle} />
        {heroPost && (
          <HeroPost
            title={heroPost.title}
            mainImage={heroPost.mainImage}
            date={heroPost._createdAt}
            author={heroPost.author}
            slug={heroPost.slug.current}
            excerpt={heroPost.excerpt}
          />
        )}
        {feedPosts.length > 0 && <AllPosts postInfo={feedPosts} />}
      </div>
    </Container>
  )
}

export default BlogClient
