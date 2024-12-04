import { fetchSanity } from '@lib/sanity'
import { Metadata } from 'next'
import type { Post } from '@types'
import { blogPageQuery, postsQuery } from './queries'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata(): Promise<Metadata> {
  const blogPage = await fetchWithRetry(() =>
    fetchSanity<BlogPageData>(blogPageQuery)
  )

  return {
    title: blogPage?.seo?.metaTitle || 'Blog - All7Z Brand',
    description:
      blogPage?.seo?.metaDescription ||
      'Explore our collection of blog posts covering West Coast Music, Lifestyle, and Merch.',
    openGraph: blogPage?.seo?.openGraphImage?.asset?.url
      ? { images: [{ url: blogPage.seo.openGraphImage.asset.url }] }
      : undefined,
  }
}

interface BlogPageData {
  heroTitle: string
  heroSubtitle?: string
  featuredPost?: Post
  blogFeed: Post[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    openGraphImage?: any
  }
}

const defaultBlogPage: BlogPageData = {
  heroTitle: 'Welcome to Our Blog',
  heroSubtitle: 'Exploring West Coast Music, Lifestyle, and Culture',
  featuredPost: undefined,
  blogFeed: [],
  seo: {
    metaTitle: 'Blog - All7Z Brand',
    metaDescription:
      'Explore our collection of blog posts covering West Coast Music, Lifestyle, and Merch.',
  },
}

export default async function BlogPage() {
  try {
    const blogPage = await fetchWithRetry(() =>
      fetchSanity<BlogPageData>(blogPageQuery)
    )

    const BlogClient = (await import('./BlogClient')).default
    return (
      <div className="pb-28">
        <BlogClient
          blogPage={blogPage || defaultBlogPage}
        />
      </div>
    )
  } catch (error) {
    console.error('BlogPage Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-xl mb-4">Unable to load blog content</h2>
        <p className="text-sm mb-4 max-w-lg text-gray-400">
          Please try again later
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Refresh page
        </button>
      </div>
    )
  }
}
