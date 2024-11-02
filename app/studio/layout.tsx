import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sanity Studio',
  description: 'All7s Sanity Studio',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 