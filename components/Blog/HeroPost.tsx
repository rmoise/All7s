import Link from 'next/link'
import Image from 'next/image'
import DateFormatter from '@/components/Blog/DateFormatter'

const shouldOptimize = process.env.NODE_ENV !== 'production'

export interface HeroPostProps {
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
  slug: string
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
}

const HeroPost: React.FC<HeroPostProps> = ({
  title,
  mainImage,
  date,
  excerpt,
  slug,
  author,
}: HeroPostProps) => {
  const imageUrl = mainImage?.asset?.url || ''
  const authorImageUrl = author?.picture?.asset?.url || ''

  return (
    <section className="mb-16 md:mb-24">
      <div className="mb-8 md:mb-16">
        {imageUrl && (
          <Link href={`/blog/${slug}`} aria-label={title}>
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={imageUrl}
                alt={`Cover Image for ${title}`}
                className="object-cover rounded-lg hover:opacity-90 transition-opacity"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                unoptimized={!shouldOptimize}
              />
            </div>
          </Link>
        )}
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl font-black leading-tight">
            <Link href={`/blog/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg text-gray-400">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          {excerpt && (
            <p className="my-4 leading-relaxed text-base text-gray-300">
              {excerpt}
            </p>
          )}
          {author && (
            <div className="flex items-center mt-4">
              {authorImageUrl && (
                <Image
                  src={authorImageUrl}
                  alt={author.name}
                  width={48}
                  height={48}
                  className="rounded-full mr-3"
                  unoptimized={!shouldOptimize}
                />
              )}
              <span className="text-lg text-gray-400">{author.name}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroPost
