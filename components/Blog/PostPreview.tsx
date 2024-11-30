import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import DateFormatter from './DateFormatter'

interface PostPreviewProps {
  title: string
  coverImage: any
  date: string
  excerpt?: string
  bodyExcerpt?: string
  author?: {
    name: string
    picture?: any
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

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  bodyExcerpt,
  author,
  slug,
  categories,
}: PostPreviewProps) {
  const displayExcerpt = excerpt || bodyExcerpt

  return (
    <div className="flex flex-col h-full">
      <div className="mb-5">
        {coverImage && (
          <div className="relative aspect-[16/9] w-full">
            <Link href={`/blog/${slug}`} aria-label={title}>
              <Image
                src={urlFor(coverImage).width(800).height(450).url()}
                alt={`Cover Image for ${title}`}
                className="object-cover hover:opacity-90 transition-opacity"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          <p className="text-gray-400 text-base leading-relaxed mb-6">
            {displayExcerpt}
          </p>
        )}

        <div className="flex items-center mt-auto">
          {author?.picture && (
            <div className="relative w-12 h-12 mr-4">
              <Image
                src={urlFor(author.picture).width(120).height(120).url()}
                alt={author.name || 'Author'}
                className="rounded-full object-cover"
                fill
                sizes="48px"
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