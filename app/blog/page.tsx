import { getClient } from '@lib/sanity'
import { Metadata } from 'next'
import { AllPosts } from '@components/Blog'

export const metadata: Metadata = {
  title: 'Blog - All7Z Brand',
  description: 'Explore our collection of blog posts covering West Coast Music, Lifestyle, and Merch.'
}

export default async function BlogPage() {
  const allPosts = await getClient().fetch(`*[_type == "post"]{
    _id,
    title,
    slug,
    mainImage,
    excerpt
  }`)

  return <AllPosts postInfo={allPosts} />
}