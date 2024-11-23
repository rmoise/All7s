import { getClient } from '@/lib/sanity'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import { Toaster } from 'react-hot-toast'
import * as FontAwesome from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import '@/styles/globals.css'
import ClientRoot from '@/components/layout/ClientRoot'
import ClientLoading from '@/components/common/ClientLoading'
import ClientLayout from '@/components/layout/ClientLayout'
import { PreviewProvider } from '@/lib/live'
import { getPreviewToken } from '@/lib/preview'

FontAwesome.config.autoAddCss = false
FontAwesome.library.add(faUser, faShoppingCart)

async function getFavicon() {
  const query = `*[_type == "settings"][0] {
    "favicon": favicon.asset->url
  }`
  const { favicon } = await getClient().fetch(query)
  return favicon
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const preview = await getPreviewToken()
  const isPreview = Boolean(preview)

  const siteSettings = await getClient(isPreview).fetch(`
    *[_type == "settings" && _id == "singleton-settings"][0] {
      navbar,
      footer
    }
  `)

  const favicon = await getFavicon()

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/xiv3wpa.css" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href={favicon}
          sizes="any"
        />
      </head>
      <body className="font-headline" suppressHydrationWarning>
        <PreviewProvider preview={isPreview}>
          <ClientLayout>
            <ClientLoading>
              <div className="flex flex-col min-h-screen">
                <Navbar navbarData={siteSettings?.navbar} />
                <main className="flex-grow w-full relative z-20">
                  {children}
                </main>
                <Footer footer={siteSettings?.footer} />
                <Toaster />
              </div>
            </ClientLoading>
          </ClientLayout>
        </PreviewProvider>
      </body>
    </html>
  )
}