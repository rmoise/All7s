import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
        <Link href="/" className="mt-6 inline-block text-blue-500 hover:text-blue-600">
          Return Home
        </Link>
      </div>
    </div>
  )
}

// Explicitly mark this page as static
export const getStaticProps = () => {
  return {
    props: {},
  }
}