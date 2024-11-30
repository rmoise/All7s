import { getClient } from '@lib/sanity'
import { Metadata } from 'next'
import { BlogPost } from '@components/Blog'
import { notFound } from 'next/navigation'
import { postDetailQuery } from '../queries'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

type GenerateMetadataProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
  searchParams,
}: GenerateMetadataProps): Promise<Metadata> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const post = await fetchWithRetry(() =>
    getClient().fetch(postDetailQuery, { slug: resolvedParams.slug }, {
      cache: 'force-cache',
      next: { tags: [`post-${resolvedParams.slug}`], revalidate: 60 }
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

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogPostPage({
  params,
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const post = await fetchWithRetry(() =>
    getClient().fetch(postDetailQuery, { slug: resolvedParams.slug }, {
      cache: 'force-cache',
      next: { tags: [`post-${resolvedParams.slug}`], revalidate: 60 }
    })
  )

  if (!post) return notFound()

  return (
    <div className="pb-28">
      <BlogPost {...post} />
    </div>
  )
}
