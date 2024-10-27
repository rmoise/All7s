import Head from 'next/head';
import { useEffect } from 'react';

const SEO = ({
  title = 'Default Site Title',
  description = 'Default description for the site.',
  faviconUrl = '/favicon.ico',
  openGraphImageUrl = '/default-og-image.jpg', // Fallback image for Open Graph
  siteName = 'Default Site Name',
  canonicalUrl,
}) => {
  // Log all props received to help debug values in production
  console.log("SEO Component Props:", {
    title,
    description,
    faviconUrl,
    openGraphImageUrl,
    siteName,
    canonicalUrl,
  });

  useEffect(() => {
    // Update favicon in the browser
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'icon' || links[i].rel === 'shortcut icon') {
        links[i].href = `${faviconUrl}?refresh=true`; // Simplified refresh parameter
      }
    }

    // Add favicon link if it doesn't exist
    if (!document.querySelector("link[rel*='icon']")) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = `${faviconUrl}?refresh=true`;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={`${faviconUrl}?refresh=true`} />

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={openGraphImageUrl} />

      {/* Twitter Meta Tags */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={openGraphImageUrl} />
      <meta name="twitter:card" content="summary_large_image" />

      {/* Viewport Meta Tag */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Inline logging script for additional production check */}
      <script>
        {`console.log("SEO Title:", "${title}");`}
      </script>
    </Head>
  );
};

export default SEO;
