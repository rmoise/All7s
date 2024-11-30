import Container from '@/components/Blog/Container'

export default function Alert({ preview }: { preview: boolean }) {
  return (
    <div className={`border-b bg-blue-900 border-blue-800 text-white`}>
      <Container>
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This is a preview.{' '}
              <a
                href="/api/exit-preview"
                className="underline hover:text-blue-200 duration-200 transition-colors"
              >
                Click here
              </a>{' '}
              to exit preview mode.
            </>
          ) : (
            <>
              Stay updated with the latest in West Coast culture and music.
            </>
          )}
        </div>
      </Container>
    </div>
  )
}