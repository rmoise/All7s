export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">500</h1>
        <p className="text-xl text-gray-600 mt-4">Server Error</p>
        <a href="/" className="mt-6 inline-block text-blue-500 hover:text-blue-600">
          Return Home
        </a>
      </div>
    </div>
  )
}

export const getStaticProps = () => {
  return {
    props: {},
  }
} 