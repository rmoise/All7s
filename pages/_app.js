// pages/_app.js
import React, { useEffect } from 'react';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '../context/NavbarContext';
import { AudioProvider } from '../context/AudioContext';
import { YouTubeAPIProvider } from '../components/media/YouTubeAPIProvider';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Target and remove the fixed high-z-index element if it exists
    const fixedHighZIndexElement = document.querySelector('div[style*="z-index: 9999"]');
    if (fixedHighZIndexElement) {
      fixedHighZIndexElement.remove();
    }
  }, []);

  const { siteSettings } = pageProps;

  if (!siteSettings) {
    return <div>Loading site settings...</div>;
  }

  return (
    <>
      <SEO
        title={pageProps?.metaTitle || siteSettings?.seo?.metaTitle}
        description={pageProps?.metaDescription || siteSettings?.seo?.metaDescription}
        faviconUrl={siteSettings?.favicon?.asset?.url || '/favicon.ico'}
        openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
        siteName={siteSettings?.title}
      />

      <StateContext>
        <NavbarProvider>
          <AudioProvider>
            <YouTubeAPIProvider>
              <Layout siteSettings={siteSettings}>
                <Toaster />
                <Component {...pageProps} />
              </Layout>
            </YouTubeAPIProvider>
          </AudioProvider>
        </NavbarProvider>
      </StateContext>
    </>
  );
}

export default MyApp;
