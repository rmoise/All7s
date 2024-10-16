import Head from 'next/head';
import { useEffect } from 'react';

const SEO = ({
  title = 'Default Site Title',
  description = 'Default description for the site.',
  faviconUrl = '/favicon.ico',
  openGraphImageUrl,
  siteName = 'Default Site Name',
  canonicalUrl,
}) => {

  useEffect(() => {
    // This useEffect ensures the browser updates the favicon and removes any old references
    const existingFavicon = document.querySelectorAll("link[rel='icon']");

    // Remove any existing favicons
    existingFavicon.forEach(favicon => favicon.parentNode.removeChild(favicon));

    // Create new favicon link
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = `${faviconUrl}?v=${Date.now()}`;
    document.head.appendChild(newFavicon);
  }, [faviconUrl]);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      {openGraphImageUrl && <meta property="og:image" content={openGraphImageUrl} />}

      {/* Twitter Meta Tags */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {openGraphImageUrl && <meta property="twitter:image" content={openGraphImageUrl} />}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Viewport Meta Tag */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
};

export default SEO;
