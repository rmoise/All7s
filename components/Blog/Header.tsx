import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-5">
        <div className="py-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:tracking-tighter leading-tight">
            <Link href="/" className="hover:underline text-white">
              All7Z Blog
            </Link>
          </h2>
          <nav className="space-x-6">
            <Link href="/blog" className="text-gray-300 hover:text-white">
              All Posts
            </Link>
            <Link href="/shop" className="text-gray-300 hover:text-white">
              Shop
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}