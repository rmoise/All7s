import Link from 'next/link'

interface Category {
  title: string
  slug: string
  color?: {
    hex: string
  }
}

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className={`px-3 py-1 rounded-full text-sm font-medium
            ${category.color?.hex
              ? `bg-[${category.color.hex}]`
              : 'bg-blue-500'}
            hover:opacity-80 transition-opacity`}
        >
          {category.title}
        </Link>
      ))}
    </div>
  )
} 