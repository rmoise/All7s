export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-800 rounded-lg mb-8" />
          <div className="h-8 bg-gray-800 w-1/2 mx-auto mb-12" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-800" />
                <div className="p-6">
                  <div className="h-6 bg-gray-800 mb-4" />
                  <div className="h-4 bg-gray-800 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 