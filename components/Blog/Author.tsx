import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

interface AuthorProps {
  name: string
  picture?: any
  bio?: any[]
}

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

  return (
    <div className="flex items-center space-x-4">
      {picture && (
        <div className="relative w-12 h-12">
          <Image
            src={urlFor(picture).width(96).height(96).url()}
            alt={name}
            className="rounded-full"
            fill
            sizes="48px"
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