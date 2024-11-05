import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  faviconUrl?: string;
  openGraphImageUrl?: string;
  siteName?: string;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Explore Music',
  description = 'Music and entertainment platform',
  faviconUrl = '/favicon.ico',
  openGraphImageUrl = '/og-image.jpg',
  siteName = 'ALL7Z',
  canonicalUrl = 'https://all7z.com',
}) => {
  console.log('SEO Props Received:', {
    title,
    description,
    faviconUrl,
    openGraphImageUrl,
    siteName,
    canonicalUrl,
  });

  useEffect(() => {
    // Update favicon in the browser
    const existingFavicon = document.querySelector("link[rel*='icon']");
    if (existingFavicon instanceof HTMLLinkElement) {
      existingFavicon.href = `${faviconUrl}?refresh=true`;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = `${faviconUrl}?refresh=true`;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href={`${faviconUrl}?refresh=true`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={openGraphImageUrl} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={openGraphImageUrl} />

        {/* Viewport Meta Tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Logging SEO Title for Production Check */}
      <Script id="seo-log-script" strategy="afterInteractive">
        {`console.log("SEO Title:", "${title}");`}
      </Script>
    </>
  );
};

export default SEO;
