'use client'

import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { useState, useEffect } from 'react'
import type { PortableTextBlock, PortableTextComponentProps } from '@portabletext/react'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Create image URL builder
const builder = imageUrlBuilder({
  projectId: '1gxdk71x',
  dataset: 'production',
})

function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

interface BlogPostProps {
  title: string
  body: PortableTextBlock[]
  mainImage: SanityImageSource
  seo?: {
    metaTitle?: string
    metaDescription?: string
    openGraphImage?: {
      asset?: {
        url?: string
      }
    }
  }
}

const components = {
  types: {
    image: ({ value }: { value: { asset: SanityImageSource } }) => (
      <img className="mt-8" src={urlFor(value.asset).url()} alt="" />
    ),
  },
  block: {
    h1: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <h1 className="text-7xl">{children}</h1>
    ),
    normal: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
      <p className="text-xl mt-12">{children}</p>
    ),
  },
}

export default function BlogPost({ title, body, mainImage }: BlogPostProps) {
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (mainImage) {
      setImageUrl(urlFor(mainImage).url())
    }
  }, [mainImage])

  return (
    <div className="flex flex-col items-center mt-28">
      <h1 className="text-9xl font-Headline">{title}</h1>
      {imageUrl && <img className="mt-8 w-3/4" src={imageUrl} alt={title} />}
      <div className="mt-20 portable-text flex flex-col gap-y-30">
        <PortableText
          value={body}
          components={components}
        />
      </div>
    </div>
  )
} 