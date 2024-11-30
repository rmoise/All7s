import { NextResponse } from 'next/server'
import { getClient } from '@lib/sanity'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    console.log('Blog API Request:', {
      url: request.url,
      slug,
      method: request.method,
      headers: Object.fromEntries(request.headers)
    })

    if (slug) {
      console.log('Fetching single post:', slug)
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
      `, { slug })

      console.log('Post fetch result:', post ? 'Found' : 'Not found')

      if (!post) {
        console.log('Post not found for slug:', slug)
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      return NextResponse.json(post)
    }

    console.log('Fetching all posts')
    const posts = await getClient().fetch(`*[_type == "post"]{
      _id,
      title,
      slug,
      mainImage,
      excerpt
    }`)

    console.log('Found posts:', posts.length)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({
      error: 'Failed to fetch blog data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 