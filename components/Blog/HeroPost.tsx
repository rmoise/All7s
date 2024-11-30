import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import DateFormatter from '@/components/Blog/DateFormatter'

interface HeroPostProps {
  title: string
  coverImage: any
  date: string
  excerpt?: string
  slug: string
}

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  slug,
  author,
}: HeroPostProps & { author?: { name: string; picture?: any } }) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        {coverImage && (
          <div className="relative aspect-[2/1] w-full">
            <Link href={`/blog/${slug}`} aria-label={title}>
              <Image
                src={urlFor(coverImage).width(2000).height(1000).url()}
                alt={`Cover Image for ${title}`}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </Link>
          </div>
        )}
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl font-bold leading-tight">
            <Link href={`/blog/${slug}`} className="hover:underline text-white">
              {title}
            </Link>
          </h3>
          <div className="text-gray-400 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-base leading-relaxed text-gray-300 mb-6 break-all overflow-wrap-anywhere">
            {excerpt}
          </p>
          <div className="flex items-center">
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
            {author?.name && (
              <span className="font-medium text-white">
                {author.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}