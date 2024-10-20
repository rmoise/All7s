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
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'icon' || links[i].rel === 'shortcut icon') {
        links[i].href = `${faviconUrl}?v=${new Date().getTime()}`;
      }
    }

    // If no favicon link exists, create a new one
    if (!document.querySelector("link[rel*='icon']")) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = `${faviconUrl}?v=${new Date().getTime()}`;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={`${faviconUrl}?v=${new Date().getTime()}`} />
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
