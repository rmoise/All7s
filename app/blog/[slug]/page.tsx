import { getClient } from '@lib/sanity'
import { Metadata } from 'next'
import { BlogPost } from '@components/Blog'
import { notFound } from 'next/navigation'
import { BlogPageProps } from '@types'
import { postDetailQuery } from '../queries'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const params = await props.params
  const post = await fetchWithRetry(() =>
    getClient().fetch(postDetailQuery, { slug: params.slug }, {
      cache: 'force-cache',
      next: { tags: [`post-${params.slug}`], revalidate: 60 }
    })
  )

  if (!post) return notFound()

  return {
    title: post.seo?.metaTitle ? `${post.seo.metaTitle} - ${post.title}` : post.title,
    description: post.seo?.metaDescription || 'Read our latest blog post.',
    openGraph: post.seo?.openGraphImage?.asset?.url
      ? { images: [{ url: post.seo.openGraphImage.asset.url }] }
      : undefined,
  }
}

export default async function BlogPostPage(props: BlogPageProps): Promise<JSX.Element> {
  const params = await props.params
  const post = await fetchWithRetry(() =>
    getClient().fetch(postDetailQuery, { slug: params.slug }, {
      cache: 'force-cache',
      next: { tags: [`post-${params.slug}`], revalidate: 60 }
    })
  )

  if (!post) return notFound()

  return (
    <div className="pb-28">
      <BlogPost {...post} />
    </div>
  )
}

