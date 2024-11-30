import { getClient } from '@lib/sanity'
import Meta from '@/components/Blog/Meta'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen bg-black -mt-[64px] pt-[84px] pb-0">
        <main className="mb-0">{children}</main>
      </div>
    </>
  )
}
