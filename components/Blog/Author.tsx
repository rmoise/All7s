import Image from 'next/image'
import { urlForImage } from '@/lib/sanity'

interface AuthorProps {
  name: string
  picture?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  bio?: any[]
}

const shouldOptimize = process.env.NODE_ENV !== 'production'

export default function Author({ name, picture, bio }: AuthorProps) {
  const bioText = Array.isArray(bio)
    ? bio
        .filter(block => block._type === 'block')
        .flatMap(block => block.children
          ?.filter((child: any) => typeof child.text === 'string')
          ?.map((child: any) => child.text)
        )
        .filter(Boolean)
        .join(' ')
    : undefined

  const imageUrl = picture ? urlForImage(picture, {
    width: 96,
    quality: 75,
  }) : ''

  return (
    <div className="flex items-center space-x-4">
      {picture && (
        <div className="relative w-12 h-12">
          <Image
            src={imageUrl}
            alt={name}
            className="rounded-full"
            fill
            sizes="48px"
            unoptimized={!shouldOptimize}
          />
        </div>
      )}
      <div className="text-left">
        <p className="text-lg font-bold text-white">{name}</p>
        {bioText && <p className="text-gray-400 text-sm">{bioText}</p>}
      </div>
    </div>
  )
}