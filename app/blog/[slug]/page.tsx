import { getClient } from '@/lib/sanity'
import { Metadata } from 'next'
import BlogPost from '@/components/blog/BlogPost'
import { notFound } from 'next/navigation'
import { BlogPageProps } from '@/types/page'

export async function generateMetadata(
  props: BlogPageProps
): Promise<Metadata> {
  const params = await props.params;
  const post = await getClient().fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      "seo": seo{
        metaTitle,
        metaDescription,
        openGraphImage{
          asset->{
            url
          }
        }
      }
    }
  `, { slug: params.slug })

  if (!post) return notFound()

  return {
    title: post.seo?.metaTitle ? `${post.seo.metaTitle} - ${post.title}` : post.title,
    description: post.seo?.metaDescription || "Read our latest blog post.",
    openGraph: post.seo?.openGraphImage?.asset?.url ? {
      images: [{ url: post.seo.openGraphImage.asset.url }]
    } : undefined
  }
}

export default async function BlogPostPage(
  props: BlogPageProps
): Promise<JSX.Element> {
  const params = await props.params;
  const post = await getClient().fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      body,
      mainImage,
      "seo": seo{
        metaTitle,
        metaDescription,
        openGraphImage{
          asset->{
            url
          }
        }
      }
    }
  `, { slug: params.slug })

  if (!post) return notFound()

  return <BlogPost {...post} />
}