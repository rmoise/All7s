import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity'
import DateFormatter from './DateFormatter'

interface PostPreviewProps {
  title: string
  mainImage?: {
    _type: 'image'
    asset: {
      _ref: string | null
      _type: 'sanity.imageAsset'
      url: string
    }
  }
  date: string
  excerpt?: string
  bodyExcerpt?: string
  author?: {
    name: string
    picture?: {
      asset: {
        _ref: string | null
        _type: 'sanity.imageAsset'
        url: string
      }
    }
  }
  slug: string
  categories?: Array<{
    title: string
    slug: string
    color?: {
      hex: string
    }
  }>
}

const shouldOptimize = process.env.NODE_ENV !== 'production'

export default function PostPreview({
  title,
  mainImage,
  date,
  excerpt,
  bodyExcerpt,
  author,
  slug,
  categories,
}: PostPreviewProps) {
  const displayExcerpt = excerpt || bodyExcerpt
  const mainImageUrl = mainImage?.asset?.url || ''
  const authorImageUrl = author?.picture?.asset?.url || ''

  return (
    <div className="flex flex-col h-full">
      <div className="mb-5">
        {mainImageUrl && (
          <div className="relative aspect-[16/9] w-full">
            <Link href={`/blog/${slug}`} aria-label={title}>
              <Image
                src={mainImageUrl}
                alt={`Cover Image for ${title}`}
                className="object-cover hover:opacity-90 transition-opacity"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={!shouldOptimize}
              />
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-3xl font-bold mb-4">
          <Link href={`/blog/${slug}`} className="text-white hover:text-gray-300 transition-colors">
            {title}
          </Link>
        </h3>
        {displayExcerpt && (
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            {displayExcerpt}
          </p>
        )}

        <div className="flex items-center mt-auto">
          {authorImageUrl && author?.name && (
            <div className="relative w-12 h-12 mr-4">
              <Image
                src={authorImageUrl}
                alt={author.name}
                className="rounded-full object-cover"
                fill
                sizes="48px"
                unoptimized={!shouldOptimize}
              />
            </div>
          )}
          <div className="flex flex-col">
            {author?.name && (
              <span className="font-medium text-white">
                {author.name}
              </span>
            )}
            <span className="text-gray-400 text-sm">
              <DateFormatter dateString={date} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}